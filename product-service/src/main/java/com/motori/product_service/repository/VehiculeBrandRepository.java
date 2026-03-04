package com.motori.product_service.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motori.product_service.models.VehiculeBrand;

public interface VehiculeBrandRepository extends JpaRepository<VehiculeBrand, UUID> {
    List<VehiculeBrand> findAllByDeletedAtIsNull();
    Optional<VehiculeBrand> findByIdAndDeletedAtIsNull(UUID id);
    Optional<VehiculeBrand> findByNameAndDeletedAtIsNull(String name);
}
