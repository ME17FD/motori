package com.motori.product_service.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security configuration for the application.
 * 
 * Configures OAuth2 resource server with JWT authentication and authorization.
 * 
 * Authorization rules:
 * - Public endpoints: All GET requests, Swagger UI, API docs, health checks
 * - Protected endpoints: POST and DELETE /orders/** require authentication
 * - Session management: Stateless - uses JWT tokens instead of sessions
 * - CSRF protection: Disabled for stateless API
 * 
 * JWT tokens are validated using Keycloak realm roles.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Configures the security filter chain for HTTP requests.
     * 
     * Sets up:
     * - CSRF protection disabled (stateless API)
     * - Stateless session management (JWT-based)
     * - Public access to Swagger/OpenAPI documentation
     * - Public access to actuator health endpoints
     * - Authentication required for POST/DELETE operations on orders
     * - OAuth2 resource server with JWT validation
     * 
     * @param http the HttpSecurity configuration object
     * @return the configured SecurityFilterChain
     * @throws Exception if configuration fails
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/api-docs/**",
                    "/actuator/health",
                    "/actuator/info"
                ).permitAll()
                .requestMatchers(
                    org.springframework.http.HttpMethod.POST, "/orders/**"
                ).authenticated()
                .requestMatchers(
                    org.springframework.http.HttpMethod.DELETE, "/orders/**"
                ).authenticated()
                .anyRequest().permitAll()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
            );

        return http.build();
    }

    /**
     * Configures JWT authentication converter with roles from Keycloak.
     * 
     * Extracts authorities from the 'realm_access.roles' claim in the JWT token
     * and prefixes them with 'ROLE_' for Spring Security compatibility.
     * 
     * @return configured JwtAuthenticationConverter
     */
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter converter = new JwtGrantedAuthoritiesConverter();
        converter.setAuthorityPrefix("ROLE_");
        converter.setAuthoritiesClaimName("realm_access.roles");

        JwtAuthenticationConverter jwtConverter = new JwtAuthenticationConverter();
        jwtConverter.setJwtGrantedAuthoritiesConverter(converter);
        return jwtConverter;
    }
}