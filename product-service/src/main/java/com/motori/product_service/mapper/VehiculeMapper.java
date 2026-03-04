package com.motori.product_service.mapper;

import org.springframework.stereotype.Component;

import com.motori.product_service.dto.VehiculeDTO.VehiculeRequest;
import com.motori.product_service.dto.VehiculeDTO.VehiculeResponse;
import com.motori.product_service.models.Vehicule;

@Component
public class VehiculeMapper {

    private final VehiculeBrandMapper vehiculeBrandMapper;

    public VehiculeMapper(VehiculeBrandMapper vehiculeBrandMapper) {
        this.vehiculeBrandMapper = vehiculeBrandMapper;
    }

    public VehiculeResponse toResponse(Vehicule vehicule) {
        return new VehiculeResponse(
            vehicule.getId(),
            vehicule.getModel(),
            vehicule.getName(),
            vehiculeBrandMapper.toResponse(vehicule.getVehiculeBrandId())
        );
    }

    public Vehicule toEntity(VehiculeRequest request) {
        return Vehicule.builder()
            .model(request.model())
            .name(request.name())
            .build();
    }
} 
    

