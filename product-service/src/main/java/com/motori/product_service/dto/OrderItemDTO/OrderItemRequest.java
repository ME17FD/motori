package com.motori.product_service.dto.OrderItemDTO;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;


public record OrderItemRequest(
    @NotNull UUID inventoryId
) {}
