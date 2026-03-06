package com.motori.product_service.service;


import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import com.motori.product_service.dto.VehiculeDTO.VehiculeRequest;
import com.motori.product_service.dto.VehiculeDTO.VehiculeResponse;
import com.motori.product_service.exception.ResourceNotFoundException;
import com.motori.product_service.mapper.VehiculeMapper;
import com.motori.product_service.models.Vehicule;
import com.motori.product_service.models.VehiculeBrand;
import com.motori.product_service.repository.VehiculeBrandRepository;
import com.motori.product_service.repository.VehiculeRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
@Slf4j
@Service
@RequiredArgsConstructor
public class VehiculeService {

    private final VehiculeRepository repository;
    private final VehiculeBrandRepository vehiculeBrandRepository;
    private final VehiculeMapper mapper;

    // ─── CREATE ───────────────────────────────────────────────
    public VehiculeResponse create(VehiculeRequest request) {
        
        VehiculeBrand brand = vehiculeBrandRepository
            .findById(request.vehiculeBrandId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Marque véhicule introuvable avec l'id : " + request.vehiculeBrandId()
            ));

        Vehicule vehicule = mapper.toEntity(request);
        vehicule.setVehiculeBrandId(brand);      
       

        return mapper.toResponse(repository.save(vehicule));
    }

    // ─── GET BY ID ────────────────────────────────────────────
    public VehiculeResponse getById(UUID id) {
        return repository
            .findById(id)
            .map(mapper::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Véhicule introuvable avec l'id : " + id
            ));
    }

    // ─── GET ALL ──────────────────────────────────────────────
    public Page<VehiculeResponse> getAll(Pageable pageable) {
    log.debug("Récupération de tous les véhicules");
    return repository.findAll(pageable)
        .map(mapper::toResponse);
    }

    // ─── UPDATE ───────────────────────────────────────────────
    public VehiculeResponse update(UUID id, VehiculeRequest request) {

        Vehicule vehicule = repository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Véhicule introuvable avec l'id : " + id
            ));

        VehiculeBrand brand = vehiculeBrandRepository
            .findById(request.vehiculeBrandId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Marque véhicule introuvable avec l'id : " + request.vehiculeBrandId()
            ));

        vehicule.setModel(request.model());
        vehicule.setName(request.name());
        vehicule.setVehiculeBrandId(brand);

        return mapper.toResponse(repository.save(vehicule));
    }

    // ─── DELETE (soft) ────────────────────────────────────────
    public void delete(UUID id) {
    log.info("Suppression du véhicule avec l'id : {}", id);
    Vehicule vehicule = repository
        .findById(id)
        .orElseThrow(() -> {
            log.warn("Véhicule introuvable avec l'id : {}", id);
            return new ResourceNotFoundException(
                "Véhicule introuvable avec l'id : " + id
            );
        });
    repository.delete(vehicule);
    log.info("Véhicule soft-deleted avec l'id : {}", id);
}
}
