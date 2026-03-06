package com.motori.product_service.specification;
import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;
import com.motori.product_service.dto.OderDTO.OrderFilterRequest;
import com.motori.product_service.enums.OrderStatus;
import com.motori.product_service.models.Order;

public class OrderSpecification {

    private OrderSpecification() {}

    public static Specification<Order> withFilters(OrderFilterRequest filter) {
        return Specification
            .where(hasStatus(filter.status()))
            .and(isCompleted(filter.completed()))
            .and(hasUser(filter.userId()));
    }

    private static Specification<Order> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isBlank()) return null;
            try {
                OrderStatus orderStatus = OrderStatus.valueOf(
                    status.toUpperCase()
                );
                return cb.equal(root.get("status"), orderStatus);
            } catch (IllegalArgumentException e) {
                return null;
            }
        };
    }

    private static Specification<Order> isCompleted(Boolean completed) {
        return (root, query, cb) -> {
            if (completed == null) return null;
            return cb.equal(root.get("completed"), completed);
        };
    }

    private static Specification<Order> hasUser(UUID userId) {
        return (root, query, cb) -> {
            if (userId == null) return null;
            return cb.equal(root.get("userId"), userId);
        };
    }
}