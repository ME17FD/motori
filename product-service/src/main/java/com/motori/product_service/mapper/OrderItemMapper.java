package com.motori.product_service.mapper;

import org.springframework.stereotype.Component;

import com.motori.order.model.OrderItem;
import com.motori.product_service.dto.OrderItemDTO.OrderItemRequest;
import com.motori.product_service.dto.OrderItemDTO.OrderItemResponse;
import com.motori.product_service.exception.ResourceNotFoundException;
import com.motori.product_service.repository.InventoryRepository;

@Component
public class OrderItemMapper {

    private final InventoryMapper inventoryMapper;
    private final InventoryRepository inventoryRepository;

    public OrderItemMapper(InventoryMapper inventoryMapper, InventoryRepository inventoryRepository) {
        this.inventoryMapper = inventoryMapper;
        this.inventoryRepository = inventoryRepository;
    }

    public OrderItemResponse toResponse(OrderItem item) {
        var inventory = inventoryRepository.findById(item.getInventoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Inventory introuvable pour la ligne de commande : " + item.getInventoryId()));
        return new OrderItemResponse(
                item.getId(),
                inventoryMapper.toResponse(inventory),
                item.getUnitPrice(),
                item.getQuantity());
    }

    public OrderItem toEntity(OrderItemRequest request) {
        return OrderItem.builder()
                .build();
    }
}
