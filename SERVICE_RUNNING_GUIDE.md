# 🚀 **Individual Service Running Guide**

## 📋 **Prerequisites**
- All dependencies verified (see DEPENDENCY_CHECK.md)
- Project files downloaded/cloned
- Basic understanding of microservices architecture

---

## 🎯 **Service 1: Catalog Service (Java)**

### **Overview**
- **Technology**: Java 11 + Maven + Tomcat
- **Port**: 8080
- **Features**: SOAP Web Services + REST API
- **Database**: In-memory (HashMap)

### **Running Steps**

#### **Option A: Using Maven (Recommended)**
```bash
# Navigate to CatalogService directory
cd CatalogService

# Clean and compile
mvn clean compile

# Run with Jetty plugin
mvn jetty:run

# Service will be available at: http://localhost:8080/CatalogService
```

#### **Option B: Using Docker**
```bash
# Build Docker image
docker build -t catalog-service .

# Run container
docker run -p 8080:8080 catalog-service
```

### **Testing Catalog Service**
```bash
# Test SOAP WSDL
curl http://localhost:8080/CatalogService?wsdl

# Test REST API
curl http://localhost:8080/api/products

# Test specific product
curl http://localhost:8080/api/products/1
```

### **SoapUI Testing**
1. Open SoapUI
2. Create new SOAP project
3. WSDL URL: `http://localhost:8080/CatalogService?wsdl`
4. Test operations: `getAllProducts`, `getProduct`, `addProduct`

---

## 🎯 **Service 2: Orders Service (Node.js)**

### **Overview**
- **Technology**: Node.js + Express + MongoDB
- **Port**: 3000
- **Features**: Order CRUD, OAuth2 client
- **Database**: MongoDB

### **Running Steps**

#### **Option A: Local Development**
```bash
# Navigate to Orders directory
cd Orders

# Install dependencies
npm install

# Start MongoDB (if not using Docker)
sudo systemctl start mongod

# Run service
npm start
# or
node index.js
```

#### **Option B: Using Docker**
```bash
# Build and run
docker build -t orders-service .
docker run -p 3000:3000 --network host orders-service
```

### **Testing Orders Service**
```bash
# Health check
curl http://localhost:3000/health

# Get OAuth2 token first (see OAuth2 section)
# Then test protected endpoints
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/orders
```

---

## 🎯 **Service 3: Payments Service (Node.js)**

### **Overview**
- **Technology**: Node.js + Express + MongoDB
- **Port**: 3001
- **Features**: Payment processing, OAuth2 client
- **Database**: MongoDB

### **Running Steps**
```bash
# Navigate to Payments directory
cd Payments

# Install dependencies
npm install

# Run service
npm start
```

### **Testing Payments Service**
```bash
# Health check
curl http://localhost:3001/health

# Test payment lookup (requires OAuth2 token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/payments/ORDER_ID
```

---

## 🎯 **Service 4: Shipping Service (Node.js)**

### **Overview**
- **Technology**: Node.js + Express + MongoDB
- **Port**: 3002
- **Features**: Shipping management, OAuth2 client
- **Database**: MongoDB

### **Running Steps**
```bash
# Navigate to Shipping directory
cd Shipping

# Install dependencies
npm install

# Run service
npm start
```

### **Testing Shipping Service**
```bash
# Health check
curl http://localhost:3002/health

# Test shipping lookup (requires OAuth2 token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3002/shipping/ORDER_ID
```

---

## 🎯 **Service 5: Orchestrator Service (Node.js)**

### **Overview**
- **Technology**: Node.js + Express + RabbitMQ
- **Port**: 3003
- **Features**: OAuth2 server, workflow orchestration
- **Dependencies**: RabbitMQ

### **Running Steps**

#### **Prerequisites: Start RabbitMQ**
```bash
# Using Docker (recommended)
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# Or install locally
sudo apt install rabbitmq-server
sudo systemctl start rabbitmq-server
```

#### **Run Orchestrator**
```bash
# Navigate to Orchestrator directory
cd Orchestrator

# Install dependencies
npm install

# Run service
npm start
```

