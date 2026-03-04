package com.motori.product_service.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motori.product_service.models.OrderItem;

 public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {
    List<OrderItem> findAllByDeletedAtIsNull();
    Optional<OrderItem> findByIdAndDeletedAtIsNull(UUID id);
} 

