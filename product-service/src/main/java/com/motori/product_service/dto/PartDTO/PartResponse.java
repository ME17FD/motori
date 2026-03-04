package com.motori.product_service.dto.PartDTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.motori.product_service.dto.PartBrandDTO.PartBrandResponse;
import com.motori.product_service.dto.PartCategoryDTO.PartCategoryResponse;

public record PartResponse(
    UUID id,
    String name,
    String ref,
    String description,
    BigDecimal price,
    PartBrandResponse brand,           
    PartCategoryResponse  category,     
    LocalDateTime createdAt
    
) {}
