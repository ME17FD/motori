package com.motori.product_service.dto.InventoryDTO;

import java.time.LocalDateTime;
import java.util.UUID;

import com.motori.product_service.dto.EquipementDTO.EquipementResponse;
import com.motori.product_service.dto.PartDTO.PartResponse;

/**
 * Response DTO for inventory items with flexible Part or Equipment linking.
 * <p>
 * This record represents a stock tracking item that can reference either an auto part or protective equipment.
 * Includes payment tracking and sales history for complete inventory management visibility.
 * </p>
 * 
 * Field Descriptions:
 * <ul>
 *   <li>id: UUID - Unique inventory item identifier</li>
 *   <li>part: PartResponse (optional) - If this is a parts inventory item, full part details including brand, category, specs</li>
 *   <li>equipement: EquipementResponse (optional) - If this is equipment inventory, full equipment details (brand, category, size, color)</li>
 *   <li>expiredAt: LocalDateTime (optional) - Expiration date for time-sensitive items</li>
 *   <li>soldAt: LocalDateTime (optional) - When this inventory item was sold/fulfilled (null if in stock)</li>
 *   <li>paymentStatus: String - Payment tracking state (PAID, UNPAID, PARTIALLY_PAID, PENDING)</li>
 *   <li>createdAt: LocalDateTime - When inventory record was created</li>
 *   <li>updatedAt: LocalDateTime - Last modification timestamp</li>
 * </ul>
 * 
 * Flexible Linking Logic:
 * - Exactly ONE of {part, equipement} will be non-null
 * - If part is non-null: this is a parts inventory item; equipement will be null
 * - If equipement is non-null: this is an equipment inventory item; part will be null
 * 
 * Payment Tracking:
 * The paymentStatus field tracks the financial state of purchases:
 * - PAID: Full payment received
 * - UNPAID: No payment received yet
 * - PARTIALLY_PAID: Partial payment received
 * - PENDING: Payment processing in progress
 * 
 * Sales History:
 * The soldAt field indicates when inventory was allocated to an order.
 * Null values mean inventory is still available. Once sold, inventory items cannot be deleted
 * (throws IllegalStateException) to preserve order fulfillment history.
 * 
 * @param id the unique inventory identifier
 * @param part the complete part details if this is a parts inventory
 * @param equipement the complete equipment details if this is equipment inventory
 * @param expiredAt optional expiration date
 * @param soldAt optional sale/fulfillment date
 * @param paymentStatus the payment state (PAID, UNPAID, PARTIALLY_PAID, PENDING)
 * @param createdAt creation timestamp
 * @param updatedAt last modification timestamp
 * 
 * @author Motori Team
 * @since 1.0
 */
public record InventoryResponse(
    UUID id,
    PartResponse part,
    EquipementResponse equipement,
    LocalDateTime expiredAt,
    LocalDateTime soldAt,
    String paymentStatus,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
