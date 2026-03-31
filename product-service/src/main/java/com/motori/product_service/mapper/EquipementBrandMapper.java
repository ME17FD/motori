package com.motori.product_service.mapper;

import org.springframework.stereotype.Component;

import com.motori.product_service.dto.EquipementBrandDTO.EquipementBrandRequest;
import com.motori.product_service.dto.EquipementBrandDTO.EquipementBrandResponse;
import com.motori.product_service.models.EquipementBrand;

/**
 * Mapper for converting EquipementBrand entities to/from DTOs.
 * 
 * <p>Handles bidirectional conversion between {@link EquipementBrand} JPA entities
 * and {@link EquipementBrandRequest}/{@link EquipementBrandResponse} DTOs.
 * 
 * <p><b>Key Responsibility:</b> Maps equipment manufacturer data with caching context.
 * This mapper is used in service layer with {@code @Cacheable} for performance optimization.
 * 
 * <p><b>Conversion Patterns:</b>
 * <ul>
 *   <li><b>toResponse():</b> Entity → DTO conversion (cached in Redis with 10-minute TTL)
 *     <ul>
 *       <li>Maps id, name, createdAt (for sorting DESC), updatedAt</li>
 *       <li>Result is cached for subsequent identical requests</li>
 *       <li>Timestamps enable consistent ordering in list endpoints</li>
 *     </ul>
 *   </li>
 *   <li><b>toEntity():</b> Request → Entity conversion for persistence
 *     <ul>
 *       <li>Extracts name from request and initializes builder</li>
 *       <li>No direct FK mapping (brand is top-level entity, not nested)</li>
 *       <li>Service layer validates name uniqueness before creation</li>
 *     </ul>
 *   </li>
 * </ul>
 * 
 * <p><b>Caching Note:</b> Service uses {@code @Cacheable("equipement-brands")}
 * on getById() and getAll() methods. Cache is invalidated on create/update/delete.
 * 
 * @see EquipementBrandRequest
 * @see EquipementBrandResponse
 * @see EquipementBrand
 * @since 1.0
 */
@Component
public class EquipementBrandMapper {

    /**
     * Converts EquipementBrand entity to DTO response.
     * 
     * <p>Maps UUID, name, and timestamps used for sorting operations.
     * Result is cached in Redis with 10-minute TTL at service layer.
     * 
     * @param brand Entity with id, name, timestamps
     * @return EquipementBrandResponse suitable for API response and caching
     */
    public EquipementBrandResponse toResponse(EquipementBrand brand) {
        return new EquipementBrandResponse(
            brand.getId(),
            brand.getName(),
            brand.getCreatedAt(),
            brand.getUpdatedAt() 
        );
    }

    /**
     * Converts EquipementBrandRequest DTO to entity for persistence.
     * 
     * <p>Extracts brand name and initializes builder with minimal fields.
     * Service layer validates that brand name is unique before persisting.
     * 
     * @param request DTO with name (validated @NotBlank)
     * @return EquipementBrand entity ready for persistence
     */
    public EquipementBrand toEntity(EquipementBrandRequest request) {
        return EquipementBrand.builder()
            .name(request.name())
            .build();
    }
}