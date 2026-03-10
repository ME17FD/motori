package com.motori.product_service.dto.CompatibilityDTO;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for creating a part-vehicle compatibility mapping.
 * <p>
 * This record encapsulates the minimum required information to establish a compatibility relationship
 * between an auto part and a vehicle model. Both IDs must refer to existing entities in the database.
 * </p>
 * 
 * Field Constraints:
 * <ul>
 *   <li>partId: UUID - Must not be null; must reference an existing Part entity</li>
 *   <li>vehiculeId: UUID - Must not be null; must reference an existing Vehicle entity</li>
 * </ul>
 * 
 * Validation: The service layer validates that:
 * - The part with partId exists (throws ResourceNotFoundException if not)
 * - The vehicle with vehiculeId exists (throws ResourceNotFoundException if not)
 * - The compatibility mapping doesn't already exist (throws DuplicateResourceException if it does)
 * 
 * @param partId the UUID of the auto part to link to a vehicle
 * @param vehiculeId the UUID of the vehicle model to link to a part
 * 
 * @author Motori Team
 * @since 1.0
 */
public record CompatibilityRequest(
    @NotNull UUID partId,
    @NotNull UUID vehiculeId
) {}