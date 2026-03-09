package com.motori.product_service.mapper;

import org.springframework.stereotype.Component;

import com.motori.product_service.dto.OrderItemDTO.OrderItemRequest;
import com.motori.product_service.dto.OrderItemDTO.OrderItemResponse;
import com.motori.product_service.models.OrderItem;

@Component
public class OrderItemMapper {

    private final InventoryMapper inventoryMapper;

    public OrderItemMapper(InventoryMapper inventoryMapper) {
        this.inventoryMapper = inventoryMapper;
    }

    public OrderItemResponse toResponse(OrderItem item) {
        return new OrderItemResponse(
            item.getId(),
            inventoryMapper.toResponse(item.getInventoryId()),
            item.getPrice()
        );
    }

    public OrderItem toEntity(OrderItemRequest request) {
        return OrderItem.builder()
            .build();
    }
}
