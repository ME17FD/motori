package com.motori.product_service.dto.EquipementCategoryDTO;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for an equipment category in the taxonomy hierarchy.
 * <p>
 * This record represents a complete category with parent reference and audit information.
 * Supports hierarchical category structures without returning nested child categories to avoid circular reference loops.
 * </p>
 * 
 * Field Descriptions:
 * <ul>
 *   <li>id: UUID - Unique identifier for the category</li>
 *   <li>name: String - Category name (e.g., "Helmets", "Gloves")</li>
 *   <li>parentCategoryId: UUID (optional) - UUID of the parent category if this is a child category</li>
 *   <li>parentCategoryName: String (optional) - Name of the parent category for display purposes</li>
 *   <li>createdAt: LocalDateTime - Timestamp when the category was created</li>
 *   <li>updatedAt: LocalDateTime - Timestamp of the last modification</li>
 * </ul>
 * 
 * Hierarchy Navigation Notes:
 * This DTO intentionally limits child category depth to prevent uncontrolled recursive loading.
 * To retrieve all child categories of a specific parent, use: GET /api/equipement-categories/{id}/children
 * (endpoint not implemented in current version - future enhancement)
 * 
 * @param id the unique category identifier
 * @param name the category name
 * @param parentCategoryId the UUID of the parent category (if hierarchically nested)
 * @param parentCategoryName the name of the parent category for UI display
 * @param createdAt the creation timestamp
 * @param updatedAt the last modification timestamp
 * 
 * @author Motori Team
 * @since 1.0
 */
public record EquipementCategoryResponse(
    UUID id,
    String name,
    UUID parentCategoryId,
    String parentCategoryName, // avoid uncontrolled loops, !!! make specific endpoint GET /categories/{id}/children
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
