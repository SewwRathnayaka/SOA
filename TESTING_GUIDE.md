# 🧪 **Comprehensive Testing Guide**

## 🎯 **Overview**
This guide covers testing all aspects of the SOA microservices system, from individual services to complete workflow testing.

---

## 🔧 **1. Pre-Testing Setup**

### **Start All Services**
```bash
# Option 1: Using Docker Compose (Recommended)
docker-compose up -d

# Option 2: Individual services (see SERVICE_RUNNING_GUIDE.md)
# Start each service in separate terminals
```

### **Verify Services Are Running**
```bash
# Check all services
curl http://localhost:3003/health  # Orchestrator
curl http://localhost:8080/api/products  # Catalog
curl http://localhost:3000/health  # Orders
curl http://localhost:3001/health  # Payments
curl http://localhost:3002/health  # Shipping

# Check RabbitMQ
curl http://localhost:15672  # Management UI
```

---

## 🔐 **2. OAuth2 Authentication Testing**

### **Get Authentication Token**

#### **Method 1: Using Browser (Interactive)**
```bash
# Step 1: Get authorization code
# Open browser and navigate to:
http://localhost:3003/oauth/authorize?client_id=orders-service-client&redirect_uri=http://localhost:3000/auth/callback&scope=read%20write&response_type=code

# Step 2: Copy the authorization code from the redirect URL
# Example: http://localhost:3000/auth/callback?code=abc123&state=

# Step 3: Exchange code for token
curl -X POST http://localhost:3003/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=YOUR_AUTH_CODE&client_id=orders-service-client&client_secret=orders-service-secret&redirect_uri=http://localhost:3000/auth/callback"
```

#### **Method 2: Using Scripts (Automated)**
```bash
# Use the provided token scripts
cd Token-getter

# Windows
./get-oauth-token.bat

# PowerShell
./get-oauth-token.ps1

# Linux/Mac
./get-token.bat
```

#### **Method 3: Direct Service Token (For Testing)**
```bash
# Generate service token directly
curl -X POST http://localhost:3003/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=orders-service-client&client_secret=orders-service-secret&scope=read%20write"
```

### **Store Token for Testing**
```bash
# Store token in environment variable
export JWT_TOKEN="your_jwt_token_here"

# Or create a token file
echo "your_jwt_token_here" > token.txt
```

---

## 📚 **3. Catalog Service Testing**

### **SOAP Web Service Testing**

#### **Using SoapUI**
1. **Open SoapUI**
2. **Create New SOAP Project**
3. **WSDL URL**: `http://localhost:8080/CatalogService?wsdl`
4. **Test Operations**:
   - `getAllProducts`
   - `getProduct` (with ID: "1")
   - `addProduct`
   - `updateProduct`
   - `deleteProduct`

#### **Using cURL (SOAP)**
```bash
# Test getAllProducts
curl -X POST http://localhost:8080/CatalogService \
  -H "Content-Type: text/xml; charset=utf-8" \
  -H "SOAPAction: \"\"" \
  -d '<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cat="http://catalog.globalbooks/">
   <soapenv:Header/>
   <soapenv:Body>
      <cat:getAllProducts/>
   </soapenv:Body>
</soapenv:Envelope>'

# Test getProduct
curl -X POST http://localhost:8080/CatalogService \
  -H "Content-Type: text/xml; charset=utf-8" \
  -H "SOAPAction: \"\"" \
  -d '<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cat="http://catalog.globalbooks/">
   <soapenv:Header/>
   <soapenv:Body>
      <cat:getProduct>
         <id>1</id>
      </cat:getProduct>
   </soapenv:Body>
</soapenv:Envelope>'
```

### **REST API Testing**
```bash
# Get all products
curl http://localhost:8080/api/products

# Get specific product
curl http://localhost:8080/api/products/1

# Update product stock
curl -X PUT http://localhost:8080/api/products/1/stock \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5}'
```

