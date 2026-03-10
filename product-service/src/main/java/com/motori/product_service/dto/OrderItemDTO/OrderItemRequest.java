package com.motori.product_service.dto.OrderItemDTO;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;


/**
 * Request DTO for adding an item (line item) to a customer order.
 * <p>
 * This record encapsulates a single order line item containing a reference to an inventory item.
 * Multiple OrderItemRequests are submitted together in an OrderRequest to create complete orders.
 * </p>
 * 
 * Field Constraints:
 * <ul>
 *   <li>inventoryId: UUID - Must not be null; must reference an existing Inventory item with available stock</li>
 * </ul>
 * 
 * Validation: The service layer validates that:
 * - inventoryId is not null (throws MethodArgumentNotValidException if null)
 * - The referenced inventory item exists (throws ResourceNotFoundException if not found)
 * - The inventory item has sufficient quantity available (throws IllegalArgumentException if quantity = 0)
 * - The inventory item is not soft-deleted
 * - The inventory item has not been previously sold (soldAt must be null)
 * 
 * Quantity Handling:
 * Note: The quantity is NOT specified in this request DTO.
 * The system assumes a quantity of 1 per OrderItemRequest.
 * To order multiple units of the same part, create multiple OrderItemRequest records with the same inventoryId.
 * 
 * Pricing:
 * Unit price is not specified in the request. The service layer uses the current price from the referenced
 * inventory's part or equipment for calculation. This prevents price manipulation by clients.
 * 
 * @param inventoryId the UUID of the inventory item to add to the order
 * 
 * @author Motori Team
 * @since 1.0
 */
public record OrderItemRequest(
    @NotNull UUID inventoryId
) {}
