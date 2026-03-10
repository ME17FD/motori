package com.motori.product_service.dto.VehiculeDTO;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for creating or updating motorcycles/vehicles.
 * <p>
 * This record encapsulates the essential details for motorcycle model definition.
 * Motorcycles/vehicles are linked to specific manufacturers (brands) via the vehiculeBrandId FK.
 * </p>
 * 
 * Field Constraints:
 * <ul>
 *   <li>model: String - Must not be blank (e.g., "CB500F", "MT-07", "Ninja 400")</li>
 *   <li>name: String - Must not be blank (e.g., "Honda CB500F", "Yamaha MT-07")</li>
 *   <li>vehiculeBrandId: UUID - Must not be null; must reference existing vehicle/motorcycle brand</li>
 * </ul>
 * 
 * Validation: The service layer validates that:
 * - All fields are provided and non-blank (triggers MethodArgumentNotValidException if missing)
 * - The vehiculeBrandId references an existing brand (throws ResourceNotFoundException if not)
 * 
 * Model vs Name:
 * - model: Technical model designation (e.g., "CB500F")
 * - name: Full display name including brand (e.g., "Honda CB500F")
 * 
 * @param model the technical motorcycle model designation
 * @param name the full display name of the motorcycle
 * @param vehiculeBrandId UUID of the manufacturer/brand
 * 
 * @author Motori Team
 * @since 1.0
 */
public record VehiculeRequest(
    @NotBlank String model,
    @NotBlank String name,
    @NotNull UUID vehiculeBrandId
) {}
