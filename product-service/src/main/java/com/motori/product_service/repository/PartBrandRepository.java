package com.motori.product_service.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motori.product_service.models.PartBrand;


public  interface PartBrandRepository extends JpaRepository<PartBrand, UUID>{
    List<PartBrand> findAllByDeletedAtIsNull();
    Optional<PartBrand> findByIdAndDeletedAtIsNull(UUID id);
    Optional<PartBrand> findByNameAndDeletedAtIsNull(String name);
}
