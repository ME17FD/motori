package com.motori.product_service.repository;


import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.motori.product_service.models.VehiculeBrand;

/**
 * Data access layer for Vehicle brand (manufacturer) entities.
 * 
 * Provides CRUD operations for vehicle brands including paginated retrieval, ID lookup,
 * and brand name search. Vehicle brands are referenced by Vehicle entities to track
 * the manufacturer/make of vehicles (motorcycles, cars, etc.).
 * 
 * @author Product Service Team
 */
public interface VehiculeBrandRepository extends JpaRepository<VehiculeBrand, UUID> {
    /**
     * Retrieves all vehicle brands with pagination support.
     * 
     * @param pageable pagination parameters (page number, size, sort)
     * @return paginated list of vehicle brands
     */
    Page<VehiculeBrand> findAll(Pageable pageable);

    /**
     * Retrieves a specific vehicle brand by ID.
     * 
     * @param id the unique identifier of the vehicle brand
     * @return optional containing the brand if found, empty otherwise
     */
    Optional<VehiculeBrand> findById(UUID id);

    /**
     * Finds a vehicle brand by its name.
     * 
     * @param name the brand name to search for
     * @return optional containing the brand if found, empty otherwise
     */
    Optional<VehiculeBrand> findByName(String name);     
}
