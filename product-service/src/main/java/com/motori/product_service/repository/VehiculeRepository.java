package com.motori.product_service.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.motori.product_service.models.Vehicule;


public interface VehiculeRepository extends JpaRepository<Vehicule, UUID> {
    @EntityGraph(attributePaths = {"vehiculeBrand"})
    Page<Vehicule> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"vehiculeBrand"})
    Optional<Vehicule> findById(UUID id);
}
