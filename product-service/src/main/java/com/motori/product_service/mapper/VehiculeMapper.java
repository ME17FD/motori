package com.motori.product_service.mapper;

import org.springframework.stereotype.Component;

import com.motori.product_service.dto.VehiculeDTO.VehiculeRequest;
import com.motori.product_service.dto.VehiculeDTO.VehiculeResponse;
import com.motori.product_service.models.Vehicule;

/**
 * Mapper for converting Vehicule entities to/from DTOs.
 * 
 * <p>Handles bidirectional conversion between {@link Vehicule} JPA entities
 * and {@link VehiculeRequest}/{@link VehiculeResponse} DTOs.
 * 
 * <p><b>Key Responsibility:</b> Maps motorcycle/vehicle model data including nested brand
 * information for complete vehicle identification.
 * 
 * <p><b>Conversion Patterns:</b>
 * <ul>
 *   <li><b>toResponse():</b> Entity → DTO conversion for API responses
 *     <ul>
 *       <li>Maps Vehicle UUID, model designation, and name</li>
 *       <li>Nested VehiculeBrandResponse mapped via {@link VehiculeBrandMapper}</li>
 *       <li>Brand nesting enables complete vehicle identification without client queries</li>
 *       <li>Maps audit timestamps (createdAt, updatedAt)</li>
 *     </ul>
 *   </li>
 *   <li><b>toEntity():</b> Request → Entity conversion for persistence
 *     <ul>
 *       <li>Maps model and name fields directly</li>
 *       <li>VehiculeBrand entity NOT set by mapper</li>
 *       <li>Service layer validates brand existence and sets reference</li>
 *     </ul>
 *   </li>
 * </ul>
 * 
 * <p><b>Dependency Injection:</b> Uses constructor injection for nested mapper:
 * {@link VehiculeBrandMapper}
 * 
 * @see VehiculeRequest
 * @see VehiculeResponse
 * @see Vehicule
 * @since 1.0
 */
@Component
public class VehiculeMapper {

    private final VehiculeBrandMapper vehiculeBrandMapper;

    public VehiculeMapper(VehiculeBrandMapper vehiculeBrandMapper) {
        this.vehiculeBrandMapper = vehiculeBrandMapper;
    }

    /**
     * Converts Vehicule entity to DTO response.
     * 
     * <p>Maps all vehicle fields including nested brand information.
     * Brand nesting enables clients to display complete vehicle identification
     * (e.g., "Honda CB500F") without additional queries.
     * 
     * @param vehicule Entity with brand reference eagerly loaded
     * @return VehiculeResponse with complete vehicle and brand details
     */
    public VehiculeResponse toResponse(Vehicule vehicule) {
        return new VehiculeResponse(
            vehicule.getId(),
            vehicule.getModel(),
            vehicule.getName(),
            vehiculeBrandMapper.toResponse(vehicule.getVehiculeBrandId()),
            vehicule.getCreatedAt(),
            vehicule.getUpdatedAt()
        );
    }

    /**
     * Converts VehiculeRequest DTO to entity for persistence.
     * 
     * <p>Extracts model and name fields. VehiculeBrand entity is NOT set by mapper;
     * it is resolved and set by {@link VehiculeService} which validates that the
     * referenced brand exists in the database.
     * 
     * @param request DTO with model, name, and vehiculeBrandId
     * @return Vehicule entity ready for persistence (brand set by service)
     */
    public Vehicule toEntity(VehiculeRequest request) {
        return Vehicule.builder()
            .model(request.model())
            .name(request.name())
            .build();
    }
} 
    

