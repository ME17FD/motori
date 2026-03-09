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
@Slf4j
@Service
@RequiredArgsConstructor
public class EquipementService {

    private final EquipementRepository repository;
    private final EquipementBrandRepository equipementBrandRepository;
    private final EquipementCategoryRepository equipementCategoryRepository;
    private final MinioService minioService;
    private final EquipementMapper mapper;

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

    // ─── GET BY ID ────────────────────────────────────────────
    public EquipementResponse getById(UUID id) {
        return repository
            .findById(id)
            .map(mapper::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Équipement introuvable avec l'id : " + id
            ));
    }

    // ─── GET ALL ──────────────────────────────────────────────
    public Page<EquipementResponse> getAll(EquipementFilterRequest filter, Pageable pageable) {
        log.debug("Récupération des équipements avec filtres : {}", filter);
        Specification<Equipement> spec = EquipementSpecification.withFilters(filter);
        return repository.findAll(spec, pageable)
            .map(mapper::toResponse);
    }

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


