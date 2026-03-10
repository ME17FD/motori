package com.motori.product_service.dto.PartBrandDTO;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for an auto parts brand/manufacturer.
 * <p>
 * This record represents a complete parts brand with audit timestamps.
 * Used in API responses when querying brand information or after brand CRUD operations.
 * </p>
 * 
 * Field Descriptions:
 * <ul>
 *   <li>id: UUID - Unique identifier for the parts brand</li>
 *   <li>name: String - Brand/manufacturer name (e.g., "Bosch", "NGK", "Total")</li>
 *   <li>createdAt: LocalDateTime - Timestamp when the brand was created</li>
 *   <li>updatedAt: LocalDateTime - Timestamp of the last modification</li>
 * </ul>
 * 
 * Caching Behavior:
 * Parts brand data is cached with a 10-minute TTL using Redis for performance optimization.
 * Cache keys are based on brand ID. Subsequent getById() calls within the TTL return cached data.
 * Cache is automatically invalidated on create, update, or delete operations.
 * 
 * Usage:
 * This DTO is returned in:
 * - GET /api/part-brands responses (list or single)
 * - POST /api/part-brands responses (after creation)
 * - PUT /api/part-brands/{id} responses (after update)
 * - Nested in PartResponse objects as the brand details for parts
 * 
 * @param id the unique brand identifier
 * @param name the brand/manufacturer name
 * @param createdAt the creation timestamp
 * @param updatedAt the last modification timestamp
 * 
 * @author Motori Team
 * @since 1.0
 */
public record PartBrandResponse(
    UUID id,
    String name,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
