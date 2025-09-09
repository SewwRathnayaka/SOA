const mongoose = require('mongoose');

// Service Interface Schema
const ServiceInterfaceSchema = new mongoose.Schema({
    type: { type: String, enum: ['REST', 'SOAP', 'GraphQL'], required: true },
    endpoint: { type: String, required: true },
    version: { type: String, default: '1.0.0' },
    description: { type: String },
    methods: [{
        name: { type: String, required: true },
        httpMethod: { type: String, enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
        path: { type: String, required: true },
        description: { type: String },
        parameters: [{
            name: { type: String },
            type: { type: String },
            required: { type: Boolean, default: false }
        }]
    }],
    wsdlUrl: { type: String }, // For SOAP services
    openApiSpec: { type: String } // For REST services
});

// Service Capability Schema
const ServiceCapabilitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    version: { type: String, default: '1.0.0' }
});

// Service SLA Schema
const ServiceSLASchema = new mongoose.Schema({
    uptime: { type: Number, default: 99.5 }, // Percentage
    responseTime: { type: Number, default: 200 }, // Milliseconds
    throughput: { type: Number, default: 1000 }, // Requests per second
    availability: { type: String, enum: ['24/7', 'Business Hours', 'On-Demand'], default: '24/7' }
});

// Main Service Schema
const ServiceSchema = new mongoose.Schema({
    serviceId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    version: { type: String, default: '1.0.0' },
    status: { 
        type: String, 
        enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DEPRECATED'], 
        default: 'ACTIVE' 
    },
    category: { type: String, required: true },
    provider: { type: String, required: true },
    tags: [String],
    
    // Service endpoints
    interfaces: [ServiceInterfaceSchema],
    
    // Service capabilities
    capabilities: [ServiceCapabilitySchema],
    
    // Service level agreements
    sla: ServiceSLASchema,
    
    // Health monitoring
    healthCheck: {
        endpoint: { type: String },
        interval: { type: Number, default: 30 }, // seconds
        timeout: { type: Number, default: 5000 }, // milliseconds
        lastChecked: { type: Date },
        isHealthy: { type: Boolean, default: true }
    },
    
    // Service metadata
    metadata: {
        environment: { type: String, enum: ['development', 'staging', 'production'], default: 'development' },
        region: { type: String, default: 'us-east-1' },
        dataCenter: { type: String },
        dependencies: [String], // Other service IDs this service depends on
        resources: {
            cpu: { type: String },
            memory: { type: String },
            storage: { type: String }
        }
    },
    
    // Registration info
    registeredAt: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }, // 24 hours
    
    // Deprecation info
    deprecation: {
        isDeprecated: { type: Boolean, default: false },
        deprecationDate: { type: Date },
        sunsetDate: { type: Date },
        migrationPath: { type: String }
    }
}, { timestamps: true });

// Indexes for better query performance
ServiceSchema.index({ serviceId: 1 });
ServiceSchema.index({ name: 1 });
ServiceSchema.index({ category: 1 });
ServiceSchema.index({ status: 1 });
ServiceSchema.index({ 'interfaces.type': 1 });
ServiceSchema.index({ 'capabilities.name': 1 });
ServiceSchema.index({ expiresAt: 1 });

// Methods
ServiceSchema.methods.isExpired = function() {
    return new Date() > this.expiresAt;
};

ServiceSchema.methods.isHealthy = function() {
    if (!this.healthCheck.lastChecked) return false;
    const timeSinceLastCheck = Date.now() - this.healthCheck.lastChecked.getTime();
    return timeSinceLastCheck < (this.healthCheck.interval * 1000 * 2); // Allow 2x interval tolerance
};

ServiceSchema.methods.updateHealthStatus = function(isHealthy) {
    this.healthCheck.isHealthy = isHealthy;
    this.healthCheck.lastChecked = new Date();
    this.lastUpdated = new Date();
};

ServiceSchema.methods.extendExpiration = function(hours = 24) {
    this.expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
    this.lastUpdated = new Date();
};

module.exports = mongoose.model('Service', ServiceSchema);
