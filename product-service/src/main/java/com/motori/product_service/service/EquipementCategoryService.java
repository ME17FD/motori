package com.motori.product_service.service;


import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import com.motori.product_service.dto.EquipementCategoryDTO.EquipementCategoryRequest;
import com.motori.product_service.dto.EquipementCategoryDTO.EquipementCategoryResponse;
import com.motori.product_service.exception.DuplicateResourceException;
import com.motori.product_service.exception.ResourceNotFoundException;
import com.motori.product_service.mapper.EquipementCategoryMapper;
import com.motori.product_service.models.EquipementCategory;
import com.motori.product_service.repository.EquipementCategoryRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
@Slf4j
@Service
@RequiredArgsConstructor
public class EquipementCategoryService {

    private final EquipementCategoryRepository repository;
    private final EquipementCategoryMapper mapper;

    // ─── CREATE ───────────────────────────────────────────────
    public EquipementCategoryResponse create(EquipementCategoryRequest request) {

        // Validation : nom unique dans la même catégorie parente
        boolean nameExists = repository
            .findByName(request.name())
            .isPresent();

        if (nameExists) {
            throw new DuplicateResourceException(
                "Une catégorie '" + request.name() + "' existe déjà"
            );
        }

        EquipementCategory category = mapper.toEntity(request);

        // Si parentCategoryId est fourni → on charge le parent
        if (request.parentCategoryId() != null) {
            EquipementCategory parent = repository
                .findById(request.parentCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Catégorie parente introuvable avec l'id : "
                    + request.parentCategoryId()
                ));
            category.setParent(parent);
        }
        // Si parentCategoryId est null → catégorie racine, pas de parent

        return mapper.toResponse(repository.save(category));
    }

    // ─── GET BY ID ────────────────────────────────────────────
    public EquipementCategoryResponse getById(UUID id) {
        return repository
            .findById(id)
            .map(mapper::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Catégorie introuvable avec l'id : " + id
            ));
    }

    // ─── GET ALL ──────────────────────────────────────────────
    public Page<EquipementCategoryResponse> getAll(Pageable pageable) {
    log.debug("Récupération de toutes les catégories équipement");
    return repository.findAll(pageable)
        .map(mapper::toResponse);
}

    // ─── UPDATE ───────────────────────────────────────────────
    public EquipementCategoryResponse update(UUID id, EquipementCategoryRequest request) {

        EquipementCategory category = repository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Catégorie introuvable avec l'id : " + id
            ));

        // Validation : nom unique sur une autre catégorie
        repository.findByName(request.name())
            .ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new DuplicateResourceException(
                        "Une catégorie '" + request.name() + "' existe déjà"
                    );
                }
            });

        category.setName(request.name());

        // Mise à jour du parent
        if (request.parentCategoryId() != null) {

            // Sécurité : une catégorie ne peut pas être son propre parent
            if (request.parentCategoryId().equals(id)) {
                throw new IllegalArgumentException(
                    "Une catégorie ne peut pas être son propre parent"
                );
            }

            EquipementCategory parent = repository
                .findById(request.parentCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Catégorie parente introuvable avec l'id : "
                    + request.parentCategoryId()
                ));
            category.setParent(parent);
        } else {
            category.setParent(null); // devient catégorie racine
        }

        return mapper.toResponse(repository.save(category));
    }

    // ─── DELETE (soft) ────────────────────────────────────────
    public void delete(UUID id) {
        EquipementCategory category = repository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Catégorie introuvable avec l'id : " + id
            ));
        repository.delete(category);
    }
}
