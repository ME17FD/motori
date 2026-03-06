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


public interface InventoryRepository extends JpaRepository<Inventory, UUID>,
    JpaSpecificationExecutor<Inventory> {

    @EntityGraph(attributePaths = {
        "part", "part.partBrand", "part.partCategory",
        "equipement", "equipement.equipementBrand", "equipement.equipementCategory"
    })
    Page<Inventory> findAll(Specification<Inventory> spec, Pageable pageable);

    Optional<Inventory> findById(UUID id);
}