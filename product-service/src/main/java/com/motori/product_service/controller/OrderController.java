package com.motori.product_service.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

import com.motori.product_service.dto.OderDTO.OrderFilterRequest;
import com.motori.product_service.dto.OderDTO.OrderRequest;
import com.motori.product_service.dto.OderDTO.OrderResponse;
import com.motori.product_service.service.OrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST controller for managing customer orders and order lifecycle.
 * <p>
 * Handles CRUD operations for customer orders with support for:
 * <ul>
 *   <li>Order creation with automatic order number generation</li>
 *   <li>Complex filtering by status and completion state</li>
 *   <li>Server-side order total price calculation based on current inventory prices</li>
 *   <li>User-scoped order retrieval (OAuth2 user context)</li>
 * </ul>
 * </p>
 * 
 * Order Lifecycle: PENDING → CONFIRMED → DELIVERED (CANCELLED allowed from any state)
 * 
 * Endpoints:
 * <ul>
 *   <li>POST /api/orders - Create a new order</li>
 *   <li>GET /api/orders - List all orders with filtering and pagination</li>
 *   <li>GET /api/orders/{id} - Retrieve a specific order</li>
 *   <li>DELETE /api/orders/{id} - Soft-delete an order</li>
 *   <li>GET /api/orders/user/{userId} - Retrieve all orders for a specific user</li>
 * </ul>
 * 
 * Authentication: OAuth2 JWT Bearer token required (Keycloak)
 * User Context: X-User-ID header identifies the authenticated user for order creation
 * 
 * @author Motori Team
 * @since 1.0
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService service;

    /**
     * Creates a new customer order with items and calculates total price.
     * <p>
     * Validates that all referenced inventory items exist and have sufficient stock.
     * The order total price is calculated server-side based on current inventory prices
     * (client-provided prices are ignored for security).
     * Generates a unique order number automatically.
     * The order is created in PENDING status ready for confirmation.
     * </p>
     * @param userId the authenticated user's unique UUID from X-User-ID header
     * @param request the {@link OrderRequest} containing order items with quantities
     * @return {@link ResponseEntity} with HTTP 201 CREATED status and the created {@link OrderResponse}
     * @throws ResourceNotFoundException if any referenced inventory item doesn't exist
     * @throws IllegalArgumentException if any inventory item has insufficient stock for the requested quantity
     */
    @PostMapping
    public ResponseEntity<OrderResponse> create(
        @RequestHeader("X-User-ID") UUID userId,
        @RequestBody @Valid OrderRequest request) {
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(service.create(userId, request));
    }   

    /**
     * Retrieves a specific order by its unique identifier.
     * <p>
     * Returns complete order details including all order items with part/equipment information.
     * </p>
     * @param id the unique UUID of the order
     * @return {@link ResponseEntity} with HTTP 200 OK status and the {@link OrderResponse}
     * @throws ResourceNotFoundException if no order with the specified ID is found
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    /**
     * Lists all orders with advanced filtering and pagination.
     * <p>
     * Supports filtering by:
     * <ul>
     *   <li>status: order state filter (PENDING, CONFIRMED, DELIVERED, CANCELLED)</li>
     *   <li>completed: boolean to filter completed orders (status = DELIVERED or CANCELLED)</li>
     *   <li>userId: filter orders for a specific user (X-User-Id header can override this)</li>
     * </ul>
     * Results are paginated with a default page size of 20 items, sorted by creation date in descending order.
     * </p>
     * @param status optional: order status filter (PENDING, CONFIRMED, DELIVERED, CANCELLED)
     * @param completed optional: boolean to filter completed orders (true = DELIVERED or CANCELLED states)
     * @param userId optional: filter by user UUID (can be overridden by X-User-Id header)
     * @param pageable the pagination and sorting configuration. Default: 20 items/page, sorted by createdAt DESC
     * @return {@link ResponseEntity} with HTTP 200 OK status containing a filtered {@link Page} of {@link OrderResponse}
     */
    @GetMapping
    public ResponseEntity<Page<OrderResponse>> getAll(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) Boolean completed,
        @RequestHeader(value = "X-User-Id", required = false) UUID userId,
        @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {

        OrderFilterRequest filter = new OrderFilterRequest(status, completed, userId);
        return ResponseEntity.ok(service.getAll(filter, pageable));
    }

    /**
     * Retrieves all orders created by a specific user.
     * <p>
     * Provides user-scoped order history for order tracking and fulfillment monitoring.
     * Order items and inventory details are fully populated for each order.
     * </p>
     * @param userId the unique UUID of the user whose orders to retrieve
     * @param pageable the pagination and sorting configuration. Default: 20 items/page, sorted by createdAt DESC
     * @return {@link ResponseEntity} with HTTP 200 OK status containing a {@link Page} of {@link OrderResponse}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<OrderResponse>> getByUserId(
        @PathVariable UUID userId,
        @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ResponseEntity.ok(service.getByUserId(userId, pageable));
    }

    /**
     * Soft-deletes an order by marking it with a deletion timestamp.
     * <p>
     * Order items and associated inventory remain intact for audit purposes.
     * Deleted orders are excluded from future queries (getById, getAll, getByUserId).
     * </p>
     * @param id the unique UUID of the order to delete
     * @return {@link ResponseEntity} with HTTP 204 NO_CONTENT status (empty response body)
     * @throws ResourceNotFoundException if no order with the specified ID is found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
} 
