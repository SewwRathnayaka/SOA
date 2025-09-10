# 🧪 **SOA Microservices Testing Guide**

This guide provides step-by-step instructions for testing all components of the SOA microservices architecture.

## 📋 **Testing Overview**

### **Testing Tools**
- **Postman**: REST API testing for all services
- **SoapUI**: SOAP web service testing for Catalog service
- **cURL**: Command-line testing for governance and health checks
- **Batch Scripts**: OAuth2 token acquisition

### **Testing Order**
1. **Health Checks** - Verify all services are running
2. **OAuth2 Authentication** - Get JWT tokens
3. **Service Discovery** - Test UDDI Registry
4. **Order Workflow** - Complete end-to-end testing
5. **Catalog Service** - SOAP and REST API testing
6. **Governance Framework** - System governance testing

## 🚀 **Quick Start Testing**

### **Step 1: Start All Services**
```bash
# Start all services
docker compose up -d

# Verify all services are running
docker compose ps

# Expected: All 9 services should be "Up"
```

### **Step 2: Get OAuth2 Token**
```bash
# Navigate to token directory
cd Token-getter

# Run the batch file to get JWT token
get-token.bat

# Copy the access_token from the response
```

### **Step 3: Import Postman Collection**
1. Open Postman
2. Click **Import**
3. Select `SOA-Microservices-Postman-Collection.json`
4. Set the `accessToken` variable with your JWT token

## 🏥 **1. Health Checks Testing**

### **Postman Tests**
Run these tests to verify all services are healthy:

| Service | Endpoint | Expected Response |
|---------|----------|-------------------|
| **Orders** | `GET http://localhost:3000/health` | `{"status": "healthy", "service": "Orders Service"}` |
| **Payments** | `GET http://localhost:3001/health` | `{"status": "healthy", "service": "Payments Service"}` |
| **Shipping** | `GET http://localhost:3002/health` | `{"status": "healthy", "service": "Shipping Service"}` |
| **Orchestrator** | `GET http://localhost:3003/health` | `{"status": "healthy", "service": "Orchestrator Service"}` |
| **UDDI Registry** | `GET http://localhost:3004/health` | `{"status": "healthy", "service": "UDDI Registry"}` |
| **Catalog** | `GET http://localhost:8080/` | HTML response with service info |

### **cURL Commands**
```bash
# Test all health endpoints
curl http://localhost:3000/health
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
curl http://localhost:8080/
```

## 🔐 **2. OAuth2 Authentication Testing**

### **Method 1: Batch Script (Recommended)**
```bash
# Navigate to token directory
cd Token-getter

# Run the batch file
get-token.bat

# Expected output:
# {
#   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "token_type": "Bearer",
#   "expires_in": 3600,
#   "scope": "read write"
# }
```

### **Method 2: Postman OAuth2 Flow**
1. **Get Authorization Code**:
   - `GET http://localhost:3003/oauth/authorize?response_type=code&client_id=orders-service-client&redirect_uri=http://localhost:3000/auth/callback&scope=read write`

2. **Exchange for Token**:
   - `POST http://localhost:3003/oauth/token`
   - Body: `grant_type=authorization_code&code=test-code&client_id=orders-service-client&client_secret=orders-service-secret&redirect_uri=http://localhost:3000/auth/callback`

### **Method 3: cURL Commands**
```bash
# Get authorization code
curl "http://localhost:3003/oauth/authorize?response_type=code&client_id=orders-service-client&redirect_uri=http://localhost:3000/auth/callback&scope=read write"

# Exchange for token
curl -X POST http://localhost:3003/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=test-code&client_id=orders-service-client&client_secret=orders-service-secret&redirect_uri=http://localhost:3000/auth/callback"
```

## 🔍 **3. Service Discovery Testing (UDDI Registry)**

### **Postman Tests**

#### **Register a Service**
- **Method**: `POST`
- **URL**: `http://localhost:3004/api/services/register`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "serviceId": "test-service",
  "name": "Test Service",
  "category": "test",
  "provider": "Test Provider",
  "description": "Test service for discovery",
  "version": "1.0.0",
  "interfaces": [
    {
      "type": "REST",
      "endpoint": "http://localhost:3000",
      "operations": ["GET", "POST"]
    }
  ]
}
```

#### **List All Services**
- **Method**: `GET`
- **URL**: `http://localhost:3004/api/services`
- **Expected**: List of registered services

