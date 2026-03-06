package com.motori.product_service.repository;


import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import com.motori.product_service.models.EquipementCategory;

public interface EquipementCategoryRepository extends JpaRepository<EquipementCategory, UUID> {
    Page<EquipementCategory> findAll(Pageable pageable);
    Optional<EquipementCategory> findByName(String name);
}

