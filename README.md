# GlobalBooks SOA Microservices System

## Overview
GlobalBooks is a comprehensive e-commerce platform built using **Service-Oriented Architecture (SOA)** principles and **microservices** design patterns. The system handles the complete book retail lifecycle from catalog management to order fulfillment and delivery.

## Architecture Overview
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ CatalogService│  │ OrdersService│  │PaymentService│  │ShippingService│
│   (SOAP)     │  │    (REST)    │  │    (REST)    │  │    (REST)    │
│   Port:8081  │  │   Port:8082  │  │   Port:8083  │  │   Port:8084  │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │                 │
       └─────────────────┼─────────────────┼─────────────────┘
                         │                 │
                    ┌────┴────┐       ┌────┴────┐
                    │RabbitMQ │       │  BPEL   │
                    │   ESB   │       │ Engine  │
                    │ Port:5672│      │ Port:8080│
                    └─────────┘       └─────────┘
```

## System Components

### Core Microservices
1. **Catalog Service** (Port 8081) - SOAP-based book catalog and inventory management
2. **Orders Service** (Port 8082) - REST-based order processing and management
3. **Payments Service** (Port 8083) - REST-based payment processing and financial transactions
4. **Shipping Service** (Port 8084) - REST-based shipping logistics and delivery tracking

### Infrastructure Services
- **MongoDB Databases** - Separate database for each service
- **RabbitMQ** - Message broker for asynchronous communication
- **Apache ODE** - BPEL engine for business process orchestration
- **UDDI Registry** - Service discovery and management

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Catalog Service** | Java JAX-WS, MongoDB | SOAP web service for book catalog |
| **Orders Service** | Spring Boot, MongoDB | REST API for order management |
| **Payments Service** | Spring Boot, MongoDB | REST API for payment processing |
| **Shipping Service** | Spring Boot, MongoDB | REST API for shipment tracking |
| **Message Broker** | RabbitMQ | Asynchronous communication |
| **Orchestration** | Apache ODE (BPEL) | Business process workflow |
| **Security** | WS-Security, OAuth2 | Authentication & authorization |
| **Registry** | UDDI | Service discovery |
| **Testing** | SOAP UI, Postman | API testing |
| **Deployment** | Docker, Cloud Platform | Containerization |

## Business Workflow
1. **Customer places order** → Orders Service
2. **Inventory validation** → Catalog Service (SOAP call)
3. **Payment processing** → Payments Service
4. **Order fulfillment** → Shipping Service
5. **All orchestrated through BPEL workflow**

## Key Features
- **Loose Coupling**: Services communicate only via well-defined APIs
- **High Cohesion**: Each service handles one specific business domain
- **Database Per Service**: Data ownership isolation
- **Asynchronous Communication**: Event-driven architecture using RabbitMQ
- **Business Process Orchestration**: Complex workflows managed by BPEL
- **Service Discovery**: UDDI registry for dynamic service location
- **Security**: WS-Security for SOAP, OAuth2 for REST services

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Java 11 or higher
- Maven 3.6 or higher
- Node.js 14 or higher (for some tooling)

### Quick Start
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd globalbooks-soa
   ```

2. **Start infrastructure services**
   ```bash
   docker-compose up -d
   ```

3. **Build and run services**
   ```bash
   # Build all services
   mvn clean install
   
   # Run individual services
   cd catalog-service && mvn spring-boot:run
   cd orders-service && mvn spring-boot:run
   cd payments-service && mvn spring-boot:run
   cd shipping-service && mvn spring-boot:run
   ```

### Service URLs
- **Catalog Service**: http://localhost:8081/catalog/CatalogService?wsdl
- **Orders Service**: http://localhost:8082/api/orders
- **Payments Service**: http://localhost:8083/api/payments
- **Shipping Service**: http://localhost:8084/api/shipping
- **RabbitMQ Management**: http://localhost:15672 (admin/admin123)
- **Apache ODE**: http://localhost:8080
- **UDDI Registry**: http://localhost:8081

## Development Guidelines

### Service Development
- Follow **Domain-Driven Design** principles
- Implement **Contract-First** API design
- Use **Event Sourcing** for state changes
- Implement **Circuit Breaker** pattern for resilience
- Add comprehensive **logging** and **monitoring**

### Testing Strategy
- **Unit Tests**: Test individual service components
- **Integration Tests**: Test service interactions
- **Contract Tests**: Verify API contracts
- **End-to-End Tests**: Test complete business workflows
- **Performance Tests**: Load and stress testing

### Security Considerations
- **Input Validation**: Validate all incoming data
- **Authentication**: Implement proper authentication mechanisms
- **Authorization**: Role-based access control
- **Data Encryption**: Encrypt sensitive data in transit and at rest
- **Audit Logging**: Log all security-relevant events

## Monitoring and Observability
- **Health Checks**: Each service exposes health endpoints
- **Metrics**: Prometheus metrics collection
- **Distributed Tracing**: Jaeger for request tracing
- **Centralized Logging**: ELK stack for log aggregation
- **Alerting**: Prometheus AlertManager for notifications

## Deployment
- **Containerization**: Docker containers for all services
- **Orchestration**: Kubernetes for production deployment
- **CI/CD**: Automated build and deployment pipelines
- **Blue-Green Deployment**: Zero-downtime deployments
- **Rollback Strategy**: Quick rollback capabilities

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Support
For questions and support, please contact the development team or create an issue in the repository.
