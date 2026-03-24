package com.motori.backoffice_service.dto;

import com.motori.order.model.Order;
import com.motori.order.model.OrderStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@Builder
@Schema(description = "Commande")
public class OrderDto {

    @Schema(description = "ID de la commande (UUID)")
    private UUID id;

    @NotNull
    @Schema(description = "Identifiant utilisateur (ex. sujet Keycloak)")
    private String userId;

    @Schema(description = "Statut de la commande")
    private OrderStatus status;

    @NotNull
    @DecimalMin("0")
    @Schema(description = "Montant total")
    private BigDecimal totalAmount;

    @Schema(description = "Adresse de livraison")
    private String shippingAddress;

    @Schema(description = "Numéro de suivi (tracking)")
    private String trackingNumber;

    @Schema(description = "Date de création")
    private LocalDateTime createdAt;

    @Schema(description = "Date de mise à jour")
    private LocalDateTime updatedAt;

    @Schema(description = "Lignes de commande")
    private List<OrderItemDto> items;

    @Data
    @Builder
    @Schema(description = "Requête de création de commande")
    public static class CreateRequest {
        @NotNull
        private String userId;
        @NotEmpty
        @Valid
        private List<OrderItemDto> items;
        private String shippingAddress;
    }

    @Data
    @Builder
    @Schema(description = "Requête de mise à jour du suivi")
    public static class UpdateTrackingRequest {
        @Schema(description = "Numéro de suivi colis")
        private String trackingNumber;
        @Schema(description = "Nouveau statut")
        private OrderStatus status;
    }

    public static OrderDto fromEntity(Order order) {
        return OrderDto.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(order.getShippingAddress())
                .trackingNumber(order.getTrackingNumber())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(order.getItems() != null
                        ? order.getItems().stream().map(OrderItemDto::fromEntity).collect(Collectors.toList())
                        : List.of())
                .build();
    }
}
