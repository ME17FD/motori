package com.motori.product_service.dto.EquipementBrandDTO;

import java.time.LocalDateTime;
import java.util.UUID;

public record EquipementBrandResponse(
    UUID id,
    String name,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}