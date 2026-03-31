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

import com.motori.product_service.dto.EquipementCategoryDTO.EquipementCategoryRequest;
import com.motori.product_service.dto.EquipementCategoryDTO.EquipementCategoryResponse;
import com.motori.product_service.service.EquipementCategoryService;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST controller for managing equipment categories.
 * <p>
 * Handles CRUD operations for equipment categories with support for:
 * <ul>
 *   <li>Duplicate name validation to prevent redundant categories</li>
 *   <li>Redis cache for optimized read performance</li>
 *   <li>In-memory pagination from cached data</li>
 * </ul>
 * </p>
 *
 * Endpoints:
 * <ul>
 *   <li>POST   /api/equipement-categories        - Create a new equipment category</li>
 *   <li>GET    /api/equipement-categories         - List all categories with pagination</li>
 *   <li>GET    /api/equipement-categories/{id}    - Retrieve a specific category</li>
 *   <li>PUT    /api/equipement-categories/{id}    - Update a category</li>
 *   <li>DELETE /api/equipement-categories/{id}    - Soft-delete a category</li>
 * </ul>
 *
 * @author Motori Team
 * @since 1.0
 */
@RestController
@RequestMapping("/api/equipement-categories")
@RequiredArgsConstructor
public class EquipementCategoryController {

    private final EquipementCategoryService service;

    /**
     * Creates a new equipment category.
     * <p>
     * Validates that no category with the same name already exists before creation.
     * Automatically evicts the categories cache upon successful creation.
     * </p>
     * @param request the {@link EquipementCategoryRequest} containing the category name
     * @return {@link ResponseEntity} with HTTP 201 CREATED and the created {@link EquipementCategoryResponse}
     */
    @PostMapping
    @Operation(summary = "Créer une nouvelle catégorie d'équipement")
    public ResponseEntity<EquipementCategoryResponse> create(
            @RequestBody @Valid EquipementCategoryRequest request) {
        return ResponseEntity.status(HttpStatus.SC_CREATED).body(service.create(request));
    }

    /**
     * Retrieves a specific equipment category by its unique identifier.
     * <p>
     * Result is cached in Redis for optimized repeated access.
     * </p>
     * @param id the unique UUID of the equipment category
     * @return {@link ResponseEntity} with HTTP 200 OK and the {@link EquipementCategoryResponse}
     */
    @GetMapping("/{id}")
    @Operation(summary = "Récupérer une catégorie d'équipement par son ID")
    public ResponseEntity<EquipementCategoryResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    /**
     * Lists all equipment categories with pagination.
     * <p>
     * The full list is fetched from Redis cache on subsequent calls.
     * Pagination is applied in-memory from the cached list.
     * Default page size is 20 items, sorted by creation date descending.
     * </p>
     * @param pageable pagination and sorting configuration
     * @return {@link ResponseEntity} with HTTP 200 OK and a paginated {@link Page} of {@link EquipementCategoryResponse}
     */
    @GetMapping
    @Operation(summary = "Lister toutes les catégories d'équipement avec pagination")
    public ResponseEntity<Page<EquipementCategoryResponse>> getAll(
        @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
        Pageable pageable) {
        List<EquipementCategoryResponse> all = service.getAll();
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), all.size());
        List<EquipementCategoryResponse> pageContent = start >= all.size()
            ? List.of()
            : all.subList(start, end);
        return ResponseEntity.ok(new PageImpl<>(pageContent, pageable, all.size()));
    }

    /**
     * Updates an existing equipment category.
     * <p>
     * Validates that the new name is not already used by another category.
     * Automatically evicts the categories cache upon successful update.
     * </p>
     * @param id the unique UUID of the equipment category to update
     * @param request the {@link EquipementCategoryRequest} containing the updated name
     * @return {@link ResponseEntity} with HTTP 200 OK and the updated {@link EquipementCategoryResponse}
     */
    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour une catégorie d'équipement")
    public ResponseEntity<EquipementCategoryResponse> update(
            @PathVariable UUID id,
            @RequestBody @Valid EquipementCategoryRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    /**
     * Soft-deletes an equipment category.
     * <p>
     * The category record is marked with a deletedAt timestamp for audit purposes.
     * Automatically evicts the categories cache upon successful deletion.
     * </p>
     * @param id the unique UUID of the equipment category to delete
     * @return {@link ResponseEntity} with HTTP 204 NO_CONTENT status
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une catégorie d'équipement (soft delete)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}