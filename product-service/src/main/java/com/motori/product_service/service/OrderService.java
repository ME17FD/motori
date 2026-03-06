package com.motori.product_service.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.motori.product_service.dto.OderDTO.OrderFilterRequest;
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
import com.motori.product_service.specification.OrderSpecification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
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
                .findById(itemRequest.inventoryId())
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
            .build();

        // 3. Lier chaque item à l'order
        items.forEach(item -> item.setOrderId(order));

        return orderMapper.toResponse(orderRepository.save(order));
    }

    // ─── GET BY ID ────────────────────────────────────────────
    public OrderResponse getById(UUID id) {
        return orderRepository
            .findById(id)
            .map(orderMapper::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Commande introuvable avec l'id : " + id
            ));
    }

    // ─── GET ALL ──────────────────────────────────────────────
    public Page<OrderResponse> getAll(OrderFilterRequest filter, Pageable pageable) {
        log.debug("Récupération des commandes avec filtres : {}", filter);
        Specification<Order> spec = OrderSpecification.withFilters(filter);
        return orderRepository.findAll(spec, pageable)
            .map(orderMapper::toResponse);
    }

    // ─── GET BY USER ──────────────────────────────────────────
    public Page<OrderResponse> getByUserId(UUID userId, Pageable pageable) {
        log.debug("Récupération des commandes du user : {}", userId);
        return orderRepository.findByUserId(userId, pageable)
            .map(orderMapper::toResponse);
    }

    // ─── DELETE (soft) ────────────────────────────────────────
    public void delete(UUID id) {
        Order order = orderRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Commande introuvable avec l'id : " + id
            ));
        orderRepository.delete(order);
    }
}
