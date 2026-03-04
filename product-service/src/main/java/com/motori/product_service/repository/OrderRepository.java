package com.motori.product_service.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motori.product_service.models.Order;
public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findAllByDeletedAtIsNull();
    Optional<Order> findByIdAndDeletedAtIsNull(UUID id);
    List<Order> findAllByUserIdAndDeletedAtIsNull(UUID userId);
} 
    

