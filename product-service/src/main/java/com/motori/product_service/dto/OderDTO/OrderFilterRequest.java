package com.motori.product_service.dto.OderDTO;

import java.util.UUID;

public record OrderFilterRequest(
    String status,       // PENDING, CONFIRMED, DELIVERED, CANCELLED
    Boolean completed,   // true = complétée, false = en cours
    UUID userId          
) {}
