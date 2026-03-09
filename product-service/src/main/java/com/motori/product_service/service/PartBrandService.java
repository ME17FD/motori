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
@Slf4j
@Service
@RequiredArgsConstructor
public class PartBrandService {
    private final PartBrandRepository repository;
    private final PartBrandMapper mapper;

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

    // ─── GET ALL ──────────────────────────────────────────────
    @Cacheable(value = "part-brands-all")
    public List<PartBrandResponse> getAll() {
        log.debug("Recuperation de toutes les marques piece");
        log.info(">>> APPEL BASE DE DONNÉES - pas de cache");
        return repository.findAll().stream()
            .map(mapper::toResponse)
            .toList();
    }


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
