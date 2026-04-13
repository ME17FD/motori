package com.motori.backoffice_service.controller;

import com.motori.backoffice_service.dto.DailyMetricDto;
import com.motori.backoffice_service.dto.KpiSummaryDto;
import com.motori.backoffice_service.dto.StatisticsDto;
import com.motori.backoffice_service.dto.StatisticsOverviewDto;
import com.motori.backoffice_service.dto.TopProductDto;
import com.motori.backoffice_service.dto.TodaySummaryDto;
import com.motori.backoffice_service.service.StatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
@Validated
@Tag(name = "Statistiques", description = "Tableau de bord et indicateurs")
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/dashboard")
    @Operation(summary = "Statistiques dashboard (période en jours ou dates personnalisées)")
    public StatisticsDto getDashboard(
            @RequestParam(required = false) @Min(1) @Max(365) Integer days,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int topProducts) {
        if (fromDate != null && toDate != null) {
            return statisticsService.getDashboardStats(fromDate, toDate, topProducts);
        }
        return statisticsService.getDashboardStats(days != null ? days : 30, topProducts);
    }

    @GetMapping("/today")
    @Operation(summary = "Résumé du jour (commandes, CA, en attente, à expédier)")
    public TodaySummaryDto getTodaySummary() {
        return statisticsService.getTodaySummary();
    }

    @GetMapping("/top-products")
    @Operation(summary = "Top produits vendus (sur N jours ou intervalle de dates)")
    public List<TopProductDto> getTopProducts(
            @RequestParam(defaultValue = "30") @Min(1) @Max(365) int days,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int limit) {
        if (fromDate != null && toDate != null) {
            return statisticsService.getTopProducts(fromDate, toDate, limit);
        }
        return statisticsService.getTopProducts(days, limit);
    }

    @GetMapping("/kpis")
    @Operation(summary = "KPI synthétiques (commandes, CA, panier moyen) sur une période")
    public KpiSummaryDto getKpis(
            @RequestParam(required = false) @Min(1) @Max(365) Integer days,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        if (fromDate != null && toDate != null) {
            return statisticsService.getKpiSummary(fromDate, toDate);
        }
        return statisticsService.getKpiSummary(days != null ? days : 30);
    }

    @GetMapping("/status-breakdown")
    @Operation(summary = "Répartition globale des commandes par statut")
    public Map<String, Long> getStatusBreakdown() {
        return statisticsService.getStatusBreakdown();
    }

    @GetMapping("/status-breakdown/period")
    @Operation(summary = "Répartition des commandes par statut sur une période")
    public Map<String, Long> getStatusBreakdownPeriod(
            @RequestParam(required = false) @Min(1) @Max(365) Integer days,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        if (fromDate != null && toDate != null) {
            return statisticsService.getStatusBreakdown(fromDate, toDate);
        }
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays((days != null ? days : 30) - 1L);
        return statisticsService.getStatusBreakdown(start, end);
    }

    @GetMapping("/daily-metrics")
    @Operation(summary = "Série journalière commandes + chiffre d'affaires")
    public List<DailyMetricDto> getDailyMetrics(
            @RequestParam(required = false) @Min(1) @Max(365) Integer days,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        if (fromDate != null && toDate != null) {
            return statisticsService.getDailyMetrics(fromDate, toDate);
        }
        return statisticsService.getDailyMetrics(days != null ? days : 30);
    }

    @GetMapping("/overview")
    @Operation(summary = "Vue consolidée du dashboard (today + kpis + statuts + courbe + top produits)")
    public StatisticsOverviewDto getOverview(
            @RequestParam(required = false) @Min(1) @Max(365) Integer days,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int topProducts) {
        if (fromDate != null && toDate != null) {
            return statisticsService.getOverview(fromDate, toDate, topProducts);
        }
        return statisticsService.getOverview(days != null ? days : 30, topProducts);
    }
}
