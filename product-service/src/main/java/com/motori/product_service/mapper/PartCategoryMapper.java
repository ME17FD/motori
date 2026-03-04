package com.motori.product_service.mapper;

import java.util.UUID;

import org.springframework.stereotype.Component;

import com.motori.product_service.dto.PartCategoryDTO.PartCategoryRequest;
import com.motori.product_service.dto.PartCategoryDTO.PartCategoryResponse;
import com.motori.product_service.models.PartCategory;

@Component
public class PartCategoryMapper {

    public PartCategoryResponse toResponse(PartCategory category) {

        UUID parentId = null;
        String parentName = null;
        
        if (category.getParent() != null) {
            parentId   = category.getParent().getId();
            parentName = category.getParent().getName();
        }

        return new PartCategoryResponse(
            category.getId(),
            category.getName(),
            parentId,
            parentName
        );
    }

    public PartCategory toEntity(PartCategoryRequest request) {
        return PartCategory.builder()
            .name(request.name())
            .build();
    }
}
