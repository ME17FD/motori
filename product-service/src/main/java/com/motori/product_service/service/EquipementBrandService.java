package com.motori.product_service.service;


import java.util.List;
import java.util.UUID;


import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.motori.product_service.dto.EquipementBrandDTO.EquipementBrandRequest;
import com.motori.product_service.dto.EquipementBrandDTO.EquipementBrandResponse;
import com.motori.product_service.exception.DuplicateResourceException;
import com.motori.product_service.exception.ResourceNotFoundException;
import com.motori.product_service.mapper.EquipementBrandMapper;
import com.motori.product_service.models.EquipementBrand;
import com.motori.product_service.repository.EquipementBrandRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
/**
 * Service responsible for managing equipment/protective gear brands.
 * <p>
 * Provides CRUD operations for equipment brands with caching support for performance optimization.
 * All brand operations (create, update, delete) invalidate the cache to ensure data consistency.
 * Prevents duplicate brand names through validation.
 * </p>
 * <p>
 * Caching Strategy:
 * - getById() results cached with 10-minute TTL
 * - getAll() results cached globally
 * - create/update/delete operations evict all brand-related caches
 * </p>
 * @author Motori Team
 * @since 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EquipementBrandService {
        private final EquipementBrandRepository repository;
    private final EquipementBrandMapper mapper;

    /**
     * Creates a new equipment brand.
     * <p>
     * Validates that the brand name is unique before creation. Cache is invalidated to reflect the new brand.
     * </p>
     * @param request the brand creation request containing the name
     * @return the created brand with assigned UUID
     * @throws DuplicateResourceException if a brand with the same name already exists
     */
    // ─── CREATE ───────────────────────────────────────────────
    @CacheEvict(value = {"equipement-brands", "equipement-brands-all"}, allEntries = true)
    public EquipementBrandResponse create(EquipementBrandRequest request) {
        boolean nameExists = repository
            .findByName(request.name())
            .isPresent();

        if (nameExists) {
            throw new DuplicateResourceException(
                "Une marque avec le nom '" + request.name() + "' existe déjà"
            );
        }

        EquipementBrand brand = mapper.toEntity(request);

        return mapper.toResponse(repository.save(brand));
    }

    /**
     * Retrieves an equipment brand by its unique identifier with caching support.
     * @param id the unique identifier of the brand
     * @return the equipment brand details
     * @throws ResourceNotFoundException if no brand is found with the given ID
     */
    // ─── GET BY ID ────────────────────────────────────────────
    @Cacheable(value = "equipement-brands", key = "#id")
    public EquipementBrandResponse getById(UUID id) {
        log.debug("Recuperation de la marque equipement : {}", id);
        return repository.findById(id)
            .map(mapper::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Marque equipement introuvable avec l'id : " + id
            ));
    }


    /**
     * Retrieves all equipment brands with caching support.
     * <p>
     * Results are cached globally and invalidated when brands are created, updated, or deleted.
     * </p>
     * @return a list of all equipment brands
     */
    // ─── GET ALL ──────────────────────────────────────────────
    @Cacheable(value = "equipement-brands-all")
    public List<EquipementBrandResponse> getAll() {
        log.debug("Recuperation de toutes les marques equipement");
        return repository.findAll().stream()
            .map(mapper::toResponse)
            .toList();
    }

    /**
     * Updates an existing equipment brand.
     * <p>
     * Validates the updated name for uniqueness across other brands and invalidates cache on success.
     * </p>
     * @param id the unique identifier of the brand to update
     * @param request the update request containing new name
     * @return the updated brand details
     * @throws ResourceNotFoundException if no brand is found with the given ID
     * @throws DuplicateResourceException if the new name already exists on another brand
     */
    // ─── UPDATE ───────────────────────────────────────────────
    @CacheEvict(value = {"equipement-brands", "equipement-brands-all"}, allEntries = true)
    public EquipementBrandResponse update(UUID id, EquipementBrandRequest request) {

        EquipementBrand brand = repository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Marque véhicule introuvable avec l'id : " + id
            ));

        repository.findByName(request.name())
            .ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new DuplicateResourceException(
                        "Une marque avec le nom '" + request.name() + "' existe déjà"
                    );
                }
            });

        brand.setName(request.name());

        return mapper.toResponse(repository.save(brand));
    }

    /**
     * Soft-deletes an equipment brand by its ID.
     * <p>
     * The brand is marked as deleted via the deletedAt field. Associated equipment items retain their brand reference
     * but the brand appears deleted in future queries. Cache is invalidated on successful deletion.
     * </p>
     * @param id the unique identifier of the brand to delete
     * @throws ResourceNotFoundException if no brand is found with the given ID
     */
    // ─── DELETE (soft) ────────────────────────────────────────
    @CacheEvict(value = {"equipement-brands", "equipement-brands-all"}, allEntries = true)
    public void delete(UUID id) {
        EquipementBrand brand = repository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Marque véhicule introuvable avec l'id : " + id
            ));
        repository.delete(brand);
    }
}
