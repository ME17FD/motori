package com.motori.product_service.controller;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.motori.product_service.dto.EquipementDTO.EquipementFilterRequest;
import com.motori.product_service.dto.EquipementDTO.EquipementRequest;
import com.motori.product_service.dto.EquipementDTO.EquipementResponse;
import com.motori.product_service.service.EquipementService;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST controller for managing protective equipment operations.
 * <p>
 * Handles CRUD operations for protective gear (helmets, gloves, jackets, boots, etc.) with support for:
 * <ul>
 *   <li>Complex filtering by name, brand, category, price range, size and JSON properties</li>
 *   <li>Image upload and deletion to MinIO S3 storage</li>
 *   <li>Dynamic property updates for flexible equipment attributes</li>
 * </ul>
 * </p>
 *
 * Endpoints:
 * <ul>
 *   <li>POST   /api/equipements                  - Create a new equipment item</li>
 *   <li>GET    /api/equipements                  - List with advanced filtering and pagination</li>
 *   <li>GET    /api/equipements/{id}             - Retrieve a specific equipment item</li>
 *   <li>PUT    /api/equipements/{id}             - Update equipment details</li>
 *   <li>DELETE /api/equipements/{id}             - Soft-delete equipment and associated image</li>
 *   <li>POST   /api/equipements/{id}/image       - Upload equipment image to MinIO</li>
 *   <li>DELETE /api/equipements/{id}/image       - Delete equipment image from MinIO</li>
 *   <li>PATCH  /api/equipements/{id}/properties  - Update flexible JSON specifications</li>
 * </ul>
 *
 * Authentication: OAuth2 JWT Bearer token required (Keycloak)
 *
 * @author Motori Team
 * @since 1.0
 */
@RestController
@RequestMapping("/api/equipements")
@RequiredArgsConstructor
public class EquipementController {

    private final EquipementService service;

