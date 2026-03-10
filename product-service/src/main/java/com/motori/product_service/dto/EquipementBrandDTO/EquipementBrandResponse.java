package com.motori.product_service.dto.EquipementBrandDTO;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for a protective equipment brand/manufacturer.
 * <p>
 * This record represents a complete equipment brand with audit timestamps.
 * Used in API responses when querying brand information or after brand CRUD operations.
 * </p>
 * 
 * Field Descriptions:
 * <ul>
 *   <li>id: UUID - Unique identifier for the equipment brand</li>
 *   <li>name: String - Brand/manufacturer name (e.g., "Shoei", "Alpinestars")</li>
 *   <li>createdAt: LocalDateTime - Timestamp when the brand was created</li>
 *   <li>updatedAt: LocalDateTime - Timestamp of the last modification</li>
 * </ul>
 * 
 * Caching Notes:
 * This brand information is cached with a 10-minute TTL for performance optimization.
 * Cache keys are based on brand ID. Cache is invalidated on create, update, or delete operations.
 * 
 * @param id the unique brand identifier
 * @param name the brand/manufacturer name
 * @param createdAt the creation timestamp
 * @param updatedAt the last modification timestamp
 * 
 * @author Motori Team
 * @since 1.0
 */
public record EquipementBrandResponse(
    UUID id,
    String name,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}