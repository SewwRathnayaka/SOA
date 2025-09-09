# 🧪 **SOA Microservices Testing Guide**

A comprehensive testing guide for the SOA Microservices architecture with detailed instructions for Postman and SoapUI testing.

## 📋 **Table of Contents**

- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Service Health Checks](#-service-health-checks)
- [OAuth2 Authentication](#-oauth2-authentication)
- [UDDI Service Discovery](#-uddi-service-discovery)
- [Postman Testing](#-postman-testing)
- [SoapUI Testing](#-soapui-testing)
- [Complete Workflow Testing](#-complete-workflow-testing)
- [Troubleshooting](#-troubleshooting)

## 🔧 **Prerequisites**

### **Required Software**
- **Docker Desktop** (v4.0+) - [Download here](https://www.docker.com/products/docker-desktop/)
- **Postman** - [Download here](https://www.postman.com/downloads/)
- **SoapUI** - [Download here](https://www.soapui.org/downloads/soapui.html)

### **System Requirements**
- **Windows 10/11** (64-bit)
- **8GB RAM** minimum (16GB recommended)
- **10GB free disk space**
- **Internet connection** for downloading Docker images

## 🚀 **Quick Start**

### **Step 1: Start All Services**
```bash
# Navigate to project root directory
cd SOA-MicroService

# Start all services
docker compose up -d

# Check service status
docker compose ps
```

**Expected Output**: All 9 services should be "Up"
- UDDI Registry (Port 3004)
- Orders Service (Port 3000)
- Payments Service (Port 3001)
- Shipping Service (Port 3002)
- Orchestrator Service (Port 3003)
- Catalog Service (Port 8080)
- RabbitMQ (Ports 5672, 15672)
- MongoDB Databases (Ports 27017-27020)

### **Step 2: Wait for Services to Initialize**
```bash
# Wait 30-60 seconds for all services to start and register
# Check logs if needed
docker compose logs -f
```

## 🏥 **Service Health Checks**

### **Health Check via Postman**
1. Open Postman
2. Import the `SOA-Microservices-Postman-Collection.json` collection
3. Run the health check requests in the "1. Service Health Checks" folder:

#### **Health Check Requests:**
- **UDDI Registry Health** → `GET http://localhost:3004/health`
- **Orders Health** → `GET http://localhost:3000/health`
- **Payments Health** → `GET http://localhost:3001/health`
- **Shipping Health** → `GET http://localhost:3002/health`
- **Orchestrator Health** → `GET http://localhost:3003/health`

**Expected Response**: All should return `200 OK` with healthy status

## 🔐 **OAuth2 Authentication**

### **Step 1: Get OAuth2 Token**
1. Navigate to the `Token-getter` folder
2. Run the batch file: `get-token.bat`
3. Follow the on-screen instructions
4. Copy the JWT token from the output

### **Step 2: Use Token in Postman**
1. Open Postman
2. Go to **Collection Variables** in the imported collection
3. Set `accessToken` variable to your JWT token
4. All requests will automatically use this token via the `{{accessToken}}` variable

### **Token Format**
- JWT tokens start with `eyJ`
- Tokens expire in 24 hours
- Format: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 🔍 **UDDI Service Discovery**

### **Test UDDI Registry Functionality via Postman**

#### **1. Check UDDI Registry Health**
- **Request**: UDDI Registry Health (from Health Checks folder)
- **Method**: `GET`
- **URL**: `http://localhost:3004/health`
- **Expected**: `200 OK` with healthy status

#### **2. Get All Registered Services**
- **Request**: Get All Services (from UDDI Registry Tests folder)
- **Method**: `GET`
- **URL**: `http://localhost:3004/api/services`
- **Expected**: Array of 4 registered services

#### **3. Get Specific Service Details**
- **Orders Service** → `GET http://localhost:3004/api/services/orders-service`
- **Payments Service** → `GET http://localhost:3004/api/services/payments-service`
- **Shipping Service** → `GET http://localhost:3004/api/services/shipping-service`
- **Orchestrator Service** → `GET http://localhost:3004/api/services/orchestrator-service`

### **Expected UDDI Response**
```json
{
  "serviceId": "orders-service",
  "name": "Orders Service",
  "category": "order-management",
  "provider": "SOA-Microservices",
  "description": "Order management and CRUD operations",
  "version": "1.0.0",
  "interfaces": [
    {
      "type": "REST",
      "endpoint": "http://orders:3000",
      "operations": ["GET", "POST"]
    }
  ],
  "status": "active",
  "lastHeartbeat": "2024-01-01T12:00:00.000Z"
}
```

## 📮 **Postman Testing**

### **Step 1: Import Postman Collection**
1. Open Postman
2. Click **Import** button
3. Select `SOA-Microservices-Postman-Collection.json`
4. The collection will be imported with all pre-configured requests

### **Step 2: Set Environment Variables**
1. In Postman, go to **Collection Variables**
2. Set the following variables:
   - `baseUrl`: `http://localhost`
   - `accessToken`: `your-jwt-token-here`
   - `orderId`: `(will be set automatically)`

### **Step 3: Test Service Health**
Run these requests from the "1. Service Health Checks" folder in order:

1. **UDDI Registry Health**
   - Method: `GET`
   - URL: `{{baseUrl}}:3004/health`
   - Expected: `200 OK`

2. **Orders Health**
   - Method: `GET`
   - URL: `{{baseUrl}}:3000/health`
   - Expected: `200 OK`

3. **Payments Health**
   - Method: `GET`
   - URL: `{{baseUrl}}:3001/health`
   - Expected: `200 OK`

4. **Shipping Health**
   - Method: `GET`
   - URL: `{{baseUrl}}:3002/health`
   - Expected: `200 OK`

5. **Orchestrator Health**
   - Method: `GET`
   - URL: `{{baseUrl}}:3003/health`
   - Expected: `200 OK`


### **Step 4: Test UDDI Service Discovery**
Run these requests from the "3. UDDI Registry Tests" folder:

1. **Get All Services**
   - Method: `GET`
   - URL: `{{baseUrl}}:3004/api/services`
   - Expected: Array of 4 services

2. **Get Orders Service**
   - Method: `GET`
   - URL: `{{baseUrl}}:3004/api/services/orders-service`
   - Expected: Orders service details

3. **Get Payments Service**
   - Method: `GET`
   - URL: `{{baseUrl}}:3004/api/services/payments-service`
   - Expected: Payments service details

4. **Get Shipping Service**
   - Method: `GET`
   - URL: `{{baseUrl}}:3004/api/services/shipping-service`
   - Expected: Shipping service details

### **Step 5: Test Orders Service**
Run these requests from the "4. Orders Service Tests" folder:

1. **Create Order**
   - Method: `POST`
   - URL: `{{baseUrl}}:3000/orders`
   - Headers: `Authorization: Bearer {{accessToken}}`
   - Body (JSON):
     ```json
     {
       "id": "ORDER-001",
       "item": "The Lord of the Rings",
       "quantity": 2,
       "customerName": "John Doe",
       "shippingAddress": {
         "street": "123 Main St",
         "city": "New York",
         "zipCode": "10001"
       }
     }
     ```
   - Expected: `200 OK` with success message
   - **Important**: Copy the order ID from response and set the `orderId` variable

2. **Get Order Details**
   - Method: `GET`
   - URL: `{{baseUrl}}:3000/orders/{{orderId}}`
   - Headers: `Authorization: Bearer {{accessToken}}`
   - Expected: Order details

### **Step 6: Test Payments Service**
Run these requests from the "5. Payments Service Tests" folder:

1. **Get Payment Details**
   - Method: `GET`
   - URL: `{{baseUrl}}:3001/payments/{{orderId}}`
   - Headers: `Authorization: Bearer {{accessToken}}`
   - Expected: Payment details (may take 10-15 seconds to process)

### **Step 7: Test Shipping Service**
Run these requests from the "6. Shipping Service Tests" folder:

1. **Get Shipping Details**
   - Method: `GET`
   - URL: `{{baseUrl}}:3002/shipping/{{orderId}}`
   - Headers: `Authorization: Bearer {{accessToken}}`
   - Expected: Shipping details (may take 10-15 seconds to process)

### **Step 8: Test Orchestrator Service**
Run these requests from the "7. Orchestrator Service Tests" folder:

1. **Place Order via Orchestrator**
   - Method: `POST`
   - URL: `{{baseUrl}}:3003/place-order`
   - Headers: `Authorization: Bearer {{accessToken}}`
   - Body (JSON):
     ```json
     {
       "id": "ORDER-002",
       "item": "Pride and Prejudice",
       "quantity": 1,
       "customerName": "Jane Smith",
       "shippingAddress": {
         "street": "456 Oak Ave",
         "city": "Los Angeles",
         "zipCode": "90210"
       }
     }
     ```
   - Expected: `200 OK` with success message

2. **Check Workflow Status**
   - Method: `GET`
   - URL: `{{baseUrl}}:3003/workflow-status/{{orderId}}`
   - Headers: `Authorization: Bearer {{accessToken}}`
   - Expected: Complete workflow status with order, payment, and shipping details

## 🧪 **SoapUI Testing - Catalog Service**

### **Step 1: Import SoapUI Project**
1. Open **SoapUI**
2. Go to **File** → **Import Project**
3. Navigate to: `CatalogService/SoapUI_Tests/CatalogService-Live-WSDL-Project-soapui-project.xml`
4. Click **Open**

### **Step 2: Test SOAP Operations**
The imported project contains pre-configured requests for:

#### **1. Get All Products**
- **Request**: `get_all`
- **Expected**: List of all products in catalog
- **Response**: Should include sample products (Lord of the Rings, Pride and Prejudice)

#### **2. Get Product by ID**
- **Request**: `get_id`
- **Product ID**: `1` (Lord of the Rings)
- **Expected**: Product details for ID 1

#### **3. Add Product**
- **Request**: `Add_req`
- **Product Data**:
  ```xml
  <product>
    <description>A thrilling fantasy novel about dragons.</description>
    <id>3</id>
    <name>Dragon's Breath</name>
    <price>22.50</price>
    <quantity>50</quantity>
  </product>
  ```
- **Expected**: Success message

#### **4. Update Product**
- **Request**: `update`
- **Product Data**:
  ```xml
  <product>
    <description>Updated description</description>
    <id>1</id>
    <name>Updated Name</name>
    <price>30.00</price>
    <quantity>75</quantity>
  </product>
  ```
- **Expected**: Success message

#### **5. Delete Product**
- **Request**: `del_req`
- **Product ID**: `4`
- **Expected**: Success message

### **Step 3: Test REST Endpoints (Optional)**
The Catalog service also provides REST endpoints:

1. **Get All Products (REST)**
   - URL: `http://localhost:8080/CatalogService/api/products`
   - Method: `GET`

2. **Get Product by ID (REST)**
   - URL: `http://localhost:8080/CatalogService/api/products/1`
   - Method: `GET`

3. **Update Stock (REST)**
   - URL: `http://localhost:8080/CatalogService/api/products/1/stock`
   - Method: `PUT`
   - Body: `{"quantity": 10}`

## 🔄 **Complete Workflow Testing**

### **End-to-End Order Processing Test**

#### **Step 1: Create Order**
1. Use Postman to create an order via Orders service
2. Note the order ID from the response
3. Wait 15-20 seconds for processing

#### **Step 2: Verify Order Processing**
1. Check order status in Orders service
2. Check payment status in Payments service
3. Check shipping status in Shipping service
4. Check complete workflow status in Orchestrator service

#### **Step 3: Verify Catalog Stock Update**
1. Check if catalog stock was updated
2. Use SoapUI to verify product quantities
3. Use REST endpoints to check stock levels

### **Expected Workflow Timeline**
- **0-5 seconds**: Order created and stored
- **5-10 seconds**: Payment processed (90% success rate)
- **10-15 seconds**: Shipping processed (90% success rate)
- **15-20 seconds**: Catalog stock updated

## 🎯 **Expected Results**

### **✅ UDDI Registry**
- Health check returns `200 OK`
- All 4 services registered and discoverable
- Service discovery works for all services

### **✅ Orders Service**
- Health check returns `200 OK`
- Can create orders with valid token
- Can retrieve orders by ID
- Orders are stored in MongoDB

### **✅ Payments Service**
- Health check returns `200 OK`
- Can retrieve payment details
- Payments are processed automatically via RabbitMQ
- 90% success rate for payment processing

### **✅ Shipping Service**
- Health check returns `200 OK`
- Can retrieve shipping details
- Shipping is processed automatically via RabbitMQ
- 90% success rate for shipping processing

### **✅ Orchestrator Service**
- Health check returns `200 OK`
- Can place orders through orchestrator
- Workflow status aggregation works
- Can update catalog stock

### **✅ Catalog Service (SoapUI)**
- All SOAP operations work correctly
- Products can be managed via SOAP interface
- REST endpoints also available for testing

## 🔧 **Troubleshooting**

### **Common Issues**

#### **1. "Unauthorized - Invalid or missing token"**
- **Solution**: Make sure you've set the `accessToken` variable correctly
- **Check**: Token should start with `eyJ` (JWT format)
- **Fix**: Re-run `get-token.bat` to get a fresh token

#### **2. "Cannot connect to service"**
- **Solution**: Check if Docker containers are running
- **Command**: `docker compose ps`
- **Fix**: Restart services with `docker compose restart`

#### **3. "UDDI service not found"**
- **Solution**: Wait for services to auto-register or restart containers
- **Check**: Use Postman to run "Get All Services" request from UDDI Registry Tests folder
- **Fix**: Wait 30-60 seconds after starting services

#### **4. "Order not processing"**
- **Solution**: Wait 15-20 seconds after creating order
- **Check**: RabbitMQ queues at `http://localhost:15672`
- **Fix**: Check service logs for errors

#### **5. "Docker build failures"**
- **Solution**: Clean Docker system and rebuild
- **Commands**:
  ```bash
  docker system prune -a -f
  docker compose build --no-cache
  docker compose up -d
  ```

### **Service Status Check Commands**
```bash
# Check all running containers
docker compose ps

# Check service logs
docker compose logs -f

# Check specific service logs
docker compose logs -f orders
docker compose logs -f payments
docker compose logs -f shipping
docker compose logs -f orchestrator
docker compose logs -f catalog
docker compose logs -f uddi-registry

# Check RabbitMQ status
# Open browser: http://localhost:15672
# Login: guest/guest
```

### **Performance Issues**
```bash
# Check container resource usage
docker stats

# Check disk space
docker system df

# Clean up unused resources
docker system prune -a -f
```

## 📝 **Testing Notes**

- **Catalog Service**: Test with SoapUI (not Postman)
- **RabbitMQ**: Check management UI at `http://localhost:15672` (guest/guest)
- **MongoDB**: Each service has its own database
- **UDDI**: Services auto-register on startup
- **OAuth2**: Tokens expire in 24 hours
- **Processing Time**: Allow 15-20 seconds for complete order processing
- **Success Rates**: 90% for payment and shipping processing

## 🆘 **Support**

If you encounter issues:
1. Check the troubleshooting section above
2. Review service logs using `docker compose logs`
3. Verify all services are running with `docker compose ps`
4. Check RabbitMQ management UI for queue status
5. Ensure OAuth2 token is valid and not expired

---

**🎉 This testing guide provides comprehensive instructions for testing all aspects of the SOA Microservices architecture!**
