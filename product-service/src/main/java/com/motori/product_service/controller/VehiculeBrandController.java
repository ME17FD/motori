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

import com.motori.product_service.dto.VehiculeBrandDTO.VehiculeBrandRequest;
import com.motori.product_service.dto.VehiculeBrandDTO.VehiculeBrandResponse;
import com.motori.product_service.service.VehiculeBrandService;



import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST controller for managing motorcycle/vehicle manufacturer/brand operations.
 * <p>
 * Provides endpoints for CRUD operations on vehicle brands (e.g., Yamaha, Honda, Kawasaki, Suzuki).
 * All brand data is cached with a 10-minute TTL for performance optimization using Redis,
 * with automatic cache invalidation on mutations to prevent stale brand listings.
 * </p>
 * Endpoints:
 * <ul>
 *   <li>POST /api/vehicule-brands - Create a new vehicle brand</li>
 *   <li>GET /api/vehicule-brands - List all brands with pagination</li>
 *   <li>GET /api/vehicule-brands/{id} - Retrieve a specific brand (cached)</li>
 *   <li>PUT /api/vehicule-brands/{id} - Update a brand</li>
 *   <li>DELETE /api/vehicule-brands/{id} - Soft-delete a brand</li>
 * </ul>
 * 
 * Caching Strategy: @Cacheable on getById() with 10-minute Redis TTL; @CacheEvict on mutations with allEntries=true
 * Request Validation: @Valid annotation triggers validation of @NotBlank, @NotNull annotations on request DTOs
 * Authentication: OAuth2 JWT Bearer token required (Keycloak)
 * 
 * @author Motori Team
 * @since 1.0
 */
@RestController
@RequestMapping("/api/vehicule-brands")
@RequiredArgsConstructor
public class VehiculeBrandController {

    private final VehiculeBrandService service;

    /**
     * Creates a new vehicle brand.
     * <p>
     * The @Valid annotation on request triggers validation of required fields (name).
     * If validation fails (missing name, etc.), MethodArgumentNotValidException is thrown
     * and mapped to HTTP 400 BAD_REQUEST by GlobalExceptionHandler.
     * Ensures the brand name is unique across the system.
     * Clears the vehicle brand cache on successful creation to maintain consistency.
     * </p>
     * @param request the {@link VehiculeBrandRequest} containing brand details (name, description)
     * @return {@link ResponseEntity} with HTTP 201 CREATED status and the created {@link VehiculeBrandResponse}
     * @throws DuplicateResourceException if a brand with the same name already exists
     * @throws MethodArgumentNotValidException if request validation fails (mapped to 400)
     */
    @PostMapping
    public ResponseEntity<VehiculeBrandResponse> create(
            @RequestBody @Valid VehiculeBrandRequest request) {
        // @Valid → déclenche la validation (@NotBlank, @NotNull...)
        // Si invalide → MethodArgumentNotValidException → 400 via GlobalExceptionHandler
        return ResponseEntity
            .status(HttpStatus.SC_CREATED)      // 201
            .body(service.create(request));
    }

    /**
     * Retrieves a specific vehicle brand by its unique identifier.
     * <p>
     * Results are cached with a 10-minute TTL using Spring Cache with Redis backend.
     * Subsequent calls for the same brand within the TTL will return the cached result without database access.
     * </p>
     * @param id the unique UUID of the vehicle brand
     * @return {@link ResponseEntity} with HTTP 200 OK status and the cached {@link VehiculeBrandResponse}
     * @throws ResourceNotFoundException if no brand with the specified ID is found
     */
    @GetMapping("/{id}")
    public ResponseEntity<VehiculeBrandResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id)); // 200
    }

    /**
     * Lists all active (non-deleted) vehicle brands with pagination.
     * <p>
     * Results are paginated with a default page size of 20 items, sorted by creation date in descending order.
     * Uses manual pagination on client-fetched list data (not database-level pagination).
     * </p>
     * @param pageable the pagination and sorting configuration. Default: 20 items/page, sorted by createdAt DESC
     * @return {@link ResponseEntity} with HTTP 200 OK status containing a {@link Page} of {@link VehiculeBrandResponse}
     */
    @GetMapping
    public ResponseEntity<Page<VehiculeBrandResponse>> getAll(
        @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
        Pageable pageable) {
            List<VehiculeBrandResponse> all = service.getAll();
            int start = (int) pageable.getOffset();
            int end = Math.min(start + pageable.getPageSize(), all.size());
            List<VehiculeBrandResponse> pageContent = start >= all.size()
                ? List.of()
                : all.subList(start, end);
        return ResponseEntity.ok(new PageImpl<>(pageContent, pageable, all.size()));
    }

    /**
     * Updates an existing vehicle brand with new details.
     * <p>
     * Validates the request format (name must be non-blank) and ensures the updated name is unique.
     * Clears the entire vehicle brand cache to ensure fresh data is returned on next getById() or getAll() calls.
     * </p>
     * @param id the unique UUID of the brand to update
     * @param request the {@link VehiculeBrandRequest} containing updated brand details
     * @return {@link ResponseEntity} with HTTP 200 OK status and the updated {@link VehiculeBrandResponse}
     * @throws ResourceNotFoundException if no brand with the specified ID is found
     * @throws DuplicateResourceException if the updated name conflicts with an existing brand
     * @throws MethodArgumentNotValidException if request validation fails (mapped to 400)
     */
    @PutMapping("/{id}")
    public ResponseEntity<VehiculeBrandResponse> update(
            @PathVariable UUID id,
            @RequestBody @Valid VehiculeBrandRequest request) {
        return ResponseEntity.ok(service.update(id, request)); // 200
    }

    /**
     * Soft-deletes a vehicle brand by marking it with a deletion timestamp.
     * <p>
     * Associated vehicle models are not deleted; they retain their brand references for audit purposes.
     * The cache is cleared to prevent future queries from returning deleted brands.
     * </p>
     * @param id the unique UUID of the brand to delete
     * @return {@link ResponseEntity} with HTTP 204 NO_CONTENT status (empty response body)
     * @throws ResourceNotFoundException if no brand with the specified ID is found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build(); // 204
    }
} 
