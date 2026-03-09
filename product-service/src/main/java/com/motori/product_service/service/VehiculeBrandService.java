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
@Slf4j
@Service
@RequiredArgsConstructor
public class VehiculeBrandService {

    private final VehiculeBrandRepository repository;
    private final VehiculeBrandMapper mapper;

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

    // ─── GET ALL ──────────────────────────────────────────────
    @Cacheable(value = "vehicule-brands-all")
    public List<VehiculeBrandResponse> getAll() {
        log.debug("Recuperation de toutes les marques vehicule");
        return repository.findAll().stream()
            .map(mapper::toResponse)
            .toList();
    }

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
    

