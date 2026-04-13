package com.motori.product_service.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.motori.order.model.Order;

public interface OrderRepository extends JpaRepository<Order, UUID>, JpaSpecificationExecutor<Order> {

    @EntityGraph(attributePaths = { "items" })
    Page<Order> findAll(Specification<Order> spec, Pageable pageable);

    @EntityGraph(attributePaths = { "items" })
    Optional<Order> findById(UUID id);

    @EntityGraph(attributePaths = { "items" })
    Page<Order> findByUserId(String userId, Pageable pageable);
}
