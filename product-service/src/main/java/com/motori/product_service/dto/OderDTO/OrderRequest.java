package com.motori.product_service.dto.OderDTO;

import java.util.List;

import com.motori.product_service.dto.OrderItemDTO.OrderItemRequest;

import jakarta.validation.constraints.NotEmpty;

/**
 * Request DTO for creating a new customer order.
 * <p>
 * This record encapsulates the items to include in a customer order.
 * The system automatically generates an order number, calculates the total price from current inventory prices,
 * and initializes the order in PENDING status for confirmation workflow.
 * </p>
 * 
 * Field Constraints:
 * <ul>
 *   <li>items: List<OrderItemRequest> - Must not be null or empty; minimum 1 item required per order</li>
 * </ul>
 * 
 * Order Items:
 * Each item in the list references an inventory item that the customer wants to order.
 * The service layer validates that all referenced inventory items exist and have available stock.
 * 
 * Validation: The service layer validates that:
 * - The items list is not null or empty (throws MethodArgumentNotValidException if empty)
 * - Every inventory item in the items list exists (throws ResourceNotFoundException if not found)
 * - Every inventory item has sufficient stock (quantity > 0; throws IllegalArgumentException if not)
 * - No duplicate inventory items are ordered in the same order (throws DuplicateResourceException)
 * 
 * Order Number Generation:
 * The service automatically generates a unique order number in format: ORD-{timestamp}-{randomId}
 * 
 * Price Calculation:
 * Total order price is calculated server-side using CURRENT prices from inventory/part/equipment entities.
 * Client-provided prices in OrderItemRequest are ignored for security and audit purposes.
 * This prevents customer price manipulation.
 * 
 * Order Status:
 * All newly created orders are initialized in PENDING state.
 * Workflow progression: PENDING -> CONFIRMED -> DELIVERED (or CANCELLED from any state)
 * 
 * @param items non-empty list of order line items to include in the order
 * 
 * @author Motori Team
 * @since 1.0
 */
public record OrderRequest(
    @NotEmpty List<OrderItemRequest> items
) {}