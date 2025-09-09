const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const cron = require('node-cron');
const axios = require('axios');

const Service = require('./models/Service');
const swaggerDocument = YAML.load('./openapi.yaml');

const app = express();
const port = 3004;

// Middleware
app.use(cors());
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// MongoDB Connection
mongoose.connect('mongodb://uddi-db:27017/uddi', {
})
.then(() => console.log('Connected to UDDI MongoDB'))
.catch(err => console.error('Could not connect to UDDI MongoDB...', err));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        service: 'UDDI Registry Service',
        timestamp: new Date().toISOString(),
        registeredServices: 0 // Will be updated by health check
    });
});

// ==================== UDDI API ENDPOINTS ====================

// 1. Service Registration
app.post('/api/services/register', async (req, res) => {
    try {
        const serviceData = req.body;
        
        // Validate required fields
        if (!serviceData.serviceId || !serviceData.name || !serviceData.category || !serviceData.provider) {
            return res.status(400).json({ 
                error: 'Missing required fields: serviceId, name, category, provider' 
            });
        }

        // Check if service already exists
        const existingService = await Service.findOne({ serviceId: serviceData.serviceId });
        if (existingService) {
            // Update existing service
            Object.assign(existingService, serviceData);
            existingService.lastUpdated = new Date();
            existingService.extendExpiration();
            await existingService.save();
            
            return res.status(200).json({ 
                message: 'Service updated successfully',
                service: existingService 
            });
        }

        // Create new service
        const newService = new Service(serviceData);
        await newService.save();
        
        console.log(`Service registered: ${serviceData.serviceId} - ${serviceData.name}`);
        res.status(201).json({ 
            message: 'Service registered successfully',
            service: newService 
        });
    } catch (error) {
        console.error('Error registering service:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 2. Service Discovery - Find by service ID
app.get('/api/services/:serviceId', async (req, res) => {
    try {
        const { serviceId } = req.params;
        const service = await Service.findOne({ serviceId });
        
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        
        res.json(service);
    } catch (error) {
        console.error('Error finding service:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 3. Service Discovery - Find by category
app.get('/api/services/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const { status = 'ACTIVE' } = req.query;
        
        const services = await Service.find({ 
            category: new RegExp(category, 'i'),
            status: status
        });
        
        res.json(services);
    } catch (error) {
        console.error('Error finding services by category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 4. Service Discovery - Find by capability
app.get('/api/services/capability/:capability', async (req, res) => {
    try {
        const { capability } = req.params;
        const { status = 'ACTIVE' } = req.query;
        
        const services = await Service.find({ 
            'capabilities.name': new RegExp(capability, 'i'),
            status: status
        });
        
        res.json(services);
    } catch (error) {
        console.error('Error finding services by capability:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 5. Service Discovery - Find by interface type
app.get('/api/services/interface/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const { status = 'ACTIVE' } = req.query;
        
        const services = await Service.find({ 
            'interfaces.type': type.toUpperCase(),
            status: status
        });
        
        res.json(services);
    } catch (error) {
        console.error('Error finding services by interface type:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 6. Service Discovery - Search services
app.get('/api/services/search', async (req, res) => {
    try {
        const { 
            q, // search query
            category, 
            capability, 
            interfaceType, 
            status = 'ACTIVE',
            limit = 50,
            offset = 0
        } = req.query;
        
        let query = { status: status };
        
        if (q) {
            query.$or = [
                { name: new RegExp(q, 'i') },
                { description: new RegExp(q, 'i') },
                { tags: new RegExp(q, 'i') }
            ];
        }
        
        if (category) {
            query.category = new RegExp(category, 'i');
        }
        
        if (capability) {
            query['capabilities.name'] = new RegExp(capability, 'i');
        }
        
        if (interfaceType) {
            query['interfaces.type'] = interfaceType.toUpperCase();
        }
        
        const services = await Service.find(query)
            .limit(parseInt(limit))
            .skip(parseInt(offset))
            .sort({ lastUpdated: -1 });
        
        res.json({
            services,
            total: services.length,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (error) {
        console.error('Error searching services:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 7. Get all services
app.get('/api/services', async (req, res) => {
    try {
        const { status = 'ACTIVE', limit = 100, offset = 0 } = req.query;
        
        const services = await Service.find({ status })
            .limit(parseInt(limit))
            .skip(parseInt(offset))
            .sort({ lastUpdated: -1 });
        
        res.json({
            services,
            total: services.length,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (error) {
        console.error('Error getting services:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 8. Service Health Check
app.post('/api/services/:serviceId/health', async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { isHealthy } = req.body;
        
        const service = await Service.findOne({ serviceId });
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        
        service.updateHealthStatus(isHealthy);
        await service.save();
        
        res.json({ message: 'Health status updated', service });
    } catch (error) {
        console.error('Error updating health status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 9. Service Deregistration
app.delete('/api/services/:serviceId', async (req, res) => {
    try {
        const { serviceId } = req.params;
        
        const service = await Service.findOne({ serviceId });
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        
        await Service.deleteOne({ serviceId });
        
        console.log(`Service deregistered: ${serviceId}`);
        res.json({ message: 'Service deregistered successfully' });
    } catch (error) {
        console.error('Error deregistering service:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 10. Service Heartbeat (extend expiration)
app.post('/api/services/:serviceId/heartbeat', async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { hours = 24 } = req.body;
        
        const service = await Service.findOne({ serviceId });
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        
        service.extendExpiration(hours);
        await service.save();
        
        res.json({ message: 'Service heartbeat received', expiresAt: service.expiresAt });
    } catch (error) {
        console.error('Error processing heartbeat:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== HEALTH MONITORING ====================

// Function to check service health
async function checkServiceHealth(service) {
    if (!service.healthCheck.endpoint) return;
    
    try {
        const response = await axios.get(service.healthCheck.endpoint, {
            timeout: service.healthCheck.timeout
        });
        
        const isHealthy = response.status === 200;
        service.updateHealthStatus(isHealthy);
        await service.save();
        
        console.log(`Health check for ${service.serviceId}: ${isHealthy ? 'HEALTHY' : 'UNHEALTHY'}`);
    } catch (error) {
        service.updateHealthStatus(false);
        await service.save();
        console.log(`Health check for ${service.serviceId}: FAILED - ${error.message}`);
    }
}

// Function to clean up expired services
async function cleanupExpiredServices() {
    try {
        const expiredServices = await Service.find({ 
            expiresAt: { $lt: new Date() } 
        });
        
        for (const service of expiredServices) {
            console.log(`Cleaning up expired service: ${service.serviceId}`);
            await Service.deleteOne({ _id: service._id });
        }
        
        if (expiredServices.length > 0) {
            console.log(`Cleaned up ${expiredServices.length} expired services`);
        }
    } catch (error) {
        console.error('Error cleaning up expired services:', error);
    }
}

// Schedule health checks every 30 seconds
cron.schedule('*/30 * * * * *', async () => {
    try {
        const services = await Service.find({ 
            status: 'ACTIVE',
            'healthCheck.endpoint': { $exists: true, $ne: null }
        });
        
        for (const service of services) {
            await checkServiceHealth(service);
        }
    } catch (error) {
        console.error('Error in scheduled health check:', error);
    }
});

// Schedule cleanup every 5 minutes
cron.schedule('*/5 * * * *', async () => {
    await cleanupExpiredServices();
});

// ==================== START SERVER ====================

app.listen(port, () => {
    console.log(`UDDI Registry service listening at http://localhost:${port}`);
    console.log('Service registration and discovery endpoints available');
    console.log('Health monitoring and cleanup scheduled');
});
