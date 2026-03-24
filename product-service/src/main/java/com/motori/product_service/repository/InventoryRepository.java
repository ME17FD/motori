package com.motori.product_service.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.motori.product_service.models.Inventory;

/**
 * Data access layer for Inventory (stock) records.
 * 
 * Manages inventory for both Parts and Equipment (exclusive relationship). Each inventory record
 * references either a Part OR an Equipment, never both. Provides dynamic filtering through JPA
 * Specifications for availability status, payment status, and product type queries.
 * Uses EntityGraph to eagerly load related part/equipment associations with brands and categories,
 * preventing N+1 query performance issues.
 * 
 * @author Product Service Team
 */
public interface InventoryRepository extends JpaRepository<Inventory, UUID>,
    JpaSpecificationExecutor<Inventory> {

    /**
     * Retrieves inventory records matching the given specification with pagination.
     * 
     * Supports dynamic filtering by availability, payment status, and product type through
     * JPA Specifications. Eagerly loads both part and equipment associations with their
     * brands and categories to support efficient product lookups.
     * 
     * @param spec the dynamic query specification with filter criteria
     * @param pageable pagination parameters (page number, size, sort)
     * @return paginated list of inventory records matching the criteria
     */
    @EntityGraph(attributePaths = {
        "part", "part.partBrand", "part.partCategory",
        "equipement", "equipement.equipementBrandId", "equipement.equipementCategoryId"
    })
    Page<Inventory> findAll(Specification<Inventory> spec, Pageable pageable);

    /**
     * Retrieves a specific inventory record by ID with related product data.
     * 
     * @param id the unique identifier of the inventory record
     * @return optional containing the inventory if found, empty otherwise
     */
    Optional<Inventory> findById(UUID id);
}