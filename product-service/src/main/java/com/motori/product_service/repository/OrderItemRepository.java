package com.motori.product_service.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motori.product_service.models.OrderItem;

/**
 * Data access layer for Order item line-items.
 * 
 * Manages individual items within orders with soft-delete support. Each order item represents
 * a single product (part or equipment) in an order. Queries filter by deletedAt field to exclude
 * soft-deleted records, maintaining data consistency across order operations.
 * 
 * @author Product Service Team
 */
public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {
    /**
     * Retrieves all non-deleted order items.
     * 
     * @return list of order items that have not been soft-deleted
     */
    List<OrderItem> findAllByDeletedAtIsNull();

    /**
     * Finds a non-deleted order item by ID.
     * 
     * @param id the unique identifier of the order item
     * @return optional containing the item if found and not deleted, empty otherwise
     */
    Optional<OrderItem> findByIdAndDeletedAtIsNull(UUID id);
} 

