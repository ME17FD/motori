package com.motori.product_service.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.motori.product_service.models.Vehicule;

/**
 * Data access layer for Vehicle (vehicle models) entities.
 * 
 * Manages vehicle records including motorcycles, cars, and other vehicles. Provides CRUD
 * operations with paginated retrieval. Uses EntityGraph optimization to eagerly load vehicle
 * brand associations, preventing N+1 query performance issues.
 * 
 * @author Product Service Team
 */
public interface VehiculeRepository extends JpaRepository<Vehicule, UUID> {
    /**
     * Retrieves all vehicles with pagination support.
     * 
     * Eagerly loads vehicle brand information to prevent N+1 queries.
     * 
     * @param pageable pagination parameters (page number, size, sort)
     * @return paginated list of vehicles with brand data
     */
    @EntityGraph(attributePaths = {"vehiculeBrandId"})
    Page<Vehicule> findAll(Pageable pageable);

    /**
     * Retrieves a specific vehicle by ID with brand information.
     * 
     * @param id the unique identifier of the vehicle
     * @return optional containing the vehicle if found, empty otherwise
     */
    @EntityGraph(attributePaths = {"vehiculeBrandId"})
    Optional<Vehicule> findById(UUID id);
}