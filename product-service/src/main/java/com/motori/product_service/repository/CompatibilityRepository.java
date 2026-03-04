package com.motori.product_service.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motori.product_service.models.Compatibility;
import com.motori.product_service.models.Parts;

import jakarta.validation.constraints.NotNull;

public interface CompatibilityRepository extends JpaRepository<Compatibility, UUID> {
    List<Compatibility> findAllByDeletedAtIsNull();
    Optional<Compatibility> findByIdAndDeletedAtIsNull(UUID id);
    Optional<Parts> findByPartIdAndVehiculeIdAndDeletedAtIsNull(UUID partId, UUID vehiculeId);
}
