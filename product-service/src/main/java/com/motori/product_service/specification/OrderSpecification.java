package com.motori.product_service.specification;
import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;
import com.motori.product_service.dto.OderDTO.OrderFilterRequest;
import com.motori.product_service.enums.OrderStatus;
import com.motori.product_service.models.Order;

/**
 * JPA Specification builder for advanced Order filtering.
 * 
 * <p>Constructs {@link Specification<Order>} predicates dynamically based on
 * filter criteria provided via {@link OrderFilterRequest}. Enables flexible
 * order search by status, completion state, and customer.
 * 
 * <p><b>Filter Combinations (AND Logic):</b>
 * <ul>
 *   <li>status: Order lifecycle status (PENDING/CONFIRMED/DELIVERED/CANCELLED)</li>
 *   <li>completed: Boolean flag indicating order completion state</li>
 *   <li>userId: Customer UUID from X-User-ID header context</li>
 * </ul>
 * 
 * <p><b>Order Lifecycle States:</b>
 * <ul>
 *   <li>PENDING: Order created, items reserved</li>
 *   <li>CONFIRMED: Customer payment confirmed</li>
 *   <li>DELIVERED: Physical delivery completed</li>
 *   <li>CANCELLED: Order cancelled by customer or system</li>
 * </ul>
 * 
 * <p><b>Usage:</b>
 * <pre>
 * OrderFilterRequest filter = new OrderFilterRequest("DELIVERED", true, userId);
 * Specification<Order> spec = OrderSpecification.withFilters(filter);
 * Page<Order> results = repository.findAll(spec, pageable);
 * </pre>
 * 
 * @see OrderFilterRequest
 * @see OrderService#getAll(OrderFilterRequest, Pageable)
 * @since 1.0
 */
public class OrderSpecification {

    private OrderSpecification() {}

    /**
     * Builds compound Specification from filter request.
     * 
     * @param filter OrderFilterRequest with optional status, completed, and userId
     * @return Specification<Order> combining all provided filters with AND logic
     */
    public static Specification<Order> withFilters(OrderFilterRequest filter) {
        return Specification
            .where(hasStatus(filter.status()))
            .and(isCompleted(filter.completed()))
            .and(hasUser(filter.userId()));
    }

    /**
     * Filters by order status enum.
     * 
     * <p>Converts String parameter to OrderStatus enum:
     * PENDING, CONFIRMED, DELIVERED, CANCELLED.
     * 
     * <p>Returns null if status is null/blank or invalid enum value (predicate ignored).
     * 
     * @param status Optional order status as String
     * @return Specification matching order status, or null to ignore
     */
    private static Specification<Order> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isBlank()) return null;
            try {
                OrderStatus orderStatus = OrderStatus.valueOf(
                    status.toUpperCase()
                );
                return cb.equal(root.get("status"), orderStatus);
            } catch (IllegalArgumentException e) {
                return null;
            }
        };
    }

    /**
     * Filters by order completion status.
     * 
     * <p>Completed = true indicates order reached DELIVERED state and is finalized.
     * Returns null if completed is null (predicate ignored).
     * 
     * @param completed Optional completion flag
     * @return Specification matching completion status, or null to ignore
     */
    private static Specification<Order> isCompleted(Boolean completed) {
        return (root, query, cb) -> {
            if (completed == null) return null;
            return cb.equal(root.get("completed"), completed);
        };
    }

    /**
     * Filters by customer user ID.
     * 
     * <p>Exact equality on order.userId. Enables retrieving orders for specific customer.
     * Returns null if userId is null (predicate ignored).
     * 
     * @param userId Optional customer UUID
     * @return Specification matching customer ID, or null to ignore
     */
    private static Specification<Order> hasUser(UUID userId) {
        return (root, query, cb) -> {
            if (userId == null) return null;
            return cb.equal(root.get("userId"), userId);
        };
    }
}