package com.motori.product_service.dto.EquipementDTO;

import java.math.BigDecimal;
import java.util.UUID;

import com.motori.product_service.enums.EquipementSize;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record EquipementRequest(
    @NotNull EquipementSize size,
    @NotBlank String color,
    @NotBlank String name,
    String description,
    @NotNull @Positive BigDecimal price,
    @NotNull UUID equipementBrandId,
    @NotNull UUID equipementCategoryId
) {}