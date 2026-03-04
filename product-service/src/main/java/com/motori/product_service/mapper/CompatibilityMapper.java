package com.motori.product_service.mapper;

import org.springframework.stereotype.Component;

import com.motori.product_service.dto.CompatibilityDTO.CompatibilityRequest;
import com.motori.product_service.dto.CompatibilityDTO.CompatibilityResponse;
import com.motori.product_service.models.Compatibility;

 @Component
public class CompatibilityMapper {

    private final PartMapper partMapper;
    private final VehiculeMapper vehiculeMapper;

    public CompatibilityMapper(PartMapper partMapper,
                               VehiculeMapper vehiculeMapper) {
        this.partMapper     = partMapper;
        this.vehiculeMapper = vehiculeMapper;
    }

    public CompatibilityResponse toResponse(Compatibility compatibility) {
        return new CompatibilityResponse(
            compatibility.getId(),
            partMapper.toResponse(compatibility.getPart()),
            vehiculeMapper.toResponse(compatibility.getVehicule()),
            compatibility.getCreatedAt()
        );
    }

    public Compatibility toEntity(CompatibilityRequest request) {
        return Compatibility.builder()
            // part et vehicule → injectés par le Service
            .build();
    }
} 
    

