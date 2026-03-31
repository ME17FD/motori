package com.motori.product_service.mapper;

import org.springframework.stereotype.Component;

import com.motori.product_service.dto.PartDTO.PartRequest;
import com.motori.product_service.dto.PartDTO.PartResponse;
import com.motori.product_service.models.Parts;

/**
 * Mapper for converting Parts entities to/from DTOs.
 * 
 * <p>Handles bidirectional conversion between {@link Parts} JPA entities
 * and {@link PartRequest}/{@link PartResponse} DTOs.
 * 
 * <p><b>Key Responsibility:</b> Maps auto parts product data including unique SKU (ref),
 * nested brand/category, image URLs, and flexible JSONB properties (technical specifications).
 * 
 * <p><b>Conversion Patterns:</b>
 * <ul>
 *   <li><b>toResponse():</b> Entity → DTO conversion for API responses
 *     <ul>
 *       <li>Ref field (SKU) included for client lookup and inventory tracking</li>
 *       <li>Nested PartBrandResponse and PartCategoryResponse mapped via delegates</li>
 *       <li>Image URL preserved from MinIO storage (nullable if not uploaded)</li>
 *       <li>Properties Map preserved from JSONB column deserialization</li>
 *       <li>All audit timestamps included (createdAt, updatedAt)</li>
 *     </ul>
 *   </li>
 *   <li><b>toEntity():</b> Request → Entity conversion for persistence
 *     <ul>
 *       <li>Name, ref (SKU), description preserved as-is</li>
 *       <li>Price field preserved with BigDecimal precision</li>
 *       <li>Properties Map stored as JSONB without modification</li>
 *       <li>Brand and category FKs (IDs) NOT set by mapper; service performs FK validation</li>
 *       <li>Image URL not set (assigned later after MinIO upload, if provided)</li>
 *       <li>Service enforces unique ref constraint at database level</li>
 *     </ul>
 *   </li>
 * </ul>
 * 
 * <p><b>SKU (ref) Field:</b> Each part has globally unique SKU/part number. This field
 * is returned in response for client-side inventory lookups and compatibility matching.
 * 
 * <p><b>Dependency Injection:</b> Uses constructor injection for nested mappers:
 * {@link PartBrandMapper}, {@link PartCategoryMapper}
 * 
 * <p><b>Special Mappings:</b>
 * <ul>
 *   <li>Ref: Unique SKU preserved for inventory lookups</li>
 *   <li>Properties: Map<String, Object> ↔ JSONB (handled by JsonMapConverter)</li>
 *   <li>ImageUrl: MinIO URL management (set by service, not mapper)</li>
 * </ul>
 * 
 * @see PartRequest
 * @see PartResponse
 * @see Parts
 * @since 1.0
 */
@Component
public class PartMapper {

    private final PartBrandMapper partBrandMapper;
    private final PartCategoryMapper partCategoryMapper;

    public PartMapper(PartBrandMapper partBrandMapper,
                      PartCategoryMapper partCategoryMapper) {
        this.partBrandMapper    = partBrandMapper;
        this.partCategoryMapper = partCategoryMapper;
    }

    /**
     * Converts Parts entity to DTO response.
     * 
     * <p>Maps all part fields including unique SKU (ref), nested brand and category objects,
     * image URL from MinIO storage, and flexible JSONB properties.
     * 
     * <p><b>Special Field Conversions:</b>
     * <ul>
     *   <li>Ref: Unique SKU/part number preserved for client inventory lookups</li>
     *   <li>Brand/Category: Recursively mapped via mapper delegates</li>
     *   <li>ImageUrl: Nullable field from MinIO (null if no image uploaded)</li>
     *   <li>Properties: Deserialized from PostgreSQL JSONB column (technical specs)</li>
     * </ul>
     * 
     * @param part Entity with all relationships eagerly loaded
     * @return PartResponse with complete product details including SKU for identification
     */
    public PartResponse toResponse(Parts part) {
        return new PartResponse(
            part.getId(),
            part.getName(),
            part.getRef(),
            part.getDescription(),
            part.getPrice(),
            partBrandMapper.toResponse(part.getPartBrand()),
            partCategoryMapper.toResponse(part.getPartCategory()),
            part.getImageUrl(),
            part.getProperties(),
            part.getCreatedAt(),
            part.getUpdatedAt()
        );
    }

    /**
     * Converts PartRequest DTO to entity for persistence.
     * 
     * <p>Maps request fields to entity fields. Note that brand and category entities
     * are NOT set by mapper; they are resolved by {@link PartService} based on
     * the provided IDs in the request, and FK validation is performed at service layer.
     * 
     * <p>Image URL is not set here; it is assigned by service only after successful
     * MinIO file upload (if image is provided with the request).
     * 
     * <p><b>SKU (ref) Handling:</b> Extracted from request but uniqueness is enforced
     * by database unique constraint combined with service-layer duplicate checking.
     * 
     * @param request DTO with validated fields (@NotBlank, @NotNull, @Positive)
     * @return Parts entity ready for persistence (brand/category FKs set by service)
     */
    public Parts toEntity(PartRequest request) {
        return Parts.builder()
            .name(request.name())
            .ref(request.ref())
            .description(request.description())
            .price(request.price())
            .properties(request.properties())
            .build();
    }
}
