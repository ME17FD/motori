package com.motori.product_service.repository;


import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.motori.product_service.models.Compatibility;

/**
 * Data access layer for Part-to-Vehicle compatibility mappings.
 * 
 * Manages the relationship between Parts and Vehicles, tracking which parts are compatible
 * with which vehicle models. Uses EntityGraph optimizations to eagerly load related part and
 * vehicle brand/category data, preventing N+1 query problems in service operations.
 * 
 * @author Product Service Team
 */
public interface CompatibilityRepository extends JpaRepository<Compatibility, UUID> {
    /**
     * Retrieves all compatibility mappings with related entity data.
     * 
     * @param pageable pagination parameters (page number, size, sort)
     * @return paginated list of compatibility records with eagerly loaded part/vehicle associations
     */
    @EntityGraph(attributePaths = {
        "part", "part.partBrand", "part.partCategory",
        "vehicule", "vehicule.vehiculeBrand"
    })
    Page<Compatibility> findAll(Pageable pageable);

    /**
     * Retrieves a specific compatibility record by ID with related entity data.
     * 
     * @param id the unique identifier of the compatibility record
     * @return optional containing the compatibility if found, empty otherwise
     */
    @EntityGraph(attributePaths = {
        "part", "part.partBrand", "part.partCategory",
        "vehicule", "vehicule.vehiculeBrand"
    })
    Optional<Compatibility> findById(UUID id);

    /**
     * Finds a compatibility record by part and vehicle IDs.
     * 
     * Used to check if a part-vehicle combination already exists before creating a new mapping,
     * preventing duplicate compatibility records.
     * 
     * @param partId the unique identifier of the part
     * @param vehiculeId the unique identifier of the vehicle
     * @return optional containing the compatibility if exists, empty otherwise
     */
    Optional<Compatibility> findByPartIdAndVehiculeId(UUID partId, UUID vehiculeId);
}