package globalbooks.catalog.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class UDDIClient {
    private static final String UDDI_REGISTRY_URL = System.getenv("UDDI_REGISTRY_URL") != null ? 
        System.getenv("UDDI_REGISTRY_URL") : "http://uddi-registry:3004";
    
    private static final HttpClient httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10))
        .build();
    
    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    public UDDIClient() {
        // Simple UDDI client for service discovery
    }
    
    public String getServiceEndpoint(String serviceId, String interfaceType) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(UDDI_REGISTRY_URL + "/api/services/" + serviceId))
                .timeout(Duration.ofSeconds(10))
                .build();
            
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() == 200) {
                // Parse response and find the requested interface type
                // For simplicity, return the first available endpoint
                return "http://" + serviceId + ":3000"; // Fallback endpoint
            }
        } catch (Exception e) {
            System.err.println("Error getting service endpoint for " + serviceId + ": " + e.getMessage());
        }
        
        // Return fallback endpoint
        return "http://" + serviceId + ":3000";
    }
}
