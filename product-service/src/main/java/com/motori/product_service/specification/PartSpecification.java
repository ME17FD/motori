package com.motori.product_service.specification;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;
import com.motori.product_service.models.Parts;
import com.motori.product_service.dto.PartDTO.PartFilterRequest;

/**
 * JPA Specification builder for advanced Parts filtering.
 *
 * <p>Constructs {@link Specification} predicates dynamically based on
 * filter criteria provided via {@link PartFilterRequest}. Enables comprehensive
 * multi-field part search including vehicle compatibility JOIN operations.
 *
 * <p><b>Filter Combinations (AND Logic):</b>
 * All specified filters are combined with AND operator:
 * <ul>
 *   <li>name/ref: Case-insensitive substring match on part name OR SKU (ILIKE)</li>
 *   <li>brandId: Exact parts manufacturer equality</li>
 *   <li>categoryId: Exact parts category equality</li>
 *   <li>minPrice/maxPrice: Price range (inclusive BETWEEN)</li>
 *   <li>vehiculeId: Vehicle compatibility via JOIN to Compatibility table</li>
 *   <li>propertyKey + propertyValue: Exact JSONB property value match</li>
 *   <li>hasProperty: JSONB property key existence check</li>
 *   <li>propertiesSearch: Full-text search via tsvector @@ tsquery (GIN indexed)</li>
 * </ul>
 *
 * <p><b>NULL Handling:</b> If a filter field is null/blank, it is ignored in the
 * WHERE clause. This allows optional filtering.
 *
 * <p><b>JSONB Filters:</b> All property-related predicates are delegated to
 * {@link JsonbSpecification} to avoid duplication with {@link EquipementSpecification}.
 *
 * @see PartFilterRequest
 * @see JsonbSpecification
 * @see Parts
 * @since 1.0
 */
public class PartSpecification {

    private PartSpecification() {}

    /**
     * Builds compound Specification from filter request.
     *
     * <p>Combines all provided filters with AND operator for flexible part search.
     *
     * @param filter PartFilterRequest with optional filtering criteria
     * @return Specification combining all filters with AND logic
     */
    public static Specification<Parts> withFilters(PartFilterRequest filter) {
        return Specification
            .where(hasNameOrRef(filter.name()))
            .and(hasBrand(filter.brandId()))
            .and(hasCategory(filter.categoryId()))
            .and(hasPriceGreaterThan(filter.minPrice()))
            .and(hasPriceLessThan(filter.maxPrice()))
            .and(isCompatibleWithVehicule(filter.vehiculeId()))
            .and(hasPropertyValue(filter.propertyKey(), filter.propertyValue()))
            .and(hasPropertyKey(filter.hasProperty()))
            .and(hasPropertySearch(filter.propertiesSearch()));
    }

    /**
     * Filters by part name OR SKU (ref) using case-insensitive substring match.
     *
     * <p>Combines two conditions with OR operator:
     * <ul>
     *   <li>name ILIKE %search%</li>
     *   <li>ref ILIKE %search%</li>
     * </ul>
     * Enables clients to search by product name or part number interchangeably.
     *
     * @param name Optional search term
     * @return Specification matching name or ref, or null to ignore
     */
    private static Specification<Parts> hasNameOrRef(String name) {
        return (root, query, cb) -> {
            if (name == null || name.isBlank()) return null;
            String pattern = "%" + name.toLowerCase() + "%";
            return cb.or(
                cb.like(cb.lower(root.get("name")), pattern),
                cb.like(cb.lower(root.get("ref")), pattern)
            );
        };
    }

    /**
     * Filters by part brand ID.
     *
     * @param brandId Optional brand UUID
     * @return Specification matching brand ID, or null to ignore
     */
    private static Specification<Parts> hasBrand(UUID brandId) {
        return (root, query, cb) -> {
            if (brandId == null) return null;
            return cb.equal(root.get("partBrand").get("id"), brandId);
        };
    }

    /**
     * Filters by part category ID.
     *
     * @param categoryId Optional category UUID
     * @return Specification matching category ID, or null to ignore
     */
    private static Specification<Parts> hasCategory(UUID categoryId) {
        return (root, query, cb) -> {
            if (categoryId == null) return null;
            return cb.equal(root.get("partCategory").get("id"), categoryId);
        };
    }

    /**
     * Filters by minimum part price (inclusive).
     *
     * @param minPrice Optional minimum price threshold
     * @return Specification matching price >= minPrice, or null to ignore
     */
    private static Specification<Parts> hasPriceGreaterThan(BigDecimal minPrice) {
        return (root, query, cb) -> {
            if (minPrice == null) return null;
            return cb.greaterThanOrEqualTo(root.get("price"), minPrice);
        };
    }

    /**
     * Filters by maximum part price (inclusive).
     *
     * @param maxPrice Optional maximum price threshold
     * @return Specification matching price <= maxPrice, or null to ignore
     */
    private static Specification<Parts> hasPriceLessThan(BigDecimal maxPrice) {
        return (root, query, cb) -> {
            if (maxPrice == null) return null;
            return cb.lessThanOrEqualTo(root.get("price"), maxPrice);
        };
    }

    /**
     * Filters parts compatible with specified vehicle via Compatibility JOIN.
     *
     * <p>Inner joins Compatibility table to find parts linked to vehicle:
     * <pre>
     * INNER JOIN Compatibility c ON self.id = c.part.id
     * WHERE c.vehicule.id = :vehiculeId
     * </pre>
     *
     * @param vehiculeId Optional motorcycle/vehicle UUID
     * @return Specification matching compatible parts, or null to ignore
     */
    private static Specification<Parts> isCompatibleWithVehicule(UUID vehiculeId) {
        return (root, query, cb) -> {
            if (vehiculeId == null) return null;
            var compatibilityJoin = root.join("compatibilities", JoinType.INNER);
            return cb.equal(
                compatibilityJoin.get("vehicule").get("id"), vehiculeId
            );
        };
    }

    /**
     * Delegates to {@link JsonbSpecification#hasPropertyValue} for exact JSONB key/value match.
     *
     * <p>Query pattern: ?propertyKey=viscosity&propertyValue=5W30
     *
     * @param key   JSONB property key name
     * @param value Expected property value
     * @return Specification matching property value, or null to ignore
     */
    private static Specification<Parts> hasPropertyValue(String key, String value) {
        return (root, query, cb) -> JsonbSpecification.hasPropertyValue(key, value, root, cb);
    }

    /**
     * Delegates to {@link JsonbSpecification#hasPropertyKey} for JSONB key existence check.
     *
     * <p>Query pattern: ?hasProperty=diameter
     *
     * @param key JSONB property key name to check
     * @return Specification matching key existence, or null to ignore
     */
    private static Specification<Parts> hasPropertyKey(String key) {
        return (root, query, cb) -> JsonbSpecification.hasPropertyKey(key, root, cb);
    }

    /**
     * Delegates to {@link JsonbSpecification#hasPropertySearch} for full-text search.
     *
     * <p>Query pattern: ?propertiesSearch=Honda
     * Uses GIN-indexed tsvector column for O(log n) search on large tables.
     *
     * @param search Optional search term
     * @return Specification matching full-text search, or null to ignore
     */
    private static Specification<Parts> hasPropertySearch(String search) {
        return (root, query, cb) -> JsonbSpecification.hasPropertySearch(search, root, cb);
    }
}