### **Expected Results**
```json
// GET /api/products response
{
  "products": [
    {
      "id": "1",
      "name": "The Lord of the Rings",
      "description": "Fantasy novel by J.R.R. Tolkien",
      "price": 25.0,
      "quantity": 100
    },
    {
      "id": "2",
      "name": "Pride and Prejudice",
      "description": "Romantic novel by Jane Austen",
      "price": 15.5,
      "quantity": 150
    }
  ]
}
```

---

## 📦 **4. Orders Service Testing**

### **Create Order**
```bash
# Create new order
curl -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-order-001",
    "item": "The Great Gatsby",
    "quantity": 2,
    "customerName": "John Doe",
    "shippingAddress": {
      "street": "123 Main Street",
      "city": "New York",
      "zipCode": "10001"
    }
  }'
```

### **Get Order**
```bash
# Get order by ID
curl -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:3000/orders/test-order-001
```

### **Get All Orders (Admin)**
```bash
# Get all orders (requires admin scope)
curl -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:3000/orders
```

### **Expected Results**
```json
// Order creation response
"Order test-order-001 saved and initiation request sent to Orchestrator"

// Order details response
{
  "_id": "...",
  "id": "test-order-001",
  "item": "The Great Gatsby",
  "quantity": 2,
  "customerName": "John Doe",
  "shippingAddress": {
    "street": "123 Main Street",
    "city": "New York",
    "zipCode": "10001"
  },
  "status": "pending",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

---

## 💳 **5. Payments Service Testing**

### **Check Payment Status**
```bash
# Wait 5-10 seconds after creating order, then check payment
curl -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:3001/payments/test-order-001
```

### **Expected Results**
```json
{
  "_id": "...",
  "orderId": "test-order-001",
  "paymentId": "PAY-12345",
  "amount": 200,
  "status": "completed",
  "processedBy": "system",
  "createdAt": "2024-01-01T12:00:05.000Z",
  "updatedAt": "2024-01-01T12:00:05.000Z"
}
```

---

## 📦 **6. Shipping Service Testing**

### **Check Shipping Status**
```bash
# Wait 10-15 seconds after creating order, then check shipping
curl -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:3002/shipping/test-order-001
```

### **Expected Results**
```json
{
  "_id": "...",
  "orderId": "test-order-001",
  "shippingId": "SHIP-67890",
  "address": {
    "street": "123 Main Street",
    "city": "New York",
    "zipCode": "10001"
  },
  "status": "shipped",
  "createdAt": "2024-01-01T12:00:10.000Z",
  "updatedAt": "2024-01-01T12:00:10.000Z"
}
```

---

## 🎯 **7. Orchestrator Service Testing**

### **Check Workflow Status**
```bash
# Check complete workflow status
curl -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:3003/workflow-status/test-order-001
```

### **Expected Results**
```json
{
  "orderId": "test-order-001",
  "details": {
    "order": {
      "id": "test-order-001",
      "item": "The Great Gatsby",
      "quantity": 2,
      "customerName": "John Doe",
      "status": "pending",
      "createdAt": "2024-01-01T12:00:00.000Z"
    },
    "payment": {
      "orderId": "test-order-001",
      "paymentId": "PAY-12345",
      "amount": 200,
      "status": "completed",
      "createdAt": "2024-01-01T12:00:05.000Z"
    },
    "shipping": {
      "orderId": "test-order-001",
      "shippingId": "SHIP-67890",
      "status": "shipped",
      "createdAt": "2024-01-01T12:00:10.000Z"
    }
  }
}
```

### **Direct Order Creation via Orchestrator**
```bash
# Create order directly through orchestrator
curl -X POST http://localhost:3003/place-order \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "orchestrator-order-001",
    "item": "To Kill a Mockingbird",
    "quantity": 1,
    "customerName": "Jane Smith",
    "shippingAddress": {
      "street": "456 Oak Avenue",
      "city": "Los Angeles",
      "zipCode": "90210"
    }
  }'
