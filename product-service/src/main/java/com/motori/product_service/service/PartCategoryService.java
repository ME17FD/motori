package com.motori.product_service.service;


import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import com.motori.product_service.dto.PartCategoryDTO.PartCategoryRequest;
import com.motori.product_service.dto.PartCategoryDTO.PartCategoryResponse;
import com.motori.product_service.exception.DuplicateResourceException;
import com.motori.product_service.exception.ResourceNotFoundException;
import com.motori.product_service.mapper.PartCategoryMapper;
import com.motori.product_service.models.PartCategory;
import com.motori.product_service.repository.PartCategoryRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
@Slf4j
@Service
@RequiredArgsConstructor
public class PartCategoryService {

    private final PartCategoryRepository repository;
    private final PartCategoryMapper mapper;

    // ─── CREATE ───────────────────────────────────────────────
    public PartCategoryResponse create(PartCategoryRequest request) {
        boolean nameExists = repository
            .findByName(request.name())
            .isPresent();

        if (nameExists) {
            throw new DuplicateResourceException(
                "Une catégorie '" + request.name() + "' existe déjà"
            );
        }

        PartCategory category = mapper.toEntity(request);

        // Si parentCategoryId est fourni → on charge le parent
        if (request.parentCategoryId() != null) {
            PartCategory parent = repository
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
    public PartCategoryResponse getById(UUID id) {
        return repository
            .findById(id)
            .map(mapper::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Catégorie introuvable avec l'id : " + id
            ));
    }

    // ─── GET ALL ──────────────────────────────────────────────
    public Page<PartCategoryResponse> getAll(Pageable pageable) {
    log.debug("Récupération de toutes les catégories pièce");
    return repository.findAll(pageable)
        .map(mapper::toResponse);
}

    // ─── UPDATE ───────────────────────────────────────────────
    public PartCategoryResponse update(UUID id, PartCategoryRequest request) {

        PartCategory category = repository
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

            PartCategory parent = repository
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
        PartCategory category = repository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Catégorie introuvable avec l'id : " + id
            ));
        repository.delete(category);
    }
}
