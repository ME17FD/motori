package com.motori.product_service.dto.EquipementDTO;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Filter criteria record for querying equipment with JpaSpecifications.
 * <p>
 * All fields are optional — null values are ignored in filtering.
 * Multiple filters are combined with AND logic.
 * </p>
 *
 * @param name             optional partial name match (case-insensitive)
 * @param brandId          optional brand UUID filter
 * @param categoryId       optional category UUID filter
 * @param minPrice         optional minimum price threshold (inclusive)
 * @param maxPrice         optional maximum price threshold (inclusive)
 * @param size             optional size enum filter (XS, S, M, L, XL, XXL)
 * @param propertyKey      optional JSON property key for exact value match (used with propertyValue)
 * @param propertyValue    optional JSON property value (used with propertyKey)
 * @param hasProperty      optional JSON property key that must exist on the equipment
 * @param propertiesSearch optional full-text search string across all JSON property values
 *
 * @author Motori Team
 * @since 1.0
 */
public record EquipementFilterRequest(
    String name,
    UUID brandId,
    UUID categoryId,
    BigDecimal minPrice,
    BigDecimal maxPrice,
    String size,
    String propertyKey,       // filtre par clé + valeur exacte (ex: material=kevlar)
    String propertyValue,     // utilisé avec propertyKey
    String hasProperty,       // filtre par clé existante (ex: weight)
    String propertiesSearch   // recherche full-text dans les properties
) {}