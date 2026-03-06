package com.motori.product_service.dto.InventoryDTO;

import java.time.LocalDateTime;
import java.util.UUID;

import com.motori.product_service.dto.EquipementDTO.EquipementResponse;
import com.motori.product_service.dto.PartDTO.PartResponse;

public record InventoryResponse(
    UUID id,
    PartResponse part,
    EquipementResponse equipement,
    LocalDateTime expiredAt,
    LocalDateTime soldAt,
    String paymentStatus,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
