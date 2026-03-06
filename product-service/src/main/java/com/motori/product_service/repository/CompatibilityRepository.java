package com.motori.product_service.repository;


import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.motori.product_service.models.Compatibility;


public interface CompatibilityRepository extends JpaRepository<Compatibility, UUID> {
    @EntityGraph(attributePaths = {
        "part", "part.partBrand", "part.partCategory",
        "vehicule", "vehicule.vehiculeBrand"
    })
    Page<Compatibility> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {
        "part", "part.partBrand", "part.partCategory",
        "vehicule", "vehicule.vehiculeBrand"
    })
    Optional<Compatibility> findById(UUID id);

    Optional<Compatibility> findByPartIdAndVehiculeId(UUID partId, UUID vehiculeId);
}