const express = require('express');
const amqp = require('amqplib');
const axios = require('axios'); // New: for making HTTP requests
const session = require('express-session');
const cors = require('cors');

// Import OAuth2 server configuration
const { 
    passport, 
    isAuthenticated, 
    hasScope, 
    handleAuthorization, 
    handleToken,
    generateServiceToken 
} = require('./oauth-server');

// Import UDDI client for dynamic service discovery
const OrchestratorUDDIClient = require('./uddi-client');

// Import BPEL Engine
const BPELEngine = require('./bpel-engine');

const app = express();
const port = 3003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({
    secret: 'orchestrator-service-secret',
    resave: false,
    saveUninitialized: false
}));

// Initialize Passport
app.use(passport.initialize());

// API Documentation endpoint

let channel, connection;
const rabbitmq_url = 'amqp://172.18.0.5:5672';

// Initialize UDDI client for dynamic service discovery
const uddiClient = new OrchestratorUDDIClient();

// Initialize BPEL Engine
const bpelEngine = new BPELEngine();

// Auto-register with UDDI Registry
async function registerWithUDDI() {
    try {
        const axios = require('axios');
        const serviceData = {
            serviceId: 'orchestrator-service',
            name: 'Orchestrator Service',
            category: 'workflow-orchestration',
            provider: 'SOA-Microservices',
            description: 'OAuth2 server and workflow orchestration',
            version: '1.0.0',
            interfaces: [
                {
                    type: 'REST',
                    endpoint: 'http://orchestrator:3003',
                    operations: ['GET', 'POST', 'PUT']
                }
            ]
        };
        
        await axios.post('http://uddi-registry:3004/api/services/register', serviceData);
        console.log('Orchestrator service registered with UDDI Registry');
    } catch (error) {
        console.log('UDDI registration failed (will retry):', error.message);
        // Retry after 5 seconds
        setTimeout(registerWithUDDI, 5000);
    }
}

// Register with UDDI after a short delay
setTimeout(registerWithUDDI, 2000);

// Function to update catalog stock using UDDI discovery
async function updateCatalogStock(productId, quantity) {
    try {
        // Discover catalog service endpoint dynamically
        const catalogEndpoint = await uddiClient.getServiceEndpoint('catalog-service', 'REST', 'updateStock');
        const fullUrl = `${catalogEndpoint}/${productId}/stock`;
        
        const response = await axios.put(fullUrl, {
            quantity: quantity
        });
        
        if (response.data.success) {
            console.log(`Catalog stock updated successfully for product ${productId}. New quantity: ${response.data.product.quantity}`);
            return true;
        } else {
            console.error(`Failed to update catalog stock for product ${productId}: ${response.data.message}`);
            return false;
        }
    } catch (error) {
        console.error(`Error updating catalog stock for product ${productId}:`, error.message);
        return false;
    }
}

// Function to get OAuth2 token for inter-service communication
async function getServiceToken() {
    try {
        // Generate a service-to-service token with read and write scope
        const token = generateServiceToken('orchestrator-service', 'read write');
        return token;
    } catch (error) {
        console.error('Error generating service token:', error);
        return null;
    }
}