```

---

## 🔄 **8. Complete Workflow Testing**

### **End-to-End Test Script**
```bash
#!/bin/bash
# complete-workflow-test.sh

echo "🚀 Starting Complete Workflow Test..."

# Set variables
ORDER_ID="workflow-test-$(date +%s)"
JWT_TOKEN="your_jwt_token_here"

echo "📝 Creating order: $ORDER_ID"

# Step 1: Create Order
ORDER_RESPONSE=$(curl -s -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": \"$ORDER_ID\",
    \"item\": \"Test Book\",
    \"quantity\": 1,
    \"customerName\": \"Test User\",
    \"shippingAddress\": {
      \"street\": \"123 Test St\",
      \"city\": \"Test City\",
      \"zipCode\": \"12345\"
    }
  }")

echo "✅ Order created: $ORDER_RESPONSE"

# Step 2: Wait for processing
echo "⏳ Waiting for payment processing..."
sleep 10

# Step 3: Check Payment
PAYMENT_RESPONSE=$(curl -s -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:3001/payments/$ORDER_ID)
echo "💳 Payment status: $PAYMENT_RESPONSE"

# Step 4: Wait for shipping
echo "⏳ Waiting for shipping processing..."
sleep 10

# Step 5: Check Shipping
SHIPPING_RESPONSE=$(curl -s -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:3002/shipping/$ORDER_ID)
echo "📦 Shipping status: $SHIPPING_RESPONSE"

# Step 6: Check Complete Workflow
WORKFLOW_RESPONSE=$(curl -s -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:3003/workflow-status/$ORDER_ID)
echo "🎯 Complete workflow: $WORKFLOW_RESPONSE"

echo "✅ Workflow test completed!"
```

### **Run Complete Test**
```bash
# Make script executable
chmod +x complete-workflow-test.sh

# Run test
./complete-workflow-test.sh
```

---

## 🧪 **9. Load Testing**

### **Using Apache Bench (ab)**
```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test Orders Service
ab -n 100 -c 10 -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -p order-payload.json \
  http://localhost:3000/orders

# Test Catalog Service
ab -n 1000 -c 50 http://localhost:8080/api/products
```

### **Create Test Payload**
```bash
# Create order-payload.json
cat > order-payload.json << EOF
{
  "id": "load-test-001",
  "item": "Load Test Book",
  "quantity": 1,
  "customerName": "Load Test User",
  "shippingAddress": {
    "street": "123 Load Test St",
    "city": "Load Test City",
    "zipCode": "12345"
  }
}
EOF
```

---

## 🔍 **10. Error Testing**

### **Test Invalid Requests**
```bash
# Test invalid order ID
curl -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:3000/orders/invalid-id

# Test invalid product ID
curl http://localhost:8080/api/products/invalid-id

# Test invalid payment ID
curl -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:3001/payments/invalid-id

# Test without authentication
curl http://localhost:3000/orders

# Test with invalid token
curl -H "Authorization: Bearer invalid-token" \
  http://localhost:3000/orders
```

### **Expected Error Responses**
```json
// 404 Not Found
{
  "error": "Order not found"
}

// 401 Unauthorized
{
  "error": "Unauthorized - Invalid or missing token"
}

// 403 Forbidden
{
  "error": "Forbidden - Insufficient permissions"
}
```

---

## 📊 **11. Performance Testing**

### **Response Time Testing**
```bash
# Test response times
time curl -s http://localhost:8080/api/products
time curl -s -H "Authorization: Bearer $JWT_TOKEN" http://localhost:3000/orders
time curl -s -H "Authorization: Bearer $JWT_TOKEN" http://localhost:3003/workflow-status/test-order-001
```

### **Memory Usage Testing**
```bash
# Check Docker container resource usage
docker stats

