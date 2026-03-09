package com.motori.product_service.service;


import java.util.List;
import java.util.UUID;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
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
    @CacheEvict(value = {"equipement-categories", "equipement-categories-all"}, allEntries = true)
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
    @Cacheable(value = "equipement-categories", key = "#id")
    public EquipementCategoryResponse getById(UUID id) {
        log.debug("Recuperation de la categorie equipement : {}", id);
        return repository.findById(id)
            .map(mapper::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Categorie equipement introuvable avec l'id : " + id
            ));
    }

    // ─── GET ALL ──────────────────────────────────────────────
    @Cacheable(value = "equipement-categories-all")
    public List<EquipementCategoryResponse> getAll() {
        log.debug("Recuperation de toutes les categories equipement");
        return repository.findAll().stream()
            .map(mapper::toResponse)
            .toList();
    }

    // ─── UPDATE ───────────────────────────────────────────────
    @CacheEvict(value = {"equipement-categories", "equipement-categories-all"}, allEntries = true)
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
    @CacheEvict(value = {"equipement-categories", "equipement-categories-all"}, allEntries = true)
    public void delete(UUID id) {
        EquipementCategory category = repository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Catégorie introuvable avec l'id : " + id
            ));
        repository.delete(category);
    }
}
