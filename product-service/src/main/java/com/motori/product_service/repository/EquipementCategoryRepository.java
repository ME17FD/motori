package com.motori.product_service.repository;


import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import com.motori.product_service.models.EquipementCategory;

/**
 * Data access layer for Equipment category hierarchy.
 * 
 * Manages equipment categories with support for hierarchical organization (parent-child relationships).
 * Provides paginated retrieval and lookup by category name for organizing equipment products.
 * 
 * @author Product Service Team
 */
public interface EquipementCategoryRepository extends JpaRepository<EquipementCategory, UUID> {
    /**
     * Retrieves all equipment categories with pagination support.
     * 
     * @param pageable pagination parameters (page number, size, sort)
     * @return paginated list of equipment categories
     */
    Page<EquipementCategory> findAll(Pageable pageable);

    /**
     * Finds an equipment category by its name.
     * 
     * @param name the category name to search for
     * @return optional containing the category if found, empty otherwise
     */
    Optional<EquipementCategory> findByName(String name);
}

