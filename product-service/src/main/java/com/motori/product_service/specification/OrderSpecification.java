package com.motori.product_service.specification;

import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.motori.order.model.Order;
import com.motori.order.model.OrderStatus;
import com.motori.product_service.dto.OderDTO.OrderFilterRequest;

public final class OrderSpecification {

    private OrderSpecification() {}

    public static Specification<Order> withFilters(OrderFilterRequest filter) {
        return Specification
                .where(hasStatus(filter.status()))
                .and(isCompleted(filter.completed()))
                .and(hasUser(filter.userId()));
    }

    private static Specification<Order> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isBlank()) {
                return null;
            }
            try {
                OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
                return cb.equal(root.get("status"), orderStatus);
            } catch (IllegalArgumentException e) {
                return null;
            }
        };
    }

    private static Specification<Order> isCompleted(Boolean completed) {
        return (root, query, cb) -> {
            if (completed == null) {
                return null;
            }
            if (completed) {
                return root.get("status").in(List.of(OrderStatus.DELIVERED, OrderStatus.CANCELLED));
            }
            return root.get("status").in(List.of(
                    OrderStatus.PENDING,
                    OrderStatus.CONFIRMED,
                    OrderStatus.PROCESSING,
                    OrderStatus.SHIPPED));
        };
    }

    private static Specification<Order> hasUser(String userId) {
        return (root, query, cb) -> {
            if (userId == null || userId.isBlank()) {
                return null;
            }
            return cb.equal(root.get("userId"), userId);
        };
    }
}
