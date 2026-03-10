package com.motori.product_service.dto.VehiculeDTO;

import java.time.LocalDateTime;
import java.util.UUID;

import com.motori.product_service.dto.VehiculeBrandDTO.VehiculeBrandResponse;

/**
 * Response DTO for motorcycle/vehicle models with complete details including manufacturer.
 * <p>
 * This record represents a fully populated motorcycle model including brand information
 * and audit timestamps. Used in API responses for GET requests and after POST/PUT operations.
 * </p>
 * 
 * Field Descriptions:
 * <ul>
 *   <li>id: UUID - Unique identifier for the motorcycle model</li>
 *   <li>model: String - Technical model designation (e.g., "CB500F", "MT-07")</li>
 *   <li>name: String - Full display name (e.g., "Honda CB500F", "Yamaha MT-07")</li>
 *   <li>brand: VehiculeBrandResponse - Nested brand/manufacturer details (id, name, timestamps)</li>
 *   <li>createdAt: LocalDateTime - Timestamp when the motorcycle model was created</li>
 *   <li>updatedAt: LocalDateTime - Timestamp of the last modification</li>
 * </ul>
 * 
 * Nested Objects:
 * - brand: Complete VehiculeBrandResponse with manufacturer details for context
 * 
 * Part Compatibility:
 * While this DTO doesn't explicitly list compatible parts, motorcycle models can be linked to parts
 * through the Compatibility entity. Query compatible parts for a vehicle via:
 * GET /api/compatibilities (filter by vehiculeId) or
 * GET /api/parts with vehiculeId query parameter
 * 
 * @param id the unique vehicle model identifier
 * @param model the technical model designation
 * @param name the full display name
 * @param brand the brand/manufacturer details
 * @param createdAt creation timestamp
 * @param updatedAt last modification timestamp
 * 
 * @author Motori Team
 * @since 1.0
 */
public record VehiculeResponse(
    UUID id,
    String model,
    String name,
    VehiculeBrandResponse brand,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
