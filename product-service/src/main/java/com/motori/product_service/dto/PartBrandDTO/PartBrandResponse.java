package com.motori.product_service.dto.PartBrandDTO;

import java.util.UUID;

public record PartBrandResponse(
    UUID id,
    String name
) {}
