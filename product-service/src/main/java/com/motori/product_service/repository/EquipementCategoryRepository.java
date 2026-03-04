package com.motori.product_service.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motori.product_service.models.EquipementCategory;

public interface EquipementCategoryRepository extends JpaRepository<EquipementCategory, UUID> {
    List<EquipementCategory> findAllByDeletedAtIsNull();
    Optional<EquipementCategory> findByIdAndDeletedAtIsNull(UUID id);
    Optional<EquipementCategory> findByNameAndDeletedAtIsNull(String name);
}
