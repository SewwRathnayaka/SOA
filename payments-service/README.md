# Payments Service

## Overview
The Payments Service is a **REST-based microservice** that handles all financial transactions for the GlobalBooks e-commerce platform. It processes payments, manages payment methods, handles refunds, and ensures secure financial operations.

## Technology Stack
- **Spring Boot** for REST API implementation
- **Spring Data MongoDB** for payment data persistence
- **Spring Security** for financial data protection
- **MongoDB** for payment transaction storage
- **RabbitMQ** for payment event messaging
- **Payment Gateway Integration** (Stripe, PayPal, etc.)

## Key Responsibilities
- **Payment Processing**: Handle credit card, debit card, and digital wallet payments
- **Payment Method Management**: Store and manage customer payment methods
- **Transaction Security**: Implement PCI DSS compliance measures
- **Refund Processing**: Handle payment refunds and chargebacks
- **Payment Analytics**: Track payment success rates and fraud detection
- **Multi-currency Support**: Handle different currency conversions

## REST API Endpoints
- `POST /api/payments/process` - Process payment for an order
- `POST /api/payments/refund` - Process refund for a payment
- `GET /api/payments/{id}` - Get payment transaction details
- `GET /api/payments/order/{orderId}` - Get payments for a specific order
- `GET /api/payments/customer/{customerId}` - Get customer payment history
- `POST /api/payments/methods` - Add new payment method for customer
- `GET /api/payments/methods/{customerId}` - Get customer payment methods

## Data Model
```java
Payment {
    String id;
    String orderId;
    String customerId;
    double amount;
    String currency;
    PaymentMethod paymentMethod;
    PaymentStatus status;
    String transactionId;
    String gatewayResponse;
    Date createdAt;
    Date processedAt;
    String failureReason;
    String refundId;
}

PaymentMethod {
    String id;
    String customerId;
    PaymentType type; // CREDIT_CARD, DEBIT_CARD, PAYPAL, etc.
    String maskedNumber; // Last 4 digits only
    String cardType; // VISA, MASTERCARD, etc.
    Date expiryDate;
    boolean isDefault;
}
```

## Payment Status Workflow
1. **PENDING** - Payment initiated, awaiting processing
2. **PROCESSING** - Payment being processed by gateway
3. **COMPLETED** - Payment successfully processed
4. **FAILED** - Payment processing failed
5. **REFUNDED** - Payment has been refunded
6. **CANCELLED** - Payment was cancelled

## Integration Points
- **Orders Service**: Receives payment requests and updates order status
- **Customer Service**: Manages customer payment method preferences
- **Fraud Detection Service**: Validates payment authenticity
- **Accounting System**: Records financial transactions
- **Payment Gateways**: External payment processing services

## Security Features
- **PCI DSS Compliance**: Secure handling of payment card data
- **Tokenization**: Payment data is tokenized, not stored in plain text
- **Encryption**: All sensitive data encrypted in transit and at rest
- **Fraud Detection**: AI-powered fraud detection algorithms
- **Audit Logging**: Complete audit trail of all financial transactions

## Port Configuration
- **Service Port**: 8083
- **Base URL**: `http://localhost:8083/api/payments`

## Database Schema
- **Database**: `payments_db`
- **Collections**: `payments`, `payment_methods`, `refunds`
- **Indexes**: `id` (primary), `orderId`, `customerId`, `transactionId`, `createdAt`

## Message Events
- **Payment Processed**: Published to RabbitMQ for order status update
- **Payment Failed**: Triggers order cancellation and customer notification
- **Refund Processed**: Updates order and inventory systems

## Supported Payment Methods
- **Credit Cards**: Visa, MasterCard, American Express, Discover
- **Debit Cards**: All major debit card networks
- **Digital Wallets**: PayPal, Apple Pay, Google Pay
- **Bank Transfers**: ACH, Wire transfers
- **Buy Now, Pay Later**: Klarna, Afterpay

## Compliance & Regulations
- **PCI DSS Level 1** compliance for payment processing
- **GDPR** compliance for customer data protection
- **SOX** compliance for financial reporting
- **Regional compliance** (EU PSD2, US Reg E, etc.)

## Deployment
This service will be deployed as a **Spring Boot JAR file** with embedded Tomcat server, with additional security hardening for financial data protection.
