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
@Slf4j
@Service
@RequiredArgsConstructor
public class EquipementBrandService {
        private final EquipementBrandRepository repository;
    private final EquipementBrandMapper mapper;

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


    // ─── GET ALL ──────────────────────────────────────────────
    @Cacheable(value = "equipement-brands-all")
    public List<EquipementBrandResponse> getAll() {
        log.debug("Recuperation de toutes les marques equipement");
        return repository.findAll().stream()
            .map(mapper::toResponse)
            .toList();
    }

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
