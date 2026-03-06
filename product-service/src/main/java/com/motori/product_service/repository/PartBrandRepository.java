package com.motori.product_service.repository;


import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import com.motori.product_service.models.PartBrand;


public interface PartBrandRepository extends JpaRepository<PartBrand, UUID> {
    Page<PartBrand> findAll(Pageable pageable);
    Optional<PartBrand> findByName(String name);
}
