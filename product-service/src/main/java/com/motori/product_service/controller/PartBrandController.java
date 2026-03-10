package com.motori.product_service.controller;

import java.util.List;
import java.util.UUID;

import org.apache.hc.core5.http.HttpStatus;
import org.springframework.data.web.PageableDefault;
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


import com.motori.product_service.dto.PartBrandDTO.PartBrandRequest;
import com.motori.product_service.dto.PartBrandDTO.PartBrandResponse;
import com.motori.product_service.service.PartBrandService;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST controller for managing auto parts manufacturer/brand operations.
 * <p>
 * Provides endpoints for CRUD operations on parts brands (e.g., Bosch, Total, NGK).
 * All brand data is cached with a 10-minute TTL for performance optimization using Redis,
 * with automatic cache invalidation on mutations.
 * </p>
 * Endpoints:
 * <ul>
 *   <li>POST /api/part-brands - Create a new parts brand</li>
 *   <li>GET /api/part-brands - List all brands with pagination</li>
 *   <li>GET /api/part-brands/{id} - Retrieve a specific brand (cached)</li>
 *   <li>PUT /api/part-brands/{id} - Update a brand</li>
 *   <li>DELETE /api/part-brands/{id} - Soft-delete a brand</li>
 * </ul>
 * 
 * Caching Strategy: @Cacheable on getById() with 10-minute Redis TTL; @CacheEvict on mutations with allEntries=true
 * Authentication: OAuth2 JWT Bearer token required (Keycloak)
 * 
 * @author Motori Team
 * @since 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/part-brands")
@RequiredArgsConstructor
public class PartBrandController {

    private final PartBrandService service;

    /**
     * Creates a new parts brand.
     * <p>
     * Validates the request and ensures the brand name is unique across the system.
     * Clears the entire parts brand cache on successful creation to maintain consistency.
     * </p>
     * @param request the {@link PartBrandRequest} containing brand details (name, description)
     * @return {@link ResponseEntity} with HTTP 201 CREATED status and the created {@link PartBrandResponse}
     * @throws DuplicateResourceException if a brand with the same name already exists
     */
    @PostMapping
    public ResponseEntity<PartBrandResponse> create(
            @RequestBody @Valid PartBrandRequest request) {
        return ResponseEntity.status(HttpStatus.SC_CREATED).body(service.create(request));
    }

    /**
     * Retrieves a specific parts brand by its unique identifier.
     * <p>
     * Results are cached with a 10-minute TTL using Spring Cache with Redis backend.
     * Subsequent calls for the same brand within the TTL will return the cached result without database access.
     * Cache logging is performed at debug level to track cache hits and misses.
     * </p>
     * @param id the unique UUID of the parts brand
     * @return {@link ResponseEntity} with HTTP 200 OK status and the cached {@link PartBrandResponse}
     * @throws ResourceNotFoundException if no brand with the specified ID is found
     */
    @GetMapping("/{id}")
    public ResponseEntity<PartBrandResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    /**
     * Lists all active (non-deleted) parts brands with pagination.
     * <p>
     * Results are paginated with a default page size of 20 items, sorted by creation date in descending order.
     * Uses manual pagination on client-fetched list data (not database-level pagination).
     * Debug logging indicates when this controller method is invoked.
     * </p>
     * @param pageable the pagination and sorting configuration. Default: 20 items/page, sorted by createdAt DESC
     * @return {@link ResponseEntity} with HTTP 200 OK status containing a {@link Page} of {@link PartBrandResponse}
     */
    @GetMapping
    public ResponseEntity<Page<PartBrandResponse>> getAll(
        @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
        Pageable pageable) {
            log.info(">>> CONTROLLER getAll appelé"); 
            List<PartBrandResponse> all = service.getAll();
            int start = (int) pageable.getOffset();
            int end = Math.min(start + pageable.getPageSize(), all.size());
            List<PartBrandResponse> pageContent = start >= all.size()
                ? List.of()
                : all.subList(start, end);
        return ResponseEntity.ok(new PageImpl<>(pageContent, pageable, all.size()));
    }

    /**
     * Updates an existing parts brand with new details.
     * <p>
     * Validates the updated name for uniqueness and clears the entire parts brand cache to ensure
     * fresh data is returned on next getById() or getAll() calls.
     * </p>
     * @param id the unique UUID of the brand to update
     * @param request the {@link PartBrandRequest} containing updated brand details
     * @return {@link ResponseEntity} with HTTP 200 OK status and the updated {@link PartBrandResponse}
     * @throws ResourceNotFoundException if no brand with the specified ID is found
     * @throws DuplicateResourceException if the updated name conflicts with an existing brand
     */
    @PutMapping("/{id}")
    public ResponseEntity<PartBrandResponse> update(
            @PathVariable UUID id,
            @RequestBody @Valid PartBrandRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    /**
     * Soft-deletes a parts brand by marking it with a deletion timestamp.
     * <p>
     * Associated parts items are not deleted; they retain their brand references for audit purposes.
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
