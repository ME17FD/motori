package com.motori.product_service.dto.EquipementCategoryDTO;

import java.time.LocalDateTime;
import java.util.UUID;

public record EquipementCategoryResponse(
    UUID id,
    String name,
    UUID parentCategoryId,
    String parentCategoryName, // avoid uncontrolled loops, !!! make specific endpoint GET /categories/{id}/children
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
