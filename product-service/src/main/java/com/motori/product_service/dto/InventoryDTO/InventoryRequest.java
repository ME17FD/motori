package com.motori.product_service.dto.InventoryDTO;

import java.time.LocalDateTime;
import java.util.UUID;


/**
 * Request DTO for creating inventory items with flexible Part OR Equipment linking.
 * <p>
 * This record encapsulates inventory creation parameters with a critical business constraint:
 * Each inventory item must reference EITHER a Part OR an Equipment, but NOT both simultaneously
 * (mutually exclusive XOR relationship). This flexibility allows tracking stock for diverse product types.
 * </p>
 * 
 * Field Constraints:
 * <ul>
 *   <li>partId: UUID (optional) - Reference to an auto part; must be null if equipementId is provided</li>
 *   <li>equipementId: UUID (optional) - Reference to protective equipment; must be null if partId is provided</li>
 *   <li>expiredAt: LocalDateTime (optional) - Expiration date for perishable or time-sensitive items</li>
 * </ul>
 * 
 * Business Rule - XOR Constraint:
 * - Exactly ONE of {partId, equipementId} must be provided
 * - Both fields cannot be null (throws IllegalArgumentException)
 * - Both fields cannot be non-null simultaneously (throws IllegalArgumentException)
 * The service layer validates: (partId != null && equipementId == null) || (partId == null && equipementId != null)
 * 
 * Validation: The service layer validates that:
 * - Exactly one of partId or equipementId is provided (XOR constraint)
 * - The referenced part or equipment exists (throws ResourceNotFoundException if not)
 * - The referenced entity is not soft-deleted
 * 
 * Expiration:
 * The expiredAt field is optional and used for inventory items with shelf life or validity periods.
 * Expired items can be filtered out in queries or managed separately for compliance tracking.
 * 
 * @param partId optional UUID of the referenced auto part
 * @param equipementId optional UUID of the referenced protective equipment
 * @param expiredAt optional expiration date for time-sensitive inventory
 * 
 * @author Motori Team
 * @since 1.0
 */
public record InventoryRequest(
    UUID partId,
    UUID equipementId,
    LocalDateTime expiredAt   
){}        