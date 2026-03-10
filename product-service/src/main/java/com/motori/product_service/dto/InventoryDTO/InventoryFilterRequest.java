package com.motori.product_service.dto.InventoryDTO;

/**
 * Filter criteria record for querying inventory items with JpaSpecifications.
 * <p>
 * This record encapsulates optional filtering parameters for stock searches.
 * All fields are optional (null values are ignored). Multiple filters are combined with AND logic.
 * </p>
 * 
 * Filter Field Descriptions:
 * <ul>
 *   <li>available: Boolean (optional) - Filter by stock availability
 *       <ul>
 *         <li>true: Items with quantity > 0 (in stock)</li>
 *         <li>false: Items with quantity = 0 (out of stock)</li>
 *       </ul>
 *   </li>
 *   <li>paymentStatus: String (optional) - Filter by payment state
 *       <ul>
 *         <li>Values: "PAID", "UNPAID", "PARTIALLY_PAID", "PENDING"</li>
 *       </ul>
 *   </li>
 *   <li>type: String (optional) - Filter by inventory item type
 *       <ul>
 *         <li>"PART": Inventory items referencing auto parts</li>
 *         <li>"EQUIPEMENT": Inventory items referencing protective equipment</li>
 *       </ul>
 *   </li>
 * </ul>
 * 
 * Filter Combination Logic:
 * When multiple filters are provided, they are combined with AND logic:
 * - available = true AND paymentStatus = "PAID" AND type = "PART"
 * 
 * Null Handling:
 * Null/absent filter fields are ignored. If all filters are null, all active inventory items are returned.
 * 
 * @param available optional boolean to filter by stock availability (true = in stock, false = out of stock)
 * @param paymentStatus optional payment state filter (PAID, UNPAID, PARTIALLY_PAID, PENDING)
 * @param type optional inventory type filter ("PART" or "EQUIPEMENT")
 * 
 * @author Motori Team
 * @since 1.0
 */
public record InventoryFilterRequest(
    Boolean available,           
    String paymentStatus,        
    String type                  // PART or EQUIPEMENT
) {}
