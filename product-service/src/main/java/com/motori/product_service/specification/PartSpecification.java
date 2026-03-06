// PartSpecification.java
package com.motori.product_service.specification;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;
import com.motori.product_service.models.Parts;
import com.motori.product_service.dto.PartDTO.PartFilterRequest;

public class PartSpecification {

    private PartSpecification() {}
    // ↑ classe utilitaire — pas d'instanciation

    public static Specification<Parts> withFilters(PartFilterRequest filter) {
        return Specification
            .where(hasNameOrRef(filter.name()))
            .and(hasBrand(filter.brandId()))
            .and(hasCategory(filter.categoryId()))
            .and(hasPriceGreaterThan(filter.minPrice()))
            .and(hasPriceLessThan(filter.maxPrice()))
            .and(isCompatibleWithVehicule(filter.vehiculeId()));
    }

    private static Specification<Parts> hasNameOrRef(String name) {
        return (root, query, cb) -> {
            if (name == null || name.isBlank()) return null;
            // ↑ si le filtre est null → ignoré
            String pattern = "%" + name.toLowerCase() + "%";
            return cb.or(
                cb.like(cb.lower(root.get("name")), pattern),
                cb.like(cb.lower(root.get("ref")), pattern)
            );
            // ↑ cherche dans name OU dans ref
        };
    }

    private static Specification<Parts> hasBrand(UUID brandId) {
        return (root, query, cb) -> {
            if (brandId == null) return null;
            return cb.equal(root.get("partBrand").get("id"), brandId);
        };
    }

    private static Specification<Parts> hasCategory(UUID categoryId) {
        return (root, query, cb) -> {
            if (categoryId == null) return null;
            return cb.equal(root.get("partCategory").get("id"), categoryId);
        };
    }

    private static Specification<Parts> hasPriceGreaterThan(BigDecimal minPrice) {
        return (root, query, cb) -> {
            if (minPrice == null) return null;
            return cb.greaterThanOrEqualTo(root.get("price"), minPrice);
        };
    }

    private static Specification<Parts> hasPriceLessThan(BigDecimal maxPrice) {
        return (root, query, cb) -> {
            if (maxPrice == null) return null;
            return cb.lessThanOrEqualTo(root.get("price"), maxPrice);
        };
    }

    private static Specification<Parts> isCompatibleWithVehicule(UUID vehiculeId) {
        return (root, query, cb) -> {
            if (vehiculeId == null) return null;
            // ↑ jointure avec la table compatibility
            // pour trouver les pièces compatibles avec un véhicule
            var compatibilityJoin = root.join("compatibilities", JoinType.INNER);
            return cb.equal(
                compatibilityJoin.get("vehicule").get("id"), vehiculeId
            );
        };
    }
}