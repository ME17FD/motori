package com.motori.product_service.service;


import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.motori.product_service.dto.EquipementDTO.EquipementFilterRequest;
import com.motori.product_service.dto.EquipementDTO.EquipementRequest;
import com.motori.product_service.dto.EquipementDTO.EquipementResponse;
import com.motori.product_service.exception.ResourceNotFoundException;
import com.motori.product_service.mapper.EquipementMapper;
import com.motori.product_service.models.Equipement;
import com.motori.product_service.models.EquipementBrand;
import com.motori.product_service.models.EquipementCategory;
import com.motori.product_service.repository.EquipementBrandRepository;
import com.motori.product_service.repository.EquipementCategoryRepository;
import com.motori.product_service.repository.EquipementRepository;
import com.motori.product_service.specification.EquipementSpecification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
/**
 * Service responsible for managing protective equipment (gear) products.
 * <p>
 * Provides comprehensive CRUD operations and additional functionality for equipment including:
 * - Image upload and deletion with MinIO S3 storage integration
 * - Dynamic properties management (flexible JSON attributes)
 * - Filtered queries using JPA Specifications
 * - Foreign key validation for referenced brands and categories
 * </p>
 * <p>
 * Equipment items represent protective gear products such as jackets, helmets, gloves, etc.
 * Each equipment has associated brand and category relationships, configurable size enum,
 * pricing information, and optional images stored in MinIO.
 * </p>
 * @author Motori Team
 * @since 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EquipementService {

    private final EquipementRepository repository;
    private final EquipementBrandRepository equipementBrandRepository;
    private final EquipementCategoryRepository equipementCategoryRepository;
    private final MinioService minioService;
    private final EquipementMapper mapper;

    /**
     * Creates a new equipment product.
     * <p>
     * Validates that the referenced brand and category exist before creation.
     * Initializes the equipment with provided attributes including size, color, and flexible JSON properties.
     * </p>
     * @param request the equipment creation request containing name, brand ID, category ID, size, color, price, and properties
     * @return the created equipment with assigned UUID and initial state
     * @throws ResourceNotFoundException if the specified brand or category does not exist
     */
    // ─── CREATE ───────────────────────────────────────────────
    public EquipementResponse create(EquipementRequest request) {

        EquipementBrand brand = equipementBrandRepository
            .findById(request.equipementBrandId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Marque équipement introuvable avec l'id : " + request.equipementBrandId()
            ));

        EquipementCategory category = equipementCategoryRepository
            .findById(request.equipementCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Catégorie équipement introuvable avec l'id : " + request.equipementCategoryId()
            ));

        Equipement equipement = mapper.toEntity(request);
        equipement.setEquipementBrandId(brand);
        equipement.setEquipementCategoryId(category);

        return mapper.toResponse(repository.save(equipement));
    }

    /**
     * Retrieves equipment details by its unique identifier.
     * @param id the unique identifier of the equipment
     * @return the equipment details with brand, category, and all properties
     * @throws ResourceNotFoundException if no equipment is found with the given ID
     */
    // ─── GET BY ID ────────────────────────────────────────────
    public EquipementResponse getById(UUID id) {
        return repository
            .findById(id)
            .map(mapper::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Équipement introuvable avec l'id : " + id
            ));
    }

    /**
     * Retrieves equipment with advanced filtering and pagination support.
     * <p>
     * Supports filtering by brand, category, size, and price range using JPA Specifications.
     * Results are returned with pagination.
     * </p>
     * @param filter the filter criteria (brandId, categoryId, size, minPrice, maxPrice)
     * @param pageable pagination parameters (page number, size, sorting)
     * @return a page of equipment matching the filter criteria
     */
    // ─── GET ALL ──────────────────────────────────────────────
    public Page<EquipementResponse> getAll(EquipementFilterRequest filter, Pageable pageable) {
        log.debug("Récupération des équipements avec filtres : {}", filter);
        Specification<Equipement> spec = EquipementSpecification.withFilters(filter);
        return repository.findAll(spec, pageable)
            .map(mapper::toResponse);
    }

    /**
     * Updates an existing equipment product.
     * <p>
     * Validates that the referenced brand and category exist. Only updateable fields (name, description, size, color,
     * price, properties, URLs) are modified. IDs and timestamps are preserved.
     * </p>
     * @param id the unique identifier of the equipment to update
     * @param request the update request with new equipment details
     * @return the updated equipment
     * @throws ResourceNotFoundException if the equipment, brand, or category is not found
     */
    // ─── UPDATE ───────────────────────────────────────────────
    public EquipementResponse update(UUID id, EquipementRequest request) {

        Equipement equipement = repository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Équipement introuvable avec l'id : " + id
            ));

        EquipementBrand brand = equipementBrandRepository
            .findById(request.equipementBrandId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Marque équipement introuvable avec l'id : " + request.equipementBrandId()
            ));

        EquipementCategory category = equipementCategoryRepository
            .findById(request.equipementCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Catégorie équipement introuvable avec l'id : " + request.equipementCategoryId()
            ));

        equipement.setSize(request.size());
        equipement.setColor(request.color());
        equipement.setName(request.name());
        equipement.setDescription(request.description());
        equipement.setPrice(request.price());
        equipement.setEquipementBrandId(brand);
        equipement.setEquipementCategoryId(category);
        equipement.setProperties(request.properties());

        return mapper.toResponse(repository.save(equipement));
    }

    /**
     * Soft-deletes an equipment product by its ID.
     * <p>
     * The equipment is marked as deleted via the deletedAt field. Images stored in MinIO are NOT automatically deleted.
     * The equipment remains linked to existing orders but is excluded from future queries.
     * </p>
     * @param id the unique identifier of the equipment to delete
     * @throws ResourceNotFoundException if no equipment is found with the given ID
     */
    // ─── DELETE (soft) ────────────────────────────────────────
    public void delete(UUID id) {
        Equipement equipement = repository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Équipement introuvable avec l'id : " + id
            ));
        repository.delete(equipement);
    }

    // ─── Images ────────────────────────────────────────
    /**
     * Uploads and associates an image with equipment.
     * <p>
     * If equipment already has an image, the old image is deleted from MinIO before uploading the new one.
     * The new image is uploaded to the MinIO S3 bucket and the URL is stored in the equipment record.
     * </p>
     * @param id the unique identifier of the equipment
     * @param file the image file to upload (supported formats: JPEG, PNG, etc.)
     * @return the updated equipment with new image URL
     * @throws ResourceNotFoundException if no equipment is found with the given ID
     * @throws RuntimeException if image upload to MinIO fails
     */
    public EquipementResponse uploadImage(UUID id, MultipartFile file) {
        log.info("Upload image pour l'équipement : {}", id);

        Equipement equipement = repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Équipement introuvable avec l'id : " + id
            ));

        if (equipement.getImageUrl() != null) {
            minioService.deleteImage(equipement.getImageUrl());
        }

        String imageUrl = minioService.uploadImage(file, "equipements");
        equipement.setImageUrl(imageUrl);

        return mapper.toResponse(repository.save(equipement));
    }

    /**
     * Removes the image associated with equipment.
     * <p>
     * Deletes the image from MinIO S3 storage and clears the imageUrl field from the equipment record.
     * </p>
     * @param id the unique identifier of the equipment
     * @return the updated equipment with imageUrl cleared
     * @throws ResourceNotFoundException if no equipment is found with the given ID
     */
    public EquipementResponse deleteImage(UUID id) {
        log.info("Suppression image pour l'équipement : {}", id);

        Equipement equipement = repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Équipement introuvable avec l'id : " + id
            ));

        if (equipement.getImageUrl() != null) {
            minioService.deleteImage(equipement.getImageUrl());
            equipement.setImageUrl(null);
            repository.save(equipement);
        }

        return mapper.toResponse(equipement);
    }

    /**
     * Updates flexible JSON properties of equipment.
     * <p>
     * Allows dynamic attribute updates that don't require schema changes. Properties are stored as JSONB
     * in the database and can contain any JSON-serializable objects.
     * </p>
     * @param id the unique identifier of the equipment
     * @param properties a map of property key-value pairs to update
     * @return the updated equipment with new properties
     * @throws ResourceNotFoundException if no equipment is found with the given ID
     */
    public EquipementResponse updateProperties(UUID id, Map<String, Object> properties) {
        log.info("Mise à jour des propriétés de l'équipement : {}", id);
        Equipement equipement = repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Équipement introuvable avec l'id : " + id
            ));
        equipement.setProperties(properties);
        return mapper.toResponse(repository.save(equipement));
    }
} 


