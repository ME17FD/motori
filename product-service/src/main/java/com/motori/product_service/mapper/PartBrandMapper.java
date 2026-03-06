package com.motori.product_service.mapper;

import org.springframework.stereotype.Component;

import com.motori.product_service.dto.PartBrandDTO.PartBrandRequest;
import com.motori.product_service.dto.PartBrandDTO.PartBrandResponse;
import com.motori.product_service.models.PartBrand;

@Component
public class PartBrandMapper {

    public PartBrandResponse toResponse(PartBrand brand) {
        return new PartBrandResponse(
            brand.getId(),
            brand.getName(),
            brand.getCreatedAt(),
            brand.getUpdatedAt() 
        );
    }

    public PartBrand toEntity(PartBrandRequest request) {
        return PartBrand.builder()
            .name(request.name())
            .build();
    }
}
