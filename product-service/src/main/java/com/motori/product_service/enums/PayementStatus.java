package com.motori.product_service.enums;

/**
 * Payment status enumeration for tracking financial transactions.
 * 
 * Represents different states of payment for orders and inventory items.
 * Used to manage payment workflows and financial reconciliation.
 */
public enum PayementStatus {
    /** Payment has been fully received */
    PAID,
    /** Payment has not been received */
    UNPAID,
    /** Payment has been partially received, remainder outstanding */
    PARTIALLY_PAID,
    /** Payment is pending and awaiting processing */
    PENDING
}