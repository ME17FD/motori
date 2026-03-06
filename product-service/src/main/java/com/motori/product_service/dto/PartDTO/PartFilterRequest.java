package com.motori.product_service.dto.PartDTO;

import java.math.BigDecimal;
import java.util.UUID;

public record PartFilterRequest(
    String name,           
    UUID brandId,          
    UUID categoryId,       
    BigDecimal minPrice,   
    BigDecimal maxPrice,   
    UUID vehiculeId        
) {}
