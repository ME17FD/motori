package com.motori.product_service.dto.PartDTO;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Filter criteria record for querying auto parts with JpaSpecifications.
 * <p>
 * This record encapsulates optional filtering parameters used with dynamic SQL queries via Spring Data Specifications.
 * All fields are optional (null values are ignored in filtering). Multiple filters are combined with AND logic.
 * </p>
 * 
 * Filter Field Descriptions:
 * <ul>
 *   <li>name: String (optional) - Partial substring match on part name (case-insensitive)</li>
 *   <li>brandId: UUID (optional) - Filter by specific parts brand UUID</li>
 *   <li>categoryId: UUID (optional) - Filter by specific parts category UUID</li>
 *   <li>minPrice: BigDecimal (optional) - Minimum price filter (inclusive, price >= minPrice)</li>
 *   <li>maxPrice: BigDecimal (optional) - Maximum price filter (inclusive, price <= maxPrice)</li>
 *   <li>vehiculeId: UUID (optional) - Filter parts compatible with a specific vehicle/motorcycle model</li>
 * </ul>
 * 
 * Filter Combination Logic:
 * When multiple filters are provided, they are combined with AND logic:
 * - name = "spark" AND brandId = UUID AND price >= minPrice AND vehiculeId = UUID
 * 
 * Vehicle Compatibility Filter:
 * The vehiculeId filter enables finding all parts compatible with a specific vehicle model
 * by querying the Compatibility join table.
 * 
 * Null Handling:
 * Null/absent filter fields are ignored in the specification predicate construction.
 * If all filters are null, all active parts are returned.
 * 
 * @param name optional partial name match substring
 * @param brandId optional brand UUID filter
 * @param categoryId optional category UUID filter
 * @param minPrice optional minimum price threshold
 * @param maxPrice optional maximum price threshold
 * @param vehiculeId optional vehicle UUID to find compatible parts
 * 
 * @author Motori Team
 * @since 1.0
 */
public record PartFilterRequest(
    String name,           
    UUID brandId,          
    UUID categoryId,       
    BigDecimal minPrice,   
    BigDecimal maxPrice,  
    UUID vehiculeId,
    String propertyKey,       // filtre par clé + valeur exacte (ex: viscosity=5W30)
    String propertyValue,     // utilisé avec propertyKey
    String hasProperty,       // filtre par clé existante (ex: diameter)
    String propertiesSearch        
) {}
