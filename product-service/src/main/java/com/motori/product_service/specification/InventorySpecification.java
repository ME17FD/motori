// InventorySpecification.java
package com.motori.product_service.specification;

import org.springframework.data.jpa.domain.Specification;
import com.motori.product_service.dto.InventoryDTO.InventoryFilterRequest;
import com.motori.product_service.enums.PayementStatus;
import com.motori.product_service.models.Inventory;

/**
 * JPA Specification builder for advanced Inventory filtering.
 * 
 * <p>Constructs {@link Specification<Inventory>} predicates dynamically based on
 * filter criteria provided via {@link InventoryFilterRequest}. Enables flexible
 * inventory search by availability status, payment status, and product type.
 * 
 * <p><b>Filter Combinations (AND Logic):</b>
 * <ul>
 *   <li>available: Maps to soldAt timestamp (null = available, not null = sold)</li>
 *   <li>paymentStatus: Enum match (PAID/UNPAID/PARTIALLY_PAID/PENDING)</li>
 *   <li>type: Product type filter (PART = part IS NOT NULL, EQUIPEMENT = equipement IS NOT NULL)</li>
 * </ul>
 * 
 * <p><b>Flexible Product Linking:</b> Inventory enforces Part XOR Equipment constraint.
 * The type filter enables searching for inventory by product category:
 * <ul>
 *   <li>type="PART": part IS NOT NULL AND equipement IS NULL</li>
 *   <li>type="EQUIPEMENT": equipement IS NOT NULL AND part IS NULL</li>
 * </ul>
 * 
 * <p><b>Availability Tracking:</b> Available items have soldAt IS NULL.
 * When inventory is purchased, OrderService sets soldAt timestamp.
 * 
 * <p><b>Usage:</b>
 * <pre>
 * InventoryFilterRequest filter = new InventoryFilterRequest(true, "PAID", "PART");
 * Specification<Inventory> spec = InventorySpecification.withFilters(filter);
 * Page<Inventory> results = repository.findAll(spec, pageable);
 * </pre>
 * 
 * @see InventoryFilterRequest
 * @see InventoryService#get(InventoryFilterRequest, Pageable)
 * @since 1.0
 */
public class InventorySpecification {

    private InventorySpecification() {}

    public static Specification<Inventory> withFilters(InventoryFilterRequest filter) {
        return Specification
            .where(isAvailable(filter.available()))
            .and(hasPaymentStatus(filter.paymentStatus()))
            .and(hasType(filter.type()));
    }

    /**
     * Filters inventory by availability status.
     * 
     * <p>Maps boolean flag to soldAt timestamp check:
     * <ul>
     *   <li>available=true: soldAt IS NULL (not yet sold)</li>
     *   <li>available=false: soldAt IS NOT NULL (already sold)</li>
     * </ul>
     * 
     * <p>Returns null if available is null (predicate ignored).
     * 
     * @param available Optional availability flag
     * @return Specification for availability status, or null to ignore
     */
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

    /**
     * Filters inventory by payment status.
     * 
     * <p>Converts String parameter to PayementStatus enum:
     * PAID, UNPAID, PARTIALLY_PAID, PENDING.
     * 
     * <p>Returns null if paymentStatus is null/blank or invalid enum value.
     * 
     * @param paymentStatus Optional payment status as String
     * @return Specification matching payment status, or null to ignore
     */
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

    /**
     * Filters inventory by product type (Part vs Equipment).
     * 
     * <p>Implements flexible linking pattern via NOT NULL checks:
     * <ul>
     *   <li>type="PART": part IS NOT NULL (filters to parts only)</li>
     *   <li>type="EQUIPEMENT": equipement IS NOT NULL (filters to equipment only)</li>
     * </ul>
     * 
     * <p>XOR constraint ensures exactly one is non-null, never both.
     * 
     * <p>Returns null if type is null/blank or unrecognized value.
     * 
     * @param type Optional product type ("PART" or "EQUIPEMENT")
     * @return Specification filtering by product type, or null to ignore
     */
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