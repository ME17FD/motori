package com.motori.product_service.mapper;

import java.util.UUID;

import org.springframework.stereotype.Component;

import com.motori.product_service.dto.EquipementCategoryDTO.EquipementCategoryRequest;
import com.motori.product_service.dto.EquipementCategoryDTO.EquipementCategoryResponse;
import com.motori.product_service.models.EquipementCategory;

/**
 * Mapper for converting EquipementCategory entities to/from DTOs.
 * 
 * <p>Handles bidirectional conversion between {@link EquipementCategory} JPA entities
 * and {@link EquipementCategoryRequest}/{@link EquipementCategoryResponse} DTOs.
 * 
 * <p><b>Key Responsibility:</b> Maps hierarchical equipment categories with parent
 * category name resolution to prevent N+1 queries.
 * 
 * <p><b>Conversion Patterns:</b>
 * <ul>
 *   <li><b>toResponse():</b> Entity → DTO conversion with parent name resolution
 *     <ul>
 *       <li>Checks if parent category exists (self-reference field)</li>
 *       <li>Extracts parent UUID and name to populate response fields</li>
 *       <li>Prevents recursive loading of full parent object (N+1 problem)</li>
 *       <li>Maps id, name, parentCategoryId, parentCategoryName, timestamps</li>
 *     </ul>
 *   </li>
 *   <li><b>toEntity():</b> Request → Entity conversion for persistence
 *     <ul>
 *       <li>Extracts category name from request</li>
 *       <li>Service layer validates parent existence and prevents self-reference</li>
 *       <li>Parent category entity set by service (not by mapper)</li>
 *     </ul>
 *   </li>
 * </ul>
 * 
 * <p><b>Hierarchy Pattern:</b> Categories use self-referential FK (parentCategoryId → EquipementCategory.id)
 * for building tree structures (e.g., Protective Gear → Helmets → Full-Face Helmets).
 * The mapper includes parentCategoryName to avoid full parent object loading.
 * 
 * @see EquipementCategoryRequest
 * @see EquipementCategoryResponse
 * @see EquipementCategory
 * @since 1.0
 */
@Component
public class EquipementCategoryMapper {

    /**
     * Converts EquipementCategory entity to DTO response.
     * 
     * <p>Extracts category hierarchy information with parent name resolution.
     * The parentCategoryName field is included to prevent N+1 queries: clients can display
     * category paths (e.g., "Protective Gear > Helmets") without additional database queries
     * to fetch parent details.
     * 
     * <p>Note: Does NOT recursively load grandparent categories. If full hierarchy
     * traversal is needed, use dedicated category tree endpoint.
     * 
     * @param category Entity with optional parent reference
     * @return EquipementCategoryResponse with parent name populated (if parent exists)
     */
    public EquipementCategoryResponse toResponse(EquipementCategory category) {

        UUID parentId = null;
        String parentName = null;

        if (category.getParent() != null) {
            parentId   = category.getParent().getId();
            parentName = category.getParent().getName();
        }

        return new EquipementCategoryResponse(
            category.getId(),
            category.getName(),
            parentId,
            parentName,
            category.getCreatedAt(),
            category.getUpdatedAt() 
        );
    }

    /**
     * Converts EquipementCategoryRequest DTO to entity for persistence.
     * 
     * <p>Extracts category name and initializes builder. Parent category entity
     * is NOT set by mapper; it is resolved and set by {@link EquipementCategoryService}
     * which validates:
     * <ul>
     *   <li>Parent category exists in database (if parentCategoryId provided)</li>
     *   <li>Category does not reference itself (prevents self-loops)</li>
     *   <li>No circular references in hierarchy (A → B → A)</li>
     * </ul>
     * 
     * @param request DTO with name and optional parentCategoryId
     * @return EquipementCategory entity ready for persistence (parent set by service)
     */
    public EquipementCategory toEntity(EquipementCategoryRequest request) {
        return EquipementCategory.builder()
            .name(request.name())
            .build();
    }
}
