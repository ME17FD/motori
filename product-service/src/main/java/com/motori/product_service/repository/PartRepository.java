package com.motori.product_service.repository;

import java.util.Optional;
import java.util.UUID;


import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.motori.product_service.models.Parts;

/**
 * Data access layer for Part (auto parts) entities.
 * 
 * Provides CRUD operations and dynamic filtering for auto parts using JPA Specifications.
 * Parts represent mechanical components with SKU tracking, compatibility associations, and
 * hierarchical categorization. Uses EntityGraph optimization to eagerly load related brand
 * and category data, preventing N+1 query performance issues.
 * 
 * @author Product Service Team
 */
public interface PartRepository extends JpaRepository<Parts, UUID>,
    JpaSpecificationExecutor<Parts> {
    /**
     * Retrieves parts matching the given specification with pagination.
     * 
     * Supports dynamic filtering by multiple criteria through JPA Specifications.
     * Eagerly loads brand and hierarchical category relationships.
     * 
     * @param spec the dynamic query specification with filter criteria
     * @param pageable pagination parameters (page number, size, sort)
     * @return paginated list of parts matching the criteria
     */
    @EntityGraph(attributePaths = {"partBrand", "partCategory", "partCategory.parent"})
    Page<Parts> findAll(Specification<Parts> spec, Pageable pageable);

    /**
     * Finds a part by its SKU reference number.
     * 
     * SKU (Stock Keeping Unit) is a unique identifier for parts to prevent duplicates
     * and enable inventory tracking.
     * 
     * @param ref the SKU reference number to search for
     * @return optional containing the part if found, empty otherwise
     */
    Optional<Parts> findByRef(String ref);
}
