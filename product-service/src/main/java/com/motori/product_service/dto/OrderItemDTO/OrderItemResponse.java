package com.motori.product_service.dto.OrderItemDTO;

import java.math.BigDecimal;
import com.motori.product_service.dto.InventoryDTO.InventoryResponse;

/**
 * Response DTO for an individual order line item with pricing and inventory details.
 * <p>
 * This record represents a single item within a customer order, including the inventory/product details
 * and the unit price at the time of order creation. Prices are snapshots and maintain the price that was
 * current when the order was placed, independent of subsequent price changes.
 * </p>
 * 
 * Field Descriptions:
 * <ul>
 *   <li>id: Long - Identifier for the order line item (surrogate key)</li>
 *   <li>inventory: InventoryResponse - Complete inventory details including linked part or equipment</li>
 *   <li>price: BigDecimal - Unit price snapshot at the time of order creation</li>
 * </ul>
 * 
 * Quantity Information:
 * Note: Quantity is not explicitly included in this DTO as the system treats each OrderItem as single unit.
 * To represent multiple units in an order, multiple OrderItemResponse records are added to the order items list.
 * 
 * Nested Inventory Object:
 * The inventory field provides complete product details:
 * - If part is non-null: Contains PartResponse with brand, category, SKU, specifications
 * - If equipement is non-null: Contains EquipementResponse with brand, category, size, color
 * 
 * Price Handling:
 * The price field is a snapshot of the inventory item's price at order creation time.
 * This prevents price disputes and allows audit trails where customer paid price is always recorded.
 * The actual inventory item price may have changed since order placement.
 * 
 * @param id the unique order line item identifier
 * @param inventory the complete inventory (product) details for this line item
 * @param price the unit price snapshot at time of order creation
 * 
 * @author Motori Team
 * @since 1.0
 */
public record OrderItemResponse(
    Long id,
    InventoryResponse inventory,
    BigDecimal price,
    int quantity
) {}
