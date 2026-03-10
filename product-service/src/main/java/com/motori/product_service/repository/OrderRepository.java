package com.motori.product_service.repository;


import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.motori.product_service.models.Order;

/**
 * Data access layer for Order entities.
 * 
 * Manages customer orders with support for dynamic filtering through JPA Specifications.
 * Orders contain multiple line items (OrderItems) linking to Inventory (Parts or Equipment).
 * Uses deep EntityGraph optimization to eagerly load complete order details including all items,
 * inventory, products, brands, and categories - preventing N+1 query problems in order retrieval.
 * 
 * @author Product Service Team
 */
public interface OrderRepository extends JpaRepository<Order, UUID>,
    JpaSpecificationExecutor<Order> {

    /**
     * Retrieves orders matching the given specification with pagination.
     * 
     * Supports dynamic filtering by order criteria (status, date range, payment status).
     * Eagerly loads complete order details: items, inventory, parts/equipment, and brands.
     * 
     * @param spec the dynamic query specification with filter criteria
     * @param pageable pagination parameters (page number, size, sort)
     * @return paginated list of orders matching the criteria
     */
    @EntityGraph(attributePaths = {
        "items", "items.inventory",
        "items.inventory.part", "items.inventory.part.partBrand",
        "items.inventory.equipement", "items.inventory.equipement.equipementBrand"
    })
    Page<Order> findAll(Specification<Order> spec, Pageable pageable);

    /**
     * Retrieves a specific order by ID with complete details.
     * 
     * Eagerly loads all order items with their inventory and product information
     * to provide complete order context in a single query.
     * 
     * @param id the unique identifier of the order
     * @return optional containing the order if found, empty otherwise
     */
    @EntityGraph(attributePaths = {
        "items", "items.inventory",
        "items.inventory.part", "items.inventory.part.partBrand",
        "items.inventory.equipement", "items.inventory.equipement.equipementBrand"
    })
    Optional<Order> findById(UUID id);

    /**
     * Retrieves all orders placed by a specific user.
     * 
     * @param userId the unique identifier of the user
     * @param pageable pagination parameters (page number, size, sort)
     * @return paginated list of orders placed by the user
     */
    Page<Order> findByUserId(UUID userId, Pageable pageable);
}
    

