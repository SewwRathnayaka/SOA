# WS-Security Configuration for Catalog Service

## 1. SoapUI WS-Security Setup

### Step 1: Configure WS-Security in SoapUI
1. Open SoapUI project: `CatalogService/SoapUI_Tests/CatalogService-Live-WSDL-Project-soapui-project.xml`
2. Navigate to any SOAP request (e.g., `getProduct`)
3. Go to the **"Auth"** tab at the bottom
4. Select **"WS-Security"** from the dropdown

### Step 2: UsernameToken Configuration
```
Authentication Type: UsernameToken
Username: catalog-user
Password: catalog-password
Password Type: PasswordText
```

### Step 3: Security Actions
- ✅ **Timestamp**: Add timestamp to prevent replay attacks
- ✅ **UsernameToken**: Add username/password authentication
- ❌ **Signature**: Not required for basic authentication
- ❌ **Encryption**: Not required for basic authentication

## 2. Java WS-Security Implementation

### Step 1: Add WS-Security Dependencies to pom.xml
```xml
<dependency>
    <groupId>com.sun.xml.ws</groupId>
    <artifactId>jaxws-rt</artifactId>
    <version>2.3.3</version>
</dependency>
<dependency>
    <groupId>com.sun.xml.ws</groupId>
    <artifactId>jaxws-tools</artifactId>
    <version>2.3.3</version>
</dependency>
```

### Step 2: Create WS-Security Handler
```java
package globalbooks.catalog.security;

import com.sun.xml.wss.impl.callback.PasswordValidationCallback;
import com.sun.xml.wss.impl.callback.UsernameCallback;
import com.sun.xml.wss.impl.handler.UsernameTokenHandler;

import javax.security.auth.callback.Callback;
import javax.security.auth.callback.CallbackHandler;
import javax.security.auth.callback.UnsupportedCallbackException;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class CatalogSecurityHandler implements CallbackHandler {
    
    private static final Map<String, String> VALID_USERS = new HashMap<>();
    
    static {
        VALID_USERS.put("catalog-user", "catalog-password");
        VALID_USERS.put("admin", "admin123");
        VALID_USERS.put("test-user", "test123");
    }
    
    @Override
    public void handle(Callback[] callbacks) throws IOException, UnsupportedCallbackException {
        for (Callback callback : callbacks) {
            if (callback instanceof UsernameCallback) {
                UsernameCallback usernameCallback = (UsernameCallback) callback;
                usernameCallback.setUsername(usernameCallback.getUsername());
            } else if (callback instanceof PasswordValidationCallback) {
                PasswordValidationCallback passwordCallback = (PasswordValidationCallback) callback;
                String username = passwordCallback.getUsername();
                String password = new String(passwordCallback.getPassword());
                
                if (isValidUser(username, password)) {
                    passwordCallback.setValid(true);
                } else {
                    passwordCallback.setValid(false);
                }
            }
        }
    }
    
    private boolean isValidUser(String username, String password) {
        return VALID_USERS.containsKey(username) && 
               VALID_USERS.get(username).equals(password);
    }
}
```

### Step 3: Update sun-jaxws.xml for WS-Security
```xml
<endpoints xmlns="http://java.sun.com/xml/ns/jax-ws/ri/runtime" version="2.0">
    <endpoint name="CatalogService"
              implementation="globalbooks.catalog.CatalogServiceImpl"
              url-pattern="/CatalogService">
        <handler-chains>
            <handler-chain>
                <handler>
                    <handler-name>UsernameTokenHandler</handler-name>
                    <handler-class>com.sun.xml.wss.impl.handler.UsernameTokenHandler</handler-class>
                    <init-param>
                        <param-name>callbackHandler</param-name>
                        <param-value>globalbooks.catalog.security.CatalogSecurityHandler</param-value>
                    </init-param>
                </handler>
            </handler-chain>
        </handler-chains>
    </endpoint>
</endpoints>
```

## 3. Testing WS-Security in SoapUI

