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

import com.motori.product_service.dto.PartCategoryDTO.PartCategoryRequest;
import com.motori.product_service.dto.PartCategoryDTO.PartCategoryResponse;
import com.motori.product_service.service.PartCategoryService;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST controller for managing parts category taxonomy hierarchy.
 * <p>
 * Handles CRUD operations for auto parts categories with support for hierarchical parent-child
 * relationships (e.g., Engine Parts → Intake System, Exhaust System).
 * Prevents circular category references where a category cannot be its own parent.
 * </p>
 * Endpoints:
 * <ul>
 *   <li>POST /api/part-categories - Create a new category</li>
 *   <li>GET /api/part-categories - List all categories with pagination</li>
 *   <li>GET /api/part-categories/{id} - Retrieve a specific category (cached)</li>
 *   <li>PUT /api/part-categories/{id} - Update a category</li>
 *   <li>DELETE /api/part-categories/{id} - Soft-delete a category</li>
 * </ul>
 * 
 * Caching Strategy: @Cacheable on getById(); @CacheEvict on mutations with allEntries=true
 * Hierarchical Validation: Prevents self-referencing and validates parent category existence
 * Authentication: OAuth2 JWT Bearer token required (Keycloak)
 * 
 * @author Motori Team
 * @since 1.0
 */
@RestController
@RequestMapping("/api/part-categories")
@RequiredArgsConstructor
public class PartCategoryController {

    private final PartCategoryService service;

    /**
     * Creates a new parts category with optional parent category linking.
     * <p>
     * Validates that the parent category exists (if specified) and prevents circular hierarchies
     * by checking that category != parentId. Ensures category names are unique within the system.
     * </p>
     * @param request the {@link PartCategoryRequest} containing name, description, and optional parentId
     * @return {@link ResponseEntity} with HTTP 201 CREATED status and the created {@link PartCategoryResponse}
     * @throws ResourceNotFoundException if the specified parent category ID does not exist
     * @throws DuplicateResourceException if a category with the same name already exists
     * @throws IllegalArgumentException if attempting to set the category as its own parent (circular reference)
     */
    @PostMapping
    public ResponseEntity<PartCategoryResponse> create(
            @RequestBody @Valid PartCategoryRequest request) {
        return ResponseEntity.status(HttpStatus.SC_CREATED).body(service.create(request));
    }

    /**
     * Retrieves a specific parts category by its unique identifier.
     * <p>
     * Returns the category along with its parent category reference (if it has one).
     * Results are cached for performance optimization with automatic invalidation on mutations.
     * </p>
     * @param id the unique UUID of the parts category
     * @return {@link ResponseEntity} with HTTP 200 OK status and the cached {@link PartCategoryResponse}
     * @throws ResourceNotFoundException if no category with the specified ID is found
     */
    @GetMapping("/{id}")
    public ResponseEntity<PartCategoryResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    /**
     * Lists all active (non-deleted) parts categories with pagination.
     * <p>
     * Results include the complete category hierarchy information (parent references for nested categories).
     * Paginated with a default page size of 20 items, sorted by creation date in descending order.
     * </p>
     * @param pageable the pagination and sorting configuration. Default: 20 items/page, sorted by createdAt DESC
     * @return {@link ResponseEntity} with HTTP 200 OK status containing a {@link Page} of {@link PartCategoryResponse}
     */
    @GetMapping
    public ResponseEntity<Page<PartCategoryResponse>> getAll(
        @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
        Pageable pageable) {
            List<PartCategoryResponse> all = service.getAll();
            int start = (int) pageable.getOffset();
            int end = Math.min(start + pageable.getPageSize(), all.size());
            List<PartCategoryResponse> pageContent = start >= all.size()
                ? List.of()
                : all.subList(start, end);
        return ResponseEntity.ok(new PageImpl<>(pageContent, pageable, all.size()));
    }

    /**
     * Updates an existing parts category details and/or parent category link.
     * <p>
     * Re-validates hierarchical constraints (parent existence, circular reference prevention)
     * and ensures name uniqueness. Clears cache on successful update to prevent stale data.
     * </p>
     * @param id the unique UUID of the category to update
     * @param request the {@link PartCategoryRequest} containing updated category details
     * @return {@link ResponseEntity} with HTTP 200 OK status and the updated {@link PartCategoryResponse}
     * @throws ResourceNotFoundException if the category or parent category (if specified) doesn't exist
     * @throws DuplicateResourceException if the updated name conflicts with another category
     * @throws IllegalArgumentException if attempting to set the category as its own parent
     */
    @PutMapping("/{id}")
    public ResponseEntity<PartCategoryResponse> update(
            @PathVariable UUID id,
            @RequestBody @Valid PartCategoryRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    /**
     * Soft-deletes a parts category while preserving child categories and associated parts.
     * <p>
     * Child categories retain their parent references but are now orphaned if parent is the sole link.
     * The category is marked with a deletedAt timestamp rather than physically removed.
     * </p>
     * @param id the unique UUID of the category to delete
     * @return {@link ResponseEntity} with HTTP 204 NO_CONTENT status (empty response body)
     * @throws ResourceNotFoundException if no category with the specified ID is found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
