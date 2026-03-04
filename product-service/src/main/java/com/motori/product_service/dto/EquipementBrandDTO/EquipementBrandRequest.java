package com.motori.product_service.dto.EquipementBrandDTO;

import jakarta.validation.constraints.NotBlank;

public record EquipementBrandRequest(
    @NotBlank String name
) {}