// Function to make authenticated HTTP requests to other services using UDDI discovery
async function makeAuthenticatedRequest(serviceId, method = 'GET', data = null, endpoint = null) {
    try {
        const token = await getServiceToken();
        if (!token) {
            throw new Error('Failed to generate service token');
        }

        // Discover service endpoint if not provided
        let url = endpoint;
        if (!url) {
            const baseEndpoint = await uddiClient.getServiceEndpoint(serviceId, 'REST');
            url = baseEndpoint;
        }

        const config = {
            method: method,
            url: url,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error(`Authenticated request failed for service ${serviceId}:`, error.message);
        throw error;
    }
}

async function connectRabbitMQ() {
    let retries = 5;
    while (retries) {
        try {
            connection = await amqp.connect(rabbitmq_url);
            channel = await connection.createChannel();

            await channel.assertQueue('order_initiation_queue'); // For initial order requests from Orders service
            await channel.assertQueue('payment_command_queue');
            await channel.assertQueue('shipping_command_queue');
            await channel.assertQueue('payment_completed_queue');
            await channel.assertQueue('shipping_completed_queue');

            console.log('Orchestrator Connected to RabbitMQ');

            // Consume initial order requests
            channel.consume('order_initiation_queue', async (msg) => {
                const order = JSON.parse(msg.content.toString());
                console.log("Orchestrator received initial order:", order);

                // Store the complete order data for later use
                global.orderData = global.orderData || {};
                global.orderData[order.id] = order;

                // Step 1: Send command to Payment service
                channel.sendToQueue('payment_command_queue', Buffer.from(JSON.stringify(order)));
                console.log("Orchestrator sent payment command for order:", order.id);
                channel.ack(msg);
            }, { noAck: false });

            // Consume payment completed events
            channel.consume('payment_completed_queue', async (msg) => {
                const paymentResult = JSON.parse(msg.content.toString());
                console.log("Orchestrator received payment completed for order:", paymentResult.orderId);

                // Step 2: Upon successful payment, send command to Shipping service
                // Get the complete order data including shippingAddress
                const orderId = paymentResult.orderId;
                const completeOrder = global.orderData[orderId];
                
                if (completeOrder) {
                    channel.sendToQueue('shipping_command_queue', Buffer.from(JSON.stringify(completeOrder)));
                    console.log("Orchestrator sent shipping command for order:", orderId, "with complete data");
                } else {
                    console.error("Could not find complete order data for order:", orderId);
                    // Fallback: try to reconstruct with available data
                    const fallbackOrder = { 
                        id: orderId, 
                        item: paymentResult.item, 
                        quantity: paymentResult.quantity 
                    };
                    channel.sendToQueue('shipping_command_queue', Buffer.from(JSON.stringify(fallbackOrder)));
                    console.log("Orchestrator sent shipping command with fallback data for order:", orderId);
                }
                
                channel.ack(msg);
            }, { noAck: false });

            // Consume shipping completed events
            channel.consume('shipping_completed_queue', async (msg) => {
                const shippingResult = JSON.parse(msg.content.toString());
                console.log("Orchestrator received shipping completed for order:", shippingResult.orderId);
                
                // Step 3: Update catalog stock when shipping is completed
                if (shippingResult.productId && shippingResult.quantity) {
                    const stockUpdateSuccess = await updateCatalogStock(shippingResult.productId, shippingResult.quantity);
                    if (stockUpdateSuccess) {
                        console.log(`Order ${shippingResult.orderId} workflow completed successfully with stock update.`);
                    } else {
                        console.error(`Order ${shippingResult.orderId} workflow completed but stock update failed.`);
                    }
                } else {
                    console.log(`Order ${shippingResult.orderId} workflow completed successfully.`);
                }
                
                channel.ack(msg);
            }, { noAck: false });
            return;

        } catch (error) {
            retries--;
            console.error(`Orchestrator service failed to connect to RabbitMQ. Retries left: ${retries}`, error.message);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
        }
    }
    console.error('Orchestrator service failed to connect to RabbitMQ after multiple retries.');
}

connectRabbitMQ();

// Orchestrator endpoint to initiate an order using BPEL workflow
app.post('/place-order', isAuthenticated, hasScope('write'), async (req, res) => {
    const order = req.body;
    
    try {
        console.log(`[BPEL] Starting PlaceOrder workflow for order: ${order.id}`);
        
        // Execute the PlaceOrder BPEL workflow
        const workflowResult = await bpelEngine.executeWorkflow('PlaceOrder', order);
        
        if (workflowResult.status === 'completed') {
            console.log(`[BPEL] PlaceOrder workflow completed successfully for order: ${order.id}`);
            
            // Also send to RabbitMQ for backward compatibility with existing services
        if (channel) {
            channel.sendToQueue('order_initiation_queue', Buffer.from(JSON.stringify(order)));
                console.log(`Order ${order.id} also sent to RabbitMQ for legacy workflow processing`);
            }
            
            return res.status(200).json({
                message: `Order ${order.id} processed successfully using BPEL workflow`,
                workflowExecutionId: workflowResult.executionId,
                result: workflowResult.result,
                duration: workflowResult.duration
            });
        } else {
            console.error(`[BPEL] PlaceOrder workflow failed for order: ${order.id} - ${workflowResult.error}`);
            return res.status(500).json({
                error: `Order processing failed: ${workflowResult.error}`,
                workflowExecutionId: workflowResult.executionId
            });
        }
    } catch (error) {
        console.error(`[BPEL] Error processing order ${order.id}:`, error.message);
        return res.status(500).json({ error: `Failed to process order: ${error.message}` });
    }
});

// New: Endpoint to get workflow status
app.get('/workflow-status/:orderId', isAuthenticated, hasScope('read'), async (req, res) => {
    const orderId = req.params.orderId;
    let workflowStatus = { orderId: orderId, details: {} };

    try {
        // Fetch Order details using UDDI discovery
        const ordersEndpoint = await uddiClient.getServiceEndpoint('orders-service', 'REST', 'getOrder');
        const orderResponse = await makeAuthenticatedRequest('orders-service', 'GET', null, `${ordersEndpoint}/${orderId}`);
        workflowStatus.details.order = orderResponse;
    } catch (error) {
        workflowStatus.details.order = { status: 'not_found', message: 'Order details not found or Orders service unavailable.' };
        console.warn(`Could not fetch order ${orderId} from Orders service:`, error.message);
    }

    try {
        // Fetch Payment details using UDDI discovery
        const paymentsEndpoint = await uddiClient.getServiceEndpoint('payments-service', 'REST', 'getPayment');
        const paymentResponse = await makeAuthenticatedRequest('payments-service', 'GET', null, `${paymentsEndpoint}/${orderId}`);
        workflowStatus.details.payment = paymentResponse;
    } catch (error) {
        workflowStatus.details.payment = { status: 'not_found', message: 'Payment details not found or Payments service unavailable.' };
        console.warn(`Could not fetch payment for order ${orderId} from Payments service:`, error.message);
    }

    try {
        // Fetch Shipping details using UDDI discovery
        const shippingEndpoint = await uddiClient.getServiceEndpoint('shipping-service', 'REST', 'getShipping');
        const shippingResponse = await makeAuthenticatedRequest('shipping-service', 'GET', null, `${shippingEndpoint}/${orderId}`);
        workflowStatus.details.shipping = shippingResponse;
    } catch (error) {
        workflowStatus.details.shipping = { status: 'not_found', message: 'Shipping details not found or Shipping service unavailable.' };
        console.warn(`Could not fetch shipping for order ${orderId} from Shipping service:`, error.message);
    }

    res.status(200).json(workflowStatus);
});

// New: Direct endpoint to update catalog stock (for testing)
app.put('/update-catalog-stock/:productId', isAuthenticated, hasScope('write'), async (req, res) => {
    const productId = req.params.productId;
    const { quantity } = req.body;
    
    if (!quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Quantity must be a positive number' });
    }
    
    try {
        const success = await updateCatalogStock(productId, quantity);
        if (success) {
            res.status(200).json({ message: `Stock updated successfully for product ${productId}` });
        } else {
            res.status(500).json({ error: `Failed to update stock for product ${productId}` });
        }
    } catch (error) {
        res.status(500).json({ error: `Error updating stock: ${error.message}` });
    }
});

// Basic Route
app.get('/', (req, res) => {
    res.send('Orchestrator Service API - OAuth2 Server');
});

// OAuth2 Server Endpoints
app.get('/oauth/authorize', handleAuthorization);
app.post('/oauth/token', handleToken);

// Health check endpoint (no authentication required)
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        service: 'Orchestrator Service',
        timestamp: new Date().toISOString()
    });
});