#### **Get Service by ID**
- **Method**: `GET`
- **URL**: `http://localhost:3004/api/services/{serviceId}`
- **Expected**: Service details

### **cURL Commands**
```bash
# Register a service
curl -X POST http://localhost:3004/api/services/register \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "test-service",
    "name": "Test Service",
    "category": "test",
    "provider": "Test Provider",
    "description": "Test service for discovery",
    "version": "1.0.0",
    "interfaces": [{"type": "REST", "endpoint": "http://localhost:3000", "operations": ["GET", "POST"]}]
  }'

# List all services
curl http://localhost:3004/api/services

# Get specific service
curl http://localhost:3004/api/services/test-service
```

## 📦 **4. Order Workflow Testing**

### **Complete End-to-End Workflow**

#### **Step 1: Place Order**
- **Method**: `POST`
- **URL**: `http://localhost:3003/place-order`
- **Headers**: `Authorization: Bearer {accessToken}`, `Content-Type: application/json`
- **Body**:
     ```json
     {
       "id": "ORDER-001",
  "item": "Laptop",
       "quantity": 2,
       "customerName": "John Doe",
       "shippingAddress": {
         "street": "123 Main St",
         "city": "New York",
         "zipCode": "10001"
       }
     }
     ```

#### **Step 2: Check Workflow Status**
- **Method**: `GET`
- **URL**: `http://localhost:3003/workflow-status/ORDER-001`
- **Headers**: `Authorization: Bearer {accessToken}`
- **Expected**: Complete workflow status with all service responses

#### **Step 3: Verify Order in Orders Service**
- **Method**: `GET`
- **URL**: `http://localhost:3000/orders/ORDER-001`
- **Headers**: `Authorization: Bearer {accessToken}`
- **Expected**: Order details

#### **Step 4: Verify Payment**
- **Method**: `GET`
- **URL**: `http://localhost:3001/payments/ORDER-001`
- **Headers**: `Authorization: Bearer {accessToken}`
- **Expected**: Payment details (90% success rate)

#### **Step 5: Verify Shipping**
- **Method**: `GET`
- **URL**: `http://localhost:3002/shipping/ORDER-001`
- **Headers**: `Authorization: Bearer {accessToken}`
- **Expected**: Shipping details (90% success rate)

### **cURL Commands**
```bash
# Place order
curl -X POST http://localhost:3003/place-order \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
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
  }'

# Check workflow status
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3003/workflow-status/ORDER-001

# Verify order
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3000/orders/ORDER-001

# Verify payment
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3001/payments/ORDER-001

# Verify shipping
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3002/shipping/ORDER-001
```

## 🏪 **5. Catalog Service Testing**

### **SOAP Service Testing (SoapUI)**

#### **Setup SoapUI**
1. Open SoapUI
2. Import project: `CatalogService/SoapUI_Tests/CatalogService-Live-WSDL-Project-soapui-project.xml`
3. Ensure Catalog service is running on port 8080

#### **SOAP Operations**

##### **Get All Products**
- **Operation**: `getAllProducts`
- **Expected**: List of all products

##### **Get Product by ID**
- **Operation**: `getProduct`
- **Parameter**: `id = "1"`
- **Expected**: Product details

##### **Add Product**
- **Operation**: `addProduct`
- **Parameter**:
  ```xml
  <product>
    <id>3</id>
    <name>Dragon's Breath</name>
  <description>A thrilling fantasy novel about dragons.</description>
    <price>22.50</price>
    <quantity>50</quantity>
  </product>
  ```

##### **Update Product**
- **Operation**: `updateProduct`
- **Parameter**: Updated product data

##### **Delete Product**
- **Operation**: `deleteProduct`
- **Parameter**: `id = "3"`

### **REST API Testing (Postman)**

#### **Update Product Stock**
- **Method**: `PUT`
- **URL**: `http://localhost:8080/CatalogService/api/products/1/stock`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "quantity": 10
}
```

#### **Get Product by ID (REST)**
- **Method**: `GET`
- **URL**: `http://localhost:8080/CatalogService/api/products/1`
- **Expected**: Product details in JSON format

