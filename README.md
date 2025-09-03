# 🚀 **SOA Microservices Architecture - Complete System**

A fully functional microservices architecture with OAuth2 authentication, event-driven communication, and complete order workflow management.

## 📋 **Table of Contents**

- [System Overview](#-system-overview)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Architecture](#-architecture)
- [Services](#-services)
- [API Documentation](#-api-documentation)
- [Testing Guide](#-testing-guide)
- [Docker Commands](#-docker-commands)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

## 🎯 **System Overview**

This system implements a **Service-Oriented Architecture (SOA)** with multiple microservices that communicate through **RabbitMQ message queues** and **REST APIs**. The system handles complete order workflows from order creation to payment processing, shipping, and catalog stock management.

### **Key Features**
- 🔐 **OAuth2 Authentication** with JWT tokens
- 🔄 **Event-Driven Architecture** using RabbitMQ
- 📊 **Complete Order Workflow** automation
- 🐳 **Docker Containerization** for easy deployment
- 📱 **REST APIs** with Swagger documentation
- 🧪 **SOAP Web Services** for catalog management
- 📈 **Real-time Status Monitoring**

## 📋 **Prerequisites**

Before running this project, ensure you have the following installed:

### **Required Software**
- **Docker Desktop** (v4.0+)
  - Download from: https://www.docker.com/products/docker-desktop/
  - Enable WSL 2 integration (recommended)
  - Enable Hyper-V if WSL 2 is not available

- **Docker Compose** (included with Docker Desktop)
  - Modern versions use `docker compose` (without hyphen)
  - Legacy versions use `docker-compose`

### **System Requirements**
- **Windows 10/11** (64-bit)
- **8GB RAM** minimum (16GB recommended)
- **10GB free disk space**
- **Internet connection** for downloading Docker images

### **Optional Tools**
- **Postman** - For API testing
- **SoapUI** - For SOAP service testing
- **Node.js 16+** - For local development
- **Java 11+** - For catalog service development
- **Maven** - For building Java services

## 🚀 **Quick Start**

### **Step 1: Clone the Repository**
```bash
git clone <repository-url>
cd SOA-MicroService
```

### **Step 2: Start All Services**
```bash
# Start all services with Docker Compose
docker compose up -d

# Or use legacy syntax
docker-compose up -d
```

### **Step 3: Verify Services Are Running**
```bash
# Check service status
docker compose ps

# Expected output: All 9 services should be "Up"
```

### **Step 4: Test the System**
```bash
# Test health endpoints
curl http://localhost:3000/health  # Orders
curl http://localhost:3001/health  # Payments
curl http://localhost:3002/health  # Shipping
curl http://localhost:3003/health  # Orchestrator
curl http://localhost:8080/        # Catalog
```

### **Step 5: Access Services**
- **Orders Service**: http://localhost:3000
- **Payments Service**: http://localhost:3001
- **Shipping Service**: http://localhost:3002
- **Orchestrator Service**: http://localhost:3003
- **Catalog Service**: http://localhost:8080
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

## 📁 **Project Structure**

```
SOA-MicroService/
├── 📁 Orchestrator/                    # OAuth2 Server & Workflow Orchestrator
│   ├── 📄 index.js                     # Main service logic & API endpoints
│   ├── 📄 oauth-server.js              # OAuth2 authorization server
│   ├── 📄 package.json                 # Dependencies & scripts
│   ├── 📄 openapi.yaml                 # API specification
│   └── 📄 Dockerfile                   # Container configuration
│
├── 📁 Orders/                          # Order Management Service
│   ├── 📄 index.js                     # Order CRUD operations & API
│   ├── 📄 auth-config.js               # OAuth2 client configuration
│   ├── 📄 package.json                 # Dependencies & scripts
│   ├── 📄 openapi.yaml                 # Swagger/OpenAPI specification
│   └── 📄 Dockerfile                   # Container configuration
│
├── 📁 Payments/                        # Payment Processing Service
│   ├── 📄 index.js                     # Payment processing logic & API
│   ├── 📄 auth-config.js               # OAuth2 client configuration
│   ├── 📄 package.json                 # Dependencies & scripts
│   ├── 📄 openapi.yaml                 # Swagger/OpenAPI specification
│   └── 📄 Dockerfile                   # Container configuration
│
├── 📁 Shipping/                        # Shipping Management Service
│   ├── 📄 index.js                     # Shipping logic & API
│   ├── 📄 auth-config.js               # OAuth2 client configuration
│   ├── 📄 package.json                 # Dependencies & scripts
│   ├── 📄 openapi.yaml                 # Swagger/OpenAPI specification
│   └── 📄 Dockerfile                   # Container configuration
│
├── 📁 CatalogService/                  # Java-based Catalog Service
│   ├── 📁 src/main/java/               # Java source code
│   │   └── 📁 globalbooks/catalog/     # Package structure
│   │       ├── 📄 CatalogService.java  # Service interface
│   │       ├── 📄 CatalogServiceImpl.java # Service implementation
│   │       ├── 📄 CatalogRestController.java # REST API endpoints
│   │       ├── 📄 Product.java         # Product model
│   │       ├── 📄 ProductList.java     # Product list model
│   │       └── 📁 utils/
│   │           └── 📄 RabbitMQPublisher.java # Message publishing
│   ├── 📁 src/main/resources/          # Configuration files
│   │   ├── 📄 application.properties   # Application config
│   │   └── 📁 wsdl/
│   │       └── 📄 CatalogService.wsdl  # SOAP service definition
│   ├── 📁 src/main/webapp/WEB-INF/     # Web application config
│   │   ├── 📄 web.xml                  # Web application descriptor
│   │   ├── 📄 beans.xml                # CDI configuration
│   │   └── 📄 sun-jaxws.xml            # JAX-WS configuration
│   ├── 📁 SoapUI_Tests/                # SOAP testing project
│   │   └── 📄 CatalogService-Live-WSDL-Project-soapui-project.xml
│   ├── 📄 pom.xml                      # Maven configuration
│   └── 📄 Dockerfile                   # Container configuration
│
├── 📁 Token-getter/                    # OAuth2 Token Acquisition Scripts
│   ├── 📄 get-oauth-token.bat          # Windows batch script
│   ├── 📄 get-oauth-token.ps1          # PowerShell script
│   ├── 📄 get-token.bat                # Alternative batch script
│   ├── 📄 OAUTH2_GUIDE.md              # OAuth2 authentication guide
│   └── 📄 TOKEN_SCRIPTS_README.md      # Token scripts documentation
│
├── 📄 docker-compose.yml               # Multi-service orchestration
├── 📄 README.md                        # This comprehensive guide
├── 📄 ENDPOINTS_SUMMARY.md             # API endpoint reference
├── 📄 SWAGGER_REFERENCE.md             # Swagger UI usage guide
├── 📄 .gitignore                       # Git ignore rules
└── 📄 .gitattributes                   # Git attributes
```

## 🏗️ **Architecture**

### **System Architecture Diagram**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │    │   Postman/      │    │   Web Browser   │
│   (Frontend)    │    │   cURL/         │    │                 │
│                 │    │   PowerShell    │    │                 │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OAuth2 Authorization Server                  │
│                    (Orchestrator Service)                      │
│                    Port: 3003                                  │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ /oauth/authorize│  │ /oauth/token    │  │ /place-order    │ │
│  │ /workflow-status│  │ /api-docs       │  │ /health         │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
          │                      │                      │
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Orders        │    │   Payments      │    │   Shipping      │
│   Service       │    │   Service       │    │   Service       │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 3002    │
│                 │    │                 │    │                 │
│  ┌─────────────┐│    │  ┌─────────────┐│    │  ┌─────────────┐│
│  │ /orders     ││    │  │ /payments   ││    │  │ /shipping   ││
│  │ /health     ││    │  │ /health     ││    │  │ /health     ││
│  │ /api-docs   ││    │  │ /api-docs   ││    │  │ /api-docs   ││
│  └─────────────┘│    │  └─────────────┘│    │  └─────────────┘│
└─────────────────┘    └─────────────────┘    └─────────────────┘
          │                      │                      │
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Orders        │    │   Payments      │    │   Shipping      │
│   MongoDB       │    │   MongoDB       │    │   MongoDB       │
│   Port: 27017   │    │   Port: 27018   │    │   Port: 27019   │
└─────────────────┘    └─────────────────┘    └─────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    RabbitMQ Message Broker                      │
│                    Ports: 5672 (AMQP), 15672 (Management)      │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ order_initiation│  │ payment_command │  │ shipping_command│ │
│  │ _queue          │  │ _queue          │  │ _queue          │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐                      │
│  │ payment_complete│  │ shipping_complet│                      │
│  │ d_queue         │  │ ed_queue        │                      │
│  └─────────────────┘  └─────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Catalog Service                              │
│                    Port: 8080                                  │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ SOAP Web        │  │ REST API        │  │ Stock Management│ │
│  │ Services        │  │ Endpoints       │  │ & Updates       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### **Event-Driven Workflow**

```
📱 Order Creation
    ↓
📦 Orders Service → order_initiation_queue
    ↓
🎯 Orchestrator → payment_command_queue
    ↓
💳 Payments Service → payment_completed_queue
    ↓
🎯 Orchestrator → shipping_command_queue
    ↓
📦 Shipping Service → shipping_completed_queue
    ↓
🎯 Orchestrator → Updates Catalog Stock
```

## 🏢 **Services**

### **1. Orchestrator Service (Port 3003)**
- **Purpose**: OAuth2 Authorization Server & Workflow Orchestration
- **Technology**: Node.js, Express
- **Key Features**:
  - OAuth2 token generation and validation
  - Workflow orchestration between services
  - Inter-service communication coordination
  - Complete order lifecycle management

### **2. Orders Service (Port 3000)**
- **Purpose**: Order Management and CRUD Operations
- **Technology**: Node.js, Express, MongoDB
- **Key Features**:
  - Order creation and management
  - OAuth2 authentication
  - Swagger API documentation
  - RabbitMQ integration for workflow initiation

### **3. Payments Service (Port 3001)**
- **Purpose**: Payment Processing
- **Technology**: Node.js, Express, MongoDB
- **Key Features**:
  - Automatic payment processing (90% success rate)
  - Payment status tracking
  - OAuth2 authentication
  - Event-driven processing via RabbitMQ

### **4. Shipping Service (Port 3002)**
- **Purpose**: Shipping Management
- **Technology**: Node.js, Express, MongoDB
- **Key Features**:
  - Automatic shipping processing (90% success rate)
  - Shipping status tracking
  - Address validation
  - Event-driven processing via RabbitMQ

### **5. Catalog Service (Port 8080)**
- **Purpose**: Product Catalog Management
- **Technology**: Java, JAX-WS, JAX-RS, Tomcat
- **Key Features**:
  - SOAP web services for product management
  - REST API for stock updates
  - Product CRUD operations
  - RabbitMQ event publishing

### **6. RabbitMQ Message Broker (Ports 5672, 15672)**
- **Purpose**: Event-driven communication
- **Technology**: RabbitMQ with Management UI
- **Key Features**:
  - Message queuing for asynchronous communication
  - Event-driven workflow orchestration
  - Web-based management interface
  - Reliable message delivery

### **7. MongoDB Databases**
- **Orders DB (Port 27017)**: Order data storage
- **Payments DB (Port 27018)**: Payment data storage
- **Shipping DB (Port 27019)**: Shipping data storage

## 📚 **API Documentation**

### **Swagger UI Access**
| Service | Swagger URL | Description |
|---------|-------------|-------------|
| **Orders** | http://localhost:3000/api-docs | Order management APIs |
| **Payments** | http://localhost:3001/api-docs | Payment processing APIs |
| **Shipping** | http://localhost:3002/api-docs | Shipping management APIs |

### **SOAP Services**
| Service | WSDL URL | Description |
|---------|----------|-------------|
| **Catalog** | http://localhost:8080/CatalogService?wsdl | Product management SOAP services |

### **Health Check Endpoints**
| Service | Health URL | Description |
|---------|------------|-------------|
| **Orders** | http://localhost:3000/health | Service health status |
| **Payments** | http://localhost:3001/health | Service health status |
| **Shipping** | http://localhost:3002/health | Service health status |
| **Orchestrator** | http://localhost:3003/health | Service health status |
| **Catalog** | http://localhost:8080/ | Service health status |

## 🧪 **Testing Guide - Postman & SoapUI**

### **📋 Testing Overview**
This guide focuses on testing the SOA microservices using **Postman** for REST API testing and **SoapUI** for SOAP web service testing.

### **🔧 Prerequisites for Testing**
- **Postman** installed and running
- **SoapUI** installed and running
- **All Docker services** running (`docker compose ps`)
- **Services accessible** on their respective ports

---

## 📮 **Postman Testing**

### **Step 1: Setup Postman Environment**

#### **Create Environment**
1. Open Postman
2. Click **"Environment"** → **"Create Environment"**
3. Name: `SOA Microservices`
4. Add these variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `http://localhost` | `http://localhost` |
| `jwt_token` | `YOUR_JWT_TOKEN_HERE` | `YOUR_JWT_TOKEN_HERE` |
| `order_id` | `test-order-123` | `test-order-123` |

5. **Save** and **Select** the environment

### **Step 2: Health Check Testing**

#### **Create Health Check Requests**

**Orders Service Health Check:**
- **Method**: `GET`
- **URL**: `{{base_url}}:3000/health`
- **Expected Response**: `{"status":"healthy","service":"Orders Service"}`

**Payments Service Health Check:**
- **Method**: `GET`
- **URL**: `{{base_url}}:3001/health`
- **Expected Response**: `{"status":"healthy","service":"Payments Service"}`

**Shipping Service Health Check:**
- **Method**: `GET`
- **URL**: `{{base_url}}:3002/health`
- **Expected Response**: `{"status":"healthy","service":"Shipping Service"}`

**Orchestrator Service Health Check:**
- **Method**: `GET`
- **URL**: `{{base_url}}:3003/health`
- **Expected Response**: `{"status":"healthy","service":"Orchestrator Service"}`

**Catalog Service Health Check:**
- **Method**: `GET`
- **URL**: `{{base_url}}:8080/`
- **Expected Response**: Service status page

### **Step 3: OAuth2 Authentication Testing**

#### **Get Authorization Code**
- **Method**: `GET`
- **URL**: `{{base_url}}:3003/oauth/authorize?client_id=orders-service-client&redirect_uri=http://localhost:3000/auth/callback&scope=read%20write&response_type=code`
- **Note**: Copy the authorization code from the redirect URL

#### **Exchange Code for Token**
- **Method**: `POST`
- **URL**: `{{base_url}}:3003/oauth/token`
- **Headers**:
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "grant_type": "authorization_code",
    "code": "YOUR_AUTH_CODE_HERE",
    "client_id": "orders-service-client",
    "client_secret": "orders-service-secret",
    "redirect_uri": "http://localhost:3000/auth/callback"
  }
  ```
- **Expected Response**: Contains `jwt_token` - copy this value
- **Action**: Set the `jwt_token` environment variable

### **Step 4: Complete Order Workflow Testing**

#### **Create Order**
- **Method**: `POST`
- **URL**: `{{base_url}}:3000/orders`
- **Headers**:
  ```
  Authorization: Bearer {{jwt_token}}
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "id": "{{order_id}}",
    "item": "The Great Gatsby",
    "quantity": 2,
    "customerName": "John Doe",
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "zipCode": "10001"
    }
  }
  ```
- **Expected Response**: `"Order test-order-123 saved and initiation request sent to Orchestrator"`

#### **Check Workflow Status (Wait 15-20 seconds first)**
- **Method**: `GET`
- **URL**: `{{base_url}}:3003/workflow-status/{{order_id}}`
- **Headers**:
  ```
  Authorization: Bearer {{jwt_token}}
  ```
- **Expected Response**:
  ```json
  {
    "orderId": "test-order-123",
    "details": {
      "order": {
        "id": "test-order-123",
        "item": "The Great Gatsby",
        "quantity": 2,
        "customerName": "John Doe",
        "status": "pending"
      },
      "payment": {
        "orderId": "test-order-123",
        "paymentId": "PAY-12345",
        "amount": 200,
        "status": "completed"
      },
      "shipping": {
        "orderId": "test-order-123",
        "shippingId": "SHIP-67890",
        "status": "shipped"
      }
    }
  }
  ```

#### **Check Individual Service Data**

**Get Order Details:**
- **Method**: `GET`
- **URL**: `{{base_url}}:3000/orders/{{order_id}}`
- **Headers**: `Authorization: Bearer {{jwt_token}}`

**Get Payment Details:**
- **Method**: `GET`
- **URL**: `{{base_url}}:3001/payments/{{order_id}}`
- **Headers**: `Authorization: Bearer {{jwt_token}}`

**Get Shipping Details:**
- **Method**: `GET`
- **URL**: `{{base_url}}:3002/shipping/{{order_id}}`
- **Headers**: `Authorization: Bearer {{jwt_token}}`

### **Step 5: Postman Test Scripts**

#### **Add Test Scripts for Order Creation**
In the **Tests** tab of the Create Order request:
```javascript
// Test if order was created successfully
pm.test("Order created successfully", function () {
    pm.response.to.have.status(200);
    pm.expect(pm.response.text()).to.include("saved and initiation request sent");
});

// Extract order ID for future requests
if (pm.response.code === 200) {
    const responseText = pm.response.text();
    const orderIdMatch = responseText.match(/Order (\w+) saved/);
    if (orderIdMatch) {
        pm.environment.set("order_id", orderIdMatch[1]);
    }
}
```

#### **Add Test Scripts for Workflow Status**
In the **Tests** tab of the Workflow Status request:
```javascript
// Test workflow status response
pm.test("Workflow status retrieved", function () {
    pm.response.to.have.status(200);
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('orderId');
    pm.expect(jsonData).to.have.property('details');
});

// Test if all stages are completed
pm.test("All workflow stages completed", function () {
    const jsonData = pm.response.json();
    const details = jsonData.details;
    
    if (details.payment) {
        pm.expect(details.payment.status).to.be.oneOf(['completed', 'failed']);
    }
    
    if (details.shipping) {
        pm.expect(details.shipping.status).to.be.oneOf(['shipped', 'failed']);
    }
});
```

---

## 🧪 **SoapUI Testing - Catalog Service**

### **Step 1: Import SoapUI Project**

#### **Import Existing Project**
1. Open **SoapUI**
2. Go to **File** → **Import Project**
3. Navigate to: `CatalogService/SoapUI_Tests/CatalogService-Live-WSDL-Project-soapui-project.xml`
4. Click **Open**
5. The project will be imported with all pre-configured requests

#### **Alternative: Create New Project from WSDL**
1. Open **SoapUI**
2. Go to **File** → **New SOAP Project**
3. **Project Name**: `CatalogService Testing`
4. **Initial WSDL**: `http://localhost:8080/CatalogService/CatalogService?wsdl`
5. Click **OK**

### **Step 2: Test SOAP Operations**

#### **Test 1: Get All Products**
1. Navigate to: **CatalogService** → **CatalogServiceImplPortBinding** → **getAllProducts**
2. Double-click on **Request 1**
3. **SOAP Request**:
   ```xml
   <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cat="http://catalog.globalbooks/">
      <soapenv:Header/>
      <soapenv:Body>
         <cat:getAllProducts/>
      </soapenv:Body>
   </soapenv:Envelope>
   ```
4. Click **Submit** (▶️)
5. **Expected Response**: List of existing products

#### **Test 2: Get Product by ID**
1. Navigate to: **getProduct** → **Request 1**
2. **SOAP Request**:
   ```xml
   <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cat="http://catalog.globalbooks/">
      <soapenv:Header/>
      <soapenv:Body>
         <cat:getProduct>
            <id>1</id>
         </cat:getProduct>
      </soapenv:Body>
   </soapenv:Envelope>
   ```
3. Click **Submit**
4. **Expected Response**: Product details for ID "1"

#### **Test 3: Add New Product**
1. Navigate to: **addProduct** → **Request 1**
2. **SOAP Request**:
   ```xml
   <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cat="http://catalog.globalbooks/">
      <soapenv:Header/>
      <soapenv:Body>
         <cat:addProduct>
            <product>
               <description>A thrilling fantasy novel about dragons.</description>
               <id>3</id>
               <name>Dragon's Breath</name>
               <price>22.50</price>
               <quantity>50</quantity>
            </product>
         </cat:addProduct>
      </soapenv:Body>
   </soapenv:Envelope>
   ```
3. Click **Submit**
4. **Expected Response**: `"Product Dragon's Breath added successfully."`

#### **Test 4: Update Product**
1. Navigate to: **updateProduct** → **Request 1**
2. **SOAP Request**:
   ```xml
   <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cat="http://catalog.globalbooks/">
      <soapenv:Header/>
      <soapenv:Body>
         <cat:updateProduct>
            <product>
               <description>Updated description for The Lord of the Rings</description>
               <id>1</id>
               <name>The Lord of the Rings</name>
               <price>27.50</price>
               <quantity>120</quantity>
            </product>
         </cat:updateProduct>
      </soapenv:Body>
   </soapenv:Envelope>
   ```
3. Click **Submit**
4. **Expected Response**: `"Product The Lord of the Rings updated successfully."`

#### **Test 5: Delete Product**
1. Navigate to: **deleteProduct** → **Request 1**
2. **SOAP Request**:
   ```xml
   <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cat="http://catalog.globalbooks/">
      <soapenv:Header/>
      <soapenv:Body>
         <cat:deleteProduct>
            <id>3</id>
         </cat:deleteProduct>
      </soapenv:Body>
   </soapenv:Envelope>
   ```
3. Click **Submit**
4. **Expected Response**: `"Product with ID 3 deleted successfully."`

### **Step 3: SoapUI Test Suite Setup**

#### **Create Test Suite**
1. Right-click on **CatalogService** project
2. Select **"New TestSuite"**
3. Name: `CatalogService Test Suite`

#### **Add Test Cases**
1. Right-click on Test Suite
2. Select **"New TestCase"**
3. Name: `Product CRUD Test`
4. Add test steps:
   - **Step 1**: getAllProducts
   - **Step 2**: addProduct
   - **Step 3**: getProduct (verify addition)
   - **Step 4**: updateProduct
   - **Step 5**: getProduct (verify update)
   - **Step 6**: deleteProduct
   - **Step 7**: getAllProducts (verify deletion)

#### **Add Assertions**
For each request, add assertions:
1. Right-click on request
2. Select **"Add Assertion"**
3. Choose assertion type:
   - **SOAP Response** - Valid SOAP response
   - **XPath Match** - Specific values
   - **Response SLA** - Response time
   - **HTTP Status** - Status code 200

**Example XPath Assertion**:
```xpath
//return[contains(text(), 'successfully')]
```

---

## 🎯 **Complete Testing Workflow**

### **Testing Sequence**
1. **Start Services**: `docker compose up -d`
2. **Health Checks**: Test all services in Postman
3. **OAuth2 Setup**: Get JWT token in Postman
4. **Order Workflow**: Create order and monitor status
5. **SOAP Testing**: Test catalog operations in SoapUI
6. **Verification**: Check data persistence across services

### **Expected Results**
- ✅ All health checks return 200 status
- ✅ OAuth2 token obtained successfully
- ✅ Order created and processed automatically
- ✅ Payment and shipping completed (90% success rate)
- ✅ Catalog stock updated automatically
- ✅ All SOAP operations work correctly
- ✅ Data persisted in respective databases

### **Testing Tips**
- **Wait 15-20 seconds** between order creation and status check
- **Use unique order IDs** to avoid conflicts
- **Check RabbitMQ queues** at http://localhost:15672 for message flow
- **Monitor service logs** for debugging: `docker compose logs -f`

## 🐳 **Docker Commands**

### **Basic Docker Commands**
```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Check service status
docker compose ps

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f orchestrator
docker compose logs -f orders
docker compose logs -f payments
docker compose logs -f shipping
docker compose logs -f catalog
```

### **Development Commands**
```bash
# Rebuild all services
docker compose build --no-cache

# Rebuild specific service
docker compose build --no-cache orchestrator

# Restart specific service
docker compose restart orchestrator

# Remove all containers and volumes
docker compose down -v

# Clean Docker system
docker system prune -a -f
```

### **Debugging Commands**
```bash
# Execute command in running container
docker compose exec orchestrator sh
docker compose exec orders sh
docker compose exec payments sh
docker compose exec shipping sh
docker compose exec catalog sh

# Check container resource usage
docker stats

# Inspect container configuration
docker compose config
```

## 🔐 **OAuth2 Authentication**

### **Authentication Flow**
1. **Get Authorization Code**: `GET /oauth/authorize`
2. **Exchange for Token**: `POST /oauth/token`
3. **Use JWT Token**: Include in `Authorization: Bearer <token>` header

### **Available Clients**
- `orders-service-client` (read, write)
- `payments-service-client` (read, write, payments)
- `shipping-service-client` (read, write, shipping)

### **Scopes**
- `read`: View data
- `write`: Create/update data
- `payments`: Payment-specific operations
- `shipping`: Shipping-specific operations
- `admin`: Administrative access

## 🚨 **Troubleshooting**

### **Common Issues and Solutions**

#### **1. Docker Compose Command Not Found**
```bash
# Error: docker-compose: command not found
# Solution: Use modern Docker Compose syntax
docker compose up -d  # Instead of docker-compose up -d
```

#### **2. Services Not Starting**
```bash
# Check service status
docker compose ps

# Check logs for errors
docker compose logs

# Restart services
docker compose restart
```

#### **3. Port Already in Use**
```bash
# Check what's using the ports
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :3002
netstat -ano | findstr :3003
netstat -ano | findstr :8080

# Kill processes using those ports
taskkill /PID <PID> /F
```

#### **4. Connection Refused Errors**
```bash
# Check if Docker Desktop is running
# Check service logs
docker compose logs orchestrator
docker compose logs orders
docker compose logs payments
docker compose logs shipping
docker compose logs catalog
```

#### **5. Build Failures**
```bash
# Clean Docker system
docker system prune -a -f

# Rebuild with no cache
docker compose build --no-cache

# Start services
docker compose up -d
```

#### **6. OAuth2 Authentication Issues**
- Verify JWT token is valid and not expired
- Check Authorization header format: `Bearer <token>`
- Ensure proper scope permissions
- Check Orchestrator service logs

#### **7. Workflow Not Processing**
- Wait 15-20 seconds after creating order
- Check RabbitMQ queues at http://localhost:15672
- Verify all services are running
- Check service logs for errors

### **Debug Commands**
```bash
# Check all service status
docker compose ps

# View real-time logs
docker compose logs -f

# Check specific service logs
docker compose logs -f [service-name]

# Check RabbitMQ status
docker exec -it soa-rabbitmq-1 rabbitmqctl status

# Test service connectivity
curl http://localhost:3003/health
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

## 🔄 **Order Workflow**

### **Complete Order Lifecycle**
1. **Order Creation**
   - Client creates order via Orders service or Orchestrator
   - Order stored in Orders MongoDB
   - Order sent to RabbitMQ for processing

2. **Payment Processing**
   - Orchestrator sends payment command
   - Payment service processes payment (90% success rate)
   - Payment result sent back to Orchestrator

3. **Shipping Processing**
   - Orchestrator sends shipping command
   - Shipping service processes shipping (90% success rate)
   - Shipping result sent back to Orchestrator

4. **Stock Update**
   - Orchestrator updates catalog stock
   - Catalog service reflects new inventory levels

5. **Workflow Status**
   - Client can query complete workflow status
   - Real-time data from all services

### **Message Queues**
- `order_initiation_queue` - New order requests
- `payment_command_queue` - Payment processing commands
- `shipping_command_queue` - Shipping processing commands
- `payment_completed_queue` - Payment completion events
- `shipping_completed_queue` - Shipping completion events

### **Automatic Status Changes**
The system automatically changes order statuses through event-driven processing:
- **Order**: "pending" → stored in database
- **Payment**: "completed" → processed automatically (90% success rate)
- **Shipping**: "shipped" → processed automatically (90% success rate)
- **Catalog**: Stock updated → inventory levels adjusted

## 🤝 **Contributing**

### **Development Setup**
1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Test thoroughly
6. Submit a pull request

### **Code Standards**
- Follow existing code style
- Add comments for complex logic
- Update documentation for new features
- Test all changes thoroughly

### **Testing Requirements**
- All new features must include tests
- Existing functionality must not be broken
- Performance impact should be minimal
- Security considerations must be addressed

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 **Support**

For support and questions:
- Check the troubleshooting section
- Review service logs
- Open an issue on GitHub
- Contact the development team

---

**🎉 This microservices architecture provides a robust, scalable, and secure foundation for order management systems with complete OAuth2 authentication and event-driven processing.**




