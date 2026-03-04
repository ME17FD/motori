package com.motori.product_service.mapper;

import org.springframework.stereotype.Component;


import com.motori.product_service.dto.InventoryDTO.InventoryRequest;
import com.motori.product_service.dto.InventoryDTO.InventoryResponse;
import com.motori.product_service.models.Inventory;

@Component
public class InventoryMapper {

    private final PartMapper partMapper;
    private final EquipementMapper equipementMapper;

    public InventoryMapper(PartMapper partMapper,
                           EquipementMapper equipementMapper) {
        this.partMapper       = partMapper;
        this.equipementMapper = equipementMapper;
    }

    public InventoryResponse toResponse(Inventory inventory) {
    return new InventoryResponse(
        inventory.getId(),
        inventory.getPart() != null
            ? partMapper.toResponse(inventory.getPart())
            : null,
        inventory.getEquipement() != null
            ? equipementMapper.toResponse(inventory.getEquipement())
            : null,
        inventory.getExpiredAt(),
        inventory.getSoldAt(),
        inventory.getPaymentStatus().name(),
        inventory.getCreatedAt()
    );
}
    public Inventory toEntity(InventoryRequest request) {
        return Inventory.builder()
            .expiredAt(request.expiredAt())
            .build();
    }
}

