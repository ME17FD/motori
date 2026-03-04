package com.motori.product_service.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motori.product_service.models.Vehicule;

public interface VehiculeRepository extends JpaRepository<Vehicule, UUID> {
    List<Vehicule> findAllByDeletedAtIsNull();
    Optional<Vehicule> findByIdAndDeletedAtIsNull(UUID id);
} 
