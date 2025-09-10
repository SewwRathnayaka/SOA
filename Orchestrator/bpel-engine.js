const axios = require('axios');

/**
 * Simple BPEL Engine for PlaceOrder Workflow
 * Implements basic BPEL-like workflow execution
 */
class BPELEngine {
    constructor() {
        this.workflows = new Map();
        this.executionHistory = new Map();
        this.definePlaceOrderWorkflow();
    }

    /**
     * Define the PlaceOrder BPEL workflow
     */
    definePlaceOrderWorkflow() {
        const placeOrderWorkflow = {
            name: 'PlaceOrder',
            version: '1.0',
            description: 'Complete order placement workflow',
            variables: {
                orderData: null,
                paymentResult: null,
                shippingResult: null,
                catalogUpdateResult: null
            },
            activities: [
                {
                    type: 'receive',
                    name: 'receiveOrder',
                    operation: 'placeOrder',
                    messageType: 'orderRequest'
                },
                {
                    type: 'invoke',
                    name: 'createOrder',
                    service: 'orders-service',
                    operation: 'createOrder',
                    inputVariable: 'orderData',
                    outputVariable: 'orderResult'
                },
                {
                    type: 'invoke',
                    name: 'processPayment',
                    service: 'payments-service',
                    operation: 'processPayment',
                    inputVariable: 'orderData',
                    outputVariable: 'paymentResult'
                },
                {
                    type: 'if',
                    name: 'checkPaymentSuccess',
                    condition: 'paymentResult.status === "completed"',
                    then: [
                        {
                            type: 'invoke',
                            name: 'processShipping',
                            service: 'shipping-service',
                            operation: 'processShipping',
                            inputVariable: 'orderData',
                            outputVariable: 'shippingResult'
                        },
                        {
                            type: 'if',
                            name: 'checkShippingSuccess',
                            condition: 'shippingResult.status === "completed"',
                            then: [
                                {
                                    type: 'invoke',
                                    name: 'updateCatalogStock',
                                    service: 'catalog-service',
                                    operation: 'updateStock',
                                    inputVariable: 'orderData',
                                    outputVariable: 'catalogUpdateResult'
                                }
                            ],
                            else: [
                                {
                                    type: 'throw',
                                    name: 'shippingFailed',
                                    faultName: 'ShippingFailedFault'
                                }
                            ]
                        }
                    ],
                    else: [
                        {
                            type: 'throw',
                            name: 'paymentFailed',
                            faultName: 'PaymentFailedFault'
                        }
                    ]
                },
                {
                    type: 'reply',
                    name: 'replyOrderComplete',
                    operation: 'placeOrder',
                    messageType: 'orderResponse'
                }
            ]
        };

        this.workflows.set('PlaceOrder', placeOrderWorkflow);
    }

    /**
     * Execute a BPEL workflow
     */
    async executeWorkflow(workflowName, inputData) {
        const workflow = this.workflows.get(workflowName);
        if (!workflow) {
            throw new Error(`Workflow ${workflowName} not found`);
        }

        const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const executionContext = {
            id: executionId,
            workflowName: workflowName,
            startTime: new Date(),
            status: 'running',
            variables: { ...workflow.variables },
            currentActivity: 0,
            inputData: inputData,
            outputData: null,
            error: null
        };

        this.executionHistory.set(executionId, executionContext);

        try {
            console.log(`[BPEL] Starting workflow execution: ${executionId}`);
            
            // Set input data
            executionContext.variables.orderData = inputData;
            
            // Execute activities sequentially
            await this.executeActivities(workflow.activities, executionContext);
            
            executionContext.status = 'completed';
            executionContext.endTime = new Date();
            executionContext.duration = executionContext.endTime - executionContext.startTime;
            
            console.log(`[BPEL] Workflow completed: ${executionId} in ${executionContext.duration}ms`);
            
            return {
                executionId: executionId,
                status: 'completed',
                result: executionContext.outputData,
                duration: executionContext.duration
            };

        } catch (error) {
            executionContext.status = 'failed';
            executionContext.endTime = new Date();
            executionContext.duration = executionContext.endTime - executionContext.startTime;
            executionContext.error = error.message;
            
            console.error(`[BPEL] Workflow failed: ${executionId} - ${error.message}`);
            
            return {
                executionId: executionId,
                status: 'failed',
                error: error.message,
                duration: executionContext.duration
            };
        }
    }

