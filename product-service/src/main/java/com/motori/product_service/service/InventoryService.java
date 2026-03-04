package com.motori.product_service.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

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

import lombok.RequiredArgsConstructor;

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
            .findByIdAndDeletedAtIsNull(request.partId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Pièce introuvable avec l'id : " + request.partId()
            ));
        inventory.setPart(part);
    }

    if (hasEquipement) {
        Equipement equipement = equipementRepository
            .findByIdAndDeletedAtIsNull(request.equipementId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Équipement introuvable avec l'id : " + request.equipementId()
            ));
        inventory.setEquipement(equipement);
    }

    inventory.setPaymentStatus(PayementStatus.PENDING);
    inventory.setCreatedAt(LocalDateTime.now());

    return mapper.toResponse(repository.save(inventory));
}
    // ─── GET BY ID ────────────────────────────────────────────
    public InventoryResponse getById(UUID id) {
        return repository
            .findByIdAndDeletedAtIsNull(id)
            .map(mapper::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Inventory introuvable avec l'id : " + id
            ));
    }

    // ─── GET ALL ──────────────────────────────────────────────
    public List<InventoryResponse> getAll() {
        return repository.findAllByDeletedAtIsNull()
            .stream()
            .map(mapper::toResponse)
            .toList();
    }

    // ─── DELETE (soft) ────────────────────────────────────────
    public void delete(UUID id) {
        Inventory inventory = repository
            .findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Inventory introuvable avec l'id : " + id
            ));

        if (inventory.getSoldAt() != null) {
            throw new IllegalStateException(
                "Impossible de supprimer un article déjà vendu"
            );
        }

        inventory.setDeletedAt(LocalDateTime.now());
        repository.save(inventory);
    }
} 
