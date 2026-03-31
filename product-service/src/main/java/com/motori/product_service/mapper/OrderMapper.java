package com.motori.product_service.mapper;

import org.springframework.stereotype.Component;

import com.motori.product_service.dto.OderDTO.OrderRequest;
import com.motori.product_service.dto.OderDTO.OrderResponse;
import com.motori.product_service.enums.OrderStatus;
import com.motori.product_service.models.Order;

/**
 * Mapper for converting Order entities to/from DTOs.
 * 
 * <p>Handles bidirectional conversion between {@link Order} JPA entities
 * and {@link OrderRequest}/{@link OrderResponse} DTOs.
 * 
 * <p><b>Key Responsibility:</b> Maps complete order information with deeply nested
 * OrderItem list. Each item contains inventory reference and price snapshot.
 * Order demonstrates complex nested document-style mapping.
 * 
 * <p><b>Conversion Patterns:</b>
 * <ul>
 *   <li><b>toResponse():</b> Entity → DTO conversion with nested items
 *     <ul>
 *       <li>Maps order UUID, customer userId from header context</li>
 *       <li>Maps totalPrice calculated on server (never from client input)</li>
 *       <li>Maps completion boolean flag and status enum</li>
 *       <li>Recursively maps OrderItem list via mapStream and {@link OrderItemMapper}</li>
 *       <li>Maps audit timestamps (createdAt, updatedAt)</li>
 *     </ul>
 *   </li>
 *   <li><b>toEntity():</b> Request → Entity conversion for persistence
 *     <ul>
 *       <li>Initializes status to PENDING (order starts in pending state)</li>
 *       <li>Initializes completed to false (fresh orders are incomplete)</li>
 *       <li>Items list NOT set by mapper; service manages item assignment</li>
 *       <li>Service calculates totalPrice from items</li>
 *     </ul>
 *   </li>
 * </ul>
 * 
 * <p><b>Lifecycle Pattern:</b> Orders progress through states:
 * PENDING → CONFIRMED → DELIVERED → (completed=true)
 * Status can transition to CANCELLED at any point.
 * 
 * <p><b>Dependency Injection:</b> Uses constructor injection for nested mapper:
 * {@link OrderItemMapper}
 * 
 * @see OrderRequest
 * @see OrderResponse
 * @see Order
 * @since 1.0
 */
@Component
public class OrderMapper {

    private final OrderItemMapper orderItemMapper;

    public OrderMapper(OrderItemMapper orderItemMapper) {
        this.orderItemMapper = orderItemMapper;
    }

    /**
     * Converts Order entity to DTO response with nested items.
     * 
     * <p><b>Nested Mapping:</b> Each item in order.getItems() is mapped to
     * OrderItemResponse via orderItemMapper, creating complete product details for each line item.
     * 
     * <p><b>Status Mapping:</b> OrderStatus enum converted to String via .name() for API stability.
     * 
     * <p><b>Client View:</b> Response includes:
     * - Customer userId (from X-User-ID header during creation)
     * - Server-calculated totalPrice
     * - Current status for workflow tracking
     * - Completion flag (true only after DELIVERED)
     * - List of items with product details and price snapshots
     * - Audit timestamps for modification tracking
     * 
     * @param order Entity with items list and calculated totalPrice
     * @return OrderResponse with complete order and nested items for API response
     */
    public OrderResponse toResponse(Order order) {
        return new OrderResponse(
            order.getId(),
            order.getUserId(),
            order.getTotalPrice(),
            order.isCompleted(),
            order.getStatus().name(),
            order.getItems().stream()
                .map(orderItemMapper::toResponse)
                .toList(),
            order.getCreatedAt(),
            order.getUpdatedAt() 
        );
    }

    /**
     * Converts OrderRequest DTO to entity for persistence.
     * 
     * <p>Initializes order with default state:
     * <ul>
     *   <li>status = PENDING (fresh orders start in pending state)</li>
     *   <li>completed = false (not yet delivered)</li>
     * </ul>
     * 
     * <p><b>Service Responsibility:</b> Service layer handles:
     * <ul>
     *   <li>Extracting userId from X-User-ID header</li>
     *   <li>Validating order items (list is non-empty via @NotEmpty)</li>
     *   <li>Validating each item references available inventory</li>
     *   <li>Calculating totalPrice from item prices</li>
     *   <li>Assigning items to order</li>
     * </ul>
     * 
     * <p>Items list is NOT set by mapper; it's managed by service.
     * 
     * @param request DTO with @NotEmpty list of { OrderItemRequest }
     * @return Order entity in PENDING state, ready for service processing
     */
    public Order toEntity(OrderRequest request) {
        return Order.builder()
            .completed(false)
            .status(OrderStatus.PENDING)
            .build();
    }
}
