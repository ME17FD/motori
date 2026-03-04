package com.motori.product_service.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

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
            .findByIdAndDeletedAtIsNull(request.partId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Pièce introuvable avec l'id : " + request.partId()
            ));

        Vehicule vehicule = vehiculeRepository
            .findByIdAndDeletedAtIsNull(request.vehiculeId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Véhicule introuvable avec l'id : " + request.vehiculeId()
            ));

        // Validation métier : cette compatibilité existe déjà ?
        boolean alreadyExists = repository
            .findByPartIdAndVehiculeIdAndDeletedAtIsNull(
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
        compatibility.setCreatedAt(LocalDateTime.now());

        return mapper.toResponse(repository.save(compatibility));
    }

    // ─── GET BY ID ────────────────────────────────────────────
    public CompatibilityResponse getById(UUID id) {
        return repository
            .findByIdAndDeletedAtIsNull(id)
            .map(mapper::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Compatibilité introuvable avec l'id : " + id
            ));
    }

    // ─── GET ALL ──────────────────────────────────────────────
    public List<CompatibilityResponse> getAll() {
        return repository.findAllByDeletedAtIsNull()
            .stream()
            .map(mapper::toResponse)
            .toList();
    }

    // ─── DELETE (soft) ────────────────────────────────────────
    public void delete(UUID id) {
        Compatibility compatibility = repository
            .findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Compatibilité introuvable avec l'id : " + id
            ));

        compatibility.setDeletedAt(LocalDateTime.now());
        repository.save(compatibility);
    }
}
