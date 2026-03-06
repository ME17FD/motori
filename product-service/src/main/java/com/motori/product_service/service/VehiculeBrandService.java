package com.motori.product_service.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    public VehiculeBrandResponse getById(UUID id) {
        VehiculeBrand brand = repository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Marque véhicule introuvable avec l'id : " + id
            ));

        return mapper.toResponse(brand);
    }

    // ─── GET ALL ──────────────────────────────────────────────
    public Page<VehiculeBrandResponse> getAll(Pageable pageable) {
        log.debug("Récupération de toutes les marques véhicule");
        return repository.findAll(pageable)
            .map(mapper::toResponse);
    }

    // ─── UPDATE ───────────────────────────────────────────────
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
    public void delete(UUID id) {
        VehiculeBrand brand = repository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Marque véhicule introuvable avec l'id : " + id
            ));
        repository.delete(brand);
    } 
}
    

