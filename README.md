# 🚀 **SOA Microservices Architecture**

A complete **Service-Oriented Architecture (SOA)** system with OAuth2 authentication, event-driven communication, and automated order workflow processing.

## 📋 **Quick Start**

### **Prerequisites**
- **Docker Desktop** (v4.0+) - [Download](https://www.docker.com/products/docker-desktop/)
- **Postman** - For API testing
- **SoapUI** - For Catalog service testing
- **8GB RAM** minimum, **10GB free disk space**

### **Step 1: Start Services (Recommended Sequence)**

#### **Option A: Start All at Once (Quick)**
```bash
# Clone and navigate to project
cd SOA

# Start all services
docker compose up -d

# Verify all services are running
docker compose ps
```

#### **Option B: Start with Proper Dependencies (Recommended)**
```bash
# Clone and navigate to project
cd SOA

# Step 1: Start infrastructure first
docker compose up -d rabbitmq orders-db payments-db shipping-db uddi-db

# Step 2: Wait for RabbitMQ to be ready (30 seconds)
echo "Waiting for RabbitMQ to be ready..."
timeout /t 30 /nobreak

# Step 3: Start UDDI Registry
docker compose up -d uddi-registry

# Step 4: Start all microservices
docker compose up -d orders payments shipping orchestrator catalog

# Step 5: Verify all services are running
docker compose ps
```

**Why this sequence?**
- RabbitMQ needs time to initialize before other services connect
- UDDI Registry should start before services that register with it
- This prevents "Failed to connect to RabbitMQ" errors

**Expected Services (9 total):**
- Orders Service (Port 3000)
- Payments Service (Port 3001) 
- Shipping Service (Port 3002)
- Orchestrator Service (Port 3003)
- Catalog Service (Port 8080)
- UDDI Registry (Port 3004)
- RabbitMQ (Ports 5672, 15672)
- MongoDB instances (Ports 27017-27020)

### **Step 2: Get OAuth2 Token**
```bash
# Navigate to token directory
cd Token-getter

# Run the batch file to get JWT token
get-token.bat
```

### **Step 3: Test the System**
- **Postman**: Import `SOA-Microservices-Postman-Collection.json` and run tests
- **SoapUI**: Use `CatalogService/SoapUI_Tests/` for Catalog service testing
- **Health Checks**: All services have `/health` endpoints

## 🏗️ **System Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │    │   Postman/      │    │   SoapUI        │
│   (Frontend)    │    │   Testing       │    │   (Catalog)     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OAuth2 Authorization Server                  │
│                    (Orchestrator Service)                      │
│                    Port: 3003                                  │
└─────────────────────────────────────────────────────────────────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Orders        │    │   Payments      │    │   Shipping      │
│   Service       │    │   Service       │    │   Service       │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 3002    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RabbitMQ Message Broker                      │
│                    Ports: 5672 (AMQP), 15672 (Management)      │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Catalog Service                              │
│                    Port: 8080 (SOAP + REST)                    │
└─────────────────────────────────────────────────────────────────┘
```

## 🏢 **Services Overview**

| Service | Port | Purpose | Key Features |
|---------|------|---------|--------------|
| **Orchestrator** | 3003 | OAuth2 + Workflow Engine | JWT tokens, BPEL workflows, order orchestration |
| **Orders** | 3000 | Order Management | CRUD operations, MongoDB storage |
| **Payments** | 3001 | Payment Processing | 90% success rate, automatic processing |
| **Shipping** | 3002 | Shipping Management | 90% success rate, address validation |
| **Catalog** | 8080 | Product Catalog | SOAP + REST APIs, stock management |
| **UDDI Registry** | 3004 | Service Discovery | Service registration, health monitoring |
| **RabbitMQ** | 5672/15672 | Message Broker | Event-driven communication, management UI |

## 🔄 **Order Workflow**

### **Complete Automated Process**
1. **Order Creation** → Orders Service stores order
2. **Payment Processing** → Orchestrator triggers payment (90% success)
3. **Shipping Processing** → Orchestrator triggers shipping (90% success)
4. **Stock Update** → Orchestrator updates catalog inventory
5. **Status Tracking** → Real-time workflow status available

### **Message Queues**
- `order_initiation_queue` - New order requests
- `payment_command_queue` - Payment processing commands
- `shipping_command_queue` - Shipping processing commands
- `payment_completed_queue` - Payment completion events
- `shipping_completed_queue` - Shipping completion events

## 🧪 **Testing Guide**

### **1. Health Checks (Postman)**
Test all service health endpoints:
- `GET http://localhost:3000/health` - Orders
- `GET http://localhost:3001/health` - Payments
- `GET http://localhost:3002/health` - Shipping
- `GET http://localhost:3003/health` - Orchestrator
- `GET http://localhost:3004/health` - UDDI Registry

### **2. OAuth2 Authentication**
```bash
# Get JWT token using batch file
cd Token-getter
get-token.bat
```

### **3. Complete Order Workflow (Postman)**
1. **Place Order**: `POST /place-order` with order data
2. **Check Status**: `GET /workflow-status/{orderId}` 
3. **Verify Payment**: `GET /payments/{orderId}`
4. **Verify Shipping**: `GET /shipping/{orderId}`

### **4. Catalog Service (SoapUI)**
- Import `CatalogService/SoapUI_Tests/CatalogService-Live-WSDL-Project-soapui-project.xml`
- Test SOAP operations: addProduct, getProduct, getAllProducts, updateProduct, deleteProduct
- Test REST API: `PUT /api/products/{productId}/stock`

### **5. Governance Framework (cURL)**
```bash
# Test governance components
cd Governance
node test-governance.js

# Test API versioning
curl http://localhost:3003/bpel/workflows

# Test SLA monitoring
curl http://localhost:3000/health
```

## 🔐 **OAuth2 Authentication**

### **Available Clients**
- `orders-service-client` (read, write)
- `payments-service-client` (read, write, payments)
- `shipping-service-client` (read, write, shipping)

### **Scopes**
- `read`: View data
- `write`: Create/update data
- `payments`: Payment-specific operations
- `shipping`: Shipping-specific operations

## 🐳 **Docker Commands**

### **Basic Operations**
```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Check service status
docker compose ps

# View logs
docker compose logs -f [service-name]

# Restart specific service
docker compose restart [service-name]
```

### **Development Commands**
```bash
# Rebuild all services
docker compose build --no-cache

# Remove all containers and volumes
docker compose down -v

# Clean Docker system
docker system prune -a -f
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Services Not Starting**
```bash
# Check Docker is running
docker --version

# Check service logs
docker compose logs [service-name]

# Restart specific service
docker compose restart [service-name]
```

#### **Port Conflicts**
```bash
# Check port usage (Windows)
netstat -ano | findstr :3000

# Stop conflicting services
taskkill /PID <PID> /F
```

#### **Authentication Issues**
```bash
# Verify OAuth2 server
curl http://localhost:3003/health

# Check JWT token validity
# Use Token-getter scripts for testing
```

#### **Database Connection Issues**
```bash
# Check MongoDB containers
docker compose ps | grep mongo

# Check database logs
docker compose logs orders-db
```

## 📊 **Service Endpoints**

### **Orders Service (Port 3000)**
- `GET /health` - Health check
- `POST /orders` - Create order (write scope)
- `GET /orders/{orderId}` - Get order (read scope)

### **Payments Service (Port 3001)**
- `GET /health` - Health check
- `GET /payments/{orderId}` - Get payment (read scope)

### **Shipping Service (Port 3002)**
- `GET /health` - Health check
- `GET /shipping/{orderId}` - Get shipping (read scope)

### **Orchestrator Service (Port 3003)**
- `GET /health` - Health check
- `POST /place-order` - Place order (write scope)
- `GET /workflow-status/{orderId}` - Check status (read scope)
- `GET /oauth/authorize` - OAuth2 authorization
- `POST /oauth/token` - OAuth2 token
- `GET /bpel/workflows` - List BPEL workflows (read scope)
- `POST /bpel/workflows/{name}/execute` - Execute workflow (write scope)

### **Catalog Service (Port 8080)**
- `GET /` - Health check
- `GET /CatalogService?wsdl` - SOAP WSDL
- `PUT /api/products/{productId}/stock` - Update stock (REST)

### **UDDI Registry (Port 3004)**
- `GET /health` - Health check
- `GET /api/services` - List services
- `POST /api/services/register` - Register service

## 🛡️ **Governance Framework**

The system includes comprehensive governance components:

### **Components**
- **API Versioning**: Semantic versioning with deprecation management
- **SLA Monitoring**: 99.5% uptime, sub-200ms response time monitoring
- **Deprecation Schedules**: Service lifecycle management
- **Governance Dashboard**: Centralized monitoring

### **Quick Governance Test**
```bash
cd Governance
node test-governance.js
```

## 📁 **Project Structure**

```
SOA/
├── 📁 Orchestrator/           # OAuth2 + BPEL Engine
├── 📁 Orders/                 # Order Management
├── 📁 Payments/               # Payment Processing
├── 📁 Shipping/               # Shipping Management
├── 📁 CatalogService/         # Java SOAP + REST Service
├── 📁 UDDI-Registry/          # Service Discovery
├── 📁 Token-getter/           # OAuth2 Token Scripts
├── 📁 Governance/             # Governance Framework
├── 📄 docker-compose.yml      # Multi-service orchestration
├── 📄 SOA-Microservices-Postman-Collection.json
└── 📄 README.md               # This guide
```

## 🎯 **Key Features**

- ✅ **OAuth2 Authentication** with JWT tokens
- ✅ **Event-Driven Architecture** using RabbitMQ
- ✅ **Complete Order Workflow** automation
- ✅ **BPEL Engine** for workflow orchestration
- ✅ **SOAP + REST APIs** for catalog management
- ✅ **Service Discovery** with UDDI Registry
- ✅ **Comprehensive Governance** framework
- ✅ **Docker Containerization** for easy deployment
- ✅ **Real-time Status Monitoring**

## 🆘 **Support**

For issues and questions:
- Check the troubleshooting section above
- Review service logs: `docker compose logs [service-name]`
- Check governance dashboard for system health
- Open an issue on GitHub

---

**🎉 This SOA microservices architecture provides a robust, scalable, and secure foundation for enterprise applications with complete OAuth2 authentication, event-driven processing, and comprehensive governance framework.**