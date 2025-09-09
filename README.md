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
│   ├── 📄 uddi-client.js               # UDDI service discovery client
│   ├── 📄 package.json                 # Dependencies & scripts
│   ├── 📄 openapi.yaml                 # API specification
│   └── 📄 Dockerfile                   # Container configuration
│
├── 📁 Orders/                          # Order Management Service
│   ├── 📄 index.js                     # Order CRUD operations & API
│   ├── 📄 auth-config.js               # OAuth2 client configuration
│   ├── 📄 uddi-client.js               # UDDI service discovery client
│   ├── 📄 package.json                 # Dependencies & scripts
│   ├── 📄 openapi.yaml                 # Swagger/OpenAPI specification
│   └── 📄 Dockerfile                   # Container configuration
│
├── 📁 Payments/                        # Payment Processing Service
│   ├── 📄 index.js                     # Payment processing logic & API
│   ├── 📄 auth-config.js               # OAuth2 client configuration
│   ├── 📄 uddi-client.js               # UDDI service discovery client
│   ├── 📄 package.json                 # Dependencies & scripts
│   ├── 📄 openapi.yaml                 # Swagger/OpenAPI specification
│   └── 📄 Dockerfile                   # Container configuration
│
├── 📁 Shipping/                        # Shipping Management Service
│   ├── 📄 index.js                     # Shipping logic & API
│   ├── 📄 auth-config.js               # OAuth2 client configuration
│   ├── 📄 uddi-client.js               # UDDI service discovery client
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
│   │           ├── 📄 RabbitMQPublisher.java # Message publishing
│   │           └── 📄 UDDIClient.java  # UDDI service discovery client
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
├── 📁 UDDI-Registry/                   # UDDI Service Registry
│   ├── 📄 index.js                     # UDDI registry server
│   ├── 📄 package.json                 # Dependencies & scripts
│   ├── 📄 openapi.yaml                 # API specification
│   ├── 📁 models/
│   │   └── 📄 Service.js               # Service model definition
│   └── 📄 Dockerfile                   # Container configuration
│
├── 📁 Token-getter/                    # OAuth2 Token Acquisition Scripts
│   ├── 📄 get-oauth-token.bat          # Windows batch script
│   ├── 📄 get-oauth-token.ps1          # PowerShell script
│   └── 📄 get-token.bat                # Alternative batch script
│
├── 📄 docker-compose.yml               # Multi-service orchestration
├── 📄 SOA-Microservices-Postman-Collection.json # Postman test collection
├── 📄 TESTING_GUIDE.md                 # Comprehensive testing instructions
├── 📄 README.md                        # This comprehensive guide
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

## 🧪 **Testing Guide**

### **📋 Testing Overview**
For comprehensive testing instructions, please refer to the **[TESTING_GUIDE.md](TESTING_GUIDE.md)** file, which contains detailed step-by-step instructions for:

- **Service Health Checks** - Verify all services are running
- **OAuth2 Authentication** - Get and use JWT tokens
- **UDDI Service Discovery** - Test service registry functionality
- **Postman Testing** - Complete REST API testing with importable collection
- **SoapUI Testing** - SOAP web service testing for Catalog service
- **Complete Workflow Testing** - End-to-end order processing validation
- **Troubleshooting** - Common issues and solutions

### **🚀 Quick Test Start**
```bash
# 1. Start all services
docker compose up -d

# 2. Get OAuth2 token
cd Token-getter
get-token.bat

# 3. Import Postman collection
# Open Postman → Import → Select SOA-Microservices-Postman-Collection.json

# 4. Follow detailed instructions in TESTING_GUIDE.md
```

### **📁 Testing Files**
- **`TESTING_GUIDE.md`** - Complete testing instructions
- **`SOA-Microservices-Postman-Collection.json`** - Importable Postman collection
- **`CatalogService/SoapUI_Tests/`** - SoapUI test project for Catalog service

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

### **Quick Fixes**

#### **Docker Issues**
```bash
# Services not starting
docker compose ps
docker compose restart

# Build failures
docker system prune -a -f
docker compose build --no-cache
docker compose up -d

# Port conflicts
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

#### **Service Issues**
```bash
# Check service status
docker compose ps

# View logs
docker compose logs -f

# Test connectivity
curl http://localhost:3003/health
```

### **Detailed Troubleshooting**
For comprehensive troubleshooting including OAuth2, UDDI, and testing issues, please refer to the **[TESTING_GUIDE.md](TESTING_GUIDE.md)** file.

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




