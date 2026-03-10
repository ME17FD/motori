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
/**
 * Service responsible for managing vehicle/motorcycle models.
 * <p>
 * Provides CRUD operations for vehicle models with support for model year tracking and brand relationships.
 * Each vehicle model must reference an existing vehicle brand. Validates foreign key relationships before
 * entity creation and deletion.
 * </p>
 * <p>
 * Vehicles represent specific motorcycle or scooter models (e.g., Honda CB500F, Yamaha MT-09, etc.)
 * with associated manufacturing year and brand. Used for tracking vehicle-part compatibility.
 * </p>
 * @author Motori Team
 * @since 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VehiculeService {

    private final VehiculeRepository repository;
    private final VehiculeBrandRepository vehiculeBrandRepository;
    private final VehiculeMapper mapper;

    /**
     * Creates a new vehicle model.
     * <p>
     * Validates that the referenced brand exists before creation.
     * Initializes the vehicle with model name, year, and brand relationship.
     * </p>
     * @param request the vehicle creation request containing name, brand ID, and year
     * @return the created vehicle with assigned UUID
     * @throws ResourceNotFoundException if the specified brand does not exist
     */
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

    /**
     * Retrieves a vehicle model by its unique identifier.
     * @param id the unique identifier of the vehicle
     * @return the vehicle details with brand information
     * @throws ResourceNotFoundException if no vehicle is found with the given ID
     */
    // ─── GET BY ID ────────────────────────────────────────────
    public VehiculeResponse getById(UUID id) {
        return repository
            .findById(id)
            .map(mapper::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Véhicule introuvable avec l'id : " + id
            ));
    }

    /**
     * Retrieves all vehicles with pagination support.
     * @param pageable pagination parameters (page number, size, sorting)
     * @return a page of all vehicle models with brand relationship data
     */
    // ─── GET ALL ──────────────────────────────────────────────
    public Page<VehiculeResponse> getAll(Pageable pageable) {
    log.debug("Récupération de tous les véhicules");
    return repository.findAll(pageable)
        .map(mapper::toResponse);
    }

    /**
     * Updates an existing vehicle model.
     * <p>
     * Validates that the referenced brand exists. Updates model name, year, and brand association.
     * </p>
     * @param id the unique identifier of the vehicle to update
     * @param request the update request with new vehicle details
     * @return the updated vehicle
     * @throws ResourceNotFoundException if the vehicle or brand is not found
     */
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

    /**
     * Soft-deletes a vehicle model by its ID.
     * <p>
     * The vehicle is marked as deleted via the deletedAt field. Associated compatibility mappings and inventory
     * retain references to the deleted vehicle. The vehicle is excluded from future queries.
     * </p>
     * @param id the unique identifier of the vehicle to delete
     * @throws ResourceNotFoundException if no vehicle is found with the given ID
     */
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
