package com.motori.product_service.dto.PartCategoryDTO;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for creating or updating a parts category in the taxonomy hierarchy.
 * <p>
 * This record encapsulates category details including optional hierarchical parent linking.
 * Part categories support multi-level hierarchies (e.g., Engine Parts → Intake System → Air Filter).
 * </p>
 * 
 * Field Constraints:
 * <ul>
 *   <li>name: String - Must not be blank; must be unique within the system</li>
 *   <li>parentCategoryId: UUID (optional) - If provided, must reference an existing parent category</li>
 * </ul>
 * 
 * Validation: The service layer validates that:
 * - The name is not blank (throws MethodArgumentNotValidException if blank)
 * - The name is unique (throws DuplicateResourceException if duplicate exists)
 * - If parentCategoryId is provided, the parent category exists (throws ResourceNotFoundException if not)
 * - Circular references are prevented: category != parentCategoryId (throws IllegalArgumentException if self-referencing)
 * 
 * @param name the category name (e.g., "Engine Parts", "Suspension", "Brakes")
 * @param parentCategoryId optional UUID of the parent category for hierarchical organization
 * 
 * @author Motori Team
 * @since 1.0
 */
public record PartCategoryRequest(
    @NotBlank String name,
    UUID parentCategoryId   
) {}
