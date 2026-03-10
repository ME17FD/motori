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
 *   <li>propertyKey + propertyValue: Exact JSON property value match</li>
 *   <li>hasProperty: JSON property key existence check</li>
 *   <li>propertiesSearch: Full-text search across all JSON property values</li>
 * </ul>
 *
 * <p><b>NULL Handling:</b> Null/blank filter fields are ignored in the WHERE clause.
 *
 * @author Motori Team
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
     * @return Specification matching LIKE pattern, or null to ignore filter
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
                return null;
                // ↑ taille invalide → filtre ignoré
            }
        };
    }

    /**
     * Filters by exact JSON property value.
     * Both key and value must be provided, otherwise the filter is ignored.
     * <p>Example: ?propertyKey=material&propertyValue=kevlar</p>
     *
     * @param key   Optional JSON property key
     * @param value Optional JSON property value
     * @return Specification matching exact JSON property value, or null to ignore
     */
    private static Specification<Equipement> hasPropertyValue(String key, String value) {
        return (root, query, cb) -> {
            if (key == null || key.isBlank() || value == null || value.isBlank()) return null;
            return cb.equal(
                cb.function(
                    "jsonb_extract_path_text",
                    String.class,
                    root.get("properties"),
                    cb.literal(key)
                ),
                value
            );
        };
    }

    /**
     * Filters by JSON property key existence.
     * Returns equipment that have the specified key in their properties JSON.
     * <p>Example: ?hasProperty=weight</p>
     *
     * @param key Optional JSON property key to check existence
     * @return Specification matching key existence, or null to ignore
     */
    private static Specification<Equipement> hasPropertyKey(String key) {
        return (root, query, cb) -> {
            if (key == null || key.isBlank()) return null;
            return cb.isTrue(
                cb.function(
                    "jsonb_exists",
                    Boolean.class,
                    root.get("properties"),
                    cb.literal(key)
                )
            );
        };
    }

    /**
     * Full-text search across all JSON property values.
     * Case-insensitive search using PostgreSQL cast_to_text function.
     * <p>Example: ?propertiesSearch=kevlar</p>
     *
     * @param search Optional search string
     * @return Specification matching search string in any property value, or null to ignore
     */
    private static Specification<Equipement> hasPropertySearch(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return null;
            return cb.like(
                cb.lower(
                    cb.function(
                        "cast_to_text",
                        String.class,
                        root.get("properties")
                    )
                ),
                "%" + search.toLowerCase() + "%"
            );
        };
    }
}