package com.motori.backoffice_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@Schema(description = "Produit le plus vendu (statistiques)")
public class TopProductDto {

    @Schema(description = "ID ligne de stock (inventory)")
    private UUID inventoryId;

    @Schema(description = "Nom produit")
    private String productName;

    @Schema(description = "Quantité vendue")
    private long quantitySold;

    @Schema(description = "Montant total des ventes")
    private BigDecimal totalAmount;
}
