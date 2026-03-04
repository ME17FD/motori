package com.motori.product_service.dto.OderDTO;

import java.util.List;

import com.motori.product_service.dto.OrderItemDTO.OrderItemRequest;

import jakarta.validation.constraints.NotEmpty;

public record OrderRequest(
    @NotEmpty List<OrderItemRequest> items
) {}