// BPEL Workflow Management Endpoints

// List available BPEL workflows
app.get('/bpel/workflows', isAuthenticated, hasScope('read'), (req, res) => {
    try {
        const workflows = bpelEngine.getAvailableWorkflows();
        res.json({
            message: 'Available BPEL workflows',
            workflows: workflows
        });
    } catch (error) {
        res.status(500).json({ error: `Failed to list workflows: ${error.message}` });
    }
});

// Get BPEL workflow definition
app.get('/bpel/workflows/:name', isAuthenticated, hasScope('read'), (req, res) => {
    try {
        const workflowName = req.params.name;
        const workflow = bpelEngine.getWorkflowDefinition(workflowName);
        
        if (!workflow) {
            return res.status(404).json({ error: `Workflow ${workflowName} not found` });
        }
        
        res.json({
            message: `BPEL workflow definition: ${workflowName}`,
            workflow: workflow
        });
    } catch (error) {
        res.status(500).json({ error: `Failed to get workflow: ${error.message}` });
    }
});

// Execute BPEL workflow
app.post('/bpel/workflows/:name/execute', isAuthenticated, hasScope('write'), async (req, res) => {
    try {
        const workflowName = req.params.name;
        const inputData = req.body;
        
        console.log(`[BPEL] Executing workflow: ${workflowName}`);
        console.log(`[BPEL] Input data:`, inputData);
        
        const result = await bpelEngine.executeWorkflow(workflowName, inputData);
        
        res.json({
            message: `BPEL workflow ${workflowName} execution completed`,
            result: result
        });
    } catch (error) {
        console.error(`[BPEL] Workflow execution failed:`, error);
        res.status(500).json({ error: `Workflow execution failed: ${error.message}` });
    }
});

// List BPEL workflow executions
app.get('/bpel/executions', isAuthenticated, hasScope('read'), (req, res) => {
    try {
        const executions = bpelEngine.getAllExecutions();
        res.json({
            message: 'BPEL workflow executions',
            executions: executions
        });
    } catch (error) {
        res.status(500).json({ error: `Failed to list executions: ${error.message}` });
    }
});

// Get BPEL execution status
app.get('/bpel/executions/:id', isAuthenticated, hasScope('read'), (req, res) => {
    try {
        const executionId = req.params.id;
        const execution = bpelEngine.getExecutionStatus(executionId);
        
        if (!execution) {
            return res.status(404).json({ error: `Execution ${executionId} not found` });
        }
        
    res.json({
            message: `BPEL execution status: ${executionId}`,
            execution: execution
    });
    } catch (error) {
        res.status(500).json({ error: `Failed to get execution status: ${error.message}` });
    }
});

app.listen(port, () => {
    console.log(`Orchestrator service listening at http://localhost:${port}`);
    console.log('OAuth2 server enabled');
    console.log('OAuth2 endpoints: /oauth/authorize, /oauth/token');
});
