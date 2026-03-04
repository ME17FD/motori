package com.motori.product_service.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motori.product_service.models.Inventory;

 public interface InventoryRepository extends JpaRepository<Inventory, UUID> {
    List<Inventory> findAllByDeletedAtIsNull();
    Optional<Inventory> findByIdAndDeletedAtIsNull(UUID id);
} 
