package com.motori.product_service.dto.PartCategoryDTO;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;

public record PartCategoryRequest(
    @NotBlank String name,
    UUID parentCategoryId   
) {}
