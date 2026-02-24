package com.motori.gateway.exception;

import org.springframework.http.HttpStatus;

public class JwtAuthenticationException extends GatewayException {

    public static final String ERROR_CODE = "JWT_AUTHENTICATION_ERROR";

    public JwtAuthenticationException(String message) {
        super(message, ERROR_CODE, HttpStatus.UNAUTHORIZED.value());
    }

    public static JwtAuthenticationException missingToken() {
        return new JwtAuthenticationException("JWT token is missing");
    }

    public static JwtAuthenticationException invalidTokenFormat() {
        return new JwtAuthenticationException("Invalid JWT token format");
    }

    public static JwtAuthenticationException invalidSignature(String details) {
        return new JwtAuthenticationException("JWT signature validation failed: " + details);
    }

    public static JwtAuthenticationException expiredToken() {
        return new JwtAuthenticationException("JWT token has expired");
    }

    public static JwtAuthenticationException keyNotFound(String keyId) {
        return new JwtAuthenticationException("Public key not found for keyId: " + keyId);
    }
}
