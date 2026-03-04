package com.motori.product_service.mapper;

import java.util.UUID;

import org.springframework.stereotype.Component;

import com.motori.product_service.dto.EquipementCategoryDTO.EquipementCategoryRequest;
import com.motori.product_service.dto.EquipementCategoryDTO.EquipementCategoryResponse;
import com.motori.product_service.models.EquipementCategory;

@Component
public class EquipementCategoryMapper {

    public EquipementCategoryResponse toResponse(EquipementCategory category) {

        UUID parentId = null;
        String parentName = null;

        if (category.getParent() != null) {
            parentId   = category.getParent().getId();
            parentName = category.getParent().getName();
        }

        return new EquipementCategoryResponse(
            category.getId(),
            category.getName(),
            parentId,
            parentName
        );
    }

    public EquipementCategory toEntity(EquipementCategoryRequest request) {
        return EquipementCategory.builder()
            .name(request.name())
            .build();
    }
}
