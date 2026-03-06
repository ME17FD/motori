package com.motori.product_service.dto.PartCategoryDTO;

import java.time.LocalDateTime;
import java.util.UUID;

public record PartCategoryResponse(
    UUID id,
    String name,
    UUID parentCategoryId,
    String parentCategoryName, // avoid uncontrolled loops, !!! make specific endpoint GET /categories/{id}/children
    LocalDateTime createdAt,
    LocalDateTime updatedAt    
) {}