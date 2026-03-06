package com.motori.product_service.dto.PartBrandDTO;

import java.time.LocalDateTime;
import java.util.UUID;

public record PartBrandResponse(
    UUID id,
    String name,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
