const express = require('express');
const mongoose = require('mongoose');
const amqp = require('amqplib');
const session = require('express-session');
const cors = require('cors');

// Import OAuth2 configuration
const { passport, isAuthenticated, hasScope } = require('./auth-config');

// Import UDDI client
const ShippingUDDIClient = require('./uddi-client');

// Define Shipping Schema and Model
const ShippingSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    shippingId: { type: String, required: true, unique: true },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        zipCode: { type: String, required: true },
    },
    status: { type: String, default: 'pending' } // e.g., pending, shipped, delivered
}, { timestamps: true });

const Shipping = mongoose.model('Shipping', ShippingSchema);

const app = express();
const port = 3002; // Different port for Shipping service

// Initialize UDDI client
const uddiClient = new ShippingUDDIClient();

// Auto-register with UDDI Registry
async function registerWithUDDI() {
    try {
        const axios = require('axios');
        const serviceData = {
            serviceId: 'shipping-service',
            name: 'Shipping Service',
            category: 'shipping-management',
            provider: 'SOA-Microservices',
            description: 'Shipping management and tracking',
            version: '1.0.0',
            interfaces: [
                {
                    type: 'REST',
                    endpoint: 'http://shipping:3002',
                    operations: ['GET', 'POST']
                }
            ]
        };
        
        await axios.post('http://uddi-registry:3004/api/services/register', serviceData);
        console.log('Shipping service registered with UDDI Registry');
    } catch (error) {
        console.log('UDDI registration failed (will retry):', error.message);
        // Retry after 5 seconds
        setTimeout(registerWithUDDI, 5000);
    }
}

// Register with UDDI after a short delay
setTimeout(registerWithUDDI, 2000);

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({
    secret: 'shipping-service-secret',
    resave: false,
    saveUninitialized: false
}));

// Initialize Passport
app.use(passport.initialize());


// RabbitMQ Connection
let channel, connection;
const rabbitmq_url = 'amqp://172.18.0.5:5672';

async function connectRabbitMQ() {
    let retries = 5;
    while (retries) {
        try {
            connection = await amqp.connect(rabbitmq_url);
            channel = await connection.createChannel();
            await channel.assertQueue('shipping_command_queue'); // New queue for commands from Orchestrator
            await channel.assertQueue('shipping_completed_queue'); // New queue for events to Orchestrator
            // Removed: await channel.assertQueue('order_queue');
            console.log('Shipping service Connected to RabbitMQ');

            // Consume shipping commands from Orchestrator
            channel.consume('shipping_command_queue', async (msg) => {
                const order = JSON.parse(msg.content.toString()); // This 'order' should contain shippingAddress
                console.log("Shipping service received command to process shipping for order:", order);

                // Validate that we have the required address data
                if (!order.shippingAddress || !order.shippingAddress.street || !order.shippingAddress.city || !order.shippingAddress.zipCode) {
                    console.error('Missing required shipping address data for order:', order.id);
                    console.error('Received order data:', order);
                    
                    // Send error result to orchestrator
                    const errorResult = { 
                        orderId: order.id, 
                        status: 'failed',
                        error: 'Missing shipping address data',
                        productId: order.item || 'unknown',
                        quantity: order.quantity || 1
                    };
                    channel.sendToQueue('shipping_completed_queue', Buffer.from(JSON.stringify(errorResult)));
                    channel.ack(msg);
                    return;
                }

                // Simulate shipping processing
                const shippingSuccess = Math.random() > 0.1; // 90% success rate
                const shippingId = `SHIP-${Math.floor(Math.random() * 100000)}`;

                const newShipping = new Shipping({
                    orderId: order.id,
                    shippingId: shippingId,
                    address: order.shippingAddress,
                    status: shippingSuccess ? 'shipped' : 'failed'
                });

                try {
                    await newShipping.save();
                    console.log('Shipping details saved to MongoDB:', newShipping);
                } catch (dbError) {
                    console.error('Error saving shipping to MongoDB:', dbError);
                    channel.ack(msg);
                    return;
                }

                if (shippingSuccess) {
                    console.log(`Shipping processed successfully for order ${order.id}`);
                    const shippingResult = { 
                        orderId: order.id, 
                        shippingId: shippingId, 
                        status: 'completed',
                        productId: order.item || 'unknown', // Include productId for stock updates
                        quantity: order.quantity || 1 // Include quantity for stock updates
                    };
                    channel.sendToQueue('shipping_completed_queue', Buffer.from(JSON.stringify(shippingResult)));
                    console.log("Shipping service sent 'shipping completed' event for order:", order.id);
                } else {
                    console.log(`Shipping failed for order ${order.id}`);
                    const shippingResult = { 
                        orderId: order.id, 
                        shippingId: shippingId, 
                        status: 'failed',
                        productId: order.item || 'unknown',
                        quantity: order.quantity || 1
                    };
                    channel.sendToQueue('shipping_completed_queue', Buffer.from(JSON.stringify(shippingResult))); // Send failed status to orchestrator
                }
                channel.ack(msg);
            }, { noAck: false });
            return;

        } catch (error) {
            retries--;
            console.error(`Shipping service failed to connect to RabbitMQ. Retries left: ${retries}`, error.message);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
        }
    }
    console.error('Shipping service failed to connect to RabbitMQ after multiple retries.');
}

connectRabbitMQ();



// MongoDB Connection
mongoose.connect('mongodb://shipping-db:27017/shipping', {
})
.then(() => console.log('Connected to Shipping MongoDB'))
.catch(err => console.error('Could not connect to Shipping MongoDB...', err));

// UDDI client available for service discovery

// Basic Route
app.get('/', (req, res) => {
  res.send('Shipping Service API - OAuth2 Protected');
});

// OAuth2 Authentication Routes
app.get('/auth/login', passport.authenticate('oauth2'));

app.get('/auth/callback', 
    passport.authenticate('oauth2', { failureRedirect: '/auth/failure' }),
    (req, res) => {
        res.redirect('/auth/success');
    }
);

app.get('/auth/success', (req, res) => {
    res.json({ message: 'Authentication successful', user: req.user });
});

app.get('/auth/failure', (req, res) => {
    res.status(401).json({ error: 'Authentication failed' });
});

// Health check endpoint (no authentication required)
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        service: 'Shipping Service',
        timestamp: new Date().toISOString()
    });
});

app.listen(port, () => {
  console.log(`Shipping service listening at http://localhost:${port}`);
  console.log('OAuth2 authentication enabled');
});

// Protected Routes - Require Authentication
app.get('/shipping/:orderId', isAuthenticated, hasScope('read'), async (req, res) => {
    try {
        const shipping = await Shipping.findOne({ orderId: req.params.orderId });
        if (!shipping) {
            return res.status(404).send('Shipping details not found for this order.');
        }
        res.status(200).json(shipping);
    } catch (error) {
        console.error('Error fetching shipping:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add endpoint to create shipping record manually (for testing)
app.post('/shipping', isAuthenticated, hasScope('write'), async (req, res) => {
    try {
        const { orderId, shippingId, address, status } = req.body;
        
        if (!orderId || !shippingId || !address) {
            return res.status(400).json({ error: 'orderId, shippingId, and address are required' });
        }
        
        const newShipping = new Shipping({
            orderId,
            shippingId,
            address,
            status: status || 'pending',
            createdBy: req.user.email || req.user.id
        });
        
        await newShipping.save();
        res.status(201).json(newShipping);
    } catch (error) {
        console.error('Error creating shipping record:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

