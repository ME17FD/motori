package com.motori.product_service.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motori.product_service.models.EquipementBrand;


public  interface EquipementBrandRepository extends JpaRepository<EquipementBrand, UUID>{
    List<EquipementBrand> findAllByDeletedAtIsNull();
    Optional<EquipementBrand> findByIdAndDeletedAtIsNull(UUID id);
    Optional<EquipementBrand> findByNameAndDeletedAtIsNull(String name);
}