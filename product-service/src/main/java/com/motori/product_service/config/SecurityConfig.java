package com.motori.product_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/api-docs/**",
                    "/api-docs.yaml",
                    "/actuator/health",  // ← public
                    "/actuator/info"     // ← public
                ).permitAll()
                .requestMatchers("/actuator/**").denyAll()
                .anyRequest().permitAll()
                // ↑ tous les autres endpoints Actuator bloqués
            );

        return http.build();
    }
}