### Test Case 1: Valid Authentication
```
Request: getProduct
WS-Security: UsernameToken
Username: catalog-user
Password: catalog-password
Expected: 200 OK with product data
```

### Test Case 2: Invalid Authentication
```
Request: getProduct
WS-Security: UsernameToken
Username: invalid-user
Password: wrong-password
Expected: 401 Unauthorized or SOAP Fault
```

### Test Case 3: No Authentication
```
Request: getProduct
WS-Security: None
Expected: 401 Unauthorized or SOAP Fault
```

## 4. WS-Security SOAP Message Example

### Request with UsernameToken
```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" 
               xmlns:cat="http://catalog.globalbooks/"
               xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"
               xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
    <soap:Header>
        <wsse:Security>
            <wsu:Timestamp wsu:Id="TS-1">
                <wsu:Created>2024-01-01T12:00:00Z</wsu:Created>
                <wsu:Expires>2024-01-01T12:05:00Z</wsu:Expires>
            </wsu:Timestamp>
            <wsse:UsernameToken wsu:Id="UsernameToken-1">
                <wsse:Username>catalog-user</wsse:Username>
                <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">catalog-password</wsse:Password>
            </wsse:UsernameToken>
        </wsse:Security>
    </soap:Header>
    <soap:Body>
        <cat:getProduct>
            <id>1</id>
        </cat:getProduct>
    </soap:Body>
</soap:Envelope>
```

### Response (Success)
```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" 
               xmlns:cat="http://catalog.globalbooks/">
    <soap:Body>
        <cat:getProductResponse>
            <return>
                <id>1</id>
                <name>The Lord of the Rings</name>
                <description>Fantasy novel by J.R.R. Tolkien</description>
                <price>25.00</price>
                <quantity>100</quantity>
            </return>
        </cat:getProductResponse>
    </soap:Body>
</soap:Envelope>
```

### Response (Authentication Failure)
```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <soap:Fault>
            <faultcode>soap:Client</faultcode>
            <faultstring>Authentication failed</faultstring>
            <detail>
                <ns2:SecurityFault xmlns:ns2="http://catalog.globalbooks/">
                    <message>Invalid username or password</message>
                </ns2:SecurityFault>
            </detail>
        </soap:Fault>
    </soap:Body>
</soap:Envelope>
```

## 5. SoapUI Test Assertions

### Security Assertions
1. **Response Time**: < 200ms
2. **Status Code**: 200 OK
3. **SOAP Fault Check**: No SOAP faults
4. **Authentication Success**: Valid product data returned

### Performance Assertions
1. **Response Time**: < 200ms
2. **Schema Validation**: Response matches WSDL schema
3. **Content Validation**: Required fields present

## 6. Advanced WS-Security Features

### Digital Signatures
```xml
<wsse:Security>
    <ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <!-- Digital signature for message integrity -->
    </ds:Signature>
</wsse:Security>
```

### Message Encryption
```xml
<wsse:Security>
    <xenc:EncryptedData xmlns:xenc="http://www.w3.org/2001/04/xmlenc#">
        <!-- Encrypted message content -->
    </xenc:EncryptedData>
</wsse:Security>
```

### SAML Tokens
```xml
<wsse:Security>
    <saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:1.0:assertion">
        <!-- SAML authentication token -->
    </saml:Assertion>
</wsse:Security>
```

## 7. Best Practices

### Security Best Practices
1. **Use HTTPS**: Always use SSL/TLS for WS-Security
2. **Password Hashing**: Store hashed passwords, not plain text
3. **Token Expiration**: Set reasonable token expiration times
4. **Audit Logging**: Log all authentication attempts
5. **Rate Limiting**: Implement rate limiting for authentication

### Testing Best Practices
1. **Test All Scenarios**: Valid, invalid, and missing authentication
2. **Performance Testing**: Test with WS-Security overhead
3. **Error Handling**: Verify proper error responses
4. **Schema Validation**: Ensure responses match WSDL
5. **Load Testing**: Test authentication under load

This configuration provides enterprise-grade security for your SOAP web services while maintaining compatibility with SoapUI testing tools.