    /**
     * Creates a new protective equipment item.
     * <p>
     * Validates that the specified brand and category exist before creation.
     * Image upload is handled separately via the uploadImage() endpoint after creation.
     * </p>
     * @param request the {@link EquipementRequest} containing equipment details
     * @return {@link ResponseEntity} with HTTP 201 CREATED and the created {@link EquipementResponse}
     */
    @PostMapping
    @Operation(summary = "Créer un nouvel équipement")
    public ResponseEntity<EquipementResponse> create(
            @RequestBody @Valid EquipementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    /**
     * Retrieves a specific equipment item by its unique identifier.
     *
     * @param id the unique UUID of the equipment item
     * @return {@link ResponseEntity} with HTTP 200 OK and the {@link EquipementResponse}
     */
    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un équipement par son ID")
    public ResponseEntity<EquipementResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    /**
     * Lists equipment with advanced filtering and pagination.
     * <p>
     * Supports multiple filter criteria combined with AND logic:
     * <ul>
     *   <li>name: Partial string match on equipment name (case-insensitive)</li>
     *   <li>brandId: Filter by specific equipment brand UUID</li>
     *   <li>categoryId: Filter by specific equipment category UUID</li>
     *   <li>minPrice: Filter items with price >= minPrice</li>
     *   <li>maxPrice: Filter items with price <= maxPrice</li>
     *   <li>size: Filter by equipment size enum (XS, S, M, L, XL, XXL)</li>
     *   <li>propertyKey + propertyValue: Filter by exact JSON property value (ex: material=kevlar)</li>
     *   <li>hasProperty: Filter equipment that have a specific JSON property key</li>
     *   <li>propertiesSearch: Full-text search across all JSON property values</li>
     * </ul>
     * </p>
     * @param name             optional partial match on equipment name
     * @param brandId          optional UUID of the brand
     * @param categoryId       optional UUID of the category
     * @param minPrice         optional minimum price threshold (inclusive)
     * @param maxPrice         optional maximum price threshold (inclusive)
     * @param size             optional size value (XS, S, M, L, XL, XXL)
     * @param propertyKey      optional JSON property key (used with propertyValue)
     * @param propertyValue    optional JSON property value (used with propertyKey)
     * @param hasProperty      optional JSON property key that must exist
     * @param propertiesSearch optional full-text search in JSON properties
     * @param page             page number (default 0)
     * @param size_            page size (default 20, max 100)
     * @return {@link ResponseEntity} with HTTP 200 OK and a filtered {@link Page} of {@link EquipementResponse}
     */
    @GetMapping
    @Operation(summary = "Lister les équipements avec filtres avancés")
    public ResponseEntity<Page<EquipementResponse>> getAll(
        @RequestParam(required = false) String name,
        @RequestParam(required = false) UUID brandId,
        @RequestParam(required = false) UUID categoryId,
        @RequestParam(required = false) BigDecimal minPrice,
        @RequestParam(required = false) BigDecimal maxPrice,
        @RequestParam(required = false) String size,
        @RequestParam(required = false) String propertyKey,
        @RequestParam(required = false) String propertyValue,
        @RequestParam(required = false) String hasProperty,
        @RequestParam(required = false) String propertiesSearch,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int pageSize) {

        PageRequest pageable = PageRequest.of(
            page,
            Math.min(pageSize, 100),
            Sort.by(Sort.Direction.DESC, "createdAt")
        );

        EquipementFilterRequest filter = new EquipementFilterRequest(
            name, brandId, categoryId, minPrice, maxPrice, size,
            propertyKey, propertyValue, hasProperty, propertiesSearch
        );
        return ResponseEntity.ok(service.getAll(filter, pageable));
    }

    /**
     * Updates an existing equipment item with new details.
     * <p>
     * Re-validates the brand and category references if they are changed.
     * Image and properties updates are handled separately via dedicated endpoints.
     * </p>
     * @param id      the unique UUID of the equipment item to update
     * @param request the {@link EquipementRequest} containing updated equipment details
     * @return {@link ResponseEntity} with HTTP 200 OK and the updated {@link EquipementResponse}
     */
    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour un équipement")
    public ResponseEntity<EquipementResponse> update(
            @PathVariable UUID id,
            @RequestBody @Valid EquipementRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    /**
     * Soft-deletes an equipment item and automatically deletes its associated image from MinIO.
     * <p>
     * The equipment record is marked with a deletedAt timestamp for audit purposes.
     * </p>
     * @param id the unique UUID of the equipment item to delete
     * @return {@link ResponseEntity} with HTTP 204 NO_CONTENT status
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un équipement (soft delete)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Uploads a new image for an equipment item to MinIO S3 storage.
     * <p>
     * If the equipment already has an image, it is automatically deleted before uploading the new one.
     * </p>
     * @param id   the unique UUID of the equipment item
     * @param file the image file to upload (multipart/form-data)
     * @return {@link ResponseEntity} with HTTP 200 OK and the updated {@link EquipementResponse}
     */
    @PostMapping("/{id}/image")
    @Operation(summary = "Uploader une image pour un équipement")
    public ResponseEntity<EquipementResponse> uploadImage(
        @PathVariable UUID id,
        @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(service.uploadImage(id, file));
    }

    /**
     * Deletes the image associated with an equipment item from MinIO S3 storage.
     *
     * @param id the unique UUID of the equipment item
     * @return {@link ResponseEntity} with HTTP 200 OK and the updated {@link EquipementResponse}
     */
    @DeleteMapping("/{id}/image")
    @Operation(summary = "Supprimer l'image d'un équipement")
    public ResponseEntity<EquipementResponse> deleteImage(@PathVariable UUID id) {
        return ResponseEntity.ok(service.deleteImage(id));
    }

    /**
     * Partially updates the flexible JSON properties of an equipment item.
     * <p>
     * Properties are stored as JSONB in PostgreSQL and support any key-value structure.
     * The provided map fully replaces the existing properties.
     * </p>
     * @param id         the unique UUID of the equipment item
     * @param properties a map of property key-value pairs (ex: {"material": "kevlar", "weight": "800g"})
     * @return {@link ResponseEntity} with HTTP 200 OK and the updated {@link EquipementResponse}
     */
    @PatchMapping("/{id}/properties")
    @Operation(summary = "Mettre à jour les propriétés JSON d'un équipement")
    public ResponseEntity<EquipementResponse> updateProperties(
        @PathVariable UUID id,
        @RequestBody Map<String, Object> properties) {
        return ResponseEntity.ok(service.updateProperties(id, properties));
    }
}