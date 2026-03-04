package com.motori.product_service.dto.EquipementCategoryDTO;

import java.util.UUID;

public record EquipementCategoryResponse(
    UUID id,
    String name,
    UUID parentCategoryId,
    String parentCategoryName 
) {}
