package com.motori.product_service.dto.EquipementBrandDTO;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for creating or updating a protective equipment brand.
 * <p>
 * This record contains the minimal information required to create or update an equipment brand/manufacturer
 * (e.g., helmet brand "Shoei", glove brand "Alpinestars").
 * </p>
 * 
 * Field Constraints:
 * <ul>
 *   <li>name: String - Must not be blank (no empty or whitespace-only strings); must be unique</li>
 * </ul>
 * 
 * Validation: The service layer validates that:
 * - The name is not blank (triggers MethodArgumentNotValidException if blank)
 * - The name is unique across all equipment brands (throws DuplicateResourceException if duplicate)
 * 
 * @param name the brand name/manufacturer identifier (e.g., "Shoei", "Alpinestars", "Dainese")
 * 
 * @author Motori Team
 * @since 1.0
 */
public record EquipementBrandRequest(
    @NotBlank String name
) {}