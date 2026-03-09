package com.motori.product_service.dto.EquipementDTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import com.motori.product_service.dto.EquipementBrandDTO.EquipementBrandResponse;
import com.motori.product_service.dto.EquipementCategoryDTO.EquipementCategoryResponse;

public record EquipementResponse(
    UUID id,
    String size,          //just incase we rename the enum in the future, we can still return the original value as a string
    String color,
    String name,
    String description,
    BigDecimal price,
    EquipementBrandResponse brand,
    EquipementCategoryResponse category,
    String imageUrl,
    Map<String, Object> properties,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}