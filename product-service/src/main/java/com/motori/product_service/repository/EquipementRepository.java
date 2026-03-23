package com.motori.product_service.repository;


import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.motori.product_service.models.Equipement;

/**
 * Data access layer for Equipment (protective gear) entities.
 * 
 * Provides CRUD operations and dynamic filtering for equipment products using JPA Specifications.
 * Equipment represents protective gear like helmets and jackets with size variations, colors,
 * brand associations, and category hierarchies. Uses EntityGraph optimization to eagerly load
 * related brand and category data, preventing N+1 query problems.
 * 
 * @author Product Service Team
 */
public interface EquipementRepository extends JpaRepository<Equipement, UUID>,
    JpaSpecificationExecutor<Equipement> {
    /**
     * Retrieves equipment records matching the given specification with pagination.
     * 
     * Supports dynamic filtering by multiple criteria (name, brand, category, price, size)
     * through JPA Specifications. Eagerly loads brand and hierarchical category relationships.
     * 
     * @param spec the dynamic query specification with filter criteria
     * @param pageable pagination parameters (page number, size, sort)
     * @return paginated list of equipment matching filter criteria
     */
    @EntityGraph(attributePaths = {
        "equipementBrandId", "equipementCategoryId", "equipementCategoryId.parent"
    })
    Page<Equipement> findAll(Specification<Equipement> spec, Pageable pageable);

    /**
     * Retrieves a specific equipment record by ID with related data.
     * 
     * @param id the unique identifier of the equipment
     * @return optional containing the equipment if found, empty otherwise
     */
    Optional<Equipement> findById(UUID id);
}