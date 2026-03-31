package com.motori.product_service.dto.EquipementDTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import com.motori.product_service.dto.EquipementBrandDTO.EquipementBrandResponse;
import com.motori.product_service.dto.EquipementCategoryDTO.EquipementCategoryResponse;

/**
 * Response DTO for protective equipment with complete details.
 * <p>
 * This record represents a fully populated equipment item including brand, category, and flexible properties.
 * Used in API responses for GET requests and after POST/PUT operations.
 * </p>
 * 
 * Field Descriptions:
 * <ul>
 *   <li>id: UUID - Unique identifier for the equipment item</li>
 *   <li>size: String - Equipment size value returned as string (allows future enum changes without API impact)</li>
 *   <li>color: String - Equipment color</li>
 *   <li>name: String - Equipment name/model (e.g., "Full Face Helmet X1")</li>
 *   <li>description: String (optional) - Detailed description</li>
 *   <li>price: BigDecimal - Current unit price</li>
 *   <li>brand: EquipementBrandResponse - Nested brand details (id, name, audit fields)</li>
 *   <li>category: EquipementCategoryResponse - Nested category details (id, name, parent reference)</li>
 *   <li>imageUrl: String (optional) - MinIO S3 URL to equipment image (populated after image upload)</li>
 *   <li>properties: Map<String, Object> (optional) - Flexible JSON attributes (weight, material, etc.)</li>
 *   <li>createdAt: LocalDateTime - Timestamp when equipment was created</li>
 *   <li>updatedAt: LocalDateTime - Timestamp of last modification</li>
 * </ul>
 * 
 * Nested Objects:
 * - brand: Complete EquipementBrandResponse with brand details
 * - category: Complete EquipementCategoryResponse with parent category reference
 * 
 * Image URL:
 * The imageUrl field is populated only after explicitly uploading an image via
 * POST /api/equipements/{id}/image endpoint. Initially null if no image is uploaded.
 * 
 * @param id the unique equipment identifier
 * @param size the size value as string (XS, S, M, L, XL, XXL)
 * @param color the equipment color
 * @param name the equipment name/model
 * @param description detailed description
 * @param price the unit price
 * @param brand the brand/manufacturer details
 * @param category the category classification details
 * @param imageUrl the MinIO S3 image URL
 * @param properties flexible JSON properties for schema evolution
 * @param createdAt creation timestamp
 * @param updatedAt last modification timestamp
 * 
 * @author Motori Team
 * @since 1.0
 */
public record EquipementResponse(
    UUID id,
    String size,          //just incase we rename the enum in the future, we can still return the original value as a string
    String color,
    String name,
    String description,
    BigDecimal price,
    EquipementBrandResponse brand,
    EquipementCategoryResponse category,
    String imageUrl,
    Map<String, Object> properties,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}