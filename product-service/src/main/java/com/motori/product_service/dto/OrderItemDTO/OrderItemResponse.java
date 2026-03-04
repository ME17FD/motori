package com.motori.product_service.dto.OrderItemDTO;

import java.math.BigDecimal;
import java.util.UUID;

import com.motori.product_service.dto.InventoryDTO.InventoryResponse;

public record OrderItemResponse(
    UUID id,
    InventoryResponse inventory,
    BigDecimal price
) {}
