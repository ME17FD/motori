package com.motori.product_service.dto.PartBrandDTO;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for creating or updating an auto parts brand/manufacturer.
 * <p>
 * This record contains the minimal information required to create or update a parts brand
 * (e.g., "Bosch", "NGK", "Total", "Denso").
 * </p>
 * 
 * Field Constraints:
 * <ul>
 *   <li>name: String - Must not be blank (no empty or whitespace-only strings); must be unique</li>
 * </ul>
 * 
 * Validation: The service layer validates that:
 * - The name is not blank (triggers MethodArgumentNotValidException if blank)
 * - The name is unique across all parts brands (throws DuplicateResourceException if duplicate exists)
 * 
 * Cache Behavior:
 * Parts brand data is managed by Redis cache (10-minute TTL). Creating/updating a brand invalidates
 * the entire brand cache to ensure consistency across all subsequent queries.
 * 
 * @param name the brand name/manufacturer identifier (e.g., "Bosch", "NGK", "Total")
 * 
 * @author Motori Team
 * @since 1.0
 */
public record PartBrandRequest(
    @NotBlank String name
) {}
