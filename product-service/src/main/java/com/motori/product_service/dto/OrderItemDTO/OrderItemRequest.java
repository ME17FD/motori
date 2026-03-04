package com.motori.product_service.dto.OrderItemDTO;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record OrderItemRequest(
    @NotNull UUID inventoryId,
    @NotNull @Positive BigDecimal price
) {}