    /**
     * Execute workflow activities
     */
    async executeActivities(activities, context) {
        for (let i = 0; i < activities.length; i++) {
            const activity = activities[i];
            context.currentActivity = i;
            
            console.log(`[BPEL] Executing activity: ${activity.name} (${activity.type})`);
            
            try {
                await this.executeActivity(activity, context);
            } catch (error) {
                console.error(`[BPEL] Activity failed: ${activity.name} - ${error.message}`);
                throw error;
            }
        }
    }

    /**
     * Execute a single activity
     */
    async executeActivity(activity, context) {
        switch (activity.type) {
            case 'receive':
                // Input data already set in context
                break;
                
            case 'invoke':
                await this.executeInvoke(activity, context);
                break;
                
            case 'if':
                await this.executeIf(activity, context);
                break;
                
            case 'throw':
                throw new Error(`BPEL Fault: ${activity.faultName}`);
                
            case 'reply':
                context.outputData = {
                    orderId: context.variables.orderData.id,
                    status: 'completed',
                    message: 'Order processed successfully'
                };
                break;
                
            default:
                console.warn(`[BPEL] Unknown activity type: ${activity.type}`);
        }
    }

    /**
     * Execute invoke activity (service call)
     */
    async executeInvoke(activity, context) {
        const serviceName = activity.service;
        const operation = activity.operation;
        const inputData = context.variables[activity.inputVariable];
        
        console.log(`[BPEL] Invoking ${serviceName}.${operation}`);
        
        try {
            let result;
            
            switch (serviceName) {
                case 'orders-service':
                    result = await this.callOrdersService(operation, inputData);
                    break;
                case 'payments-service':
                    result = await this.callPaymentsService(operation, inputData);
                    break;
                case 'shipping-service':
                    result = await this.callShippingService(operation, inputData);
                    break;
                case 'catalog-service':
                    result = await this.callCatalogService(operation, inputData);
                    break;
                default:
                    throw new Error(`Unknown service: ${serviceName}`);
            }
            
            // Store result in context variable
            if (activity.outputVariable) {
                context.variables[activity.outputVariable] = result;
            }
            
        } catch (error) {
            console.error(`[BPEL] Service call failed: ${serviceName}.${operation} - ${error.message}`);
            throw error;
        }
    }

    /**
     * Execute if activity (conditional logic)
     */
    async executeIf(activity, context) {
        const condition = this.evaluateCondition(activity.condition, context);
        
        if (condition) {
            console.log(`[BPEL] Condition true, executing then branch`);
            if (activity.then && activity.then.length > 0) {
                await this.executeActivities(activity.then, context);
            }
        } else {
            console.log(`[BPEL] Condition false, executing else branch`);
            if (activity.else && activity.else.length > 0) {
                await this.executeActivities(activity.else, context);
            }
        }
    }

    /**
     * Evaluate condition expression
     */
    evaluateCondition(condition, context) {
        // Simple condition evaluation - in a real BPEL engine, this would be more sophisticated
        try {
            // Replace variable references with actual values
            let evaluatedCondition = condition;
            Object.keys(context.variables).forEach(varName => {
                const value = context.variables[varName];
                if (value && typeof value === 'object') {
                    evaluatedCondition = evaluatedCondition.replace(
                        new RegExp(`${varName}\\.(\\w+)`, 'g'),
                        (match, prop) => {
                            return value[prop] !== undefined ? JSON.stringify(value[prop]) : 'undefined';
                        }
                    );
                }
            });
            
            // Simple evaluation - in production, use a proper expression evaluator
            return eval(evaluatedCondition);
        } catch (error) {
            console.error(`[BPEL] Condition evaluation failed: ${condition} - ${error.message}`);
            return false;
        }
    }

