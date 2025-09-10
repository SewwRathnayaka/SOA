/**
 * Simple test script for BPEL Engine
 * This script demonstrates how to use the BPEL engine for PlaceOrder workflow
 */

const BPELEngine = require('./bpel-engine');

async function testBPELWorkflow() {
    console.log('=== BPEL Engine Test ===\n');
    
    // Initialize BPEL Engine
    const bpelEngine = new BPELEngine();
    
    // Test 1: List available workflows
    console.log('1. Available Workflows:');
    const workflows = bpelEngine.getAvailableWorkflows();
    console.log(workflows);
    console.log();
    
    // Test 2: Get workflow definition
    console.log('2. PlaceOrder Workflow Definition:');
    const workflow = bpelEngine.getWorkflowDefinition('PlaceOrder');
    console.log(JSON.stringify(workflow, null, 2));
    console.log();
    
    // Test 3: Execute workflow
    console.log('3. Executing PlaceOrder Workflow:');
    const orderData = {
        id: 'ORDER-001',
        item: 'Laptop',
        quantity: 2,
        customerName: 'John Doe',
        shippingAddress: {
            street: '123 Main St',
            city: 'New York',
            zipCode: '10001'
        }
    };
    
    console.log('Input Data:', JSON.stringify(orderData, null, 2));
    console.log();
    
    try {
        const result = await bpelEngine.executeWorkflow('PlaceOrder', orderData);
        console.log('Execution Result:', JSON.stringify(result, null, 2));
        console.log();
        
        // Test 4: Get execution status
        console.log('4. Execution Status:');
        const execution = bpelEngine.getExecutionStatus(result.executionId);
        console.log(JSON.stringify(execution, null, 2));
        console.log();
        
        // Test 5: List all executions
        console.log('5. All Executions:');
        const allExecutions = bpelEngine.getAllExecutions();
        console.log(`Total executions: ${allExecutions.length}`);
        allExecutions.forEach(exec => {
            console.log(`- ${exec.id}: ${exec.status} (${exec.duration}ms)`);
        });
        
    } catch (error) {
        console.error('Workflow execution failed:', error.message);
    }
    
    console.log('\n=== Test Complete ===');
}

// Run the test
if (require.main === module) {
    testBPELWorkflow().catch(console.error);
}

module.exports = { testBPELWorkflow };
