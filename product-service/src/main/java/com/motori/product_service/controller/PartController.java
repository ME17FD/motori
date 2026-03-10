package com.motori.product_service.controller;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import com.motori.product_service.dto.PartDTO.PartFilterRequest;
import com.motori.product_service.dto.PartDTO.PartRequest;
import com.motori.product_service.dto.PartDTO.PartResponse;
import com.motori.product_service.service.PartService;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST controller for managing auto parts (SKU-based items) operations.
 * <p>
 * Handles CRUD operations for auto parts with support for:
 * <ul>
 *   <li>Complex filtering by name, brand, category, price range, vehicle compatibility and JSON properties</li>
 *   <li>Unique SKU (reference) validation to prevent duplicate parts</li>
 *   <li>Image upload and deletion to MinIO S3 storage</li>
 *   <li>Dynamic property updates for flexible part specifications (weight, dimensions, etc.)</li>
 *   <li>Vehicle compatibility queries to find parts compatible with specific motorcycles</li>
 * </ul>
 * </p>
 *
 * Endpoints:
 * <ul>
 *   <li>POST   /api/parts                    - Create a new auto part</li>
 *   <li>GET    /api/parts                    - List with advanced filtering and pagination</li>
 *   <li>GET    /api/parts/{id}               - Retrieve a specific part</li>
 *   <li>PUT    /api/parts/{id}               - Update part details</li>
 *   <li>DELETE /api/parts/{id}               - Soft-delete part and associated image</li>
 *   <li>POST   /api/parts/{id}/image         - Upload part image to MinIO</li>
 *   <li>DELETE /api/parts/{id}/image         - Delete part image from MinIO</li>
 *   <li>PATCH  /api/parts/{id}/properties    - Update flexible JSON specifications</li>
 * </ul>
 *
 * Authentication: OAuth2 JWT Bearer token required (Keycloak)
 *
 * @author Motori Team
 * @since 1.0
 */
@RestController
@RequestMapping("/api/parts")
@RequiredArgsConstructor
public class PartController {

    private final PartService service;

