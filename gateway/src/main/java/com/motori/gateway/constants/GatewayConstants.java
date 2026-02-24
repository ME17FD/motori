package com.motori.gateway.constants;

import java.util.Set;

public final class GatewayConstants {

    private GatewayConstants() {}

    public static final String AUTHORIZATION_HEADER = "Authorization";
    public static final String BEARER_PREFIX = "Bearer ";
    public static final String USER_ID_HEADER = "X-User-ID";
    public static final String USER_EMAIL_HEADER = "X-User-Email";
    public static final String USER_ROLES_HEADER = "X-User-Roles";

    public static final String JWT_KID_HEADER = "kid";
    public static final String JWT_MODULUS_KEY = "n";
    public static final String JWT_EXPONENT_KEY = "e";
    public static final String JWT_KEYS_KEY = "keys";
    public static final String JWT_REALM_ACCESS_KEY = "realm_access";
    public static final String JWT_ROLES_KEY = "roles";
    public static final String JWT_EMAIL_KEY = "email";

    public static final String JWKS_ENDPOINT = "/protocol/openid-connect/certs";

    public static final Set<String> PUBLIC_ENDPOINTS = Set.of(
            "/actuator",
            "/api/eureka",
            "/api/auth",
            "/api/public",
            "/api/gateway",
            "/logs"
    );

    public static final Set<String> PUBLIC_PATHS = Set.of(
            "/api/users/register",
            "/api/users/forgot-password",
            "/api/users/reset-password"
    );

    public static final Set<String> ALLOWED_ORIGINS = Set.of("http://localhost:5173");
    public static final Set<String> ALLOWED_METHODS = Set.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH");

    public static final int JWT_FILTER_ORDER = -100;
    public static final String ERROR_EXTRACTING_ROLES = "Error extracting roles: ";
}
