package com.motori.product_service.dto.PartBrandDTO;

import jakarta.validation.constraints.NotBlank;

public record PartBrandRequest(
    @NotBlank String name
) {}
