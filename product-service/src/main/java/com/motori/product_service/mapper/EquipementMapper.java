package com.motori.product_service.mapper;

import org.springframework.stereotype.Component;

import com.motori.product_service.dto.EquipementDTO.EquipementRequest;
import com.motori.product_service.dto.EquipementDTO.EquipementResponse;
import com.motori.product_service.models.Equipement;

/**
 * Mapper for converting Equipement entities to/from DTOs.
 * 
 * <p>Handles bidirectional conversion between {@link Equipement} JPA entities
 * and {@link EquipementRequest}/{@link EquipementResponse} DTOs.
 * 
 * <p><b>Key Responsibility:</b> Maps equipment product data including nested brand/category,
 * size enum conversion, image URLs, and flexible JSONB properties.
 * 
 * <p><b>Conversion Patterns:</b>
 * <ul>
 *   <li><b>toResponse():</b> Entity → DTO conversion for API responses
 *     <ul>
 *       <li>Size enum converted to String for API stability</li>
 *       <li>Nested EquipementBrandResponse and EquipementCategoryResponse mapped via delegates</li>
 *       <li>Image URL preserved from MinIO storage (nullable if not uploaded)</li>
 *       <li>Properties Map preserved from JSONB column deserialization</li>
 *       <li>All audit timestamps included (createdAt, updatedAt)</li>
 *     </ul>
 *   </li>
 *   <li><b>toEntity():</b> Request → Entity conversion for persistence
 *     <ul>
 *       <li>Size enum extracted directly (validated in request)</li>
 *       <li>Color, name, description preserved as-is</li>
 *       <li>Price field preserved with BigDecimal precision</li>
 *       <li>Properties Map stored as JSONB without modification</li>
 *       <li>Brand and category FKs (IDs) NOT set by mapper; service performs FK validation</li>
 *       <li>Image URL not set (assigned later after MinIO upload, if provided)</li>
 *     </ul>
 *   </li>
 * </ul>
 * 
 * <p><b>Dependency Injection:</b> Uses constructor injection for nested mappers:
 * {@link EquipementBrandMapper}, {@link EquipementCategoryMapper}
 * 
 * <p><b>Special Mappings:</b>
 * <ul>
 *   <li>Size: Enum → String (leverages EquipementSize.name())</li>
 *   <li>Properties: Map<String, Object> ↔ JSONB (handled by JsonMapConverter)</li>
 *   <li>ImageUrl: MinIO URL management (set by service, not mapper)</li>
 * </ul>
 * 
 * @see EquipementRequest
 * @see EquipementResponse
 * @see Equipement
 * @since 1.0
 */
@Component
public class EquipementMapper{

    private final EquipementBrandMapper equipementBrandMapper;
    private final EquipementCategoryMapper equipementCategoryMapper;

    public EquipementMapper(EquipementBrandMapper equipementBrandMapper,
                            EquipementCategoryMapper equipementCategoryMapper) {
        this.equipementBrandMapper    = equipementBrandMapper;
        this.equipementCategoryMapper = equipementCategoryMapper;
    }

    /**
     * Converts Equipement entity to DTO response.
     * 
     * <p>Maps all equipment fields including nested brand and category objects,
     * image URL from MinIO storage, and flexible JSONB properties.
     * 
     * <p><b>Special Field Conversions:</b>
     * <ul>
     *   <li>Size: Enum.name() converts to String (e.g., XL as "XL") for API stability</li>
     *   <li>Brand/Category: Recursively mapped via mapper delegates</li>
     *   <li>ImageUrl: Nullable field from MinIO (null if no image uploaded)</li>
     *   <li>Properties: Deserialized from PostgreSQL JSONB column</li>
     * </ul>
     * 
     * @param equipement Entity with all relationships eagerly loaded
     * @return EquipementResponse with complete product details
     */
    public EquipementResponse toResponse(Equipement equipement) {
        return new EquipementResponse(
            equipement.getId(),
            equipement.getSize().name(),
            equipement.getColor(),
            equipement.getName(),
            equipement.getDescription(),
            equipement.getPrice(),
            equipementBrandMapper.toResponse(equipement.getEquipementBrandId()),
            equipementCategoryMapper.toResponse(equipement.getEquipementCategoryId()),
            equipement.getImageUrl(),
            equipement.getProperties(),
            equipement.getCreatedAt(),
            equipement.getUpdatedAt()
        );
    }

    /**
     * Converts EquipementRequest DTO to entity for persistence.
     * 
     * <p>Maps request fields to entity fields. Note that brand and category entities
     * are NOT set by mapper; they are resolved by {@link EquipementService} based on
     * the provided IDs in the request, and FK validation is performed at service layer.
     * 
     * <p>Image URL is not set here; it is assigned by service only after successful
     * MinIO file upload (if image is provided with the request).
     * 
     * @param request DTO with validated fields (@NotBlank, @NotNull, @Positive)
     * @return Equipement entity ready for persistence (brand/category FKs set by service)
     */
    public Equipement toEntity(EquipementRequest request) {
        return Equipement.builder()
            .size(request.size())
            .color(request.color())
            .name(request.name())
            .description(request.description())
            .price(request.price())
            .properties(request.properties())
            .build();   
    }
}
