package com.motori.backoffice_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
@Schema(description = "Vue consolidée du dashboard backoffice")
public class StatisticsOverviewDto {

    @Schema(description = "Résumé du jour")
    private TodaySummaryDto today;

    @Schema(description = "KPI de période")
    private KpiSummaryDto periodKpis;

    @Schema(description = "Répartition des commandes par statut (global)")
    private Map<String, Long> statusBreakdown;

    @Schema(description = "Courbe journalière commandes + CA sur la période")
    private List<DailyMetricDto> dailyMetrics;

    @Schema(description = "Top produits vendus sur la période")
    private List<TopProductDto> topProducts;
}
