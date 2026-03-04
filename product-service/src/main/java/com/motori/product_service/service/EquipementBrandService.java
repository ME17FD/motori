package com.motori.product_service.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.motori.product_service.dto.EquipementBrandDTO.EquipementBrandRequest;
import com.motori.product_service.dto.EquipementBrandDTO.EquipementBrandResponse;
import com.motori.product_service.exception.DuplicateResourceException;
import com.motori.product_service.exception.ResourceNotFoundException;
import com.motori.product_service.mapper.EquipementBrandMapper;
import com.motori.product_service.models.EquipementBrand;
import com.motori.product_service.repository.EquipementBrandRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EquipementBrandService {
        private final EquipementBrandRepository repository;
    private final EquipementBrandMapper mapper;

    // ─── CREATE ───────────────────────────────────────────────
    public EquipementBrandResponse create(EquipementBrandRequest request) {
        boolean nameExists = repository
            .findByNameAndDeletedAtIsNull(request.name())
            .isPresent();

        if (nameExists) {
            throw new DuplicateResourceException(
                "Une marque avec le nom '" + request.name() + "' existe déjà"
            );
        }

        EquipementBrand brand = mapper.toEntity(request);
        brand.setCreatedAt(LocalDateTime.now());

        return mapper.toResponse(repository.save(brand));
    }

    // ─── GET BY ID ────────────────────────────────────────────
    public EquipementBrandResponse getById(UUID id) {
        EquipementBrand brand = repository
            .findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Marque véhicule introuvable avec l'id : " + id
            ));

        return mapper.toResponse(brand);
    }

    // ─── GET ALL ──────────────────────────────────────────────
    public List<EquipementBrandResponse> getAll() {
        return repository.findAllByDeletedAtIsNull()
            .stream()
            .map(mapper::toResponse)
            .toList();
    }

    // ─── UPDATE ───────────────────────────────────────────────
    public EquipementBrandResponse update(UUID id, EquipementBrandRequest request) {

        EquipementBrand brand = repository
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
        EquipementBrand brand = repository
            .findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Marque véhicule introuvable avec l'id : " + id
            ));

        brand.setDeletedAt(LocalDateTime.now());
        repository.save(brand);
    }
}
