package com.motori.product_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.motori.product_service.models.PartCategory;

public interface PartCategoryRepository extends JpaRepository<PartCategory, UUID> {
    List<PartCategory> findAllByDeletedAtIsNull();
    Optional<PartCategory> findByIdAndDeletedAtIsNull(UUID id);
    Optional<PartCategory> findByNameAndDeletedAtIsNull(String name);
}
