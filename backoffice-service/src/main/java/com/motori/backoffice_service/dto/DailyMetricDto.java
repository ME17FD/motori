package com.motori.backoffice_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@Schema(description = "Point journalier pour courbe dashboard")
public class DailyMetricDto {

    @Schema(description = "Jour")
    private LocalDate date;

    @Schema(description = "Nombre de commandes du jour")
    private long ordersCount;

    @Schema(description = "Chiffre d'affaires du jour")
    private BigDecimal revenue;
}
