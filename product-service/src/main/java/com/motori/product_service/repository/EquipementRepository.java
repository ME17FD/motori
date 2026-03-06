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

public interface EquipementRepository extends JpaRepository<Equipement, UUID>,
    JpaSpecificationExecutor<Equipement> {
    @EntityGraph(attributePaths = {
        "equipementBrand", "equipementCategory", "equipementCategory.parent"
    })
    Page<Equipement> findAll(Specification<Equipement> spec, Pageable pageable);
    Optional<Equipement> findById(UUID id);
}