# 🚀 **SOA Microservices Architecture - Complete System**

A fully functional microservices architecture with OAuth2 authentication, event-driven communication, and complete order workflow management.

## 🎯 **System Overview**

This system implements a **Service-Oriented Architecture (SOA)** with multiple microservices that communicate through **RabbitMQ message queues** and **REST APIs**. The system handles complete order workflows from order creation to payment processing, shipping, and catalog stock management.

## ✨ **Key Features**

### **🔐 Authentication & Security**
- **OAuth2 Authorization Server** (Orchestrator Service)
- **JWT Token-based Authentication** (24-hour validity, no timeout)
- **Scope-based Access Control** (read, write, admin, payments, shipping)
- **Service-to-Service Authentication** for inter-service communication

### **📊 Complete Order Workflow**
- **Order Creation & Management**
- **Payment Processing** (automatic with 90% success rate)
- **Shipping Management** (automatic with 90% success rate)
- **Catalog Stock Updates** (automatic after shipping completion)
- **Real-time Workflow Status** tracking

### **🔄 Event-Driven Architecture**
- **RabbitMQ Message Queues** for asynchronous communication
- **Event-driven processing** for scalability and reliability
- **Automatic workflow orchestration** between services

### **📱 API Management**
- **RESTful APIs** for all services
- **Swagger UI** documentation for Orders, Payments, and Shipping services
- **Comprehensive API endpoints** with proper authentication
- **Health check endpoints** for monitoring

## 🏗️ **Architecture Diagram**

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

## 🗂️ **File Structure**

```
SOA-MicroService/
├── 📁 Orchestrator/                    # OAuth2 Server & Workflow Orchestrator
│   ├── 📄 index.js                     # Main service logic & API endpoints
│   ├── 📄 oauth-server.js              # OAuth2 authorization server
│   ├── 📄 package.json                 # Dependencies & scripts
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
│   │       └── 📄 CatalogRestController.java # REST API endpoints
│   ├── 📄 pom.xml                      # Maven configuration
│   ├── 📄 Dockerfile                   # Container configuration
│   └── 📄 web.xml                      # Web application configuration
│
├── 📄 docker-compose.yml               # Multi-service orchestration
├── 📄 README.md                        # This comprehensive guide
├── 📄 ENDPOINTS_SUMMARY.md             # API endpoint reference
├── 📄 SWAGGER_REFERENCE.md             # Swagger UI usage guide
└── 📄 OAUTH2_GUIDE.md                  # OAuth2 authentication guide
```

## 🚀 **Getting Started**

### **Prerequisites**
- Docker & Docker Compose
- Node.js 16+ (for local development)
- Java 11+ (for Catalog Service development)
- Maven (for Catalog Service building)

### **Quick Start**
```bash
# Clone the repository
git clone <repository-url>
cd SOA-MicroService

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### **Service URLs**
- **Orchestrator**: http://localhost:3003
- **Orders**: http://localhost:3000
- **Payments**: http://localhost:3001
- **Shipping**: http://localhost:3002
- **Catalog**: http://localhost:8080
- **RabbitMQ Management**: http://localhost:15672

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

## 📡 **API Endpoints**

### **Orchestrator Service (Port 3003)**

#### **Public Endpoints**
- `GET /` - Service status
- `GET /health` - Health check
- `GET /api-docs` - API documentation

#### **OAuth2 Endpoints**
- `GET /oauth/authorize` - OAuth2 authorization
- `POST /oauth/token` - OAuth2 token exchange
- `GET /oauth/clients` - List OAuth2 clients (admin)

#### **Protected Endpoints**
- `POST /place-order` - Create new order (write scope)
- `GET /workflow-status/:orderId` - Check order status (read scope)
- `PUT /update-catalog-stock/:productId` - Update catalog stock (write scope)

### **Orders Service (Port 3000)**

#### **Public Endpoints**
- `GET /` - Service status
- `GET /health` - Health check

#### **OAuth2 Endpoints**
- `GET /auth/login` - OAuth2 login
- `GET /auth/callback` - OAuth2 callback
- `GET /auth/success` - Authentication success
- `GET /auth/failure` - Authentication failure

#### **Protected Endpoints**
- `POST /orders` - Create order (write scope)
- `GET /orders/:id` - Get order by ID (read scope)
- `GET /orders` - Get all orders (admin scope)

#### **Swagger UI**
- `GET /api-docs` - Interactive API documentation

### **Payments Service (Port 3001)**

#### **Public Endpoints**
- `GET /` - Service status
- `GET /health` - Health check

#### **OAuth2 Endpoints**
- `GET /auth/login` - OAuth2 login
- `GET /auth/callback` - OAuth2 callback
- `GET /auth/success` - Authentication success
- `GET /auth/failure` - Authentication failure

#### **Protected Endpoints**
- `GET /payments/:orderId` - Get payment by order ID (read scope)

#### **Swagger UI**
- `GET /api-docs` - Interactive API documentation

### **Shipping Service (Port 3002)**

#### **Public Endpoints**
- `GET /` - Service status
- `GET /health` - Health check

#### **OAuth2 Endpoints**
- `GET /auth/login` - OAuth2 login
- `GET /auth/callback` - OAuth2 callback
- `GET /auth/success` - Authentication success
- `GET /auth/failure` - Authentication failure

#### **Protected Endpoints**
- `GET /shipping/:orderId` - Get shipping by order ID (read scope)
- `POST /shipping` - Create shipping record (write scope)
- `GET /shipping` - Get all shipping records (admin scope)

#### **Swagger UI**
- `GET /api-docs` - Interactive API documentation

### **Catalog Service (Port 8080)**

#### **SOAP Endpoints**
- `/catalog?wsdl` - WSDL definition
- SOAP operations for product management

#### **REST Endpoints**
- `PUT /api/products/:id/stock` - Update product stock
- `GET /api/products/:id` - Get product details
- `GET /api/products` - Get all products

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

## 🗄️ **Database Schema**

### **Orders Collection**
```javascript
{
  id: String,                    // Unique order ID
  item: String,                  // Product name
  quantity: Number,              // Quantity ordered
  customerName: String,          // Customer name
  shippingAddress: {             // Shipping address
    street: String,
    city: String,
    zipCode: String
  },
  status: String,                // Order status
  createdBy: String,             // Creator identifier
  createdAt: Date,               // Creation timestamp
  updatedAt: Date                // Last update timestamp
}
```

### **Payments Collection**
```javascript
{
  orderId: String,               // Associated order ID
  paymentId: String,             // Unique payment ID
  amount: Number,                // Payment amount
  status: String,                // Payment status
  processedBy: String,           // Processor identifier
  createdAt: Date,               // Creation timestamp
  updatedAt: Date                // Last update timestamp
}
```

### **Shipping Collection**
```javascript
{
  orderId: String,               // Associated order ID
  shippingId: String,            // Unique shipping ID
  address: {                     // Shipping address
    street: String,
    city: String,
    zipCode: String
  },
  status: String,                // Shipping status
  createdAt: Date,               // Creation timestamp
  updatedAt: Date                // Last update timestamp
}
```

## 🧪 **Testing & Examples**

### **OAuth2 Token Acquisition**
```bash
# Get authorization code
GET http://localhost:3003/oauth/authorize?client_id=orders-service-client&redirect_uri=http://localhost:3000/auth/callback&scope=read%20write&response_type=code

