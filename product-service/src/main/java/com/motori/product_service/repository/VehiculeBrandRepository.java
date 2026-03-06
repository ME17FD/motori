package com.motori.product_service.repository;


import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.motori.product_service.models.VehiculeBrand;

public interface VehiculeBrandRepository extends JpaRepository<VehiculeBrand, UUID> {
    Page<VehiculeBrand> findAll(Pageable pageable);      
    Optional<VehiculeBrand> findById(UUID id);          
    Optional<VehiculeBrand> findByName(String name);     
}
