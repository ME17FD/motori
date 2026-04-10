package com.motori.gateway.security;

import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

import com.motori.gateway.constants.GatewayConstants;

@Configuration
@EnableWebFluxSecurity
@ConditionalOnProperty(name = "gateway.security.jwt-validation-enabled", havingValue = "true", matchIfMissing = true)
public class GatewaySecurityConfig {

    @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri}")
    private String jwkSetUri;

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        String[] publicPatterns = Stream.concat(
            GatewayConstants.PUBLIC_ENDPOINTS.stream().map(e -> e + "/**"),
            GatewayConstants.PUBLIC_PATHS.stream()
        ).toArray(String[]::new);

        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchanges -> exchanges
                        .pathMatchers(publicPatterns).permitAll()
                        .anyExchange().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwkSetUri(jwkSetUri))
                )
                .build();
    }
}