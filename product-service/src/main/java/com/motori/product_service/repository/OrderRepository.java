package com.motori.product_service.repository;


import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.motori.product_service.models.Order;

public interface OrderRepository extends JpaRepository<Order, UUID>,
    JpaSpecificationExecutor<Order> {

    @EntityGraph(attributePaths = {
        "items", "items.inventory",
        "items.inventory.part", "items.inventory.part.partBrand",
        "items.inventory.equipement", "items.inventory.equipement.equipementBrand"
    })
    Page<Order> findAll(Specification<Order> spec, Pageable pageable);

    @EntityGraph(attributePaths = {
        "items", "items.inventory",
        "items.inventory.part", "items.inventory.part.partBrand",
        "items.inventory.equipement", "items.inventory.equipement.equipementBrand"
    })
    Optional<Order> findById(UUID id);

    Page<Order> findByUserId(UUID userId, Pageable pageable);
}
    

