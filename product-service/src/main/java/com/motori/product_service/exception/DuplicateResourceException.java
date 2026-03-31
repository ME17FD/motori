package com.motori.product_service.exception;

/**
 * Exception thrown when attempting to create a resource that already exists.
 * 
 * This exception is used to handle business logic violations where duplicate
 * entries are not allowed (e.g., duplicate brand names, category names, etc.).
 * 
 * Example: Trying to create a brand with a name that already exists.
 */
public class DuplicateResourceException extends RuntimeException {
    
    /**
     * Constructs a new DuplicateResourceException with the specified detail message.
     * 
     * @param message Description of the duplicate resource
     */
    public DuplicateResourceException(String message) {
        super(message);
    }
}

