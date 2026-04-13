package com.motori.backoffice_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@Builder
@Schema(description = "Statistiques globales (dashboard)")
public class StatisticsDto {

    @Schema(description = "Nombre total de commandes")
    private long totalOrders;

    @Schema(description = "Chiffre d'affaires total")
    private BigDecimal totalRevenue;

    @Schema(description = "Nombre de commandes par statut")
    private Map<String, Long> ordersByStatus;

    @Schema(description = "Commandes sur la période (ex: dernier mois)")
    private long ordersInPeriod;

    @Schema(description = "CA sur la période")
    private BigDecimal revenueInPeriod;

    @Schema(description = "Début de la période (optionnel)")
    private LocalDate periodFrom;

    @Schema(description = "Fin de la période (optionnel)")
    private LocalDate periodTo;

    @Schema(description = "Top produits vendus sur la période")
    private List<TopProductDto> topProducts;
}
