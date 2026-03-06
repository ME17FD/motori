package com.motori.product_service.mapper;

import org.springframework.stereotype.Component;

import com.motori.product_service.dto.PartDTO.PartRequest;
import com.motori.product_service.dto.PartDTO.PartResponse;
import com.motori.product_service.models.Parts;

@Component
public class PartMapper {

    private final PartBrandMapper partBrandMapper;
    private final PartCategoryMapper partCategoryMapper;

    public PartMapper(PartBrandMapper partBrandMapper,
                      PartCategoryMapper partCategoryMapper) {
        this.partBrandMapper    = partBrandMapper;
        this.partCategoryMapper = partCategoryMapper;
    }

    public PartResponse toResponse(Parts part) {
        return new PartResponse(
            part.getId(),
            part.getName(),
            part.getRef(),
            part.getDescription(),
            part.getPrice(),
            partBrandMapper.toResponse(part.getPartBrand()),
            partCategoryMapper.toResponse(part.getPartCategory()),
            part.getImageUrl(),
            part.getCreatedAt(),
            part.getUpdatedAt()
        );
    }

    public Parts toEntity(PartRequest request) {
        return Parts.builder()
            .name(request.name())
            .ref(request.ref())
            .description(request.description())
            .price(request.price())
            .build();
    }
}
