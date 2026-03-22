package com.motori.backoffice_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
@Schema(description = "Produit le plus vendu (statistiques)")
public class TopProductDto {

    @Schema(description = "ID produit")
    private Long productId;

    @Schema(description = "Nom produit")
    private String productName;

    @Schema(description = "Quantité vendue")
    private long quantitySold;

    @Schema(description = "Montant total des ventes")
    private BigDecimal totalAmount;
}
