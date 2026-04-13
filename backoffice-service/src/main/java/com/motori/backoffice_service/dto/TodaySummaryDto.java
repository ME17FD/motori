package com.motori.backoffice_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
@Schema(description = "Résumé du jour (tableau de bord)")
public class TodaySummaryDto {

    @Schema(description = "Nombre de commandes aujourd'hui")
    private long ordersToday;

    @Schema(description = "Chiffre d'affaires du jour")
    private BigDecimal revenueToday;

    @Schema(description = "Commandes en attente (PENDING)")
    private long pendingOrders;

    @Schema(description = "Commandes à expédier (CONFIRMED / PROCESSING)")
    private long toShipOrders;
}
