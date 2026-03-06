package com.motori.product_service.dto.VehiculeBrandDTO;

import java.time.LocalDateTime;
import java.util.UUID;

public record VehiculeBrandResponse(
    UUID id,
    String name,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
