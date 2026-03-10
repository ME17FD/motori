package com.motori.product_service.service;


import java.util.List;
import java.util.UUID;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.motori.product_service.dto.EquipementCategoryDTO.EquipementCategoryRequest;
import com.motori.product_service.dto.EquipementCategoryDTO.EquipementCategoryResponse;
import com.motori.product_service.exception.DuplicateResourceException;
import com.motori.product_service.exception.ResourceNotFoundException;
import com.motori.product_service.mapper.EquipementCategoryMapper;
import com.motori.product_service.models.EquipementCategory;
import com.motori.product_service.repository.EquipementCategoryRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
/**
 * Service responsible for managing equipment category hierarchies.
 * <p>
 * Provides CRUD operations for equipment categories with support for hierarchical parent-child relationships.
 * Includes validation to prevent circular references (a category cannot be its own parent) and duplicate names.
 * All category operations leverage caching for performance optimization.
 * </p>
 * <p>
 * Category Structure:
 * - Categories can have parent categories to form a hierarchy (e.g., Jackets <- Protective Gear <- All)
 * - A category without a parent is considered a root-level category
 * - Prevents a category from being assigned itself as a parent
 * </p>
 * @author Motori Team
 * @since 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EquipementCategoryService {

    private final EquipementCategoryRepository repository;
    private final EquipementCategoryMapper mapper;

    /**
     * Creates a new equipment category with optional hierarchical parent.
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
    @CacheEvict(value = {"equipement-categories", "equipement-categories-all"}, allEntries = true)
    public EquipementCategoryResponse create(EquipementCategoryRequest request) {

        // Validation : nom unique dans la même catégorie parente
        boolean nameExists = repository
            .findByName(request.name())
            .isPresent();

        if (nameExists) {
            throw new DuplicateResourceException(
                "Une catégorie '" + request.name() + "' existe déjà"
            );
        }

        EquipementCategory category = mapper.toEntity(request);

        // Si parentCategoryId est fourni → on charge le parent
        if (request.parentCategoryId() != null) {
            EquipementCategory parent = repository
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
     * Retrieves an equipment category by its unique identifier with caching support.
     * @param id the unique identifier of the category
     * @return the equipment category details including parent hierarchy
     * @throws ResourceNotFoundException if no category is found with the given ID
     */
    // ─── GET BY ID ────────────────────────────────────────────
    @Cacheable(value = "equipement-categories", key = "#id")
    public EquipementCategoryResponse getById(UUID id) {
        log.debug("Recuperation de la categorie equipement : {}", id);
        return repository.findById(id)
            .map(mapper::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Categorie equipement introuvable avec l'id : " + id
            ));
    }

    /**
     * Retrieves all equipment categories with caching support.
     * <p>
     * Results are cached globally and automatically invalidated when categories are created, updated, or deleted.
     * </p>
     * @return a list of all equipment categories including all hierarchy levels
     */
    // ─── GET ALL ──────────────────────────────────────────────
    @Cacheable(value = "equipement-categories-all")
    public List<EquipementCategoryResponse> getAll() {
        log.debug("Recuperation de toutes les categories equipement");
        return repository.findAll().stream()
            .map(mapper::toResponse)
            .toList();
    }

    /**
     * Updates an existing equipment category.
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
    @CacheEvict(value = {"equipement-categories", "equipement-categories-all"}, allEntries = true)
    public EquipementCategoryResponse update(UUID id, EquipementCategoryRequest request) {

        EquipementCategory category = repository
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

            EquipementCategory parent = repository
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
     * Soft-deletes an equipment category by its ID.
     * <p>
     * The category is marked as deleted via the deletedAt field. Child categories and associated equipment items
     * are not deleted but may show the deleted parent in their hierarchy. Cache is invalidated on successful deletion.
     * </p>
     * @param id the unique identifier of the category to delete
     * @throws ResourceNotFoundException if no category is found with the given ID
     */
    // ─── DELETE (soft) ────────────────────────────────────────
    @CacheEvict(value = {"equipement-categories", "equipement-categories-all"}, allEntries = true)
    public void delete(UUID id) {
        EquipementCategory category = repository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Catégorie introuvable avec l'id : " + id
            ));
        repository.delete(category);
    }
}
