package com.motori.product_service.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

import com.motori.product_service.models.PartCategory;

public interface PartCategoryRepository extends JpaRepository<PartCategory, UUID> {
    Page<PartCategory> findAll(Pageable pageable);
    Optional<PartCategory> findByName(String name);
}
