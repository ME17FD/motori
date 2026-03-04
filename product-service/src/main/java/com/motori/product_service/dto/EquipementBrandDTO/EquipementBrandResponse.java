package com.motori.product_service.dto.EquipementBrandDTO;

import java.util.UUID;

public record EquipementBrandResponse(
    UUID id,
    String name
) {}