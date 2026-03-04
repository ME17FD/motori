package com.motori.product_service.mapper;

import org.springframework.stereotype.Component;

import com.motori.product_service.dto.OderDTO.OrderRequest;
import com.motori.product_service.dto.OderDTO.OrderResponse;
import com.motori.product_service.enums.OrderStatus;
import com.motori.product_service.models.Order;

@Component
public class OrderMapper {

    private final OrderItemMapper orderItemMapper;

    public OrderMapper(OrderItemMapper orderItemMapper) {
        this.orderItemMapper = orderItemMapper;
    }

    public OrderResponse toResponse(Order order) {
        return new OrderResponse(
            order.getId(),
            order.getUserId(),
            order.getTotalPrice(),
            order.isCompleted(),
            order.getStatus().name(),
            order.getItems().stream()
                .map(orderItemMapper::toResponse)
                .toList(),
            order.getCreatedAt()
        );
    }

    public Order toEntity(OrderRequest request) {
        return Order.builder()
            .completed(false)
            .status(OrderStatus.PENDING)
            .build();
    }
}
