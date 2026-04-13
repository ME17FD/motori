package com.motori.product_service.mapper;

import org.springframework.stereotype.Component;

import com.motori.order.model.Order;
import com.motori.order.model.OrderStatus;
import com.motori.product_service.dto.OderDTO.OrderRequest;
import com.motori.product_service.dto.OderDTO.OrderResponse;

@Component
public class OrderMapper {

    private final OrderItemMapper orderItemMapper;

    public OrderMapper(OrderItemMapper orderItemMapper) {
        this.orderItemMapper = orderItemMapper;
    }

    public OrderResponse toResponse(Order order) {
        boolean completed = order.getStatus() == OrderStatus.DELIVERED
                || order.getStatus() == OrderStatus.CANCELLED;
        return new OrderResponse(
                order.getId(),
                order.getUserId(),
                order.getTotalAmount(),
                completed,
                order.getStatus().name(),
                order.getItems().stream()
                        .map(orderItemMapper::toResponse)
                        .toList(),
                order.getCreatedAt(),
                order.getUpdatedAt());
    }

    public Order toEntity(OrderRequest request) {
        return Order.builder()
                .status(OrderStatus.PENDING)
                .build();
    }
}
