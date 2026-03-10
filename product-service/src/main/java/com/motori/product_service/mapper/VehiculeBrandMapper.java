package com.motori.product_service.mapper;

import org.springframework.stereotype.Component;

import com.motori.product_service.dto.VehiculeBrandDTO.VehiculeBrandRequest;
import com.motori.product_service.dto.VehiculeBrandDTO.VehiculeBrandResponse;
import com.motori.product_service.models.VehiculeBrand;

/**
 * Mapper for converting VehiculeBrand entities to/from DTOs.
 * 
 * <p>Handles bidirectional conversion between {@link VehiculeBrand} JPA entities
 * and {@link VehiculeBrandRequest}/{@link VehiculeBrandResponse} DTOs.
 * 
 * <p><b>Key Responsibility:</b> Maps motorcycle/vehicle manufacturer data with caching context.
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
 * <p><b>Caching Note:</b> Service uses {@code @Cacheable("vehicule-brands")}
 * on getById() and getAll() methods. Cache is invalidated on create/update/delete.
 * 
 * @see VehiculeBrandRequest
 * @see VehiculeBrandResponse
 * @see VehiculeBrand
 * @since 1.0
 */
@Component
public class VehiculeBrandMapper {

    /**
     * Converts VehiculeBrand entity to DTO response.
     * 
     * <p>Maps UUID, name, and timestamps used for sorting operations.
     * Result is cached in Redis with 10-minute TTL at service layer.
     * 
     * @param brand Entity with id, name, timestamps
     * @return VehiculeBrandResponse suitable for API response and caching
     */
    public VehiculeBrandResponse toResponse(VehiculeBrand brand) {
        return new VehiculeBrandResponse(
            brand.getId(),
            brand.getName(),
            brand.getCreatedAt(),
            brand.getUpdatedAt()  
        );
    }

    /**
     * Converts VehiculeBrandRequest DTO to entity for persistence.
     * 
     * <p>Extracts brand name and initializes builder with minimal fields.
     * Service layer validates that brand name is unique before persisting.
     * 
     * @param request DTO with name (validated @NotBlank)
     * @return VehiculeBrand entity ready for persistence
     */
    public VehiculeBrand toEntity(VehiculeBrandRequest request) {
        return VehiculeBrand.builder()
            .name(request.name())
            .build();
    }
}