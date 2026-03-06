package com.motori.product_service.service;


import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import com.motori.product_service.dto.InventoryDTO.InventoryFilterRequest;
import com.motori.product_service.dto.InventoryDTO.InventoryRequest;
import com.motori.product_service.dto.InventoryDTO.InventoryResponse;
import com.motori.product_service.enums.PayementStatus;
import com.motori.product_service.exception.ResourceNotFoundException;
import com.motori.product_service.mapper.InventoryMapper;
import com.motori.product_service.models.Equipement;
import com.motori.product_service.models.Inventory;
import com.motori.product_service.models.Parts;
import com.motori.product_service.repository.EquipementRepository;
import com.motori.product_service.repository.InventoryRepository;
import com.motori.product_service.repository.PartRepository;
import com.motori.product_service.specification.InventorySpecification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository repository;
    private final PartRepository partRepository;
    private final EquipementRepository equipementRepository;
    private final InventoryMapper mapper;

    // ─── CREATE ───────────────────────────────────────────────
    public InventoryResponse create(InventoryRequest request) {

    // Validation : exactement un des deux doit être renseigné
    boolean hasPart = request.partId() != null;
    boolean hasEquipement = request.equipementId() != null;

    if (!hasPart && !hasEquipement) {
        throw new IllegalArgumentException(
            "Un inventory doit contenir soit une pièce, soit un équipement"
        );
    }

    if (hasPart && hasEquipement) {
        throw new IllegalArgumentException(
            "Un inventory ne peut pas contenir à la fois une pièce et un équipement"
        );
    }

    Inventory inventory = mapper.toEntity(request);

    if (hasPart) {
        Parts part = partRepository
            .findById(request.partId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Pièce introuvable avec l'id : " + request.partId()
            ));
        inventory.setPart(part);
    }

    if (hasEquipement) {
        Equipement equipement = equipementRepository
            .findById(request.equipementId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Équipement introuvable avec l'id : " + request.equipementId()
            ));
        inventory.setEquipement(equipement);
    }

    inventory.setPaymentStatus(PayementStatus.PENDING);

    return mapper.toResponse(repository.save(inventory));
}
    // ─── GET BY ID ────────────────────────────────────────────
    public InventoryResponse getById(UUID id) {
        return repository
            .findById(id)
            .map(mapper::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Inventory introuvable avec l'id : " + id
            ));
    }

    // ─── GET ALL ──────────────────────────────────────────────
    public Page<InventoryResponse> getAll(InventoryFilterRequest filter, Pageable pageable) {
        log.debug("Récupération des inventaires avec filtres : {}", filter);
        Specification<Inventory> spec = InventorySpecification.withFilters(filter);
        return repository.findAll(spec, pageable)
            .map(mapper::toResponse);
    }

    // ─── DELETE (soft) ────────────────────────────────────────
    public void delete(UUID id) {
        Inventory inventory = repository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Inventory introuvable avec l'id : " + id
            ));

        if (inventory.getSoldAt() != null) {
            throw new IllegalStateException(
                "Impossible de supprimer un article déjà vendu"
            );
        }
        repository.delete(inventory);
    }
} 
