package com.motori.product_service.specification;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

/**
 * Utility class providing reusable JSONB filter predicates for JPA Specifications.
 *
 * <p>Centralizes all PostgreSQL JSONB-related query logic to avoid duplication
 * across {@link PartSpecification} and {@link EquipementSpecification}.
 * Each method returns a raw {@link Predicate} to be composed into a parent Specification.
 *
 * <p><b>Supported filter types:</b>
 * <ul>
 *   <li>Full-text search via {@code tsvector @@ tsquery} (index-backed, scalable)</li>
 *   <li>Exact key/value match via {@code jsonb_extract_path_text}</li>
 *   <li>Key existence check via {@code jsonb_exists}</li>
 * </ul>
 *
 * <p><b>Performance:</b>
 * Full-text search relies on the {@code search_vector} GIN-indexed tsvector column
 * generated automatically by PostgreSQL from the {@code properties} JSONB field.
 * This ensures O(log n) search complexity even on tables with millions of rows.
 *
 * <p><b>Usage example:</b>
 * <pre>
 * return (root, query, cb) -> JsonbSpecification.hasPropertySearch(search, root, cb);
 * </pre>
 *
 * @see PartSpecification
 * @see EquipementSpecification
 * @see CustomFunctionContributor
 * @since 1.0
 */
public class JsonbSpecification {

    private JsonbSpecification() {}

    /**
     * Full-text search predicate across all JSONB property values.
     *
     * <p>Uses the pre-computed {@code search_vector} (tsvector) column indexed with GIN
     * to perform efficient full-text matching via PostgreSQL's {@code @@} operator.
     *
     * <p>The search term is transformed into a tsquery with prefix matching ({@code :*})
     * to support partial word searches:
     * <pre>
     * "Honda"        → to_tsquery('english', 'Honda:*')
     * "Honda 10W40"  → to_tsquery('english', 'Honda:* &amp; 10W40:*')
     * </pre>
     *
     * <p>Generated SQL:
     * <pre>
     * WHERE search_vector @@ to_tsquery('english', 'Honda:*')
     * </pre>
     *
     * @param search Optional full-text search term
     * @param root   JPA root entity reference
     * @param cb     JPA CriteriaBuilder
     * @return Predicate for full-text match, or {@code null} if search is blank
     */
    public static Predicate hasPropertySearch(String search, Root<?> root, CriteriaBuilder cb) {
        if (search == null || search.isBlank()) return null;

        // Build tsquery: each word gets :* suffix for partial matching
        // "5W30 Honda" → "5W30:* & Honda:*"
        String tsQuery = search.trim()
            .replaceAll("\\s+", ":* & ") + ":*";

        return cb.isTrue(
            cb.function(
                "tsmatch",              // @@ operator registered in CustomFunctionContributor
                Boolean.class,
                root.get("searchVector"),   // GENERATED tsvector column
                cb.function(
                    "to_tsquery",
                    Object.class,
                    cb.literal("english"),  // language for stemming
                    cb.literal(tsQuery)     // ex: "Honda:*"
                )
            )
        );
    }

    /**
     * Exact JSONB property value match predicate.
     *
     * <p>Extracts the value of the given key from the JSONB {@code properties} column
     * and compares it to the expected value using PostgreSQL's {@code jsonb_extract_path_text}.
     *
     * <p>Generated SQL:
     * <pre>
     * WHERE jsonb_extract_path_text(properties, 'viscosity') = '5W30'
     * </pre>
     *
     * @param key   JSONB property key name (e.g. "viscosity")
     * @param value Expected property value (e.g. "5W30")
     * @param root  JPA root entity reference
     * @param cb    JPA CriteriaBuilder
     * @return Predicate for exact value match, or {@code null} if key or value is blank
     */
    public static Predicate hasPropertyValue(String key, String value, Root<?> root, CriteriaBuilder cb) {
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
    }

    /**
     * JSONB property key existence predicate.
     *
     * <p>Checks that the given key exists in the JSONB {@code properties} column,
     * regardless of its value, using PostgreSQL's {@code jsonb_exists} function.
     *
     * <p>Generated SQL:
     * <pre>
     * WHERE jsonb_exists(properties, 'diameter')
     * </pre>
     *
     * @param key  JSONB property key to check existence (e.g. "diameter")
     * @param root JPA root entity reference
     * @param cb   JPA CriteriaBuilder
     * @return Predicate for key existence, or {@code null} if key is blank
     */
    public static Predicate hasPropertyKey(String key, Root<?> root, CriteriaBuilder cb) {
        if (key == null || key.isBlank()) return null;

        return cb.isTrue(
            cb.function(
                "jsonb_exists",
                Boolean.class,
                root.get("properties"),
                cb.literal(key)
            )
        );
    }
}