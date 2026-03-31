package com.motori.product_service.mapper;

import org.springframework.stereotype.Component;


import com.motori.product_service.dto.InventoryDTO.InventoryRequest;
import com.motori.product_service.dto.InventoryDTO.InventoryResponse;
import com.motori.product_service.models.Inventory;

/**
 * Mapper for converting Inventory entities to/from DTOs.
 * 
 * <p>Handles bidirectional conversion between {@link Inventory} JPA entities
 * and {@link InventoryRequest}/{@link InventoryResponse} DTOs.
 * 
 * <p><b>Key Responsibility:</b> Maps inventory stock items with flexible Part XOR Equipment
 * linking. This critical business rule ensures each inventory item tracks exactly ONE product
 * type (either a Part OR Equipment, never both).
 * 
 * <p><b>Conversion Patterns:</b>
 * <ul>
 *   <li><b>toResponse():</b> Entity → DTO conversion with conditional nesting
 *     <ul>
 *       <li>Checks inventory.getPart() → if non-null, maps to PartResponse</li>
 *       <li>Checks inventory.getEquipement() → if non-null, maps to EquipementResponse</li>
 *       <li>Exactly ONE of part or equipement will be non-null (XOR constraint)</li>
 *       <li>Maps payment status (PAID/UNPAID/PARTIALLY_PAID/PENDING)</li>
 *       <li>Maps soldAt timestamp (null while available, populated when sold)</li>
 *       <li>Maps expiredAt for perishable item tracking</li>
 *     </ul>
 *   </li>
 *   <li><b>toEntity():</b> Request → Entity conversion for persistence
 *     <ul>
 *       <li>Extracts optional expiredAt field</li>
 *       <li>Part and Equipment entities NOT set by mapper</li>
 *       <li>Service layer validates XOR constraint: (partId != null && equipementId == null) || vice versa</li>
 *       <li>Service sets appropriate entity before persistence</li>
 *     </ul>
 *   </li>
 * </ul>
 * 
 * <p><b>Flexible Linking Pattern:</b> Inventory uses discriminated union pattern:
 * <ul>
 *   <li>If partId FK is set: inventory represents a Part stock item</li>
 *   <li>If equipementId FK is set: inventory represents an Equipment stock item</li>
 *   <li>Never both FKs set (enforced by service validation)</li>
 * </ul>
 * 
 * <p><b>Dependency Injection:</b> Uses constructor injection for nested mappers:
 * {@link PartMapper}, {@link EquipementMapper}
 * 
 * @see InventoryRequest
 * @see InventoryResponse
 * @see Inventory
 * @since 1.0
 */
@Component
public class InventoryMapper {

    private final PartMapper partMapper;
    private final EquipementMapper equipementMapper;

    public InventoryMapper(PartMapper partMapper,
                           EquipementMapper equipementMapper) {
        this.partMapper       = partMapper;
        this.equipementMapper = equipementMapper;
    }

    /**
     * Converts Inventory entity to DTO response with flexible product linking.
     * 
     * <p><b>Flexible Linking Logic:</b>
     * <ul>
     *   <li>If inventory.getPart() != null → maps to PartResponse, equipement=null</li>
     *   <li>If inventory.getEquipement() != null → maps to EquipementResponse, part=null</li>
     *   <li>Exactly ONE will be non-null (guaranteed by service XOR validation)</li>
     * </ul>
     * 
     * <p>This allows clients to handle either product type in a single response structure,
     * checking which field is non-null to determine product category.
     * 
     * @param inventory Entity with either Part OR Equipment relationship populated
     * @return InventoryResponse with flexible product nesting and status tracking
     */
    public InventoryResponse toResponse(Inventory inventory) {
    return new InventoryResponse(
        inventory.getId(),
        inventory.getPart() != null
            ? partMapper.toResponse(inventory.getPart())
            : null,
        inventory.getEquipement() != null
            ? equipementMapper.toResponse(inventory.getEquipement())
            : null,
        inventory.getExpiredAt(),
        inventory.getSoldAt(),
        inventory.getPaymentStatus().name(),
        inventory.getCreatedAt(),
        inventory.getUpdatedAt() 
        
    );
}
    /**
     * Converts InventoryRequest DTO to entity for persistence.
     * 
     * <p>Extracts only optional expiredAt field for perishable item tracking.
     * Part and Equipment entities are NOT set by mapper.
     * 
     * <p><b>XOR Constraint Enforcement:</b> Service layer validates that exactly ONE
     * of partId or equipementId is provided in the request:
     * <pre>
     * (partId != null && equipementId == null) || (partId == null && equipementId != null)
     * </pre>
     * If violated, service throws IllegalArgumentException.
     * 
     * @param request DTO with optional expiredAt and one of partId/equipementId
     * @return Inventory entity ready for persistence (product FK and validation by service)
     */
    public Inventory toEntity(InventoryRequest request) {
        return Inventory.builder()
            .expiredAt(request.expiredAt())
            .build();
    }
}

