package com.motori.product_service.dto.VehiculeBrandDTO;

import jakarta.validation.constraints.NotBlank;

public record VehiculeBrandRequest(
    @NotBlank String name
) {}