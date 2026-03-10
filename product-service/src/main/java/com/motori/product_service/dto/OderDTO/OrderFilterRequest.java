package com.motori.product_service.dto.OderDTO;

import java.util.UUID;

/**
 * Filter criteria record for querying orders with JpaSpecifications.
 * <p>
 * This record encapsulates optional filtering parameters for order searches.
 * All fields are optional (null values are ignored). Multiple filters are combined with AND logic.
 * </p>
 * 
 * Filter Field Descriptions:
 * <ul>
 *   <li>status: String (optional) - Filter by order state
 *       <ul>
 *         <li>Valid values: "PENDING", "CONFIRMED", "DELIVERED", "CANCELLED"</li>
 *         <li>PENDING: Newly created orders awaiting confirmation</li>
 *         <li>CONFIRMED: Orders confirmed and being prepared for shipment</li>
 *         <li>DELIVERED: Orders successfully delivered to customer</li>
 *         <li>CANCELLED: Orders cancelled by customer or system</li>
 *       </ul>
 *   </li>
 *   <li>completed: Boolean (optional) - Filter by completion state
 *       <ul>
 *         <li>true: Orders in final states (DELIVERED or CANCELLED)</li>
 *         <li>false: Orders in progress states (PENDING or CONFIRMED)</li>
 *       </ul>
 *   </li>
 *   <li>userId: UUID (optional) - Filter orders for a specific customer user; can be overridden by X-User-Id header</li>
 * </ul>
 * 
 * Filter Combination Logic:
 * When multiple filters are provided, they are combined with AND logic:
 * - status = "DELIVERED" AND completed = true AND userId = {specific UUID}
 * 
 * Null Handling:
 * Null/absent filter fields are ignored in specification predicates. If all filters are null, all active orders are returned.
 * 
 * @param status optional order status filter (PENDING, CONFIRMED, DELIVERED, CANCELLED)
 * @param completed optional boolean to filter completed vs. in-progress orders
 * @param userId optional user UUID to scope orders to a specific customer
 * 
 * @author Motori Team
 * @since 1.0
 */
public record OrderFilterRequest(
    String status,       // PENDING, CONFIRMED, DELIVERED, CANCELLED
    Boolean completed,   // true = completed (DELIVERED/CANCELLED), false = in progress (PENDING/CONFIRMED)
    UUID userId          
) {}
