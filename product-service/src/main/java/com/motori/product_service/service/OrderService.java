package com.motori.product_service.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.motori.product_service.dto.OderDTO.OrderRequest;
import com.motori.product_service.dto.OderDTO.OrderResponse;
import com.motori.product_service.dto.OrderItemDTO.OrderItemRequest;
import com.motori.product_service.enums.OrderStatus;
import com.motori.product_service.exception.DuplicateResourceException;
import com.motori.product_service.exception.ResourceNotFoundException;
import com.motori.product_service.mapper.OrderMapper;
import com.motori.product_service.models.Inventory;
import com.motori.product_service.models.Order;
import com.motori.product_service.models.OrderItem;
import com.motori.product_service.repository.InventoryRepository;
import com.motori.product_service.repository.OrderRepository;


import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;
    private final OrderMapper orderMapper;
    // ─── CREATE ───────────────────────────────────────────────
    public OrderResponse create(UUID userId, OrderRequest request) {

        // 1. Construire les items et calculer le total en même temps
        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.items()) {

            Inventory inventory = inventoryRepository
                .findByIdAndDeletedAtIsNull(itemRequest.inventoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Inventory introuvable avec l'id : " + itemRequest.inventoryId()
                ));

            // Validation métier : l'inventory est-il déjà vendu ?
            if (inventory.getSoldAt() != null) {
                throw new DuplicateResourceException(
                    "L'article " + itemRequest.inventoryId() + " est déjà vendu"
                );
            }

            OrderItem item = OrderItem.builder()
                .inventoryId(inventory)
                .price(itemRequest.price())
                .createdAt(LocalDateTime.now())
                .build();

            items.add(item);
            total = total.add(itemRequest.price());
        }

        // 2. Construire l'Order
        Order order = Order.builder()
            .userId(userId)
            .items(items)
            .totalPrice(total)
            .completed(false)
            .status(OrderStatus.PENDING)
            .createdAt(LocalDateTime.now())
            .build();

        // 3. Lier chaque item à l'order
        items.forEach(item -> item.setOrderId(order));

        return orderMapper.toResponse(orderRepository.save(order));
    }

    // ─── GET BY ID ────────────────────────────────────────────
    public OrderResponse getById(UUID id) {
        return orderRepository
            .findByIdAndDeletedAtIsNull(id)
            .map(orderMapper::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Commande introuvable avec l'id : " + id
            ));
    }

    // ─── GET ALL ──────────────────────────────────────────────
    public List<OrderResponse> getAll() {
        return orderRepository.findAllByDeletedAtIsNull()
            .stream()
            .map(orderMapper::toResponse)
            .toList();
    }

    // ─── GET BY USER ──────────────────────────────────────────
    // Utile pour afficher les commandes d'un user spécifique
    public List<OrderResponse> getByUserId(UUID userId) {
        return orderRepository.findAllByUserIdAndDeletedAtIsNull(userId)
            .stream()
            .map(orderMapper::toResponse)
            .toList();
    }

    // ─── DELETE (soft) ────────────────────────────────────────
    public void delete(UUID id) {
        Order order = orderRepository
            .findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Commande introuvable avec l'id : " + id
            ));

        order.setDeletedAt(LocalDateTime.now());
        orderRepository.save(order);
    }
}
