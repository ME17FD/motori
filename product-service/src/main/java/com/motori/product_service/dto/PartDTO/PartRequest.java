package com.motori.product_service.dto.PartDTO;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record PartRequest(
    @NotBlank String name,
    @NotBlank String ref,
    String description,
    @NotNull @Positive BigDecimal price,
    @NotNull UUID partBrandId,
    @NotNull UUID partCategoryId,
    Map<String, Object> properties 
) {}