#### **Get All Products (REST)**
- **Method**: `GET`
- **URL**: `http://localhost:8080/CatalogService/api/products`
- **Expected**: List of all products in JSON format

### **cURL Commands**
```bash
# Get all products (REST)
curl http://localhost:8080/CatalogService/api/products

# Get product by ID (REST)
curl http://localhost:8080/CatalogService/api/products/1

# Update product stock (REST)
curl -X PUT http://localhost:8080/CatalogService/api/products/1/stock \
  -H "Content-Type: application/json" \
  -d '{"quantity": 10}'
```

## 🏗️ **6. BPEL Workflow Testing**

### **Postman Tests**

#### **List Available Workflows**
- **Method**: `GET`
- **URL**: `http://localhost:3003/bpel/workflows`
- **Headers**: `Authorization: Bearer {accessToken}`
- **Expected**: List of available BPEL workflows

#### **Get Workflow Definition**
- **Method**: `GET`
- **URL**: `http://localhost:3003/bpel/workflows/PlaceOrder`
- **Headers**: `Authorization: Bearer {accessToken}`
- **Expected**: PlaceOrder workflow definition

#### **Execute Workflow**
- **Method**: `POST`
- **URL**: `http://localhost:3003/bpel/workflows/PlaceOrder/execute`
- **Headers**: `Authorization: Bearer {accessToken}`, `Content-Type: application/json`
- **Body**: Order data (same as place-order)

#### **List Workflow Executions**
- **Method**: `GET`
- **URL**: `http://localhost:3003/bpel/executions`
- **Headers**: `Authorization: Bearer {accessToken}`
- **Expected**: List of workflow executions

#### **Get Execution Status**
- **Method**: `GET`
- **URL**: `http://localhost:3003/bpel/executions/{executionId}`
- **Headers**: `Authorization: Bearer {accessToken}`
- **Expected**: Execution status and details

### **cURL Commands**
```bash
# List workflows
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3003/bpel/workflows

# Get workflow definition
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3003/bpel/workflows/PlaceOrder

# Execute workflow
curl -X POST \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"id": "ORDER-002", "item": "Book", "quantity": 1, "customerName": "Jane Doe", "shippingAddress": {"street": "456 Oak St", "city": "Boston", "zipCode": "02101"}}' \
     http://localhost:3003/bpel/workflows/PlaceOrder/execute

# List executions
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3003/bpel/executions
```

## 🛡️ **7. Governance Framework Testing**

### **Governance Dashboard Test**
```bash
# Navigate to governance directory
cd Governance

# Run governance test script
node test-governance.js

# Expected output: All governance components working correctly
```

### **API Versioning Test**
```bash
# Test version middleware
curl http://localhost:3003/bpel/workflows

# Check version headers in response
```

### **SLA Monitoring Test**
```bash
# Test SLA monitoring
curl http://localhost:3000/health
curl http://localhost:3001/health
curl http://localhost:3002/health

# Check response times and status codes
```

### **Deprecation Management Test**
  ```bash
# Test deprecation manager
cd Governance
node -e "
const DeprecationManager = require('./Deprecation-Schedules/deprecation-manager');
const dm = new DeprecationManager();
console.log('Deprecation Schedule:', dm.getDeprecationSchedule());
"
```

## 🐳 **8. Docker and Infrastructure Testing**

### **Service Status Check**
```bash
# Check all services are running
docker compose ps

# Expected: All services should be "Up"
```

### **Service Logs**
```bash
# View logs for specific services
docker compose logs -f orchestrator
docker compose logs -f orders
docker compose logs -f payments
docker compose logs -f shipping
docker compose logs -f catalog
```

### **RabbitMQ Management**
1. Open browser: `http://localhost:15672`
2. Login: `guest` / `guest`
3. Check queues and message flow
4. Verify message routing

### **MongoDB Connection**
```bash
# Check MongoDB containers
docker compose ps | grep mongo

# Check database logs
docker compose logs orders-db
docker compose logs payments-db
docker compose logs shipping-db
```

## 🚨 **Troubleshooting**

### **Common Issues and Solutions**

