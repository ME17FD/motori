package com.motori.product_service.dto.InventoryDTO;

public record InventoryFilterRequest(
    Boolean available,           
    String paymentStatus,        
    String type                  // PART ou EQUIPEMENT
) {}
