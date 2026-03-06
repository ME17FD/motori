package com.motori.product_service.service;

import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import com.motori.product_service.dto.CompatibilityDTO.CompatibilityRequest;
import com.motori.product_service.dto.CompatibilityDTO.CompatibilityResponse;
import com.motori.product_service.exception.DuplicateResourceException;
import com.motori.product_service.exception.ResourceNotFoundException;
import com.motori.product_service.mapper.CompatibilityMapper;
import com.motori.product_service.models.Compatibility;
import com.motori.product_service.models.Parts;
import com.motori.product_service.models.Vehicule;
import com.motori.product_service.repository.CompatibilityRepository;
import com.motori.product_service.repository.PartRepository;
import com.motori.product_service.repository.VehiculeRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompatibilityService {

    private final CompatibilityRepository repository;
    private final PartRepository partRepository;
    private final VehiculeRepository vehiculeRepository;
    private final CompatibilityMapper mapper;

    // ─── CREATE ───────────────────────────────────────────────
    public CompatibilityResponse create(CompatibilityRequest request) {

        Parts part = partRepository
            .findById(request.partId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Pièce introuvable avec l'id : " + request.partId()
            ));

        Vehicule vehicule = vehiculeRepository
            .findById(request.vehiculeId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Véhicule introuvable avec l'id : " + request.vehiculeId()
            ));

        // Validation métier : cette compatibilité existe déjà ?
        boolean alreadyExists = repository
            .findByPartIdAndVehiculeId(
                request.partId(),
                request.vehiculeId()
            ).isPresent();

        if (alreadyExists) {
            throw new DuplicateResourceException(
                "Cette compatibilité entre la pièce et le véhicule existe déjà"
            );
        }

        Compatibility compatibility = mapper.toEntity(request);
        compatibility.setPart(part);
        compatibility.setVehicule(vehicule);

        return mapper.toResponse(repository.save(compatibility));
    }

    // ─── GET BY ID ────────────────────────────────────────────
    public CompatibilityResponse getById(UUID id) {
        return repository
            .findById(id)
            .map(mapper::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Compatibilité introuvable avec l'id : " + id
            ));
    }

    // ─── GET ALL ──────────────────────────────────────────────
    public Page<CompatibilityResponse> getAll(Pageable pageable) {
        log.debug("Récupération de toutes les compatibilités");
        return repository.findAll(pageable)
            .map(mapper::toResponse);
    }

    // ─── DELETE (soft) ────────────────────────────────────────
    public void delete(UUID id) {
        Compatibility compatibility = repository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Compatibilité introuvable avec l'id : " + id
            ));
        repository.delete(compatibility);
    }
}
