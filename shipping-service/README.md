# Shipping Service

## Overview
The Shipping Service is a **REST-based microservice** that manages order fulfillment, shipping logistics, and delivery tracking for the GlobalBooks e-commerce platform. It coordinates with shipping carriers and provides real-time delivery status updates.

## Technology Stack
- **Spring Boot** for REST API implementation
- **Spring Data MongoDB** for shipping data persistence
- **Spring Web** for REST endpoints
- **Spring Security** for authentication and authorization
- **MongoDB** for shipping data storage
- **RabbitMQ** for shipping event messaging
- **Carrier API Integration** (FedEx, UPS, DHL, USPS)

## Key Responsibilities
- **Order Fulfillment**: Process orders for shipping and delivery
- **Shipping Rate Calculation**: Calculate shipping costs based on weight, distance, and service level
- **Carrier Integration**: Interface with multiple shipping carriers
- **Tracking Management**: Provide real-time package tracking information
- **Delivery Scheduling**: Coordinate delivery time slots and notifications
- **Returns Processing**: Handle return shipping labels and processing

## REST API Endpoints
- `POST /api/shipping/fulfill` - Create shipping label for an order
- `GET /api/shipping/track/{trackingNumber}` - Get package tracking information
- `GET /api/shipping/rates` - Calculate shipping rates for an order
- `POST /api/shipping/return` - Create return shipping label
- `GET /api/shipping/orders/{orderId}` - Get shipping details for an order
- `PUT /api/shipping/status/{trackingNumber}` - Update shipping status
- `GET /api/shipping/carriers` - Get available shipping carriers

## Data Model
```java
Shipment {
    String id;
    String orderId;
    String trackingNumber;
    String carrierCode; // FEDEX, UPS, DHL, USPS
    ShippingService service; // GROUND, EXPRESS, PRIORITY
    Address originAddress;
    Address destinationAddress;
    PackageDetails packageDetails;
    ShippingStatus status;
    Date shippedDate;
    Date estimatedDelivery;
    Date actualDelivery;
    double shippingCost;
    String labelUrl;
}

PackageDetails {
    double weight;
    double length;
    double width;
    double height;
    String packageType; // ENVELOPE, BOX, PALLET
    boolean fragile;
    String specialInstructions;
}
```

## Shipping Status Workflow
1. **PENDING** - Order ready for shipping, awaiting label creation
2. **LABEL_CREATED** - Shipping label generated
3. **PICKED_UP** - Package picked up by carrier
4. **IN_TRANSIT** - Package in transit
5. **OUT_FOR_DELIVERY** - Package out for final delivery
6. **DELIVERED** - Package successfully delivered
7. **EXCEPTION** - Delivery issue encountered

## Integration Points
- **Orders Service**: Receives order fulfillment requests
- **Payments Service**: Confirms payment before shipping
- **Inventory Service**: Updates inventory after shipping
- **Customer Service**: Provides shipping information for customer support
- **Carrier APIs**: External shipping carrier services
- **RabbitMQ**: Publishes shipping events for other services

## Supported Shipping Carriers
- **FedEx**: Ground, Express, Priority, SmartPost
- **UPS**: Ground, 3-Day Select, 2nd Day Air, Next Day Air
- **DHL**: Express, Ground, International
- **USPS**: First Class, Priority, Media Mail, Ground
- **Regional Carriers**: Local and regional delivery services

## Shipping Rate Calculation
- **Weight-based pricing**: Cost per pound/kilogram
- **Distance-based pricing**: Cost per mile/kilometer
- **Service level pricing**: Express vs. standard delivery
- **Package type pricing**: Box, envelope, or special handling
- **Additional fees**: Insurance, signature confirmation, Saturday delivery

## Tracking & Notifications
- **Real-time tracking**: Live package location updates
- **Delivery notifications**: SMS, email, and push notifications
- **Exception handling**: Delivery issues and rescheduling
- **Proof of delivery**: Digital signatures and photos
- **Customer portal**: Self-service tracking interface

## Port Configuration
- **Service Port**: 8084
- **Base URL**: `http://localhost:8084/api/shipping`

## Database Schema
- **Database**: `shipping_db`
- **Collections**: `shipments`, `tracking_events`, `shipping_rates`
- **Indexes**: `id` (primary), `orderId`, `trackingNumber`, `carrierCode`, `status`

## Message Events
- **Shipment Created**: Published to RabbitMQ for order status update
- **Tracking Updated**: Notifies customer service of delivery progress
- **Delivery Completed**: Triggers inventory and order completion processes

## International Shipping
- **Customs Documentation**: Generate required customs forms
- **Duty & Tax Calculation**: Calculate import duties and taxes
- **Restricted Items**: Check for prohibited items by country
- **Delivery Timeframes**: International shipping estimates
- **Local Carrier Handoff**: Coordinate with local delivery partners

## Deployment
This service will be deployed as a **Spring Boot JAR file** with embedded Tomcat server, with additional monitoring for shipping performance metrics.
