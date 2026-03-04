package com.motori.product_service.mapper;

import org.springframework.stereotype.Component;

import com.motori.product_service.dto.EquipementBrandDTO.EquipementBrandRequest;
import com.motori.product_service.dto.EquipementBrandDTO.EquipementBrandResponse;
import com.motori.product_service.models.EquipementBrand;

@Component
public class EquipementBrandMapper {

    public EquipementBrandResponse toResponse(EquipementBrand brand) {
        return new EquipementBrandResponse(
            brand.getId(),
            brand.getName()
        );
    }

    public EquipementBrand toEntity(EquipementBrandRequest request) {
        return EquipementBrand.builder()
            .name(request.name())
            .build();
    }
}