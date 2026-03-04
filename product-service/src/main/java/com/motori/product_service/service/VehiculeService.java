package com.motori.product_service.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

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

@Service
@RequiredArgsConstructor
public class VehiculeService {

    private final VehiculeRepository repository;
    private final VehiculeBrandRepository vehiculeBrandRepository;
    private final VehiculeMapper mapper;

    // ─── CREATE ───────────────────────────────────────────────
    public VehiculeResponse create(VehiculeRequest request) {
        
        VehiculeBrand brand = vehiculeBrandRepository
            .findByIdAndDeletedAtIsNull(request.vehiculeBrandId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Marque véhicule introuvable avec l'id : " + request.vehiculeBrandId()
            ));

        Vehicule vehicule = mapper.toEntity(request);
        vehicule.setVehiculeBrandId(brand);      
        vehicule.setCreatedAt(LocalDateTime.now());

        return mapper.toResponse(repository.save(vehicule));
    }

    // ─── GET BY ID ────────────────────────────────────────────
    public VehiculeResponse getById(UUID id) {
        return repository
            .findByIdAndDeletedAtIsNull(id)
            .map(mapper::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Véhicule introuvable avec l'id : " + id
            ));
    }

    // ─── GET ALL ──────────────────────────────────────────────
    public List<VehiculeResponse> getAll() {
        return repository.findAllByDeletedAtIsNull()
            .stream()
            .map(mapper::toResponse)
            .toList();
    }

    // ─── UPDATE ───────────────────────────────────────────────
    public VehiculeResponse update(UUID id, VehiculeRequest request) {

        Vehicule vehicule = repository
            .findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Véhicule introuvable avec l'id : " + id
            ));

        VehiculeBrand brand = vehiculeBrandRepository
            .findByIdAndDeletedAtIsNull(request.vehiculeBrandId())
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
        Vehicule vehicule = repository
            .findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Véhicule introuvable avec l'id : " + id
            ));

        vehicule.setDeletedAt(LocalDateTime.now());
        repository.save(vehicule);
    }
}
