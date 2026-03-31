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
/**
 * Service responsible for managing inventory (stock) items.
 * <p>
 * Handles inventory tracking for both parts and equipment. Each inventory item represents a physical
 * stock unit that must be linked to EITHER a Part OR Equipment, but not both. Validates entity existence
 * before creating inventory entries and prevents deletion of sold items.
 * </p>
 * <p>
 * Business Rules:
 * - Each inventory must reference exactly one of: Part or Equipment
 * - Inventory cannot have both part and equipment references
 * - Sold items (with non-null soldAt timestamp) cannot be deleted
 * - Payment status defaults to PENDING on creation
 * - Supports filtering via dynamic JPA Specifications
 * </p>
 * @author Motori Team
 * @since 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository repository;
    private final PartRepository partRepository;
    private final EquipementRepository equipementRepository;
    private final InventoryMapper mapper;

    /**
     * Creates a new inventory item.
     * <p>
     * Enforces business rule that inventory must contain EXACTLY ONE of: part or equipment.
     * Validates that the referenced part/equipment exists and initializes payment status to PENDING.
     * </p>
     * @param request the inventory creation request with either partId or equipementId (not both)
     * @return the created inventory item
     * @throws IllegalArgumentException if neither partId nor equipementId is provided, or both are provided
     * @throws ResourceNotFoundException if the referenced part or equipment does not exist
     */
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
    /**
     * Retrieves an inventory item by its unique identifier.
     * @param id the unique identifier of the inventory item
     * @return the inventory details including associated part or equipment
     * @throws ResourceNotFoundException if no inventory is found with the given ID
     */
    // ─── GET BY ID ────────────────────────────────────────────
    public InventoryResponse getById(UUID id) {
        return repository
            .findById(id)
            .map(mapper::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Inventory introuvable avec l'id : " + id
            ));
    }

    /**
     * Retrieves inventory items with advanced filtering and pagination.
     * <p>
     * Supports filtering by payment status, item type (part/equipment), and availability.
     * Uses JPA Specifications for dynamic query building.
     * </p>
     * @param filter the filter criteria (paymentStatus, type, soldAt status, etc.)
     * @param pageable pagination parameters (page number, size, sorting)
     * @return a page of inventory items matching the filter criteria
     */
    // ─── GET ALL ──────────────────────────────────────────────
    public Page<InventoryResponse> getAll(InventoryFilterRequest filter, Pageable pageable) {
        log.debug("Récupération des inventaires avec filtres : {}", filter);
        Specification<Inventory> spec = InventorySpecification.withFilters(filter);
        return repository.findAll(spec, pageable)
            .map(mapper::toResponse);
    }

    /**
     * Soft-deletes an inventory item by its ID.
     * <p>
     * Prevents deletion of sold items (those with a non-null soldAt timestamp) to maintain
     * integrity of order history. The item is marked as deleted via the deletedAt field.
     * </p>
     * @param id the unique identifier of the inventory item to delete
     * @throws ResourceNotFoundException if no inventory is found with the given ID
     * @throws IllegalStateException if the inventory item has already been sold
     */
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
