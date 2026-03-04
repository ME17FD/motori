package com.motori.product_service.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

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

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PartService {

    private final PartRepository repository;
    private final PartBrandRepository partBrandRepository;
    private final PartCategoryRepository partCategoryRepository;
    private final PartMapper mapper;

    // ─── CREATE ───────────────────────────────────────────────
    public PartResponse create(PartRequest request) {

        // Validation métier : ref unique
        if (repository.findByRefAndDeletedAtIsNull(request.ref()).isPresent()) {
            throw new DuplicateResourceException(
                "Une pièce avec la référence '" + request.ref() + "' existe déjà"
            );
        }

        PartBrand brand = partBrandRepository
            .findByIdAndDeletedAtIsNull(request.partBrandId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Marque pièce introuvable avec l'id : " + request.partBrandId()
            ));

        PartCategory category = partCategoryRepository
            .findByIdAndDeletedAtIsNull(request.partCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Catégorie introuvable avec l'id : " + request.partCategoryId()
            ));

        Parts part = mapper.toEntity(request);
        part.setPartBrand(brand);
        part.setPartCategory(category);
        part.setCreatedAt(LocalDateTime.now());

        return mapper.toResponse(repository.save(part));
    }

    // ─── GET BY ID ────────────────────────────────────────────
    public PartResponse getById(UUID id) {
        return repository
            .findByIdAndDeletedAtIsNull(id)
            .map(mapper::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Pièce introuvable avec l'id : " + id
            ));
    }

    // ─── GET ALL ──────────────────────────────────────────────
    public List<PartResponse> getAll() {
        return repository.findAllByDeletedAtIsNull()
            .stream()
            .map(mapper::toResponse)
            .toList();
    }

    // ─── UPDATE ───────────────────────────────────────────────
    public PartResponse update(UUID id, PartRequest request) {

        Parts part = repository
            .findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Pièce introuvable avec l'id : " + id
            ));

        // Ref unique sur une autre pièce
        repository.findByRefAndDeletedAtIsNull(request.ref())
            .ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new DuplicateResourceException(
                        "Une pièce avec la référence '" + request.ref() + "' existe déjà"
                    );
                }
            });

        PartBrand brand = partBrandRepository
            .findByIdAndDeletedAtIsNull(request.partBrandId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Marque pièce introuvable avec l'id : " + request.partBrandId()
            ));

        PartCategory category = partCategoryRepository
            .findByIdAndDeletedAtIsNull(request.partCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Catégorie introuvable avec l'id : " + request.partCategoryId()
            ));

        part.setName(request.name());
        part.setRef(request.ref());
        part.setDescription(request.description());
        part.setPrice(request.price());
        part.setPartBrand(brand);
        part.setPartCategory(category);

        return mapper.toResponse(repository.save(part));
    }

    // ─── DELETE (soft) ────────────────────────────────────────
    public void delete(UUID id) {
        Parts part = repository
            .findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Pièce introuvable avec l'id : " + id
            ));

        part.setDeletedAt(LocalDateTime.now());
        repository.save(part);
    }
} 
