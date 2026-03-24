package com.motori.backoffice_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@Schema(description = "KPI synthétiques sur une période")
public class KpiSummaryDto {

    @Schema(description = "Début de période")
    private LocalDate periodFrom;

    @Schema(description = "Fin de période")
    private LocalDate periodTo;

    @Schema(description = "Nombre de commandes sur la période")
    private long ordersCount;

    @Schema(description = "Chiffre d'affaires sur la période")
    private BigDecimal revenue;

    @Schema(description = "Panier moyen sur la période")
    private BigDecimal averageOrderValue;
}
