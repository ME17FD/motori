package com.motori.product_service.dto.CompatibilityDTO;

import java.time.LocalDateTime;
import java.util.UUID;

import com.motori.product_service.dto.PartDTO.PartResponse;
import com.motori.product_service.dto.VehiculeDTO.VehiculeResponse;

/**
 * Response DTO for a part-vehicle compatibility mapping.
 * <p>
 * This record represents a complete compatibility mapping including nested details of both
 * the linked part and vehicle. Used in API responses when querying compatibility relationships.
 * </p>
 * 
 * Field Descriptions:
 * <ul>
 *   <li>id: UUID - Unique identifier for this compatibility mapping</li>
 *   <li>part: PartResponse - Complete details of the compatible auto part (brand, category, price)</li>
 *   <li>vehicule: VehiculeResponse - Complete details of the compatible vehicle (brand, model, year)</li>
 *   <li>createdAt: LocalDateTime - Timestamp when the compatibility was created</li>
 *   <li>updatedAt: LocalDateTime - Timestamp of the last modification</li>
 * </ul>
 * 
 * Nested Objects:
 * - part: Contains full PartResponse with brand, category, and technical specifications
 * - vehicule: Contains full VehiculeResponse with brand information
 * 
 * @param id the unique compatibility mapping identifier
 * @param part the complete part details for the compatible part
 * @param vehicule the complete vehicle details for the compatible vehicle
 * @param createdAt the creation timestamp
 * @param updatedAt the last modification timestamp
 * 
 * @author Motori Team
 * @since 1.0
 */
public record CompatibilityResponse(
    UUID id,
    PartResponse part,
    VehiculeResponse vehicule,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
