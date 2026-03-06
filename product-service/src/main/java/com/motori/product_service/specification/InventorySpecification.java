// InventorySpecification.java
package com.motori.product_service.specification;

import org.springframework.data.jpa.domain.Specification;
import com.motori.product_service.dto.InventoryDTO.InventoryFilterRequest;
import com.motori.product_service.enums.PayementStatus;
import com.motori.product_service.models.Inventory;

public class InventorySpecification {

    private InventorySpecification() {}

    public static Specification<Inventory> withFilters(InventoryFilterRequest filter) {
        return Specification
            .where(isAvailable(filter.available()))
            .and(hasPaymentStatus(filter.paymentStatus()))
            .and(hasType(filter.type()));
    }

    private static Specification<Inventory> isAvailable(Boolean available) {
        return (root, query, cb) -> {
            if (available == null) return null;
            if (available) {
                return cb.isNull(root.get("soldAt"));
                // ↑ disponible → soldAt IS NULL
            } else {
                return cb.isNotNull(root.get("soldAt"));
                // ↑ vendu → soldAt IS NOT NULL
            }
        };
    }

    private static Specification<Inventory> hasPaymentStatus(String paymentStatus) {
        return (root, query, cb) -> {
            if (paymentStatus == null || paymentStatus.isBlank()) return null;
            try {
                PayementStatus status = PayementStatus.valueOf(
                    paymentStatus.toUpperCase()
                );
                return cb.equal(root.get("paymentStatus"), status);
            } catch (IllegalArgumentException e) {
                return null;
                // ↑ statut invalide → filtre ignoré
            }
        };
    }

    private static Specification<Inventory> hasType(String type) {
        return (root, query, cb) -> {
            if (type == null || type.isBlank()) return null;
            if (type.equalsIgnoreCase("PART")) {
                return cb.isNotNull(root.get("part"));
                // ↑ type PART → part IS NOT NULL
            } else if (type.equalsIgnoreCase("EQUIPEMENT")) {
                return cb.isNotNull(root.get("equipement"));
                // ↑ type EQUIPEMENT → equipement IS NOT NULL
            }
            return null;
        };
    }
}