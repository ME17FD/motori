package com.motori.product_service.dto.VehiculeBrandDTO;

import java.util.UUID;

public record VehiculeBrandResponse(
    UUID id,
    String name
) {}
