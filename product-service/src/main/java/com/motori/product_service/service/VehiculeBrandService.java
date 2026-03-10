package com.motori.product_service.service;

import java.util.List;
import java.util.UUID;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.motori.product_service.dto.VehiculeBrandDTO.VehiculeBrandRequest;
import com.motori.product_service.dto.VehiculeBrandDTO.VehiculeBrandResponse;
import com.motori.product_service.exception.DuplicateResourceException;
import com.motori.product_service.exception.ResourceNotFoundException;
import com.motori.product_service.mapper.VehiculeBrandMapper;
import com.motori.product_service.models.VehiculeBrand;
import com.motori.product_service.repository.VehiculeBrandRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
/**
 * Service responsible for managing vehicle/motorcycle brands and manufacturers.
 * <p>
 * Provides CRUD operations for vehicle brands with caching support for performance optimization.
 * All brand operations (create, update, delete) invalidate the cache to ensure data consistency.
 * Prevents duplicate brand names through validation.
 * </p>
 * <p>
 * Caching Strategy:
 * - getById() results cached with 10-minute TTL
 * - getAll() results cached globally
 * - create/update/delete operations evict all vehicle-brand-related caches
 * </p>
 * @author Motori Team
 * @since 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VehiculeBrandService {

    private final VehiculeBrandRepository repository;
    private final VehiculeBrandMapper mapper;

    /**
     * Creates a new vehicle brand.
     * <p>
     * Validates that the brand name is unique before creation. Cache is invalidated to reflect the new brand.
     * </p>
     * @param request the brand creation request containing the name
     * @return the created brand with assigned UUID
     * @throws DuplicateResourceException if a brand with the same name already exists
     */
    // ─── CREATE ───────────────────────────────────────────────
    @CacheEvict(value = {"vehicule-brands", "vehicule-brands-all"}, allEntries = true)
    public VehiculeBrandResponse create(VehiculeBrandRequest request) {
        boolean nameExists = repository
            .findByName(request.name())
            .isPresent();
        if (nameExists) {
            throw new DuplicateResourceException(
                "Une marque avec le nom '" + request.name() + "' existe déjà"
            );
        }
        VehiculeBrand brand = mapper.toEntity(request);
        

        return mapper.toResponse(repository.save(brand));
    }

    /**
     * Retrieves a vehicle brand by its unique identifier with caching support.
     * @param id the unique identifier of the brand
     * @return the vehicle brand details
     * @throws ResourceNotFoundException if no brand is found with the given ID
     */
    // ─── GET BY ID ────────────────────────────────────────────
    @Cacheable(value = "vehicule-brands", key = "#id")
    public VehiculeBrandResponse getById(UUID id) {
        log.debug("Recuperation de la marque vehicule : {}", id);
        return repository.findById(id)
            .map(mapper::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Marque vehicule introuvable avec l'id : " + id
            ));
    }

    /**
     * Retrieves all vehicle brands with caching support.
     * <p>
     * Results are cached globally and invalidated when brands are created, updated, or deleted.
     * </p>
     * @return a list of all vehicle brands
     */
    // ─── GET ALL ──────────────────────────────────────────────
    @Cacheable(value = "vehicule-brands-all")
    public List<VehiculeBrandResponse> getAll() {
        log.debug("Recuperation de toutes les marques vehicule");
        return repository.findAll().stream()
            .map(mapper::toResponse)
            .toList();
    }

    /**
     * Updates an existing vehicle brand.
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
    @CacheEvict(value = {"vehicule-brands", "vehicule-brands-all"}, allEntries = true)
    public VehiculeBrandResponse update(UUID id, VehiculeBrandRequest request) {

        VehiculeBrand brand = repository
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
     * Soft-deletes a vehicle brand by its ID.
     * <p>
     * The brand is marked as deleted via the deletedAt field. Associated vehicle models retain their brand reference
     * but the brand appears deleted in future queries. Cache is invalidated on successful deletion.
     * </p>
     * @param id the unique identifier of the brand to delete
     * @throws ResourceNotFoundException if no brand is found with the given ID
     */
    // ─── DELETE (soft) ────────────────────────────────────────
    @CacheEvict(value = {"vehicule-brands", "vehicule-brands-all"}, allEntries = true)
    public void delete(UUID id) {
        VehiculeBrand brand = repository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Marque véhicule introuvable avec l'id : " + id
            ));
        repository.delete(brand);
    } 
}
    

