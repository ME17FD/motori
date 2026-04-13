package com.motori.backoffice_service.repository;

import com.motori.order.model.Order;
import com.motori.order.model.OrderStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public final class OrderSpecification {

    private OrderSpecification() {}

    public static Specification<Order> withFilters(
            String trackingNumber,
            OrderStatus status,
            String userId,
            LocalDate fromDate,
            LocalDate toDate) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (trackingNumber != null && !trackingNumber.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("trackingNumber")), "%" + trackingNumber.toLowerCase() + "%"));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (userId != null && !userId.isBlank()) {
                predicates.add(cb.equal(root.get("userId"), userId));
            }
            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), LocalDateTime.of(fromDate, LocalTime.MIN)));
            }
            if (toDate != null) {
                predicates.add(cb.lessThan(root.get("createdAt"), LocalDateTime.of(toDate.plusDays(1), LocalTime.MIN)));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
