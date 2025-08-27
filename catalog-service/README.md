# Catalog Service

## Overview
The Catalog Service is a **SOAP-based web service** that manages the book catalog and inventory for the GlobalBooks e-commerce platform. It provides book information, stock levels, and inventory management capabilities.

## Technology Stack
- **Java JAX-WS** for SOAP web service implementation
- **MongoDB** for book catalog data storage
- **Spring Framework** for dependency injection and configuration
- **Apache CXF** or **Metro** for SOAP service implementation

## Key Responsibilities
- **Book Management**: CRUD operations for book catalog
- **Inventory Control**: Stock level tracking and updates
- **Search & Discovery**: Book search by various criteria (title, author, category)
- **Price Management**: Book pricing information
- **Availability Status**: Real-time stock availability

## Service Endpoints
- `getBook(String bookId)` - Retrieve book details by ID
- `getAllBooks()` - Get complete book catalog
- `searchBooks(String criteria)` - Search books by various criteria
- `updateStock(String bookId, int quantity)` - Update book stock levels
- `addBook(Book book)` - Add new book to catalog
- `updateBook(Book book)` - Update existing book information

## Data Model
```java
Book {
    String id;
    String title;
    String author;
    String isbn;
    String category;
    double price;
    int stock;
    String description;
    String publisher;
    Date publishDate;
}
```

## Integration Points
- **Orders Service**: Provides book availability and pricing for order processing
- **Inventory Management**: Receives stock updates from warehouse systems
- **Admin Portal**: Allows catalog administrators to manage books

## Security
- **WS-Security** implementation for SOAP message security
- **Username/Password** authentication
- **Role-based access control** for admin operations

## Port Configuration
- **Service Port**: 8081
- **Endpoint**: `/catalog/CatalogService`
- **WSDL Location**: `http://localhost:8081/catalog/CatalogService?wsdl`

## Database Schema
- **Database**: `catalog_db`
- **Collection**: `books`
- **Indexes**: `id` (primary), `isbn`, `title`, `author`, `category`

## Deployment
This service will be deployed as a **Java WAR file** in a servlet container (Tomcat) or as a **Spring Boot application** with embedded Tomcat.
