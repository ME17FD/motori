package com.motori.product_service.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

import com.motori.product_service.dto.VehiculeDTO.VehiculeRequest;
import com.motori.product_service.dto.VehiculeDTO.VehiculeResponse;
import com.motori.product_service.service.VehiculeService;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST controller for managing vehicle/motorcycle model operations.
 * <p>
 * Handles CRUD operations for specific motorcycle models (e.g., Yamaha YZF-R1, Honda CB500F).
 * Each vehicle model is linked to a vehicle brand and is used for determining part compatibility
 * through the Compatibility entity.
 * </p>
 * Endpoints:
 * <ul>
 *   <li>POST /api/vehicules - Create a new vehicle model</li>
 *   <li>GET /api/vehicules - List all vehicle models with pagination</li>
 *   <li>GET /api/vehicules/{id} - Retrieve a specific vehicle model</li>
 *   <li>PUT /api/vehicules/{id} - Update a vehicle model</li>
 *   <li>DELETE /api/vehicules/{id} - Soft-delete a vehicle model</li>
 * </ul>
 * 
 * Business Use: Vehicle models are used to establish part compatibility through many-to-many
 * relationships via the Compatibility entity (Part ↔ Vehicle compatibility mappings).
 * 
 * Authentication: OAuth2 JWT Bearer token required (Keycloak)
 * 
 * @author Motori Team
 * @since 1.0
 */
@RestController
@RequestMapping("/api/vehicules")
@RequiredArgsConstructor
public class VehiculeController {

    private final VehiculeService service;

    /**
     * Creates a new vehicle/motorcycle model.
     * <p>
     * Validates that the specified brand exists in the system.
     * Model name, year, and other details are stored for part compatibility matching.
     * </p>
     * @param request the {@link VehiculeRequest} containing vehicle details (model name, year, brand UUID, description)
     * @return {@link ResponseEntity} with HTTP 201 CREATED status and the created {@link VehiculeResponse}
     * @throws ResourceNotFoundException if the specified brand UUID does not exist
     */
    @PostMapping
    public ResponseEntity<VehiculeResponse> create(
            @RequestBody @Valid VehiculeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    /**
     * Retrieves a specific vehicle model by its unique identifier.
     * <p>
     * Returns complete vehicle details including brand information and associated compatibility data.
     * </p>
     * @param id the unique UUID of the vehicle model
     * @return {@link ResponseEntity} with HTTP 200 OK status and the {@link VehiculeResponse}
     * @throws ResourceNotFoundException if no vehicle model with the specified ID is found
     */
    @GetMapping("/{id}")
    public ResponseEntity<VehiculeResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    /**
     * Lists all active (non-deleted) vehicle models with pagination.
     * <p>
     * Results are paginated with a default page size of 20 items, sorted by creation date in descending order.
     * Each vehicle includes its brand information and vehicle year/model details.
     * </p>
     * @param pageable the pagination and sorting configuration. Default: 20 items/page, sorted by createdAt DESC
     * @return {@link ResponseEntity} with HTTP 200 OK status containing a {@link Page} of {@link VehiculeResponse}
     */
    @GetMapping
    public ResponseEntity<Page<VehiculeResponse>> getAll(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ResponseEntity.ok(service.getAll(pageable));
    }      

    /**
     * Updates an existing vehicle model with new details.
     * <p>
     * Re-validates the brand reference if it is changed.
     * Compatibility relationships to parts are preserved and remain valid.
     * </p>
     * @param id the unique UUID of the vehicle model to update
     * @param request the {@link VehiculeRequest} containing updated vehicle details
     * @return {@link ResponseEntity} with HTTP 200 OK status and the updated {@link VehiculeResponse}
     * @throws ResourceNotFoundException if the vehicle model or referenced brand doesn't exist
     */
    @PutMapping("/{id}")
    public ResponseEntity<VehiculeResponse> update(
            @PathVariable UUID id,
            @RequestBody @Valid VehiculeRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    /**
     * Soft-deletes a vehicle model by marking it with a deletion timestamp.
     * <p>
     * Associated compatibility mappings (parts linked to this vehicle) are preserved for audit purposes.
     * The vehicle record is marked as deleted rather than physically removed from the database.
     * </p>
     * @param id the unique UUID of the vehicle model to delete
     * @return {@link ResponseEntity} with HTTP 204 NO_CONTENT status (empty response body)
     * @throws ResourceNotFoundException if no vehicle model with the specified ID is found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
} 
