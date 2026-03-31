package com.motori.product_service.exception;

/**
 * Exception thrown when a requested resource is not found in the database.
 * 
 * This exception is typically thrown by service methods when they attempt
 * to retrieve or perform operations on resources that don't exist.
 * 
 * Example: Trying to get an equipment by ID that doesn't exist in the database.
 */
public class ResourceNotFoundException extends RuntimeException {
    
    /**
     * Constructs a new ResourceNotFoundException with the specified detail message.
     * 
     * @param message Description of the resource that was not found
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }
}