### **Testing Orchestrator Service**
```bash
# Health check
curl http://localhost:3003/health

# OAuth2 authorization
curl "http://localhost:3003/oauth/authorize?client_id=orders-service-client&redirect_uri=http://localhost:3000/auth/callback&scope=read%20write&response_type=code"
```

---

## 🔄 **Running Services in Order**

### **Recommended Startup Sequence**

#### **1. Infrastructure First**
```bash
# Start RabbitMQ
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# Start MongoDB instances
docker run -d --name orders-db -p 27017:27017 mongo:4.4
docker run -d --name payments-db -p 27018:27017 mongo:4.4
docker run -d --name shipping-db -p 27019:27017 mongo:4.4
```

#### **2. Core Services**
```bash
# Terminal 1: Orchestrator (OAuth2 server)
cd Orchestrator && npm start

# Terminal 2: Catalog Service
cd CatalogService && mvn jetty:run

# Terminal 3: Orders Service
cd Orders && npm start

# Terminal 4: Payments Service
cd Payments && npm start

# Terminal 5: Shipping Service
cd Shipping && npm start
```

### **Verification Commands**
```bash
# Check all services are running
curl http://localhost:3003/health  # Orchestrator
curl http://localhost:8080/api/products  # Catalog
curl http://localhost:3000/health  # Orders
curl http://localhost:3001/health  # Payments
curl http://localhost:3002/health  # Shipping

# Check RabbitMQ management
open http://localhost:15672  # guest/guest
```

---

## 🐳 **Alternative: Docker Compose (All Services)**

### **Quick Start**
```bash
# From project root directory
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### **Individual Service with Docker Compose**
```bash
# Start only specific services
docker-compose up -d catalog
docker-compose up -d orders
docker-compose up -d payments
docker-compose up -d shipping
docker-compose up -d orchestrator
```

---

## 🧪 **Testing Individual Services**

### **1. Catalog Service Tests**
```bash
# SOAP WSDL
curl http://localhost:8080/CatalogService?wsdl

# REST API
curl http://localhost:8080/api/products
curl http://localhost:8080/api/products/1

# Stock update
curl -X PUT http://localhost:8080/api/products/1/stock \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5}'
```

### **2. Orders Service Tests**
```bash
# Get OAuth2 token first
TOKEN=$(curl -s -X POST http://localhost:3003/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=AUTH_CODE&client_id=orders-service-client&client_secret=orders-service-secret&redirect_uri=http://localhost:3000/auth/callback" | jq -r '.jwt_token')

# Create order
curl -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-order-1",
    "item": "Test Book",
    "quantity": 2,
    "customerName": "John Doe",
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "zipCode": "10001"
    }
  }'
```

### **3. Workflow Testing**
```bash
# Check workflow status
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3003/workflow-status/test-order-1
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Port Conflicts**
```bash
# Check what's using ports
netstat -tulpn | grep :3000
netstat -tulpn | grep :8080

# Kill processes using ports
sudo kill -9 $(lsof -t -i:3000)
```

#### **MongoDB Connection Issues**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo journalctl -u mongod -f
```

#### **RabbitMQ Connection Issues**
```bash
# Check RabbitMQ status
sudo systemctl status rabbitmq-server

# Check RabbitMQ logs
sudo journalctl -u rabbitmq-server -f
```

#### **Java/Maven Issues**
```bash
# Clear Maven cache
mvn dependency:purge-local-repository

# Rebuild project
mvn clean install -DskipTests
```

---

## 📊 **Service Monitoring**

### **Health Check URLs**
- Orchestrator: `http://localhost:3003/health`
- Catalog: `http://localhost:8080/api/products`
- Orders: `http://localhost:3000/health`
- Payments: `http://localhost:3001/health`
- Shipping: `http://localhost:3002/health`

### **Management UIs**
- RabbitMQ: `http://localhost:15672` (guest/guest)
- Swagger UI: 
  - Orders: `http://localhost:3000/api-docs`
  - Payments: `http://localhost:3001/api-docs`
  - Shipping: `http://localhost:3002/api-docs`

---

## 🎯 **Next Steps**

1. **Test each service individually** using the commands above
2. **Verify OAuth2 authentication** works between services
3. **Test the complete workflow** by creating an order
4. **Customize the services** (see customization guide)
5. **Deploy to production** when ready
