package com.motori.product_service.specification;

import java.math.BigDecimal;
import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;
import com.motori.product_service.models.Equipement;
import com.motori.product_service.dto.EquipementDTO.EquipementFilterRequest;
import com.motori.product_service.enums.EquipementSize;

public class EquipementSpecification {

    private EquipementSpecification() {}

    public static Specification<Equipement> withFilters(EquipementFilterRequest filter) {
        return Specification
            .where(hasName(filter.name()))
            .and(hasBrand(filter.brandId()))
            .and(hasCategory(filter.categoryId()))
            .and(hasPriceGreaterThan(filter.minPrice()))
            .and(hasPriceLessThan(filter.maxPrice()))
            .and(hasSize(filter.size()));
    }

    private static Specification<Equipement> hasName(String name) {
        return (root, query, cb) -> {
            if (name == null || name.isBlank()) return null;
            return cb.like(
                cb.lower(root.get("name")),
                "%" + name.toLowerCase() + "%"
            );
        };
    }

    private static Specification<Equipement> hasBrand(UUID brandId) {
        return (root, query, cb) -> {
            if (brandId == null) return null;
            return cb.equal(root.get("equipementBrand").get("id"), brandId);
        };
    }

    private static Specification<Equipement> hasCategory(UUID categoryId) {
        return (root, query, cb) -> {
            if (categoryId == null) return null;
            return cb.equal(root.get("equipementCategory").get("id"), categoryId);
        };
    }

    private static Specification<Equipement> hasPriceGreaterThan(BigDecimal minPrice) {
        return (root, query, cb) -> {
            if (minPrice == null) return null;
            return cb.greaterThanOrEqualTo(root.get("price"), minPrice);
        };
    }

    private static Specification<Equipement> hasPriceLessThan(BigDecimal maxPrice) {
        return (root, query, cb) -> {
            if (maxPrice == null) return null;
            return cb.lessThanOrEqualTo(root.get("price"), maxPrice);
        };
    }

    private static Specification<Equipement> hasSize(String size) {
        return (root, query, cb) -> {
            if (size == null || size.isBlank()) return null;
            try {
                EquipementSize enumSize = EquipementSize.valueOf(size.toUpperCase());
                return cb.equal(root.get("size"), enumSize);
            } catch (IllegalArgumentException e) {
                return null;
                // ↑ si la taille envoyée n'est pas valide → filtre ignoré
            }
        };
    }
}