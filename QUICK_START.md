# 🚀 **Quick Start - Get Running in 5 Minutes**

## ⚡ **Immediate Setup**

### **1. Verify Your Dependencies**
```bash
# Check Java 11
java -version

# Check Maven
mvn -version

# Check Docker
docker --version
docker-compose --version

# Check Node.js (for local development)
node --version
```

### **2. Start All Services (Easiest Method)**
```bash
# From project root directory
docker-compose up -d

# Check if all services are running
docker-compose ps

# View logs
docker-compose logs -f
```

### **3. Test Services Are Working**
```bash
# Test each service
curl http://localhost:3003/health  # Orchestrator
curl http://localhost:8080/api/products  # Catalog
curl http://localhost:3000/health  # Orders
curl http://localhost:3001/health  # Payments
curl http://localhost:3002/health  # Shipping
```

## 🔐 **Get OAuth2 Token (For Testing)**

### **Quick Token Method**
```bash
# Get service token directly
curl -X POST http://localhost:3003/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=orders-service-client&client_secret=orders-service-secret&scope=read%20write"

# Copy the "jwt_token" from the response
export JWT_TOKEN="your_jwt_token_here"
```

## 🧪 **Test Complete Workflow**

### **Create Test Order**
```bash
# Create order
curl -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-001",
    "item": "Test Book",
    "quantity": 1,
    "customerName": "Test User",
    "shippingAddress": {
      "street": "123 Test St",
      "city": "Test City",
      "zipCode": "12345"
    }
  }'
```

### **Check Workflow Status**
```bash
# Wait 20 seconds, then check status
curl -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:3003/workflow-status/test-001
```

## 🔍 **Access Management UIs**

- **RabbitMQ Management**: http://localhost:15672 (guest/guest)
- **Swagger UI Orders**: http://localhost:3000/api-docs
- **Swagger UI Payments**: http://localhost:3001/api-docs
- **Swagger UI Shipping**: http://localhost:3002/api-docs

## 🛑 **Stop Services**
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

## 🚨 **If Something Goes Wrong**

### **Check Service Status**
```bash
docker-compose ps
docker-compose logs [service-name]
```

### **Restart Specific Service**
```bash
docker-compose restart [service-name]
```

### **Full Reset**
```bash
docker-compose down -v
docker-compose up -d
```

## 📚 **Next Steps**

1. **Read the detailed guides**:
   - `DEPENDENCY_CHECK.md` - Verify all dependencies
   - `SERVICE_RUNNING_GUIDE.md` - Run services individually
   - `TESTING_GUIDE.md` - Comprehensive testing
   - `CUSTOMIZATION_GUIDE.md` - Make it your own

2. **Test with SoapUI**:
   - Open SoapUI
   - Create new SOAP project
   - WSDL URL: `http://localhost:8080/CatalogService?wsdl`

3. **Customize the project**:
   - Change service names
   - Update branding
   - Add new features

## 🎯 **Success Indicators**

✅ All services respond to health checks  
✅ OAuth2 token generation works  
✅ Order creation succeeds  
✅ Workflow completes in ~20 seconds  
✅ RabbitMQ queues show message flow  
✅ SoapUI can load WSDL  

**You're ready to go! 🚀**
