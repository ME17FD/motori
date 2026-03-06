package com.motori.product_service.dto.OderDTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.motori.product_service.dto.OrderItemDTO.OrderItemResponse;

public record OrderResponse(
    UUID id,
    UUID userId,              
    BigDecimal totalPrice,
    boolean completed,
    String status,
    List<OrderItemResponse> items,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}