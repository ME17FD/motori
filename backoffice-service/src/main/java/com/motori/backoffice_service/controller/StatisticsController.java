package com.motori.backoffice_service.controller;

import com.motori.backoffice_service.dto.StatisticsDto;
import com.motori.backoffice_service.dto.TopProductDto;
import com.motori.backoffice_service.dto.TodaySummaryDto;
import com.motori.backoffice_service.service.StatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
@Tag(name = "Statistiques", description = "Tableau de bord et indicateurs")
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/dashboard")
    @Operation(summary = "Statistiques dashboard (période en jours ou dates personnalisées)")
    public StatisticsDto getDashboard(
            @RequestParam(required = false) Integer days,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "10") int topProducts) {
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
    @Operation(summary = "Top produits vendus sur une période")
    public List<TopProductDto> getTopProducts(
            @RequestParam(defaultValue = "30") int days,
            @RequestParam(defaultValue = "10") int limit) {
        return statisticsService.getTopProducts(days, limit);
    }
}
