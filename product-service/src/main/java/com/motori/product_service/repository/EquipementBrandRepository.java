package com.motori.product_service.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import com.motori.product_service.models.EquipementBrand;

/**
 * Data access layer for Equipment brand (manufacturer) entities.
 * 
 * Provides CRUD operations for equipment brands including paginated retrieval and
 * lookup by brand name. Equipment brands are referenced by Equipment entities to track
 * manufacturers of protective gear.
 * 
 * @author Product Service Team
 */
public interface EquipementBrandRepository extends JpaRepository<EquipementBrand, UUID> {
    /**
     * Retrieves all equipment brands with pagination support.
     * 
     * @param pageable pagination parameters (page number, size, sort)
     * @return paginated list of equipment brands
     */
    Page<EquipementBrand> findAll(Pageable pageable);

    /**
     * Finds an equipment brand by its name.
     * 
     * @param name the brand name to search for
     * @return optional containing the brand if found, empty otherwise
     */
    Optional<EquipementBrand> findByName(String name);
}