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

/**
 * Service responsible for managing part-to-vehicle compatibility relationships.
 * <p>
 * Provides CRUD operations for compatibility mappings that define which parts are compatible
 * with which vehicle models. Includes validation to prevent duplicate compatibility entries
 * and ensures both referenced parts and vehicles exist before creating associations.
 * </p>
 * @author Motori Team
 * @since 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CompatibilityService {

    private final CompatibilityRepository repository;
    private final PartRepository partRepository;
    private final VehiculeRepository vehiculeRepository;
    private final CompatibilityMapper mapper;

    /**
     * Creates a new compatibility mapping between a part and a vehicle.
     * <p>
     * Validates that both the part and vehicle exist in the system before creating the mapping.
     * Also checks for duplicate compatibility entries (same part-vehicle pair) to prevent duplicates.
     * </p>
     * @param request the compatibility request containing partId and vehiculeId
     * @return the created compatibility mapping
     * @throws ResourceNotFoundException if the part or vehicle is not found
     * @throws DuplicateResourceException if a compatibility mapping already exists for this part-vehicle pair
     */
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

    /**
     * Retrieves a compatibility mapping by its unique identifier.
     * @param id the unique identifier of the compatibility relationship
     * @return the compatibility mapping with part and vehicle details
     * @throws ResourceNotFoundException if no compatibility mapping is found with the given ID
     */
    // ─── GET BY ID ────────────────────────────────────────────
    public CompatibilityResponse getById(UUID id) {
        return repository
            .findById(id)
            .map(mapper::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Compatibilité introuvable avec l'id : " + id
            ));
    }

    /**
     * Retrieves all compatibility mappings with pagination support.
     * @param pageable pagination parameters (page number, size, sorting)
     * @return a page of compatibility mappings with their associated part and vehicle details
     */
    // ─── GET ALL ──────────────────────────────────────────────
    public Page<CompatibilityResponse> getAll(Pageable pageable) {
        log.debug("Récupération de toutes les compatibilités");
        return repository.findAll(pageable)
            .map(mapper::toResponse);
    }

    /**
     * Soft-deletes a compatibility mapping by its ID.
     * <p>
     * The compatibility record is marked as deleted via the deletedAt field rather than physically removed,
     * allowing for audit trail and potential recovery.
     * </p>
     * @param id the unique identifier of the compatibility mapping to delete
     * @throws ResourceNotFoundException if no compatibility mapping is found with the given ID
     */
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
