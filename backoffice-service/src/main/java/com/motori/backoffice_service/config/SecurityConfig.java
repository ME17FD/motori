package com.motori.backoffice_service.config;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.web.SecurityFilterChain;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/eureka/**").permitAll()
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs", "/v3/api-docs/**").permitAll()
                        .requestMatchers("/api/orders/**", "/api/statistics/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                );
        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(this::extractAuthoritiesFromJwt);
        return converter;
    }

    private Collection<GrantedAuthority> extractAuthoritiesFromJwt(Jwt token) {
        // Keycloak default claim: realm_access.roles = ["ADMIN", ...]
        Map<String, Object> realmAccess = token.getClaim("realm_access");
        if (realmAccess == null) return Collections.emptyList();

        Object rolesObj = realmAccess.get("roles");
        if (!(rolesObj instanceof List<?> roles)) return Collections.emptyList();

        return roles.stream()
                .map(role -> role != null ? String.valueOf(role) : null)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(r -> !r.isEmpty())
                // Spring expects ROLE_ prefix for hasRole("X")
                .map(role -> "ROLE_" + role)
                .map(role -> (GrantedAuthority) new SimpleGrantedAuthority(role))
                .collect(Collectors.toList());
    }
}
