package com.motori.backoffice_service.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI backofficeOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Backoffice Service API")
                        .description("Backoffice : statistiques, suivi des commandes, export. " +
                                "La création des commandes est gérée par product-service. " +
                                "Base de données partagée : motori_products.")
                        .version("1.0"));
    }
}