    /**
     * Creates a new auto part with unique SKU enforcement.
     * <p>
     * Validates that the specified brand and category exist before creation.
     * Ensures the SKU (reference) is unique across the system to prevent duplicate parts.
     * Image upload is handled separately via the uploadImage() endpoint after creation.
     * </p>
     * @param request the {@link PartRequest} containing part details (name, SKU, description, price, brand, category)
     * @return {@link ResponseEntity} with HTTP 201 CREATED status and the created {@link PartResponse}
     */
    @PostMapping
    @Operation(summary = "Créer une nouvelle pièce")
    public ResponseEntity<PartResponse> create(
            @RequestBody @Valid PartRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    /**
     * Retrieves a specific auto part by its unique identifier.
     * <p>
     * Returns complete part details including brand, category, image URL, technical specifications,
     * and vehicle compatibility information.
     * </p>
     * @param id the unique UUID of the auto part
     * @return {@link ResponseEntity} with HTTP 200 OK status and the {@link PartResponse}
     */
    @GetMapping("/{id}")
    @Operation(summary = "Récupérer une pièce par son ID")
    public ResponseEntity<PartResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    /**
     * Lists auto parts with advanced filtering and pagination.
     * <p>
     * Supports multiple filter criteria combined with AND logic:
     * <ul>
     *   <li>name: Partial string match on part name or ref (case-insensitive)</li>
     *   <li>brandId: Filter by specific parts brand UUID</li>
     *   <li>categoryId: Filter by specific parts category UUID</li>
     *   <li>minPrice: Filter parts with price >= minPrice</li>
     *   <li>maxPrice: Filter parts with price <= maxPrice</li>
     *   <li>vehiculeId: Filter parts compatible with a specific vehicle model</li>
     *   <li>propertyKey + propertyValue: Filter by exact JSON property value (ex: viscosity=5W30)</li>
     *   <li>hasProperty: Filter parts that have a specific JSON property key (ex: diameter)</li>
     *   <li>propertiesSearch: Full-text search across all JSON properties values</li>
     * </ul>
     * Results are paginated with a default page size of 20 items, sorted by creation date descending.
     * </p>
     * @param name optional partial match on part name or ref
     * @param brandId optional UUID of the parts brand
     * @param categoryId optional UUID of the parts category
     * @param minPrice optional minimum price threshold (inclusive)
     * @param maxPrice optional maximum price threshold (inclusive)
     * @param vehiculeId optional UUID of a vehicle to find compatible parts
     * @param propertyKey optional JSON property key to filter by exact value (used with propertyValue)
     * @param propertyValue optional JSON property value (used with propertyKey)
     * @param hasProperty optional JSON property key that must exist on the part
     * @param propertiesSearch optional full-text search string across all JSON property values
     * @param pageable pagination and sorting configuration
     * @return {@link ResponseEntity} with HTTP 200 OK and a filtered {@link Page} of {@link PartResponse}
     */
    @GetMapping
    @Operation(summary = "Lister les pièces avec filtres avancés")
public ResponseEntity<Page<PartResponse>> getAll(
    @RequestParam(required = false) String name,
    @RequestParam(required = false) UUID brandId,
    @RequestParam(required = false) UUID categoryId,
    @RequestParam(required = false) BigDecimal minPrice,
    @RequestParam(required = false) BigDecimal maxPrice,
    @RequestParam(required = false) UUID vehiculeId,
    @RequestParam(required = false) String propertyKey,
    @RequestParam(required = false) String propertyValue,
    @RequestParam(required = false) String hasProperty,
    @RequestParam(required = false) String propertiesSearch,
    @RequestParam(defaultValue = "0") int page,       // ← remplace Pageable
    @RequestParam(defaultValue = "20") int size) {    // ← remplace Pageable

    Pageable pageable = PageRequest.of(page, Math.min(size, 100),
        Sort.by(Sort.Direction.DESC, "createdAt"));

    PartFilterRequest filter = new PartFilterRequest(
        name, brandId, categoryId, minPrice, maxPrice, vehiculeId,
        propertyKey, propertyValue, hasProperty, propertiesSearch
    );
    return ResponseEntity.ok(service.getAll(filter, pageable));
}

    /**
     * Updates an existing auto part with new details.
     * <p>
     * Re-validates the brand and category references if they are changed.
     * Image updates are handled separately via the uploadImage() endpoint.
     * Properties updates are handled separately via the updateProperties() endpoint.
     * </p>
     * @param id the unique UUID of the auto part to update
     * @param request the {@link PartRequest} containing updated part details
     * @return {@link ResponseEntity} with HTTP 200 OK and the updated {@link PartResponse}
     */
    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour une pièce")
    public ResponseEntity<PartResponse> update(
            @PathVariable UUID id,
            @RequestBody @Valid PartRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    /**
     * Soft-deletes an auto part and automatically deletes its associated image from MinIO.
     * <p>
     * The part record is marked with a deletedAt timestamp for audit purposes.
     * Associated images are permanently removed from MinIO S3 storage.
     * </p>
     * @param id the unique UUID of the auto part to delete
     * @return {@link ResponseEntity} with HTTP 204 NO_CONTENT status
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une pièce (soft delete)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Uploads a new image for an auto part to MinIO S3 storage.
     * <p>
     * If the part already has an image, the old image is automatically deleted before uploading the new one.
     * The image is stored with a unique key based on the part UUID.
     * </p>
     * @param id the unique UUID of the auto part
     * @param file the image file to upload (multipart/form-data)
     * @return {@link ResponseEntity} with HTTP 200 OK and the updated {@link PartResponse} with new imageUrl
     */
    @PostMapping("/{id}/image")
    @Operation(summary = "Uploader une image pour une pièce")
    public ResponseEntity<PartResponse> uploadImage(
        @PathVariable UUID id,
        @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(service.uploadImage(id, file));
    }

    /**
     * Deletes the image associated with an auto part from MinIO S3 storage.
     * <p>
     * Removes the image URL reference from the part record.
     * If no image is currently associated, the operation succeeds without error.
     * </p>
     * @param id the unique UUID of the auto part
     * @return {@link ResponseEntity} with HTTP 200 OK and the updated {@link PartResponse}
     */
    @DeleteMapping("/{id}/image")
    @Operation(summary = "Supprimer l'image d'une pièce")
    public ResponseEntity<PartResponse> deleteImage(@PathVariable UUID id) {
        return ResponseEntity.ok(service.deleteImage(id));
    }

    /**
     * Partially updates the flexible JSON properties of an auto part.
     * <p>
     * Properties are stored as JSONB in PostgreSQL and support any key-value structure.
     * The provided map fully replaces the existing properties.
     * Typical properties include weight, dimensions, material, torque specifications, etc.
     * </p>
     * @param id the unique UUID of the auto part
     * @param properties a map of property key-value pairs (ex: {"weight": "250g", "torque": "45Nm"})
     * @return {@link ResponseEntity} with HTTP 200 OK and the updated {@link PartResponse}
     */
    @PatchMapping("/{id}/properties")
    @Operation(summary = "Mettre à jour les propriétés JSON d'une pièce")
    public ResponseEntity<PartResponse> updateProperties(
        @PathVariable UUID id,
        @RequestBody Map<String, Object> properties) {
        return ResponseEntity.ok(service.updateProperties(id, properties));
    }
}