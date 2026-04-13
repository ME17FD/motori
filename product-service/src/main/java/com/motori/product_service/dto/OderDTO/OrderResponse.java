package com.motori.product_service.dto.OderDTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.motori.product_service.dto.OrderItemDTO.OrderItemResponse;

/**
 * Response DTO for a complete customer order with all line items and status information.
 * <p>
 * This record represents a complete order snapshot including customer identification, current status,
 * total price, and all line items with product details. Used in API responses for order retrieval and creation.
 * </p>
 * 
 * Field Descriptions:
 * <ul>
 *   <li>id: UUID - Unique order identifier</li>
 *   <li>userId: String - Identifiant utilisateur (ex. sujet Keycloak, aligné sur X-User-ID)</li>
 *   <li>totalPrice: BigDecimal - Order total calculated from all line item prices at order time</li>
 *   <li>completed: boolean - Indicates if order is in a final state (true = DELIVERED or CANCELLED)</li>
 *   <li>status: String - Current order status (PENDING, CONFIRMED, DELIVERED, or CANCELLED)</li>
 *   <li>items: List<OrderItemResponse> - All line items in the order with product and pricing details</li>
 *   <li>createdAt: LocalDateTime - When order was placed</li>
 *   <li>updatedAt: LocalDateTime - Last status update timestamp</li>
 * </ul>
 * 
 * Order Status Lifecycle:
 * <pre>
 *   PENDING -----(confirmation)----> CONFIRMED -----(shipment)----> DELIVERED
 *     ^                                 ^                              ^
 *     |___________(cancel)______________|___________(cancel)__________|  -> CANCELLED
 * </pre>
 * 
 * Order Completion:
 * The 'completed' boolean field indicates terminal states:
 * - true: Order is DELIVERED or CANCELLED (order fulfillment is complete)
 * - false: Order is PENDING or CONFIRMED (order is still in progress)
 * 
 * Total Price:
 * The totalPrice field represents the sum of (unit price * quantity) for all line items.
 * This is a snapshot of prices at order creation time and remains unchanged even if
 * underlying product prices change later.
 * 
 * Items Collection:
 * The items list contains complete OrderItemResponse records with:
 * - Full inventory details (part or equipment information)
 * - Unit price snapshot from order creation time
 * - Order item ID for potential returns/refunds
 * 
 * @param id the unique order identifier
 * @param userId the customer/user who placed the order
 * @param totalPrice the total order amount (sum of line items)
 * @param completed boolean indicating if order is in terminal state
 * @param status the current order state (PENDING, CONFIRMED, DELIVERED, or CANCELLED)
 * @param items list of all line items in this order
 * @param createdAt the order creation timestamp
 * @param updatedAt the last status update timestamp
 * 
 * @author Motori Team
 * @since 1.0
 */
public record OrderResponse(
    UUID id,
    String userId,
    BigDecimal totalPrice,
    boolean completed,
    String status,
    List<OrderItemResponse> items,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}