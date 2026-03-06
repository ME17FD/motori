package com.motori.product_service.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import com.motori.product_service.models.EquipementBrand;


public interface EquipementBrandRepository extends JpaRepository<EquipementBrand, UUID> {
    Page<EquipementBrand> findAll(Pageable pageable);
    Optional<EquipementBrand> findByName(String name);
}