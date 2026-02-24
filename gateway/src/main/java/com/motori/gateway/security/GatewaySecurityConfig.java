package com.motori.gateway.security;

import com.motori.gateway.constants.GatewayConstants;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
@ConditionalOnProperty(name = "gateway.security.jwt-validation-enabled", havingValue = "true", matchIfMissing = true)
public class GatewaySecurityConfig {

    @Value("${keycloak.auth-server-url:http://localhost:8082}")
    private String keycloakUrl;

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchanges -> {
                    GatewayConstants.PUBLIC_ENDPOINTS.forEach(endpoint ->
                            exchanges.pathMatchers(endpoint + "/**").permitAll()
                    );
                    GatewayConstants.PUBLIC_PATHS.forEach(path ->
                            exchanges.pathMatchers(path).permitAll()
                    );
                    exchanges.anyExchange().permitAll();
                })
                .build();
    }
}
