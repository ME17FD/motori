package com.motori.product_service.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

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

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EquipementService {

    private final EquipementRepository repository;
    private final EquipementBrandRepository equipementBrandRepository;
    private final EquipementCategoryRepository equipementCategoryRepository;
    private final EquipementMapper mapper;

    // ─── CREATE ───────────────────────────────────────────────
    public EquipementResponse create(EquipementRequest request) {

        EquipementBrand brand = equipementBrandRepository
            .findByIdAndDeletedAtIsNull(request.equipementBrandId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Marque équipement introuvable avec l'id : " + request.equipementBrandId()
            ));

        EquipementCategory category = equipementCategoryRepository
            .findByIdAndDeletedAtIsNull(request.equipementCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Catégorie équipement introuvable avec l'id : " + request.equipementCategoryId()
            ));

        Equipement equipement = mapper.toEntity(request);
        equipement.setEquipementBrandId(brand);
        equipement.setEquipementCategoryId(category);
        equipement.setCreatedAt(LocalDateTime.now());

        return mapper.toResponse(repository.save(equipement));
    }

    // ─── GET BY ID ────────────────────────────────────────────
    public EquipementResponse getById(UUID id) {
        return repository
            .findByIdAndDeletedAtIsNull(id)
            .map(mapper::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Équipement introuvable avec l'id : " + id
            ));
    }

    // ─── GET ALL ──────────────────────────────────────────────
    public List<EquipementResponse> getAll() {
        return repository.findAllByDeletedAtIsNull()
            .stream()
            .map(mapper::toResponse)
            .toList();
    }

    // ─── UPDATE ───────────────────────────────────────────────
    public EquipementResponse update(UUID id, EquipementRequest request) {

        Equipement equipement = repository
            .findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Équipement introuvable avec l'id : " + id
            ));

        EquipementBrand brand = equipementBrandRepository
            .findByIdAndDeletedAtIsNull(request.equipementBrandId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Marque équipement introuvable avec l'id : " + request.equipementBrandId()
            ));

        EquipementCategory category = equipementCategoryRepository
            .findByIdAndDeletedAtIsNull(request.equipementCategoryId())
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

        return mapper.toResponse(repository.save(equipement));
    }

    // ─── DELETE (soft) ────────────────────────────────────────
    public void delete(UUID id) {
        Equipement equipement = repository
            .findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Équipement introuvable avec l'id : " + id
            ));

        equipement.setDeletedAt(LocalDateTime.now());
        repository.save(equipement);
    }
} 