# Exchange for token
POST http://localhost:3003/oauth/token
{
  "grant_type": "authorization_code",
  "code": "YOUR_AUTH_CODE",
  "client_id": "orders-service-client",
  "client_secret": "orders-service-secret",
  "redirect_uri": "http://localhost:3000/auth/callback"
}
```

### **Create Order via Orchestrator**
```bash
POST http://localhost:3003/place-order
Authorization: Bearer YOUR_JWT_TOKEN
{
  "id": "order123",
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

### **Check Workflow Status**
```bash
GET http://localhost:3003/workflow-status/order123
Authorization: Bearer YOUR_JWT_TOKEN
```

### **Create Order Directly**
```bash
POST http://localhost:3000/orders
Authorization: Bearer YOUR_JWT_TOKEN
{
  "id": "order456",
  "item": "To Kill a Mockingbird",
  "quantity": 1,
  "customerName": "Jane Smith",
  "shippingAddress": {
    "street": "456 Oak Ave",
    "city": "Los Angeles",
    "zipCode": "90210"
  }
}
```

## 🔧 **Development & Customization**

### **Local Development**
```bash
# Install dependencies for each service
cd Orders && npm install
cd ../Payments && npm install
cd ../Shipping && npm install
cd ../Orchestrator && npm install

# Start individual services
npm run dev
```

### **Environment Variables**
```bash
# OAuth2 Configuration
OAUTH2_AUTH_URL=http://localhost:3003/oauth/authorize
OAUTH2_TOKEN_URL=http://localhost:3003/oauth/token
OAUTH2_CLIENT_ID=your-client-id
OAUTH2_CLIENT_SECRET=your-client-secret

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/database
```

### **Adding New Services**
1. Create service directory with `index.js`
2. Add OAuth2 configuration
3. Implement required endpoints
4. Add to `docker-compose.yml`
5. Update Orchestrator if needed

## 📊 **Monitoring & Health Checks**

### **Health Endpoints**
- All services provide `/health` endpoints
- Return service status and timestamp
- Useful for load balancers and monitoring

### **Logging**
- Comprehensive logging across all services
- RabbitMQ connection status
- Authentication and authorization events
- Workflow progression tracking

### **Error Handling**
- Graceful error handling with proper HTTP status codes
- Detailed error messages for debugging
- Automatic retry mechanisms for RabbitMQ connections

## 🚨 **Troubleshooting**

### **Common Issues**
1. **OAuth2 Authentication Errors**
   - Verify client credentials
   - Check token expiration
   - Ensure proper scope permissions

2. **Service Communication Issues**
   - Check RabbitMQ connection
   - Verify service URLs in docker-compose
   - Check service logs for errors

3. **Database Connection Issues**
   - Verify MongoDB containers are running
   - Check connection strings
   - Ensure proper network configuration

### **Debug Commands**
```bash
# Check service status
docker-compose ps

# View service logs
docker-compose logs -f [service-name]

# Check RabbitMQ status
docker exec -it soa-microservice-rabbitmq-1 rabbitmqctl status

# Test service connectivity
curl http://localhost:3003/health
```

## 🔮 **Future Enhancements**

### **Planned Features**
- **User Management System** with role-based access
- **Advanced Analytics** and reporting
- **WebSocket Support** for real-time updates
- **API Rate Limiting** and throttling
- **Advanced Caching** with Redis
- **Distributed Tracing** with Jaeger
- **Metrics Collection** with Prometheus

### **Scalability Improvements**
- **Horizontal Scaling** of services
- **Load Balancing** with Nginx
- **Database Sharding** for large datasets
- **Message Queue Clustering** for high availability

## 📚 **Additional Resources**

- **ENDPOINTS_SUMMARY.md** - Complete API reference
- **SWAGGER_REFERENCE.md** - Interactive API documentation
- **OAUTH2_GUIDE.md** - Authentication guide
- **Docker Documentation** - Container management
- **RabbitMQ Documentation** - Message queuing
- **MongoDB Documentation** - Database operations

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

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
