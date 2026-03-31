package com.motori.product_service.service;


import java.util.List;
import java.util.UUID;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.motori.product_service.dto.PartCategoryDTO.PartCategoryRequest;
import com.motori.product_service.dto.PartCategoryDTO.PartCategoryResponse;
import com.motori.product_service.exception.DuplicateResourceException;
import com.motori.product_service.exception.ResourceNotFoundException;
import com.motori.product_service.mapper.PartCategoryMapper;
import com.motori.product_service.models.PartCategory;
import com.motori.product_service.repository.PartCategoryRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
/**
 * Service responsible for managing auto parts category hierarchies.
 * <p>
 * Provides CRUD operations for part categories with support for hierarchical parent-child relationships.
 * Includes validation to prevent circular references (a category cannot be its own parent) and duplicate names.
 * All category operations leverage caching for performance optimization.
 * </p>
 * <p>
 * Category Structure:
 * - Categories can have parent categories to form a hierarchy (e.g., Engine Components <- Engines <- All)
 * - A category without a parent is considered a root-level category
 * - Prevents a category from being assigned itself as a parent
 * - Each category name is unique across the hierarchy
 * </p>
 * @author Motori Team
 * @since 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PartCategoryService {

    private final PartCategoryRepository repository;
    private final PartCategoryMapper mapper;

    /**
     * Creates a new parts category with optional hierarchical parent.
     * <p>
     * Validates that the category name is unique and the parent category (if provided) exists.
     * Invalidates cache on successful creation.
     * </p>
     * @param request the category creation request containing name and optional parentCategoryId
     * @return the created category with UUID and hierarchy information
     * @throws DuplicateResourceException if a category with the same name already exists
     * @throws ResourceNotFoundException if the specified parent category does not exist
     */
    // ─── CREATE ───────────────────────────────────────────────
    @CacheEvict(value = {"part-categories", "part-categories-all"}, allEntries = true)
    public PartCategoryResponse create(PartCategoryRequest request) {
        boolean nameExists = repository
            .findByName(request.name())
            .isPresent();

        if (nameExists) {
            throw new DuplicateResourceException(
                "Une catégorie '" + request.name() + "' existe déjà"
            );
        }

        PartCategory category = mapper.toEntity(request);

        // Si parentCategoryId est fourni → on charge le parent
        if (request.parentCategoryId() != null) {
            PartCategory parent = repository
                .findById(request.parentCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Catégorie parente introuvable avec l'id : "
                    + request.parentCategoryId()
                ));
            category.setParent(parent);
        }
        // Si parentCategoryId est null → catégorie racine, pas de parent

        return mapper.toResponse(repository.save(category));
    }

    /**
     * Retrieves a parts category by its unique identifier with caching support.
     * @param id the unique identifier of the category
     * @return the parts category details including parent hierarchy
     * @throws ResourceNotFoundException if no category is found with the given ID
     */
    // ─── GET BY ID ────────────────────────────────────────────
    @Cacheable(value = "part-categories", key = "#id")
    public PartCategoryResponse getById(UUID id) {
        log.debug("Recuperation de la categorie piece : {}", id);
        return repository.findById(id)
            .map(mapper::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Categorie piece introuvable avec l'id : " + id
            ));
    }

    /**
     * Retrieves all parts categories with caching support.
     * <p>
     * Results are cached globally and automatically invalidated when categories are created, updated, or deleted.
     * </p>
     * @return a list of all parts categories including all hierarchy levels
     */
    // ─── GET ALL ──────────────────────────────────────────────
    @Cacheable(value = "part-categories-all")
    public List<PartCategoryResponse> getAll() {
        log.debug("Recuperation de toutes les categories piece");
        return repository.findAll().stream()
            .map(mapper::toResponse)
            .toList();
    }

    /**
     * Updates an existing parts category.
     * <p>
     * Validates the new name for uniqueness and the parent category for existence. Prevents a category from being
     * assigned itself as a parent to maintain hierarchy integrity. If parentCategoryId is null, the category becomes
     * a root-level category. Cache is invalidated on successful update.
     * </p>
     * @param id the unique identifier of the category to update
     * @param request the update request containing new name and optional parent category ID
     * @return the updated category details
     * @throws ResourceNotFoundException if the category or specified parent category does not exist
     * @throws DuplicateResourceException if the new name already exists on another category
     * @throws IllegalArgumentException if a category attempts to become its own parent
     */
    // ─── UPDATE ───────────────────────────────────────────────
    @CacheEvict(value = {"part-categories", "part-categories-all"}, allEntries = true)
    public PartCategoryResponse update(UUID id, PartCategoryRequest request) {

        PartCategory category = repository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Catégorie introuvable avec l'id : " + id
            ));

        // Validation : nom unique sur une autre catégorie
        repository.findByName(request.name())
            .ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new DuplicateResourceException(
                        "Une catégorie '" + request.name() + "' existe déjà"
                    );
                }
            });

        category.setName(request.name());

        // Mise à jour du parent
        if (request.parentCategoryId() != null) {

            // Sécurité : une catégorie ne peut pas être son propre parent
            if (request.parentCategoryId().equals(id)) {
                throw new IllegalArgumentException(
                    "Une catégorie ne peut pas être son propre parent"
                );
            }

            PartCategory parent = repository
                .findById(request.parentCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Catégorie parente introuvable avec l'id : "
                    + request.parentCategoryId()
                ));
            category.setParent(parent);
        } else {
            category.setParent(null); // devient catégorie racine
        }

        return mapper.toResponse(repository.save(category));
    }

    /**
     * Soft-deletes a parts category by its ID.
     * <p>
     * The category is marked as deleted via the deletedAt field. Child categories and associated parts
     * are not deleted but may show the deleted parent in their hierarchy. Cache is invalidated on successful deletion.
     * </p>
     * @param id the unique identifier of the category to delete
     * @throws ResourceNotFoundException if no category is found with the given ID
     */
    // ─── DELETE (soft) ────────────────────────────────────────
    @CacheEvict(value = {"part-categories", "part-categories-all"}, allEntries = true)
    public void delete(UUID id) {
        PartCategory category = repository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Catégorie introuvable avec l'id : " + id
            ));
        repository.delete(category);
    }
}
