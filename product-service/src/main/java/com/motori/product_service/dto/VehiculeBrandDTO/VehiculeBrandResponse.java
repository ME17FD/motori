package com.motori.product_service.dto.VehiculeBrandDTO;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for motorcycle/vehicle manufacturers with audit information.
 * <p>
 * This record represents a complete vehicle brand/manufacturer entry including creation
 * and modification timestamps for audit trail purposes.
 * </p>
 * 
 * Field Descriptions:
 * <ul>
 *   <li>id: UUID - Unique identifier for the vehicle brand</li>
 *   <li>name: String - Brand/manufacturer name (e.g., "Honda", "Yamaha", "Kawasaki")</li>
 *   <li>createdAt: LocalDateTime - Timestamp when the brand was created</li>
 *   <li>updatedAt: LocalDateTime - Timestamp of the last modification</li>
 * </ul>
 * 
 * Vehicle Models:
 * Vehicle brands have associated motorcycle/vehicle models. Retrieve models for a brand via:
 * GET /api/vehicules with optional brandId filter
 * 
 * Parts Compatibility:
 * Vehicle brands are linked to specific parts through vehicle models:
 * VehicleBrand -> Vehicule (model) -> Compatibility -> Part
 * 
 * Caching:
 * Vehicle brands are cached in Redis (10-minute TTL) for performance optimization
 * on high-traffic brand lookups.
 * 
 * @param id the unique brand identifier
 * @param name the brand/manufacturer name
 * @param createdAt creation timestamp
 * @param updatedAt last modification timestamp
 * 
 * @author Motori Team
 * @since 1.0
 */
public record VehiculeBrandResponse(
    UUID id,
    String name,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
