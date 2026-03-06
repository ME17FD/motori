package com.motori.product_service.mapper;

import org.springframework.stereotype.Component;

import com.motori.product_service.dto.VehiculeBrandDTO.VehiculeBrandRequest;
import com.motori.product_service.dto.VehiculeBrandDTO.VehiculeBrandResponse;
import com.motori.product_service.models.VehiculeBrand;

@Component
public class VehiculeBrandMapper {

    public VehiculeBrandResponse toResponse(VehiculeBrand brand) {
        return new VehiculeBrandResponse(
            brand.getId(),
            brand.getName(),
            brand.getCreatedAt(),
            brand.getUpdatedAt()  
        );
    }

    public VehiculeBrand toEntity(VehiculeBrandRequest request) {
        return VehiculeBrand.builder()
            .name(request.name())
            .build();
    }
}