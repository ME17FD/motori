package com.motori.product_service.controller;

import java.util.List;
import java.util.UUID;

import org.apache.hc.core5.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

import com.motori.product_service.dto.EquipementBrandDTO.EquipementBrandRequest;
import com.motori.product_service.dto.EquipementBrandDTO.EquipementBrandResponse;
import com.motori.product_service.service.EquipementBrandService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;


/**
 * REST controller for managing protective equipment brand operations.
 * <p>
 * Provides endpoints for CRUD operations on equipment manufacturers/brands (e.g., helmet makers, glove brands).
 * All brand data is cached with a 10-minute TTL for performance optimization, with automatic invalidation on mutations.
 * </p>
 * Endpoints:
 * <ul>
 *   <li>POST /api/equipement-brands - Create a new equipment brand</li>
 *   <li>GET /api/equipement-brands - List all brands with pagination</li>
 *   <li>GET /api/equipement-brands/{id} - Retrieve a specific brand (cached)</li>
 *   <li>PUT /api/equipement-brands/{id} - Update a brand</li>
 *   <li>DELETE /api/equipement-brands/{id} - Soft-delete a brand</li>
 * </ul>
 * 
 * Caching Strategy: @Cacheable on getById() with 10-minute Redis TTL; @CacheEvict on mutations
 * Authentication: OAuth2 JWT Bearer token required (Keycloak)
 * 
 * @author Motori Team
 * @since 1.0
 */
@RestController
@RequestMapping("/api/equipement-brands")
@RequiredArgsConstructor
public class EquipementBrandController {

    private final EquipementBrandService service;

    /**
     * Creates a new equipment brand.
     * <p>
     * Validates the request and ensures the brand name is unique across the system.
     * Clears the brand cache on successful creation to maintain consistency.
     * </p>
     * @param request the {@link EquipementBrandRequest} containing brand details (name, description)
     * @return {@link ResponseEntity} with HTTP 201 CREATED status and the created {@link EquipementBrandResponse}
     * @throws DuplicateResourceException if a brand with the same name already exists
     */
    @PostMapping
    public ResponseEntity<EquipementBrandResponse> create(
            @RequestBody @Valid EquipementBrandRequest request) {
        return ResponseEntity.status(HttpStatus.SC_CREATED).body(service.create(request));
    }

    /**
     * Retrieves a specific equipment brand by its unique identifier.
     * <p>
     * Results are cached with a 10-minute TTL using Spring Cache with Redis backend.
     * Subsequent calls for the same brand within the TTL will return the cached result.
     * </p>
     * @param id the unique UUID of the equipment brand
     * @return {@link ResponseEntity} with HTTP 200 OK status and the cached {@link EquipementBrandResponse}
     * @throws ResourceNotFoundException if no brand with the specified ID is found
     */
    @GetMapping("/{id}")
    public ResponseEntity<EquipementBrandResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    /**
     * Lists all active (non-deleted) equipment brands with pagination.
     * <p>
     * Results are paginated with a default page size of 20 items, sorted by creation date in descending order.
     * Uses manual pagination on client-fetched data (not database-level pagination).
     * </p>
     * @param pageable the pagination and sorting configuration. Default: 20 items/page, sorted by createdAt DESC
     * @return {@link ResponseEntity} with HTTP 200 OK status containing a {@link Page} of {@link EquipementBrandResponse}
     */
    @GetMapping
    public ResponseEntity<Page<EquipementBrandResponse>> getAll(
        @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
        Pageable pageable) {
            List<EquipementBrandResponse> all = service.getAll();
            int start = (int) pageable.getOffset();
            int end = Math.min(start + pageable.getPageSize(), all.size());
            List<EquipementBrandResponse> pageContent = start >= all.size()
                ? List.of()
                : all.subList(start, end);
        return ResponseEntity.ok(new PageImpl<>(pageContent, pageable, all.size()));
    }

    /**
     * Updates an existing equipment brand with new details.
     * <p>
     * Validates the updated name for uniqueness and clears the brand cache to ensure
     * fresh data is returned on next getById() call.
     * </p>
     * @param id the unique UUID of the brand to update
     * @param request the {@link EquipementBrandRequest} containing updated brand details
     * @return {@link ResponseEntity} with HTTP 200 OK status and the updated {@link EquipementBrandResponse}
     * @throws ResourceNotFoundException if no brand with the specified ID is found
     * @throws DuplicateResourceException if the updated name conflicts with an existing brand
     */
    @PutMapping("/{id}")
    public ResponseEntity<EquipementBrandResponse> update(
            @PathVariable UUID id,
            @RequestBody @Valid EquipementBrandRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    /**
     * Soft-deletes an equipment brand by marking it with a deletion timestamp.
     * <p>
     * Associated equipment items are not deleted; they retain their brand references for audit purposes.
     * The cache is cleared to prevent future queries from returning deleted brands.
     * </p>
     * @param id the unique UUID of the brand to delete
     * @return {@link ResponseEntity} with HTTP 204 NO_CONTENT status (empty response body)
     * @throws ResourceNotFoundException if no brand with the specified ID is found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
} 
