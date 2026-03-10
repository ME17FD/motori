package com.motori.product_service.mapper;

import org.springframework.stereotype.Component;

import com.motori.product_service.dto.CompatibilityDTO.CompatibilityRequest;
import com.motori.product_service.dto.CompatibilityDTO.CompatibilityResponse;
import com.motori.product_service.models.Compatibility;

/**
 * Mapper for converting Compatibility entities to/from DTOs.
 * 
 * <p>Handles bidirectional conversion between {@link Compatibility} JPA entities
 * and {@link CompatibilityRequest}/{@link CompatibilityResponse} DTOs.
 * 
 * <p><b>Key Responsibility:</b> Maps Compatibility relationships including nested
 * {@link PartResponse} and {@link VehiculeResponse} objects for complete API response.
 * 
 * <p><b>Conversion Patterns:</b>
 * <ul>
 *   <li><b>toResponse():</b> Entity → DTO conversion for API responses
 *     <ul>
 *       <li>Extracts UUID, audit timestamps (createdAt, updatedAt)</li>
 *       <li>Delegates nested Part/Vehicule mapping to {@link PartMapper}/{@link VehiculeMapper}</li>
 *       <li>Preserves all relationship data for client convenience</li>
 *     </ul>
 *   </li>
 *   <li><b>toEntity():</b> Request → Entity conversion for persistence
 *     <ul>
 *       <li>Part and Vehicule entities injected by CompatibilityService (not by mapper)</li>
 *       <li>Service performs FK validation before entity creation</li>
 *       <li>Returns minimal entity (relationships set by service)</li>
 *     </ul>
 *   </li>
 * </ul>
 * 
 * <p><b>Dependency Injection:</b> Uses constructor injection for mappers:
 * {@link PartMapper}, {@link VehiculeMapper}
 * 
 * @see CompatibilityRequest
 * @see CompatibilityResponse
 * @see Compatibility
 * @since 1.0
 */
@Component
public class CompatibilityMapper {

    private final PartMapper partMapper;
    private final VehiculeMapper vehiculeMapper;

    public CompatibilityMapper(PartMapper partMapper,
                               VehiculeMapper vehiculeMapper) {
        this.partMapper     = partMapper;
        this.vehiculeMapper = vehiculeMapper;
    }

    /**
     * Converts Compatibility entity to DTO response.
     * 
     * <p>Maps all fields including nested Part and Vehicule objects for complete API response.
     * This avoids requiring clients to make additional queries to fetch related entities.
     * 
     * @param compatibility Entity with Part and Vehicule relationships eagerly loaded
     * @return CompatibilityResponse with nested PartResponse and VehiculeResponse objects
     */
    public CompatibilityResponse toResponse(Compatibility compatibility) {
        return new CompatibilityResponse(
            compatibility.getId(),
            partMapper.toResponse(compatibility.getPart()),
            vehiculeMapper.toResponse(compatibility.getVehicule()),
            compatibility.getCreatedAt(),
            compatibility.getUpdatedAt()  
        );
    }

    /**
     * Converts CompatibilityRequest DTO to entity for persistence.
     * 
     * <p>Note: Part and Vehicule entities are NOT set by this mapper. They are resolved
     * and set by {@link CompatibilityService} which validates their existence before
     * creating the Compatibility entity. This ensures FK constraints are enforced at
     * service layer before persistence.
     * 
     * @param request DTO with partId and vehiculeId (FKs validated in service)
     * @return Partially initialized Compatibility entity (relationships set by service)
     */
    public Compatibility toEntity(CompatibilityRequest request) {
        return Compatibility.builder()
            // part et vehicule → injectés par le Service
            .build();
    }
} 
    

