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

/**
 * Service responsible for managing customer orders and order items.
 * <p>
 * Handles order creation with comprehensive validation:
 * - Verifies all referenced inventory items exist
 * - Prevents ordering already-sold items
 * - Retrieves prices from inventory (preventing client-side price manipulation)
 * - Calculates total order price by summing item prices
 * - Returns orders with full item and inventory details
 * </p>
 * <p>
 * Business Rules:
 * - Order prices are server-determined from inventory prices, not client-provided
 * - Each order item must reference valid inventory
 * - Sold inventory items cannot be added to new orders
 * - Orders default to PENDING status and incomplete state
 * - Supports user-scoped order retrieval and advanced filtering via Specifications
 * </p>
 * @author Motori Team
 * @since 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;
    private final OrderMapper orderMapper;

    /**
     * Creates a new customer order with validation.
     * <p>
     * Validates all inventory items exist and are not already sold. Prices are retrieved from the server
     * (part or equipment price) to prevent client-side price manipulation. Calculates the order total by
     * summing individual item prices. Order status defaults to PENDING and completed flag to false.
     * </p>
     * @param userId the customer's unique identifier
     * @param request the order creation request containing list of inventory items to order
     * @return the created order with items, prices, and initial PENDING status
     * @throws ResourceNotFoundException if any inventory item is not found
     * @throws DuplicateResourceException if any inventory item has already been sold (has non-null soldAt)
     */
    // ─── CREATE ───────────────────────────────────────────────
    public OrderResponse create(UUID userId, OrderRequest request) {

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

            // Prix récupéré depuis le serveur — jamais depuis le client
            BigDecimal price = inventory.getPart() != null
                ? inventory.getPart().getPrice()
                : inventory.getEquipement().getPrice();

            OrderItem item = OrderItem.builder()
                .inventoryId(inventory)
                .price(price)
                .build();

            items.add(item);
            total = total.add(price);
        }

        Order order = Order.builder()
            .userId(userId)
            .items(items)
            .totalPrice(total)
            .completed(false)
            .status(OrderStatus.PENDING)
            .build();

        items.forEach(item -> item.setOrderId(order));

        log.info("Commande creee pour le user : {}", userId);
        return orderMapper.toResponse(orderRepository.save(order));
    }

    /**
     * Retrieves an order by its unique identifier with full details.
     * @param id the unique identifier of the order
     * @return the order with items and inventory details
     * @throws ResourceNotFoundException if no order is found with the given ID
     */
    // ─── GET BY ID ────────────────────────────────────────────
    public OrderResponse getById(UUID id) {
        log.debug("Recuperation de la commande : {}", id);
        return orderRepository
            .findById(id)
            .map(orderMapper::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Commande introuvable avec l'id : " + id
            ));
    }

    /**
     * Retrieves all orders with advanced filtering and pagination.
     * <p>
     * Supports filtering by order status, payment status, and date range using JPA Specifications.
     * </p>
     * @param filter the filter criteria (status, paymentStatus, dateRange, etc.)
     * @param pageable pagination parameters (page number, size, sorting)
     * @return a page of orders matching the filter criteria with items and inventory details
     */
    // ─── GET ALL ──────────────────────────────────────────────
    public Page<OrderResponse> getAll(OrderFilterRequest filter, Pageable pageable) {
        log.debug("Recuperation des commandes avec filtres : {}", filter);
        Specification<Order> spec = OrderSpecification.withFilters(filter);
        return orderRepository.findAll(spec, pageable)
            .map(orderMapper::toResponse);
    }

    /**
     * Retrieves all orders for a specific customer with pagination.
     * @param userId the unique identifier of the customer
     * @param pageable pagination parameters (page number, size, sorting)
     * @return a page of orders belonging to the specified user
     */
    // ─── GET BY USER ──────────────────────────────────────────
    public Page<OrderResponse> getByUserId(UUID userId, Pageable pageable) {
        log.debug("Recuperation des commandes du user : {}", userId);
        return orderRepository.findByUserId(userId, pageable)
            .map(orderMapper::toResponse);
    }

    /**
     * Soft-deletes an order by its ID.
     * <p>
     * The order is marked as deleted via the deletedAt field. Associated OrderItem records are also soft-deleted.
     * Inventory items referenced by the order are NOT automatically marked as sold when order is deleted.
     * </p>
     * @param id the unique identifier of the order to delete
     * @throws ResourceNotFoundException if no order is found with the given ID
     */
    // ─── DELETE (soft) ────────────────────────────────────────
    public void delete(UUID id) {
        log.info("Suppression de la commande : {}", id);
        Order order = orderRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Commande introuvable avec l'id : " + id
            ));
        orderRepository.delete(order);
    }
}