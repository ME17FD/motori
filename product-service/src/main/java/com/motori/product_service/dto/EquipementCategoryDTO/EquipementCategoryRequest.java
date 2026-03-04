package com.motori.product_service.dto.EquipementCategoryDTO;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;

public record EquipementCategoryRequest(
    @NotBlank String name,
    UUID parentCategoryId 
) {}

