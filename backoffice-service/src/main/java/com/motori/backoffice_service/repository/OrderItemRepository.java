package com.motori.backoffice_service.repository;

import com.motori.order.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(UUID orderId);

    @Query("SELECT oi.productId, oi.productName, SUM(oi.quantity), SUM(oi.quantity * oi.unitPrice) " +
           "FROM OrderItem oi JOIN oi.order o WHERE o.createdAt >= :since " +
           "GROUP BY oi.productId, oi.productName ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findTopProductsSince(@Param("since") LocalDateTime since, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT oi.productId, oi.productName, SUM(oi.quantity), SUM(oi.quantity * oi.unitPrice) " +
           "FROM OrderItem oi JOIN oi.order o WHERE o.createdAt >= :from AND o.createdAt < :to " +
           "GROUP BY oi.productId, oi.productName ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findTopProductsBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to, org.springframework.data.domain.Pageable pageable);
}
