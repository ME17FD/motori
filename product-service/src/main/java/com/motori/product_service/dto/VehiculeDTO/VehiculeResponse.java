package com.motori.product_service.dto.VehiculeDTO;

import java.time.LocalDateTime;
import java.util.UUID;

import com.motori.product_service.dto.VehiculeBrandDTO.VehiculeBrandResponse;

public record VehiculeResponse(
    UUID id,
    String model,
    String name,
    VehiculeBrandResponse brand,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
