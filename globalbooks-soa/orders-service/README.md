# Orders Service

## Overview
The Orders Service is a **REST-based microservice** that manages the complete order lifecycle for the GlobalBooks e-commerce platform. It handles order creation, processing, status tracking, and order history management.

## Technology Stack
- **Spring Boot** for REST API implementation
- **Spring Data MongoDB** for data persistence
- **Spring Web** for REST endpoints
- **Spring Security** for authentication and authorization
- **MongoDB** for order data storage
- **RabbitMQ** for asynchronous messaging

## Key Responsibilities
- **Order Management**: Create, read, update, and delete orders
- **Order Processing**: Handle order workflow and status transitions
- **Inventory Validation**: Check book availability before order confirmation
- **Price Calculation**: Calculate order totals, taxes, and shipping costs
- **Order Tracking**: Provide order status and tracking information
- **Customer Order History**: Maintain customer order records

## REST API Endpoints
- `POST /api/orders` - Create new order
- `GET /api/orders/{id}` - Get order details by ID
- `GET /api/orders/customer/{customerId}` - Get customer order history
- `PUT /api/orders/{id}/status` - Update order status
- `GET /api/orders` - Get all orders (with pagination and filtering)
- `DELETE /api/orders/{id}` - Cancel order (if not yet shipped)

## Data Model
```java
Order {
    String id;
    String customerId;
    List<OrderItem> items;
    Address shippingAddress;
    Address billingAddress;
    double subtotal;
    double tax;
    double shippingCost;
    double totalAmount;
    OrderStatus status;
    PaymentStatus paymentStatus;
    Date createdAt;
    Date updatedAt;
    String trackingNumber;
}

OrderItem {
    String bookId;
    String bookTitle;
    int quantity;
    double unitPrice;
    double subtotal;
}
```

## Order Status Workflow
1. **PENDING** - Order created, awaiting payment
2. **PAID** - Payment received, order confirmed
3. **PROCESSING** - Order being prepared for shipping
4. **SHIPPED** - Order shipped with tracking number
5. **DELIVERED** - Order successfully delivered
6. **CANCELLED** - Order cancelled by customer or system

## Integration Points
- **Catalog Service**: Validates book availability and gets pricing
- **Payments Service**: Processes payment transactions
- **Shipping Service**: Coordinates order fulfillment and delivery
- **Customer Service**: Provides order information for customer support
- **RabbitMQ**: Publishes order events for other services

## Security
- **OAuth2** JWT token authentication
- **Role-based access control** (customer, admin, staff)
- **Order ownership validation** (customers can only access their own orders)

## Port Configuration
- **Service Port**: 8082
- **Base URL**: `http://localhost:8082/api/orders`

## Database Schema
- **Database**: `orders_db`
- **Collections**: `orders`, `order_items`
- **Indexes**: `id` (primary), `customerId`, `status`, `createdAt`

## Message Events
- **Order Created**: Published to RabbitMQ for payment processing
- **Order Status Changed**: Notifies other services of status updates
- **Order Cancelled**: Triggers refund and inventory restoration processes

## Deployment
This service will be deployed as a **Spring Boot JAR file** with embedded Tomcat server.
