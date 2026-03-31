package com.motori.product_service.service;


import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.motori.product_service.dto.PartDTO.PartFilterRequest;
import com.motori.product_service.dto.PartDTO.PartRequest;
import com.motori.product_service.dto.PartDTO.PartResponse;
import com.motori.product_service.exception.DuplicateResourceException;
import com.motori.product_service.exception.ResourceNotFoundException;
import com.motori.product_service.mapper.PartMapper;
import com.motori.product_service.models.PartBrand;
import com.motori.product_service.models.PartCategory;
import com.motori.product_service.models.Parts;
import com.motori.product_service.repository.PartBrandRepository;
import com.motori.product_service.repository.PartCategoryRepository;
import com.motori.product_service.repository.PartRepository;
import com.motori.product_service.specification.PartSpecification;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
/**
 * Service responsible for managing auto parts products.
 * <p>
 * Provides comprehensive CRUD operations and additional functionality for parts including:
 * - Image upload and deletion with MinIO S3 storage integration
 * - Dynamic properties management (flexible JSON attributes)
 * - Filtered queries using JPA Specifications
 * - Foreign key validation for referenced brands and categories
 * - Unique SKU (reference) enforcement across all parts
 * </p>
 * <p>
 * Parts represent auto/motorcycle components such as engines, brakes, filters, etc.
 * Each part has a unique stock reference (ref field), associated brand and category relationships,
 * compatibility tracking, pricing information, and optional images stored in MinIO.
 * </p>
 * @author Motori Team
 * @since 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PartService {

    private final PartRepository repository;
    private final PartBrandRepository partBrandRepository;
    private final PartCategoryRepository partCategoryRepository;
    private final PartMapper mapper;
    private final MinioService minioService;

    /**
     * Creates a new parts product.
     * <p>
     * Validates that the referenced brand and category exist before creation.
     * Enforces unique part reference (SKU) across the system to prevent duplicates.
     * Initializes the part with provided attributes including description, pricing, and flexible properties.
     * </p>
     * @param request the part creation request containing name, ref (SKU), brand ID, category ID, description, price, and properties
     * @return the created part with assigned UUID and initial state
     * @throws DuplicateResourceException if a part with the same reference already exists
     * @throws ResourceNotFoundException if the specified brand or category does not exist
     */
    // ─── CREATE ───────────────────────────────────────────────
    public PartResponse create(PartRequest request) {

        // Validation métier : ref unique
        if (repository.findByRef(request.ref()).isPresent()) {
            throw new DuplicateResourceException(
                "Une pièce avec la référence '" + request.ref() + "' existe déjà"
            );
        }

        PartBrand brand = partBrandRepository
            .findById(request.partBrandId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Marque pièce introuvable avec l'id : " + request.partBrandId()
            ));

        PartCategory category = partCategoryRepository
            .findById(request.partCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Catégorie introuvable avec l'id : " + request.partCategoryId()
            ));

        Parts part = mapper.toEntity(request);
        part.setPartBrand(brand);
        part.setPartCategory(category);
        

        return mapper.toResponse(repository.save(part));
    }

    /**
     * Retrieves part details by its unique identifier.
     * @param id the unique identifier of the part
     * @return the part details with brand, category, properties, and all attributes
     * @throws ResourceNotFoundException if no part is found with the given ID
     */
    // ─── GET BY ID ────────────────────────────────────────────
    public PartResponse getById(UUID id) {
        return repository
            .findById(id)
            .map(mapper::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Pièce introuvable avec l'id : " + id
            ));
    }

    // ─── GET ALL ──────────────────────────────────────────────
    
    public Page<PartResponse> getAll(PartFilterRequest filter, Pageable pageable) {
        log.debug("Récupération des pièces avec filtres : {}", filter);
        return repository.findAll(PartSpecification.withFilters(filter), pageable)
        .map(mapper::toResponse);
    }
    /**
     * Updates an existing parts product.
     * <p>
     * Validates that the referenced brand and category exist. Enforces unique reference (SKU) on update
     * (can update reference if new reference is unique). Only updateable fields are modified; IDs and
     * timestamps are preserved.
     * </p>
     * @param id the unique identifier of the part to update
     * @param request the update request with new part details
     * @return the updated part
     * @throws ResourceNotFoundException if the part, brand, or category is not found
     * @throws DuplicateResourceException if the new reference already exists on another part
     */
    // ─── UPDATE ───────────────────────────────────────────────
    public PartResponse update(UUID id, PartRequest request) {

        Parts part = repository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Pièce introuvable avec l'id : " + id
            ));

        // Ref unique sur une autre pièce
        repository.findByRef(request.ref())
            .ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new DuplicateResourceException(
                        "Une pièce avec la référence '" + request.ref() + "' existe déjà"
                    );
                }
            });

        PartBrand brand = partBrandRepository
            .findById(request.partBrandId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Marque pièce introuvable avec l'id : " + request.partBrandId()
            ));

        PartCategory category = partCategoryRepository
            .findById(request.partCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Catégorie introuvable avec l'id : " + request.partCategoryId()
            ));

        part.setName(request.name());
        part.setRef(request.ref());
        part.setDescription(request.description());
        part.setPrice(request.price());
        part.setProperties(request.properties());
        part.setPartBrand(brand);
        part.setPartCategory(category);

        return mapper.toResponse(repository.save(part));
    }

    /**
     * Soft-deletes a parts product by its ID.
     * <p>
     * The part is marked as deleted via the deletedAt field. Images stored in MinIO are NOT automatically deleted.
     * The part remains linked to existing compatibility mappings and orders but is excluded from future queries.
     * </p>
     * @param id the unique identifier of the part to delete
     * @throws ResourceNotFoundException if no part is found with the given ID
     */
    // ─── DELETE (soft) ────────────────────────────────────────
    public void delete(UUID id) {
        Parts part = repository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Pièce introuvable avec l'id : " + id
            ));
        repository.delete(part);
    }

    // ─── Images ────────────────────────────────────────
    public PartResponse uploadImage(UUID id, MultipartFile file) {
        log.info("Upload image pour la pièce : {}", id);

        Parts part = repository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Pièce introuvable avec l'id : " + id
        ));

        // Supprime l'ancienne image si elle existe
        if (part.getImageUrl() != null) {
            minioService.deleteImage(part.getImageUrl());
        }

        String imageUrl = minioService.uploadImage(file, "parts");
        part.setImageUrl(imageUrl);

        return mapper.toResponse(repository.save(part));
    }

    /**
     * Removes the image associated with a part.
     * <p>
     * Deletes the image from MinIO S3 storage and clears the imageUrl field from the part record.
     * </p>
     * @param id the unique identifier of the part
     * @return the updated part with imageUrl cleared
     * @throws ResourceNotFoundException if no part is found with the given ID
     */
    public PartResponse deleteImage(UUID id) {
        log.info("Suppression image pour la pièce : {}", id);

        Parts part = repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
            "Pièce introuvable avec l'id : " + id
            ));

        if (part.getImageUrl() != null) {
            minioService.deleteImage(part.getImageUrl());
            part.setImageUrl(null);
            repository.save(part);
        }
        return mapper.toResponse(part);
    }

    /**
     * Updates flexible JSON properties of a part.
     * <p>
     * Allows dynamic attribute updates that don't require schema changes. Properties are stored as JSONB
     * in the database and can contain any JSON-serializable objects (e.g., dimensions, weight, certifications).
     * </p>
     * @param id the unique identifier of the part
     * @param properties a map of property key-value pairs to update
     * @return the updated part with new properties
     * @throws ResourceNotFoundException if no part is found with the given ID
     */
    public PartResponse updateProperties(UUID id, Map<String, Object> properties) {
        log.info("Mise à jour des propriétés de la pièce : {}", id);
        Parts part = repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Pièce introuvable avec l'id : " + id
            ));
        part.setProperties(properties);
        return mapper.toResponse(repository.save(part));
    }
} 

