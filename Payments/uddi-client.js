const axios = require('axios');

class PaymentsUDDIClient {
    constructor() {
        this.uddiRegistryUrl = process.env.UDDI_REGISTRY_URL || 'http://uddi-registry:3004';
    }

    async getServiceEndpoint(serviceId, interfaceType = 'REST') {
        try {
            const response = await axios.get(`${this.uddiRegistryUrl}/api/services/${serviceId}`);
            const service = response.data;
            
            // Find the interface of the requested type
            const serviceInterface = service.interfaces?.find(i => i.type === interfaceType);
            return serviceInterface ? serviceInterface.endpoint : service.interfaces?.[0]?.endpoint;
        } catch (error) {
            console.error(`Error getting service endpoint for ${serviceId}:`, error.message);
            throw error;
        }
    }
}

module.exports = PaymentsUDDIClient;
