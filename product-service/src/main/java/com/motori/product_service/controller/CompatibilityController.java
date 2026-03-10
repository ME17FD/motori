package com.motori.product_service.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

import com.motori.product_service.dto.CompatibilityDTO.CompatibilityRequest;
import com.motori.product_service.dto.CompatibilityDTO.CompatibilityResponse;
import com.motori.product_service.service.CompatibilityService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST controller for managing part-vehicle compatibility mappings.
 * <p>
 * Exposes endpoints for creating and managing compatibility relationships between auto parts
 * and vehicle models. Supports filtering parts compatible with specific vehicles.
 * </p>
 * Endpoints:
 * <ul>
 *   <li>POST /api/compatibilities - Create a new compatibility mapping</li>
 *   <li>GET /api/compatibilities - List all compatibility mappings with pagination</li>
 *   <li>GET /api/compatibilities/{id} - Retrieve a specific compatibility mapping</li>
 *   <li>DELETE /api/compatibilities/{id} - Remove a compatibility mapping (soft-delete)</li>
 * </ul>
 * 
 * Authentication: OAuth2 JWT Bearer token required (Keycloak)
 * 
 * @author Motori Team
 * @since 1.0
 */
@RestController
@RequestMapping("/api/compatibilities")
@RequiredArgsConstructor
public class CompatibilityController {

    private final CompatibilityService service;

    /**
     * Creates a new part-vehicle compatibility mapping.
     * <p>
     * Validates that both the part and vehicle exist before linking them.
     * Prevents duplicate compatibility mappings via service-level duplicate checking.
     * </p>
     * @param request the {@link CompatibilityRequest} containing partId and vehiculeId
     * @return {@link ResponseEntity} with HTTP 201 CREATED status and the created {@link CompatibilityResponse}
     * @throws ResourceNotFoundException if the part or vehicle with the specified IDs do not exist
     * @throws DuplicateResourceException if the compatibility mapping already exists
     */
    @PostMapping
    public ResponseEntity<CompatibilityResponse> create(
            @RequestBody @Valid CompatibilityRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    /**
     * Retrieves a specific compatibility mapping by its unique identifier.
     * <p>
     * Returns the complete compatibility mapping including part and vehicle details.
     * </p>
     * @param id the unique UUID of the compatibility mapping
     * @return {@link ResponseEntity} with HTTP 200 OK status and the {@link CompatibilityResponse}
     * @throws ResourceNotFoundException if no compatibility mapping with the specified ID is found
     */
    @GetMapping("/{id}")
    public ResponseEntity<CompatibilityResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    /**
     * Lists all active (non-deleted) compatibility mappings with pagination and sorting.
     * <p>
     * Results are paginated with a default page size of 20 items, sorted by creation date in descending order.
     * Soft-deleted mappings are automatically excluded from results.
     * </p>
     * @param pageable the pagination and sorting configuration. Default: 20 items/page, sorted by createdAt DESC
     * @return {@link ResponseEntity} with HTTP 200 OK status containing a {@link Page} of {@link CompatibilityResponse}
     */
    @GetMapping
    public ResponseEntity<Page<CompatibilityResponse>> getAll(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ResponseEntity.ok(service.getAll(pageable));
    }

    /**
     * Soft-deletes a compatibility mapping by marking it with a deletion timestamp.
     * <p>
     * Physical database records are not removed; instead, the deletedAt field is populated,
     * making the mapping invisible to future queries. This preserves referential integrity
     * and audit trail.
     * </p>
     * @param id the unique UUID of the compatibility mapping to delete
     * @return {@link ResponseEntity} with HTTP 204 NO_CONTENT status (empty response body)
     * @throws ResourceNotFoundException if no compatibility mapping with the specified ID is found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
    
} 
