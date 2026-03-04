package com.motori.product_service.dto.CompatibilityDTO;

import java.time.LocalDateTime;
import java.util.UUID;

import com.motori.product_service.dto.PartDTO.PartResponse;
import com.motori.product_service.dto.VehiculeDTO.VehiculeResponse;

public record CompatibilityResponse(
    UUID id,
    PartResponse part,
    VehiculeResponse vehicule,
    LocalDateTime createdAt
) {}
