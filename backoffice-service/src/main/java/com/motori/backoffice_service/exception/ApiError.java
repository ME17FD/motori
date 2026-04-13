package com.motori.backoffice_service.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Erreur API standardisée")
public class ApiError {

    @Schema(description = "Timestamp")
    private Instant timestamp;

    @Schema(description = "Code HTTP")
    private int status;

    @Schema(description = "Erreur (ex: Not Found)")
    private String error;

    @Schema(description = "Message")
    private String message;

    @Schema(description = "Chemin de la requête")
    private String path;

    @Schema(description = "Détails de validation (optionnel)")
    private List<FieldErrorDto> fieldErrors;

    @Data
    @Builder
    @Schema(description = "Erreur de champ (validation)")
    public static class FieldErrorDto {
        private String field;
        private String message;
        private Object rejectedValue;
    }
}
