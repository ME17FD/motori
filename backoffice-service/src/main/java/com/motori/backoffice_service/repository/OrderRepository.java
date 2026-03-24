package com.motori.backoffice_service.repository;

import com.motori.order.model.Order;
import com.motori.order.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID>, JpaSpecificationExecutor<Order> {

    Page<Order> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    List<Order> findByUserIdOrderByCreatedAtDesc(String userId);

    Page<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status, Pageable pageable);

    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countByStatus(OrderStatus status);

    long countByUserId(String userId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :since")
    long countSince(@Param("since") LocalDateTime since);

    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countByStatusGroupBy();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o")
    BigDecimal sumTotalAmount();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.createdAt >= :since")
    BigDecimal sumTotalAmountSince(@Param("since") LocalDateTime since);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.createdAt >= :from AND o.createdAt < :to")
    BigDecimal sumTotalAmountBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :from AND o.createdAt < :to")
    long countBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT o.status, COUNT(o) FROM Order o WHERE o.createdAt >= :from AND o.createdAt < :to GROUP BY o.status")
    List<Object[]> countByStatusBetweenGroupBy(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query(value = "SELECT DATE(o.created_at) AS day, COUNT(*) AS orders_count " +
            "FROM orders o " +
            "WHERE o.created_at >= :from AND o.created_at < :to " +
            "GROUP BY DATE(o.created_at) " +
            "ORDER BY day", nativeQuery = true)
    List<Object[]> countOrdersByDay(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query(value = "SELECT DATE(o.created_at) AS day, COALESCE(SUM(o.total_amount), 0) AS revenue " +
            "FROM orders o " +
            "WHERE o.created_at >= :from AND o.created_at < :to " +
            "GROUP BY DATE(o.created_at) " +
            "ORDER BY day", nativeQuery = true)
    List<Object[]> sumRevenueByDay(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    List<Order> findByTrackingNumberContainingIgnoreCase(String trackingNumber);
}
