package com.motori.product_service.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motori.product_service.models.Equipement;

public interface EquipementRepository extends JpaRepository<Equipement, UUID> {
    List<Equipement> findAllByDeletedAtIsNull();
    Optional<Equipement> findByIdAndDeletedAtIsNull(UUID id);
} 
