package com.motori.product_service.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motori.product_service.models.Parts;

public interface PartRepository extends JpaRepository<Parts, UUID> {
    List<Parts> findAllByDeletedAtIsNull();
    Optional<Parts> findByIdAndDeletedAtIsNull(UUID id);
    Optional<Parts> findByRefAndDeletedAtIsNull(String ref);
} 
