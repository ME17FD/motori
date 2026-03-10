package com.motori.product_service.specification;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;
import com.motori.product_service.models.Parts;
import com.motori.product_service.service.PartService;
import com.motori.product_service.dto.PartDTO.PartFilterRequest;

/**
 * JPA Specification builder for advanced Parts filtering.
 * 
 * <p>Constructs {@link Specification<Parts>} predicates dynamically based on
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
 *   <li>propertyKey: Exact JSONB property key match</li>
 *   <li>propertyValue: JSONB property value match for key</li>
 *   <li>propertiesSearch: Comma-separated property search terms</li>
 * </ul>
 * 
 * <p><b>NULL Handling:</b> If a filter field is null/blank, it is ignored in the
 * WHERE clause. This allows optional filtering: clients can omit fields they don't
 * need to filter by. This pattern prevents unnecessary predicates from being added
 * to the Specification tree.
 * 
 * <p><b>Complex Filters:</b>
 * <ul>
 *   <li><b>Vehicle Compatibility:</b> LEFT JOIN to Compatibility table with Part matching
 *     to filter parts compatible with specific vehicle models</li>
 *   <li><b>Properties Filtering:</b> PostgreSQL JSONB functions for flexible attribute search.
 *     Supports both exact matches and key existence checks</li>
 *   <li><b>Name/Ref Search:</b> Dual-field search allows clients to find parts by product name
 *     or SKU interchangeably without separate queries</li>
 * </ul>
 * 
 * <p><b>Usage:</b>
 * <pre>
 * PartFilterRequest filter = new PartFilterRequest("oil filter", brandId, categoryId, 10, 50, vehiculeId, null, null, null);
 * Specification<Parts> spec = PartSpecification.withFilters(filter);
 * Page<Parts> results = repository.findAll(spec, pageable);
 * </pre>
 * 
 * <p><b>JPA Criteria API Features:</b>
 * <ul>
 *   <li>Dynamic predicate construction with null-safe chains</li>
 *   <li>JOIN operations for relationship-based filtering (LEFT JOIN FETCH)</li>
 *   <li>Parameter binding to prevent SQL injection</li>
 *   <li>Type-safe column references via entity attributes</li>
 *   <li>PostgreSQL JSONB operators via raw SQL functions</li>
 * </ul>
 * 
 * @see PartFilterRequest
 * @see PartService#get(PartFilterRequest, Pageable)
 * @see Parts
 * @see Compatibility
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
     * @return Specification<Parts> combining all filters
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
     * <p>This enables queries like "Get all parts for Honda CB500F".
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

    // ─── FILTRE PAR VALEUR EXACTE ─────────────────────────────
    // ?propertyKey=viscosity&propertyValue=5W30
    /**
     * Filters by exact JSONB property value match.
     * 
     * <p>Query pattern: ?propertyKey=viscosity&propertyValue=5W30
     * Uses PostgreSQL jsonb_extract_path_text() function to extract and compare:
     * <pre>
     * WHERE jsonb_extract_path_text(properties, 'viscosity') = '5W30'
     * </pre>
     * 
     * Both key and value must be provided; returns null if either is blank.
     * 
     * @param key JSONB property key name
     * @param value Expected property value
     * @return Specification matching property value, or null to ignore
     */
    private static Specification<Parts> hasPropertyValue(String key, String value) {
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

    // ─── FILTRE PAR CLÉ EXISTANTE ─────────────────────────────
    // ?hasProperty=diameter
    /**
     * Filters by JSONB property key existence.
     * 
     * <p>Query pattern: ?hasProperty=diameter
     * Uses PostgreSQL jsonb_exists() function:
     * <pre>
     * WHERE jsonb_exists(properties, 'diameter')
     * </pre>
     * 
     * Finds parts that have a specific property key, regardless of value.
     * 
     * @param key JSONB property key name to check
     * @return Specification matching property existence, or null to ignore
     */
    private static Specification<Parts> hasPropertyKey(String key) {
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

    // ─── RECHERCHE FULL-TEXT DANS PROPERTIES ──────────────────
    // ?propertiesSearch=5W30
    /**
     * Full-text search across all JSONB properties.
     * 
     * <p>Query pattern: ?propertiesSearch=5W30
     * Converts JSONB to text and performs case-insensitive substring search:
     * <pre>
     * WHERE CAST(properties AS TEXT) ILIKE '%5W30%'
     * </pre>
     * 
     * Useful for discovering parts by any property value without knowing key names.
     * 
     * @param search Optional search term to find in any property
     * @return Specification matching property search, or null to ignore
     */
    private static Specification<Parts> hasPropertySearch(String search) {
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
                "%" + search.toLowerCase() + "%"  // ← lowercase des deux côtés
            );
        };
    }
}