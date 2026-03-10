package com.motori.product_service.service;


import java.util.List;
import java.util.UUID;


import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.motori.product_service.dto.PartBrandDTO.PartBrandRequest;
import com.motori.product_service.dto.PartBrandDTO.PartBrandResponse;
import com.motori.product_service.exception.DuplicateResourceException;
import com.motori.product_service.exception.ResourceNotFoundException;
import com.motori.product_service.mapper.PartBrandMapper;
import com.motori.product_service.models.PartBrand;
import com.motori.product_service.repository.PartBrandRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
/**
 * Service responsible for managing auto parts/motorcycle parts brands.
 * <p>
 * Provides CRUD operations for part brands with Redis caching support for performance optimization.
 * All brand operations (create, update, delete) invalidate the cache to ensure data consistency.
 * Prevents duplicate brand names through validation.
 * </p>
 * <p>
 * Caching Strategy:
 * - getById() results cached with 10-minute TTL
 * - getAll() results cached globally
 * - create/update/delete operations evict all part-brand-related caches
 * </p>
 * @author Motori Team
 * @since 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PartBrandService {
    private final PartBrandRepository repository;
    private final PartBrandMapper mapper;

    /**
     * Creates a new parts brand.
     * <p>
     * Validates that the brand name is unique before creation. Cache is invalidated to reflect the new brand.
     * </p>
     * @param request the brand creation request containing the name
     * @return the created brand with assigned UUID
     * @throws DuplicateResourceException if a brand with the same name already exists
     */
    // ─── CREATE ───────────────────────────────────────────────
    @CacheEvict(value = {"part-brands", "part-brands-all"}, allEntries = true)
    public PartBrandResponse create(PartBrandRequest request) {
        boolean nameExists = repository
            .findByName(request.name())
            .isPresent();

        if (nameExists) {
            throw new DuplicateResourceException(
                "Une marque avec le nom '" + request.name() + "' existe déjà"
            );
        }

        PartBrand brand = mapper.toEntity(request);
       

        return mapper.toResponse(repository.save(brand));
    }

    /**
     * Retrieves a parts brand by its unique identifier with caching support.
     * @param id the unique identifier of the brand
     * @return the parts brand details
     * @throws ResourceNotFoundException if no brand is found with the given ID
     */
    // ─── GET BY ID ────────────────────────────────────────────
    @Cacheable(value = "part-brands", key = "#id")
    public PartBrandResponse getById(UUID id) {
        log.debug("Recuperation de la marque piece : {}", id);
        return repository.findById(id)
            .map(mapper::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Marque piece introuvable avec l'id : " + id
            ));
    }

    /**
     * Retrieves all parts brands with caching support.
     * <p>
     * Results are cached globally and invalidated when brands are created, updated, or deleted.
     * </p>
     * @return a list of all parts brands
     */
    // ─── GET ALL ──────────────────────────────────────────────
    @Cacheable(value = "part-brands-all")
    public List<PartBrandResponse> getAll() {
        log.debug("Recuperation de toutes les marques piece");
        log.info(">>> APPEL BASE DE DONNÉES - pas de cache");
        return repository.findAll().stream()
            .map(mapper::toResponse)
            .toList();
    }


    /**
     * Updates an existing parts brand.
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
    @CacheEvict(value = {"part-brands", "part-brands-all"}, allEntries = true)
    public PartBrandResponse update(UUID id, PartBrandRequest request) {

        PartBrand brand = repository
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
     * Soft-deletes a parts brand by its ID.
     * <p>
     * The brand is marked as deleted via the deletedAt field. Associated parts retain their brand reference
     * but the brand appears deleted in future queries. Cache is invalidated on successful deletion.
     * </p>
     * @param id the unique identifier of the brand to delete
     * @throws ResourceNotFoundException if no brand is found with the given ID
     */
    // ─── DELETE (soft) ────────────────────────────────────────
    @CacheEvict(value = {"part-brands", "part-brands-all"}, allEntries = true)
    public void delete(UUID id) {
        PartBrand brand = repository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Marque véhicule introuvable avec l'id : " + id
            ));
        repository.delete(brand);
    }
}
