package com.motori.product_service.enums;

/**
 * Order status enumeration representing the lifecycle of a customer order.
 * 
 * Tracks the progression of an order from creation to final delivery or cancellation.
 * Used for order management and customer communication.
 */
public enum OrderStatus {
    /** Order is awaiting confirmation from the customer */
    PENDING,
    /** Order has been confirmed and is being processed */
    CONFIRMED,
    /** Order has been delivered to the customer */
    DELIVERED,
    /** Order has been cancelled by the customer or system */
    CANCELLED
}
