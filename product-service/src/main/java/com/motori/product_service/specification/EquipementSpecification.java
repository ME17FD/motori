package com.motori.product_service.specification;

import java.math.BigDecimal;
import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;
import com.motori.product_service.models.Equipement;
import com.motori.product_service.dto.EquipementDTO.EquipementFilterRequest;
import com.motori.product_service.enums.EquipementSize;

/**
 * JPA Specification builder for advanced Equipment filtering.
 *
 * <p>Constructs {@link Specification} predicates dynamically based on
 * filter criteria provided via {@link EquipementFilterRequest}.
 *
 * <p><b>Filter Combinations (AND Logic):</b>
 * <ul>
 *   <li>name: Case-insensitive substring match</li>
 *   <li>brandId: Exact brand equality</li>
 *   <li>categoryId: Exact category equality</li>
 *   <li>minPrice/maxPrice: Price range (inclusive)</li>
 *   <li>size: Equipment size enum (XS, S, M, L, XL, XXL)</li>
 *   <li>propertyKey + propertyValue: Exact JSONB property value match</li>
 *   <li>hasProperty: JSONB property key existence check</li>
 *   <li>propertiesSearch: Full-text search via tsvector @@ tsquery (GIN indexed)</li>
 * </ul>
 *
 * <p><b>NULL Handling:</b> Null/blank filter fields are ignored in the WHERE clause.
 *
 * <p><b>JSONB Filters:</b> All property-related predicates are delegated to
 * {@link JsonbSpecification} to avoid duplication with {@link PartSpecification}.
 *
 * @see EquipementFilterRequest
 * @see JsonbSpecification
 * @see Equipement
 * @since 1.0
 */
public class EquipementSpecification {

    private EquipementSpecification() {}

    /**
     * Builds compound Specification from filter request.
     *
     * @param filter EquipementFilterRequest with optional criteria
     * @return Specification combining all provided filters with AND logic
     */
    public static Specification<Equipement> withFilters(EquipementFilterRequest filter) {
        return Specification
            .where(hasName(filter.name()))
            .and(hasBrand(filter.brandId()))
            .and(hasCategory(filter.categoryId()))
            .and(hasPriceGreaterThan(filter.minPrice()))
            .and(hasPriceLessThan(filter.maxPrice()))
            .and(hasSize(filter.size()))
            .and(hasPropertyValue(filter.propertyKey(), filter.propertyValue()))
            .and(hasPropertyKey(filter.hasProperty()))
            .and(hasPropertySearch(filter.propertiesSearch()));
    }

    /**
     * Filters by equipment name using case-insensitive substring match.
     *
     * @param name Optional search term
     * @return Specification matching LIKE pattern, or null to ignore
     */
    private static Specification<Equipement> hasName(String name) {
        return (root, query, cb) -> {
            if (name == null || name.isBlank()) return null;
            return cb.like(
                cb.lower(root.get("name")),
                "%" + name.toLowerCase() + "%"
            );
        };
    }

    /**
     * Filters by equipment brand ID.
     *
     * @param brandId Optional brand UUID
     * @return Specification matching brand ID, or null to ignore
     */
    private static Specification<Equipement> hasBrand(UUID brandId) {
        return (root, query, cb) -> {
            if (brandId == null) return null;
            return cb.equal(root.get("equipementBrand").get("id"), brandId);
        };
    }

    /**
     * Filters by equipment category ID.
     *
     * @param categoryId Optional category UUID
     * @return Specification matching category ID, or null to ignore
     */
    private static Specification<Equipement> hasCategory(UUID categoryId) {
        return (root, query, cb) -> {
            if (categoryId == null) return null;
            return cb.equal(root.get("equipementCategory").get("id"), categoryId);
        };
    }

    /**
     * Filters by minimum equipment price (inclusive).
     *
     * @param minPrice Optional minimum price threshold
     * @return Specification matching price >= minPrice, or null to ignore
     */
    private static Specification<Equipement> hasPriceGreaterThan(BigDecimal minPrice) {
        return (root, query, cb) -> {
            if (minPrice == null) return null;
            return cb.greaterThanOrEqualTo(root.get("price"), minPrice);
        };
    }

    /**
     * Filters by maximum equipment price (inclusive).
     *
     * @param maxPrice Optional maximum price threshold
     * @return Specification matching price <= maxPrice, or null to ignore
     */
    private static Specification<Equipement> hasPriceLessThan(BigDecimal maxPrice) {
        return (root, query, cb) -> {
            if (maxPrice == null) return null;
            return cb.lessThanOrEqualTo(root.get("price"), maxPrice);
        };
    }

    /**
     * Filters by equipment size enum.
     * Invalid size values are silently ignored.
     *
     * @param size Optional size enum as String (XS/S/M/L/XL/XXL)
     * @return Specification matching size enum, or null to ignore
     */
    private static Specification<Equipement> hasSize(String size) {
        return (root, query, cb) -> {
            if (size == null || size.isBlank()) return null;
            try {
                EquipementSize enumSize = EquipementSize.valueOf(size.toUpperCase());
                return cb.equal(root.get("size"), enumSize);
            } catch (IllegalArgumentException e) {
                return null; // invalid size → filter ignored
            }
        };
    }

    /**
     * Delegates to {@link JsonbSpecification#hasPropertyValue} for exact JSONB key/value match.
     *
     * <p>Query pattern: ?propertyKey=material&propertyValue=kevlar
     *
     * @param key   JSONB property key name
     * @param value Expected property value
     * @return Specification matching property value, or null to ignore
     */
    private static Specification<Equipement> hasPropertyValue(String key, String value) {
        return (root, query, cb) -> JsonbSpecification.hasPropertyValue(key, value, root, cb);
    }

    /**
     * Delegates to {@link JsonbSpecification#hasPropertyKey} for JSONB key existence check.
     *
     * <p>Query pattern: ?hasProperty=weight
     *
     * @param key JSONB property key name to check
     * @return Specification matching key existence, or null to ignore
     */
    private static Specification<Equipement> hasPropertyKey(String key) {
        return (root, query, cb) -> JsonbSpecification.hasPropertyKey(key, root, cb);
    }

    /**
     * Delegates to {@link JsonbSpecification#hasPropertySearch} for full-text search.
     *
     * <p>Query pattern: ?propertiesSearch=kevlar
     * Uses GIN-indexed tsvector column for O(log n) search on large tables.
     *
     * @param search Optional search term
     * @return Specification matching full-text search, or null to ignore
     */
    private static Specification<Equipement> hasPropertySearch(String search) {
        return (root, query, cb) -> JsonbSpecification.hasPropertySearch(search, root, cb);
    }
}