#### **Services Not Starting**
```bash
# Check Docker is running
docker --version

# Check service logs
docker compose logs [service-name]

# Restart specific service
docker compose restart [service-name]

# Rebuild and restart
docker compose up -d --build
```

#### **Port Conflicts**
```bash
# Check port usage (Windows)
netstat -ano | findstr :3000

# Stop conflicting services
taskkill /PID <PID> /F

# Update ports in docker-compose.yml if needed
```

#### **Authentication Issues**
```bash
# Verify OAuth2 server is running
curl http://localhost:3003/health

# Check JWT token validity
# Use Token-getter scripts for testing

# Verify token format
# Token should start with "eyJ"
```

#### **Database Connection Issues**
```bash
# Check MongoDB containers
docker compose ps | grep mongo

# Check database logs
docker compose logs orders-db

# Restart database containers
docker compose restart orders-db payments-db shipping-db
```

#### **RabbitMQ Connection Issues**
```bash
# Check RabbitMQ container
docker compose ps | grep rabbitmq

# Check RabbitMQ logs
docker compose logs rabbitmq

# Access RabbitMQ management UI
# http://localhost:15672 (guest/guest)
```

#### **Catalog Service Issues**
```bash
# Check Catalog service logs
docker compose logs catalog

# Verify Java service is running
curl http://localhost:8080/

# Check SOAP WSDL
curl http://localhost:8080/CatalogService?wsdl
```

### **Performance Testing**

#### **Load Testing with cURL**
```bash
# Test multiple concurrent requests
for i in {1..10}; do
  curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
       http://localhost:3000/health &
done
wait
```

#### **Response Time Testing**
```bash
# Test response times
time curl http://localhost:3000/health
time curl http://localhost:3001/health
time curl http://localhost:3002/health
time curl http://localhost:3003/health
```

## 📊 **Testing Checklist**

### **Pre-Testing Setup**
- [ ] Docker Desktop is running
- [ ] All services are started (`docker compose up -d`)
- [ ] All services show "Up" status (`docker compose ps`)
- [ ] OAuth2 token is obtained (`get-token.bat`)
- [ ] Postman collection is imported
- [ ] SoapUI project is imported

### **Health Checks**
- [ ] Orders service health check passes
- [ ] Payments service health check passes
- [ ] Shipping service health check passes
- [ ] Orchestrator service health check passes
- [ ] UDDI Registry health check passes
- [ ] Catalog service health check passes

### **Authentication**
- [ ] OAuth2 token is valid
- [ ] Token has correct scopes (read, write)
- [ ] Token is properly formatted
- [ ] Authorization headers work in Postman

### **Service Discovery**
- [ ] UDDI Registry is accessible
- [ ] Services can be registered
- [ ] Services can be discovered
- [ ] Service health monitoring works

### **Order Workflow**
- [ ] Order can be placed successfully
- [ ] Payment processing works (90% success rate)
- [ ] Shipping processing works (90% success rate)
- [ ] Workflow status can be checked
- [ ] All services return correct data

### **Catalog Service**
- [ ] SOAP operations work in SoapUI
- [ ] REST API operations work in Postman
- [ ] Product CRUD operations work
- [ ] Stock updates work
- [ ] WSDL is accessible

### **BPEL Workflows**
- [ ] Workflows can be listed
- [ ] Workflow definitions can be retrieved
- [ ] Workflows can be executed
- [ ] Execution status can be checked
- [ ] Execution history is maintained

### **Governance Framework**
- [ ] Governance dashboard works
- [ ] API versioning functions correctly
- [ ] SLA monitoring is active
- [ ] Deprecation management works
- [ ] All governance components are healthy

## 🎯 **Success Criteria**

### **All Tests Pass When:**
- ✅ All health checks return 200 OK
- ✅ OAuth2 authentication works
- ✅ Complete order workflow executes successfully
- ✅ All services return expected data
- ✅ SOAP and REST APIs work correctly
- ✅ BPEL workflows execute properly
- ✅ Governance framework is functional
- ✅ No error messages in service logs
- ✅ All Docker containers are running
- ✅ RabbitMQ message flow is working

---

**🎉 This testing guide ensures comprehensive validation of all SOA microservices components. Follow the steps in order for best results.**