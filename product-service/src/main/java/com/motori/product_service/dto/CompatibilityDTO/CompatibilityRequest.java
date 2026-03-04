package com.motori.product_service.dto.CompatibilityDTO;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record CompatibilityRequest(
    @NotNull UUID partId,
    @NotNull UUID vehiculeId
) {}