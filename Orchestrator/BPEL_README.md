# BPEL Engine Implementation

## Overview

This implementation provides a simple BPEL (Business Process Execution Language) engine for orchestrating the "PlaceOrder" workflow in the SOA microservices architecture.

## Features

- **Simple BPEL Engine**: Lightweight implementation of BPEL workflow execution
- **PlaceOrder Workflow**: Complete order processing workflow with conditional logic
- **Activity Types**: Support for receive, invoke, if/else, throw, and reply activities
- **Execution Tracking**: Full execution history and status monitoring
- **REST API**: Complete REST API for workflow management

## BPEL Workflow Definition

The PlaceOrder workflow includes the following activities:

1. **receive**: Receive order request
2. **invoke**: Create order in Orders service
3. **invoke**: Process payment in Payments service
4. **if**: Check payment success
   - **then**: Process shipping and update catalog stock
   - **else**: Throw payment failed fault
5. **reply**: Send order completion response

## API Endpoints

### Workflow Management
- `GET /bpel/workflows` - List available workflows
- `GET /bpel/workflows/:name` - Get workflow definition
- `POST /bpel/workflows/:name/execute` - Execute workflow

### Execution Management
- `GET /bpel/executions` - List all executions
- `GET /bpel/executions/:id` - Get execution status

### Order Processing
- `POST /place-order` - Place order using BPEL workflow

## Usage Examples

### 1. List Available Workflows
```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:3003/bpel/workflows
```

### 2. Get Workflow Definition
```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:3003/bpel/workflows/PlaceOrder
```

### 3. Execute PlaceOrder Workflow
```bash
curl -X POST \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{
       "id": "ORDER-001",
       "item": "Laptop",
       "quantity": 2,
       "customerName": "John Doe",
       "shippingAddress": {
         "street": "123 Main St",
         "city": "New York",
         "zipCode": "10001"
       }
     }' \
     http://localhost:3003/bpel/workflows/PlaceOrder/execute
```

### 4. Check Execution Status
```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:3003/bpel/executions/<execution-id>
```

## Workflow Execution Flow

```
Order Request
     ↓
[receive] Receive Order
     ↓
[invoke] Create Order → Orders Service
     ↓
[invoke] Process Payment → Payments Service
     ↓
[if] Payment Success?
     ↓ (Yes)
[invoke] Process Shipping → Shipping Service
     ↓
[if] Shipping Success?
     ↓ (Yes)
[invoke] Update Stock → Catalog Service
     ↓
[reply] Order Complete
```

## Error Handling

The BPEL engine includes comprehensive error handling:

- **Payment Failed**: Throws `PaymentFailedFault` if payment processing fails
- **Shipping Failed**: Throws `ShippingFailedFault` if shipping processing fails
- **Service Errors**: Captures and reports service invocation errors
- **Execution Tracking**: All errors are logged with execution context

## Testing

Run the test script to verify BPEL engine functionality:

```bash
cd Orchestrator
node test-bpel.js
```

## Integration with Existing System

The BPEL engine integrates seamlessly with the existing microservices:

- **Backward Compatibility**: Still sends messages to RabbitMQ for legacy services
- **OAuth2 Authentication**: All endpoints require proper authentication
- **UDDI Integration**: Can be extended to use UDDI for service discovery
- **Monitoring**: Full execution tracking and status monitoring

## Configuration

The BPEL engine is configured in `bpel-engine.js`:

- **Workflow Definitions**: Define workflows in the constructor
- **Service Calls**: Implement service invocation logic
- **Condition Evaluation**: Customize condition evaluation logic
- **Error Handling**: Configure fault handling behavior

## Future Enhancements

Potential improvements for the BPEL engine:

1. **More Activity Types**: Add support for loops, parallel execution, etc.
2. **Service Discovery**: Integrate with UDDI for dynamic service endpoints
3. **Persistence**: Store workflow definitions and execution history in database
4. **Visualization**: Add workflow visualization and monitoring UI
5. **Advanced Conditions**: Implement more sophisticated condition evaluation
6. **Compensation**: Add compensation logic for failed workflows

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client        │    │   BPEL Engine   │    │   Services      │
│   Application   │───▶│   (Orchestrator)│───▶│   (Orders,      │
│                 │    │                 │    │    Payments,    │
└─────────────────┘    └─────────────────┘    │    Shipping,    │
                              │                │    Catalog)     │
                              ▼                └─────────────────┘
                    ┌─────────────────┐
                    │   Execution     │
                    │   History       │
                    │   & Status      │
                    └─────────────────┘
```

This simple BPEL implementation provides a solid foundation for workflow orchestration while maintaining simplicity and ease of use.
