package com.motori.product_service.dto.VehiculeBrandDTO;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for creating or updating motorcycle/vehicle manufacturers.
 * <p>
 * This record encapsulates the minimal information required to define a vehicle brand/manufacturer.
 * Vehicle brand names must be unique to prevent duplicate manufacturer entries in the system.
 * </p>
 * 
 * Field Constraints:
 * <ul>
 *   <li>name: String - Must not be blank (e.g., "Honda", "Yamaha", "Kawasaki", "Suzuki")</li>
 * </ul>
 * 
 * Validation: The service layer validates that:
 * - The name is not blank (throws MethodArgumentNotValidException if blank)
 * - The name is unique across all vehicle brands (throws DuplicateResourceException if duplicate)
 * 
 * Usage:
 * POST /api/vehicule-brands → 201 CREATED
 * PUT /api/vehicule-brands/{id} → 200 OK
 * 
 * @param name the brand/manufacturer name (motorcycles, automobiles, etc.)
 * 
 * @author Motori Team
 * @since 1.0
 */
public record VehiculeBrandRequest(
    @NotBlank String name
) {}