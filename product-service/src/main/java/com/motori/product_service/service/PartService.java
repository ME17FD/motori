package com.motori.product_service.service;


import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
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
@Slf4j
@Service
@RequiredArgsConstructor
public class PartService {

    private final PartRepository repository;
    private final PartBrandRepository partBrandRepository;
    private final PartCategoryRepository partCategoryRepository;
    private final PartMapper mapper;
    private final MinioService minioService;

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
        Specification<Parts> spec = PartSpecification.withFilters(filter);
        return repository.findAll(spec, pageable)
            .map(mapper::toResponse);
    }
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

