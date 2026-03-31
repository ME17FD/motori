package com.motori.product_service.config;

import org.hibernate.boot.model.FunctionContributions;
import org.hibernate.boot.model.FunctionContributor;
import org.hibernate.type.StandardBasicTypes;

/**
 * Registers custom PostgreSQL functions and operators into Hibernate's function registry.
 *
 * <p>Hibernate does not natively support PostgreSQL-specific operators such as
 * {@code @@} (tsvector match) used in full-text search queries. This contributor
 * bridges that gap by registering these operators as named functions callable
 * via {@code cb.function(...)} in JPA Criteria API.
 *
 * <p><b>Registered functions:</b>
 * <ul>
 *   <li>{@code tsmatch} → maps to PostgreSQL {@code ?1 @@ ?2} operator</li>
 * </ul>
 *
 * <p><b>Auto-loading:</b> Hibernate discovers this class automatically via the
 * Java SPI mechanism defined in:
 * {@code META-INF/services/org.hibernate.boot.model.FunctionContributor}
 *
 * @see JsonbSpecification#hasPropertySearch(String, jakarta.persistence.criteria.Root)
 * @since 1.0
 */
public class CustomFunctionContributor implements FunctionContributor {

    /**
     * Contributes custom SQL function patterns to Hibernate's function registry.
     *
     * @param functionContributions Hibernate's function contribution context
     */
    @Override
    public void contributeFunctions(FunctionContributions functionContributions) {

        // Registers PostgreSQL @@ operator as "tsmatch"
        // Usage: cb.function("tsmatch", Boolean.class, searchVectorExpr, tsqueryExpr)
        // Generates SQL: search_vector @@ to_tsquery('english', 'honda:*')
        functionContributions.getFunctionRegistry().registerPattern(
            "tsmatch",
            "(?1 @@ ?2)",
            functionContributions.getTypeConfiguration()
                .getBasicTypeRegistry()
                .resolve(StandardBasicTypes.BOOLEAN)
        );
    }
}