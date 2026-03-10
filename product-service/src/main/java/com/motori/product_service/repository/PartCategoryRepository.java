package com.motori.product_service.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

import com.motori.product_service.models.PartCategory;

/**
 * Data access layer for Part category hierarchy.
 * 
 * Manages part categories with support for hierarchical organization (parent-child relationships).
 * Provides paginated retrieval and lookup by category name for organizing auto parts products.
 * 
 * @author Product Service Team
 */
public interface PartCategoryRepository extends JpaRepository<PartCategory, UUID> {
    /**
     * Retrieves all part categories with pagination support.
     * 
     * @param pageable pagination parameters (page number, size, sort)
     * @return paginated list of part categories
     */
    Page<PartCategory> findAll(Pageable pageable);

    /**
     * Finds a part category by its name.
     * 
     * @param name the category name to search for
     * @return optional containing the category if found, empty otherwise
     */
    Optional<PartCategory> findByName(String name);
}
