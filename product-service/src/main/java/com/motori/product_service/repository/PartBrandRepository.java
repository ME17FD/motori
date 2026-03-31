package com.motori.product_service.repository;


import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import com.motori.product_service.models.PartBrand;

/**
 * Data access layer for Part brand (manufacturer) entities.
 * 
 * Provides CRUD operations for part brands including paginated retrieval and lookup by brand name.
 * Part brands are referenced by Parts entities to track manufacturers of auto parts.
 * 
 * @author Product Service Team
 */
public interface PartBrandRepository extends JpaRepository<PartBrand, UUID> {
    /**
     * Retrieves all part brands with pagination support.
     * 
     * @param pageable pagination parameters (page number, size, sort)
     * @return paginated list of part brands
     */
    Page<PartBrand> findAll(Pageable pageable);

    /**
     * Finds a part brand by its name.
     * 
     * @param name the brand name to search for
     * @return optional containing the brand if found, empty otherwise
     */
    Optional<PartBrand> findByName(String name);
}
