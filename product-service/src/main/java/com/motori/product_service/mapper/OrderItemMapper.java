package com.motori.product_service.mapper;

import org.springframework.stereotype.Component;

import com.motori.product_service.dto.OrderItemDTO.OrderItemRequest;
import com.motori.product_service.dto.OrderItemDTO.OrderItemResponse;
import com.motori.product_service.models.OrderItem;

/**
 * Mapper for converting OrderItem entities to/from DTOs.
 * 
 * <p>Handles bidirectional conversion between {@link OrderItem} JPA entities
 * and {@link OrderItemRequest}/{@link OrderItemResponse} DTOs.
 * 
 * <p><b>Key Responsibility:</b> Maps individual order line items with inventory references
 * and price snapshots. Price snapshot is immutable for audit trail and dispute prevention.
 * 
 * <p><b>Conversion Patterns:</b>
 * <ul>
 *   <li><b>toResponse():</b> Entity → DTO conversion for API responses
 *     <ul>
 *       <li>Maps item UUID and inventory reference via {@link InventoryMapper}</li>
 *       <li>Maps price snapshot captured at order creation time</li>
 *       <li>Price is read-only in response (cannot be modified after order creation)</li>
 *       <li>Enables audit trail: historical price verification</li>
 *     </ul>
 *   </li>
 *   <li><b>toEntity():</b> Request → Entity conversion for persistence
 *     <ul>
 *       <li>No explicit mapping from mapper (service handles ID extraction)</li>
 *       <li>Service resolves inventory by ID and validates availability</li>
 *       <li>Service captures current inventory price as snapshot</li>
 *     </ul>
 *   </li>
 * </ul>
 * 
 * <p><b>Dependency Injection:</b> Uses constructor injection for nested mapper:
 * {@link InventoryMapper}
 * 
 * @see OrderItemRequest
 * @see OrderItemResponse
 * @see OrderItem
 * @since 1.0
 */
@Component
public class OrderItemMapper {

    private final InventoryMapper inventoryMapper;

    public OrderItemMapper(InventoryMapper inventoryMapper) {
        this.inventoryMapper = inventoryMapper;
    }

    /**
     * Converts OrderItem entity to DTO response.
     * 
     * <p>Maps item UUID, inventory reference, and price snapshot.
     * The price field is immutable once captured to prevent disputes about
     * whether client was charged correct amount at order time.
     * 
     * @param item Entity with inventory reference and captured price
     * @return OrderItemResponse with complete product details and historical price
     */
    public OrderItemResponse toResponse(OrderItem item) {
        return new OrderItemResponse(
            item.getId(),
            inventoryMapper.toResponse(item.getInventoryId()),
            item.getPrice()
        );
    }

    /**
     * Converts OrderItemRequest DTO to entity for persistence.
     * 
     * <p>Minimal entity initialization. Service layer handles:
     * <ul>
     *   <li>Resolving inventory by ID from request</li>
     *   <li>Validating inventory availability (not already sold)</li>
     *   <li>Capturing current inventory price as snapshot</li>
     *   <li>Associating item with Order</li>
     * </ul>
     * 
     * @param request DTO with inventoryId reference
     * @return OrderItem entity ready for service processing (details set by service)
     */
    public OrderItem toEntity(OrderItemRequest request) {
        return OrderItem.builder()
            .build();
    }
}
