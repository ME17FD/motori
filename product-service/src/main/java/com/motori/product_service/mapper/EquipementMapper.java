package com.motori.product_service.mapper;

import org.springframework.stereotype.Component;

import com.motori.product_service.dto.EquipementDTO.EquipementRequest;
import com.motori.product_service.dto.EquipementDTO.EquipementResponse;
import com.motori.product_service.models.Equipement;

@Component
public class EquipementMapper{

    private final EquipementBrandMapper equipementBrandMapper;
    private final EquipementCategoryMapper equipementCategoryMapper;

    public EquipementMapper(EquipementBrandMapper equipementBrandMapper,
                            EquipementCategoryMapper equipementCategoryMapper) {
        this.equipementBrandMapper    = equipementBrandMapper;
        this.equipementCategoryMapper = equipementCategoryMapper;
    }

    public EquipementResponse toResponse(Equipement equipement) {
        return new EquipementResponse(
            equipement.getId(),
            equipement.getSize().name(),
            equipement.getColor(),
            equipement.getName(),
            equipement.getDescription(),
            equipement.getPrice(),
            equipementBrandMapper.toResponse(equipement.getEquipementBrandId()),
            equipementCategoryMapper.toResponse(equipement.getEquipementCategoryId()),
            equipement.getImageUrl(),
            equipement.getProperties(),
            equipement.getCreatedAt(),
            equipement.getUpdatedAt()
        );
    }

    public Equipement toEntity(EquipementRequest request) {
        return Equipement.builder()
            .size(request.size())
            .color(request.color())
            .name(request.name())
            .description(request.description())
            .price(request.price())
            .properties(request.properties())
            .build();   
    }
}
