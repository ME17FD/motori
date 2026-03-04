package com.motori.product_service.dto.InventoryDTO;

import java.time.LocalDateTime;
import java.util.UUID;


public record InventoryRequest(
    UUID partId,
    UUID equipementId,
    LocalDateTime expiredAt   
){}        