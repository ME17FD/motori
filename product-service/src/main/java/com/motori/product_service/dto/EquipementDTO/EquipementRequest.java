package com.motori.product_service.dto.EquipementDTO;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

import com.motori.product_service.enums.EquipementSize;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Request DTO for creating or updating protective equipment items.
 * <p>
 * This record encapsulates all required and optional fields for protective gear creation/update.
 * Images are uploaded separately via POST /api/equipements/{id}/image after equipment creation.
 * </p>
 * 
 * Field Constraints:
 * <ul>
 *   <li>size: EquipementSize - Must not be null; valid values: XS, S, M, L, XL, XXL</li>
 *   <li>color: String - Must not be blank</li>
 *   <li>name: String - Must not be blank</li>
 *   <li>description: String (optional) - Additional equipment details</li>
 *   <li>price: BigDecimal - Must not be null and must be positive (> 0)</li>
 *   <li>equipementBrandId: UUID - Must not be null; must reference existing brand</li>
 *   <li>equipementCategoryId: UUID - Must not be null; must reference existing category</li>
 *   <li>properties: Map<String, Object> (optional) - Flexible JSON properties (weight, material, certifications, etc.)</li>
 * </ul>
 * 
 * Validation: The service layer validates that:
 * - Brand and category UUIDs reference existing entities (throws ResourceNotFoundException if not)
 * - Price is positive (throws ConstraintViolationException if not)
 * - Required fields are provided (triggers MethodArgumentNotValidException if missing)
 * 
 * Properties Field:
 * The properties map allows storing schema-flexible attributes as JSON in the database:
 * Example: {"weight": "500g", "material": "carbon fiber", "certification": "ECE 22.05"}
 * 
 * @param size the equipment size enum value (XS through XXL)
 * @param color the equipment color description
 * @param name the equipment name/model
 * @param description optional detailed description
 * @param price the unit price in the system currency
 * @param equipementBrandId UUID of the manufacturer/brand
 * @param equipementCategoryId UUID of the equipment category (helmets, gloves, etc.)
 * @param properties optional flexible attributes stored as JSON
 * 
 * @author Motori Team
 * @since 1.0
 */
public record EquipementRequest(
    @NotNull EquipementSize size,
    @NotBlank String color,
    @NotBlank String name,
    String description,
    @NotNull @Positive BigDecimal price,
    @NotNull UUID equipementBrandId,
    @NotNull UUID equipementCategoryId,
    Map<String, Object> properties
) {}