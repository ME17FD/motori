package com.motori.backoffice_service.dto;

import com.motori.order.model.OrderItem;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
@Schema(description = "Ligne de commande")
public class OrderItemDto {

    @Schema(description = "ID du produit")
    private Long productId;

    @NotNull
    @Positive
    @Schema(description = "Quantité", example = "2")
    private Integer quantity;

    @NotNull
    @DecimalMin("0")
    @Schema(description = "Prix unitaire", example = "99.99")
    private BigDecimal unitPrice;

    @Schema(description = "Nom du produit (optionnel)")
    private String productName;

    public static OrderItemDto fromEntity(OrderItem item) {
        return OrderItemDto.builder()
                .productId(item.getProductId())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .productName(item.getProductName())
                .build();
    }
}
