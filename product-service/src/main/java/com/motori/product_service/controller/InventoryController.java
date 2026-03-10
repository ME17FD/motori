package com.motori.product_service.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

import com.motori.product_service.dto.InventoryDTO.InventoryFilterRequest;
import com.motori.product_service.dto.InventoryDTO.InventoryRequest;
import com.motori.product_service.dto.InventoryDTO.InventoryResponse;
import com.motori.product_service.service.InventoryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST controller for managing inventory (stock tracking) operations.
 * <p>
 * Handles stock level management for parts and protective equipment with support for:
 * <ul>
 *   <li>Flexible linking: Each inventory item references EITHER a Part OR Equipment (mutually exclusive)</li>
 *   <li>Payment status tracking for purchased items</li>
 *   <li>Availability filtering to identify in-stock items</li>
 * </ul>
 * </p>
 * 
 * Endpoints:
 * <ul>
 *   <li>POST /api/inventories - Create a new inventory item</li>
 *   <li>GET /api/inventories - List with filtering and pagination</li>
 *   <li>GET /api/inventories/{id} - Retrieve a specific inventory item</li>
 *   <li>DELETE /api/inventories/{id} - Soft-delete an inventory item</li>
 * </ul>
 * 
 * Business Rule: Inventory items with associated sales history (soldAt is not null) cannot be deleted
 * to maintain referential integrity with Order records.
 * 
 * Authentication: OAuth2 JWT Bearer token required (Keycloak)
 * 
 * @author Motori Team
 * @since 1.0
 */
@RestController
@RequestMapping("/api/inventories")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService service;

    /**
     * Creates a new inventory item for either a part or equipment.
     * <p>
     * Validates that exactly one of partId or equipementId is provided (mutually exclusive).
     * The referenced part or equipment must exist in the database.
     * </p>
     * @param request the {@link InventoryRequest} containing inventory details (partId XOR equipementId, quantity, payment status)
     * @return {@link ResponseEntity} with HTTP 201 CREATED status and the created {@link InventoryResponse}
     * @throws ResourceNotFoundException if the referenced part or equipment doesn't exist
     * @throws IllegalArgumentException if both partId and equipementId are provided or neither is provided
     */
    @PostMapping
    public ResponseEntity<InventoryResponse> create(
            @RequestBody @Valid InventoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    /**
     * Retrieves a specific inventory item by its unique identifier.
     * <p>
     * Returns complete inventory details including linked part/equipment information and payment status.
     * </p>
     * @param id the unique UUID of the inventory item
     * @return {@link ResponseEntity} with HTTP 200 OK status and the {@link InventoryResponse}
     * @throws ResourceNotFoundException if no inventory item with the specified ID is found
     */
    @GetMapping("/{id}")
    public ResponseEntity<InventoryResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    /**
     * Lists inventory items with filtering and pagination.
     * <p>
     * Supports filtering by:
     * <ul>
     *   <li>available: boolean to filter items with quantity > 0 (true) or quantity = 0 (false)</li>
     *   <li>paymentStatus: filter by payment state (PAID, UNPAID, PARTIALLY_PAID, PENDING)</li>
     *   <li>type: filter by item type ("PART" for parts inventory, "EQUIPMENT" for equipment inventory)</li>
     * </ul>
     * Results are paginated with a default page size of 20 items, sorted by creation date in descending order.
     * </p>
     * @param available optional: boolean to filter by stock availability (true = in stock, false = out of stock)
     * @param paymentStatus optional: filter by payment status (PAID, UNPAID, PARTIALLY_PAID, PENDING)
     * @param type optional: filter by inventory type ("PART" or "EQUIPMENT")
     * @param pageable the pagination and sorting configuration. Default: 20 items/page, sorted by createdAt DESC
     * @return {@link ResponseEntity} with HTTP 200 OK status containing a filtered {@link Page} of {@link InventoryResponse}
     */
    @GetMapping
    public ResponseEntity<Page<InventoryResponse>> getAll(
        @RequestParam(required = false) Boolean available,
        @RequestParam(required = false) String paymentStatus,
        @RequestParam(required = false) String type,
        @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
        Pageable pageable) {

        InventoryFilterRequest filter = new InventoryFilterRequest(
            available, paymentStatus, type
        );
        return ResponseEntity.ok(service.getAll(filter, pageable));
    }

    /**
     * Soft-deletes an inventory item, preventing future stock queries from returning it.
     * <p>
     * Cannot delete inventory items that have been sold (where soldAt is not null) to preserve
     * referential integrity with Order records. Such items must be handled through order management.
     * The inventory record is marked with a deletedAt timestamp rather than physically removed.
     * </p>
     * @param id the unique UUID of the inventory item to delete
     * @return {@link ResponseEntity} with HTTP 204 NO_CONTENT status (empty response body)
     * @throws ResourceNotFoundException if no inventory item with the specified ID is found
     * @throws IllegalStateException if the inventory item has associated sales history (soldAt is not null)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