    /**
     * Service call implementations - Real HTTP calls
     */
    async callOrdersService(operation, data) {
        try {
            console.log(`[BPEL] Making real HTTP call to orders-service.${operation}`);
            const response = await axios.post('http://orders:3000/orders', data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.getServiceToken()
                },
                timeout: 10000
            });
            
            console.log(`[BPEL] Orders service response:`, response.data);
            return {
                orderId: data.id,
                status: 'created',
                message: 'Order created successfully',
                response: response.data
            };
        } catch (error) {
            console.error(`[BPEL] Orders service call failed:`, error.message);
            throw new Error(`Orders service call failed: ${error.message}`);
        }
    }

    async callPaymentsService(operation, data) {
        try {
            console.log(`[BPEL] Making real HTTP call to payments-service.${operation}`);
            const response = await axios.post('http://payments:3001/payments', {
                orderId: data.id,
                amount: data.quantity * 100,
                customerName: data.customerName
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.getServiceToken()
                },
                timeout: 10000
            });
            
            console.log(`[BPEL] Payments service response:`, response.data);
            return {
                orderId: data.id,
                status: 'completed',
                paymentId: response.data.paymentId || `PAY-${Math.floor(Math.random() * 100000)}`,
                amount: data.quantity * 100,
                response: response.data
            };
        } catch (error) {
            console.error(`[BPEL] Payments service call failed:`, error.message);
            throw new Error(`Payments service call failed: ${error.message}`);
        }
    }

    async callShippingService(operation, data) {
        try {
            console.log(`[BPEL] Making real HTTP call to shipping-service.${operation}`);
            const response = await axios.post('http://shipping:3002/shipping', {
                orderId: data.id,
                customerName: data.customerName,
                shippingAddress: data.shippingAddress
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.getServiceToken()
                },
                timeout: 10000
            });
            
            console.log(`[BPEL] Shipping service response:`, response.data);
            return {
                orderId: data.id,
                status: 'completed',
                shippingId: response.data.shippingId || `SHIP-${Math.floor(Math.random() * 100000)}`,
                response: response.data
            };
        } catch (error) {
            console.error(`[BPEL] Shipping service call failed:`, error.message);
            throw new Error(`Shipping service call failed: ${error.message}`);
        }
    }

    async callCatalogService(operation, data) {
        try {
            console.log(`[BPEL] Making real HTTP call to catalog-service.${operation}`);
            // For catalog service, we'll update stock via REST API
            const response = await axios.put(`http://catalog:8080/CatalogService/api/products/1/stock`, {
                quantity: data.quantity
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            
            console.log(`[BPEL] Catalog service response:`, response.data);
            return {
                productId: data.item,
                quantity: data.quantity,
                status: 'updated',
                message: 'Stock updated successfully',
                response: response.data
            };
        } catch (error) {
            console.error(`[BPEL] Catalog service call failed:`, error.message);
            // Don't throw error for catalog update failure - it's not critical
            return {
                productId: data.item,
                quantity: data.quantity,
                status: 'failed',
                message: `Stock update failed: ${error.message}`,
                error: error.message
            };
        }
    }

    /**
     * Get service token for authentication
     */
    getServiceToken() {
        // Generate a service token for inter-service communication
        const jwt = require('jsonwebtoken');
        const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
        
        return jwt.sign({
            sub: 'bpel-engine',
            email: 'bpel-engine',
            scope: 'read write',
            type: 'service'
        }, secret, { expiresIn: '1h' });
    }

    /**
     * Get workflow execution status
     */
    getExecutionStatus(executionId) {
        return this.executionHistory.get(executionId);
    }

    /**
     * List all workflow executions
     */
    getAllExecutions() {
        return Array.from(this.executionHistory.values());
    }

    /**
     * Get workflow definition
     */
    getWorkflowDefinition(workflowName) {
        return this.workflows.get(workflowName);
    }

    /**
     * List all available workflows
     */
    getAvailableWorkflows() {
        return Array.from(this.workflows.keys());
    }
}

module.exports = BPELEngine;
