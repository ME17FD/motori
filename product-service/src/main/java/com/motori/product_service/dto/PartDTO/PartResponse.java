package com.motori.product_service.dto.PartDTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import com.motori.product_service.dto.PartBrandDTO.PartBrandResponse;
import com.motori.product_service.dto.PartCategoryDTO.PartCategoryResponse;

/**
 * Response DTO for auto parts with complete details including brand, category, and specifications.
 * <p>
 * This record represents a fully populated auto part including manufacturer, classification, pricing,
 * and flexible technical specifications. Used in API responses for GET requests and after POST/PUT operations.
 * </p>
 * 
 * Field Descriptions:
 * <ul>
 *   <li>id: UUID - Unique identifier for the auto part</li>
 *   <li>name: String - Part name/designation (e.g., "Spark Plug NGK", "Air Filter K&N")</li>
 *   <li>ref: String - Unique SKU/part number reference for inventory identification</li>
 *   <li>description: String (optional) - Detailed part description</li>
 *   <li>price: BigDecimal - Current unit price</li>
 *   <li>brand: PartBrandResponse - Nested brand details (id, name, audit fields)</li>
 *   <li>category: PartCategoryResponse - Nested category details (id, name, parent reference)</li>
 *   <li>imageUrl: String (optional) - MinIO S3 URL to part image (populated after image upload)</li>
 *   <li>properties: Map<String, Object> (optional) - Flexible JSON attributes (weight, torque, material, etc.)</li>
 *   <li>createdAt: LocalDateTime - Timestamp when part was created</li>
 *   <li>updatedAt: LocalDateTime - Timestamp of last modification</li>
 * </ul>
 * 
 * SKU Reference:
 * The 'ref' field is the part's unique stock keeping unit and part number.
 * Used for inventory tracking and part identification in orders.
 * 
 * Nested Objects:
 * - brand: Complete PartBrandResponse with manufacturer details
 * - category: Complete PartCategoryResponse with parent category reference for hierarchical browsing
 * 
 * Image URL:
 * The imageUrl field is populated only after explicitly uploading an image via
 * POST /api/parts/{id}/image endpoint. Initially null if no image is uploaded.
 * 
 * Compatibility Information:
 * While this DTO doesn't explicitly include compatible vehicles, parts can be linked to vehicles
 * through the Compatibility entity. Query vehicle compatibility via:
 * GET /api/compatibilities (filter by partId)
 * 
 * @param id the unique part identifier
 * @param name the part name/designation
 * @param ref the unique SKU/part number
 * @param description the part description
 * @param price the unit price
 * @param brand the brand/manufacturer details
 * @param category the category classification details
 * @param imageUrl the MinIO S3 image URL
 * @param properties flexible JSON properties for technical specifications
 * @param createdAt creation timestamp
 * @param updatedAt last modification timestamp
 * 
 * @author Motori Team
 * @since 1.0
 */
public record PartResponse(
    UUID id,
    String name,
    String ref,
    String description,
    BigDecimal price,
    PartBrandResponse brand,           
    PartCategoryResponse  category,     
    String imageUrl,
    Map<String, Object> properties,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
    
) {}
