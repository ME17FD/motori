package com.motori.product_service.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.motori.product_service.dto.PartBrandDTO.PartBrandRequest;
import com.motori.product_service.dto.PartBrandDTO.PartBrandResponse;
import com.motori.product_service.exception.DuplicateResourceException;
import com.motori.product_service.exception.ResourceNotFoundException;
import com.motori.product_service.mapper.PartBrandMapper;
import com.motori.product_service.models.PartBrand;
import com.motori.product_service.repository.PartBrandRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PartBrandService {
    private final PartBrandRepository repository;
    private final PartBrandMapper mapper;

    // ─── CREATE ───────────────────────────────────────────────
    public PartBrandResponse create(PartBrandRequest request) {
        boolean nameExists = repository
            .findByNameAndDeletedAtIsNull(request.name())
            .isPresent();

        if (nameExists) {
            throw new DuplicateResourceException(
                "Une marque avec le nom '" + request.name() + "' existe déjà"
            );
        }

        PartBrand brand = mapper.toEntity(request);
        brand.setCreatedAt(LocalDateTime.now());

        return mapper.toResponse(repository.save(brand));
    }

    // ─── GET BY ID ────────────────────────────────────────────
    public PartBrandResponse getById(UUID id) {
        PartBrand brand = repository
            .findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Marque véhicule introuvable avec l'id : " + id
            ));

        return mapper.toResponse(brand);
    }

    // ─── GET ALL ──────────────────────────────────────────────
    public List<PartBrandResponse> getAll() {
        return repository.findAllByDeletedAtIsNull()
            .stream()
            .map(mapper::toResponse)
            .toList();
    }

    // ─── UPDATE ───────────────────────────────────────────────
    public PartBrandResponse update(UUID id, PartBrandRequest request) {

        PartBrand brand = repository
            .findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Marque véhicule introuvable avec l'id : " + id
            ));
        repository.findByNameAndDeletedAtIsNull(request.name())
            .ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new DuplicateResourceException(
                        "Une marque avec le nom '" + request.name() + "' existe déjà"
                    );
                }
            });

        brand.setName(request.name());

        return mapper.toResponse(repository.save(brand));
    }

    // ─── DELETE (soft) ────────────────────────────────────────
    public void delete(UUID id) {
        PartBrand brand = repository
            .findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Marque véhicule introuvable avec l'id : " + id
            ));

        brand.setDeletedAt(LocalDateTime.now());
        repository.save(brand);
    }
}
