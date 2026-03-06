package com.motori.product_service.dto.EquipementDTO;

import java.math.BigDecimal;
import java.util.UUID;

public record EquipementFilterRequest(
    String name,           
    UUID brandId,
    UUID categoryId,
    BigDecimal minPrice,
    BigDecimal maxPrice,
    String size           
) {}
