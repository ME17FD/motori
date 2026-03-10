package com.motori.product_service.dto.PartDTO;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Request DTO for creating or updating auto parts.
 * <p>
 * This record encapsulates all required and optional fields for auto parts creation/update.
 * Auto parts are identified by unique SKU references (ref field) to prevent duplicate part entries.
 * Images are uploaded separately via POST /api/parts/{id}/image after part creation.
 * </p>
 * 
 * Field Constraints:
 * <ul>
 *   <li>name: String - Must not be blank</li>
 *   <li>ref: String - Must not be blank and must be unique (SKU/part number identification)</li>
 *   <li>description: String (optional) - Additional part details and specifications</li>
 *   <li>price: BigDecimal - Must not be null and must be positive (> 0)</li>
 *   <li>partBrandId: UUID - Must not be null; must reference existing parts brand</li>
 *   <li>partCategoryId: UUID - Must not be null; must reference existing parts category</li>
 *   <li>properties: Map<String, Object> (optional) - Flexible JSON properties (weight, torque, dimensions, etc.)</li>
 * </ul>
 * 
 * Validation: The service layer validates that:
 * - Brand and category UUIDs reference existing entities (throws ResourceNotFoundException if not)
 * - Price is positive (throws ConstraintViolationException if not)
 * - Required fields are provided (triggers MethodArgumentNotValidException if missing)
 * - SKU (ref) is unique across all parts (throws DuplicateResourceException if duplicate)
 * 
 * SKU (Reference Number):
 * The 'ref' field serves as the part's stock keeping unit and unique part number.
 * Examples: "AC-001", "IG-SP-0001", "BR-PAD-12345"
 * Must be unique; duplicates are rejected to prevent inventory confusion.
 * 
 * Properties Field:
 * The properties map allows storing schema-flexible attributes as JSON in the database:
 * Example: {"weight": "250g", "torque": "45Nm", "thread_size": "M8", "material": "bronze"}
 * 
 * @param name the part name/designation
 * @param ref the unique SKU/part number reference
 * @param description optional detailed part description
 * @param price the unit price in the system currency
 * @param partBrandId UUID of the manufacturer/brand
 * @param partCategoryId UUID of the parts category (engine, suspension, etc.)
 * @param properties optional flexible attributes stored as JSON
 * @param propertyKey optional property key for search/filtering
 * @param propertyValue optional property value for search/filtering
 * @param hasProperty optional flag to filter parts by property presence
 * @param propertiesSearch optional JSON search criteria for properties
 * 
 * @author Motori Team
 * @since 1.0
 */
public record PartRequest(
    @NotBlank String name,
    @NotBlank String ref,
    String description,
    @NotNull @Positive BigDecimal price,
    @NotNull UUID partBrandId,
    @NotNull UUID partCategoryId,
    Map<String, Object> properties,
    String propertyKey,       
    String propertyValue,     
    String hasProperty,       
    String propertiesSearch 
) {}