# Check individual service memory
docker exec -it soa-microservice-orders-1 ps aux
docker exec -it soa-microservice-catalog-1 ps aux
```

---

## 🐛 **12. Debugging & Troubleshooting**

### **Check Service Logs**
```bash
# Docker Compose logs
docker-compose logs -f orders
docker-compose logs -f payments
docker-compose logs -f shipping
docker-compose logs -f orchestrator
docker-compose logs -f catalog

# Individual container logs
docker logs soa-microservice-orders-1
docker logs soa-microservice-catalog-1
```

### **Check RabbitMQ Queues**
```bash
# Access RabbitMQ Management UI
open http://localhost:15672
# Login: guest/guest

# Check queue status
docker exec -it soa-microservice-rabbitmq-1 rabbitmqctl list_queues
```

### **Check Database Connections**
```bash
# Check MongoDB connections
docker exec -it soa-microservice-orders-db-1 mongo --eval "db.stats()"
docker exec -it soa-microservice-payments-db-1 mongo --eval "db.stats()"
docker exec -it soa-microservice-shipping-db-1 mongo --eval "db.stats()"
```

---

## 📋 **13. Test Checklist**

### **Individual Service Tests**
- [ ] Catalog Service SOAP operations
- [ ] Catalog Service REST API
- [ ] Orders Service CRUD operations
- [ ] Payments Service status checks
- [ ] Shipping Service status checks
- [ ] Orchestrator OAuth2 endpoints
- [ ] Orchestrator workflow status

### **Integration Tests**
- [ ] OAuth2 authentication flow
- [ ] Order creation workflow
- [ ] Payment processing workflow
- [ ] Shipping processing workflow
- [ ] Complete end-to-end workflow
- [ ] Error handling scenarios

### **Performance Tests**
- [ ] Response time benchmarks
- [ ] Load testing with multiple requests
- [ ] Memory usage monitoring
- [ ] Database connection testing
- [ ] RabbitMQ queue performance

### **Security Tests**
- [ ] Authentication token validation
- [ ] Authorization scope testing
- [ ] Invalid request handling
- [ ] SQL injection prevention
- [ ] XSS prevention

---

## 🎯 **14. Test Results Validation**

### **Success Criteria**
- ✅ All services respond within 2 seconds
- ✅ OAuth2 authentication works correctly
- ✅ Complete workflow processes in under 30 seconds
- ✅ Error handling returns appropriate HTTP status codes
- ✅ No memory leaks or resource issues
- ✅ RabbitMQ queues process messages correctly
- ✅ Database operations complete successfully

### **Performance Benchmarks**
- **Catalog Service**: < 500ms response time
- **Orders Service**: < 1s response time
- **Payments Service**: < 2s processing time
- **Shipping Service**: < 2s processing time
- **Complete Workflow**: < 30s total time

---

## 🚀 **15. Automated Testing**

### **Create Test Suite**
```bash
# Create test directory
mkdir tests
cd tests

# Create test script
cat > run-all-tests.sh << 'EOF'
#!/bin/bash
echo "🧪 Running SOA Microservices Test Suite..."

# Test 1: Service Health Checks
echo "1. Testing service health checks..."
./test-health-checks.sh

# Test 2: OAuth2 Authentication
echo "2. Testing OAuth2 authentication..."
./test-oauth2.sh

# Test 3: Individual Services
echo "3. Testing individual services..."
./test-catalog.sh
./test-orders.sh
./test-payments.sh
./test-shipping.sh

# Test 4: Complete Workflow
echo "4. Testing complete workflow..."
./test-workflow.sh

echo "✅ All tests completed!"
EOF

chmod +x run-all-tests.sh
```

---

## 🎉 **Testing Summary**

This comprehensive testing guide covers:
- ✅ **Individual service testing**
- ✅ **OAuth2 authentication testing**
- ✅ **Complete workflow testing**
- ✅ **Error handling testing**
- ✅ **Performance testing**
- ✅ **Load testing**
- ✅ **Debugging and troubleshooting**

Follow this guide to ensure your SOA microservices system is working correctly and performing optimally!
