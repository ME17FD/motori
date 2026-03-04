package com.motori.product_service.dto.VehiculeDTO;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record VehiculeRequest(
    @NotBlank String model,
    @NotBlank String name,
    @NotNull UUID vehiculeBrandId
) {}
