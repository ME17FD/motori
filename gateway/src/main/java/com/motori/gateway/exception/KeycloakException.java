package com.motori.gateway.exception;

import org.springframework.http.HttpStatus;

public class KeycloakException extends GatewayException {

    public static final String ERROR_CODE = "KEYCLOAK_ERROR";

    public KeycloakException(String message) {
        super(message, ERROR_CODE, HttpStatus.SERVICE_UNAVAILABLE.value());
    }

    public KeycloakException(String message, Throwable cause) {
        super(message, ERROR_CODE, HttpStatus.SERVICE_UNAVAILABLE.value(), cause);
    }

    public static KeycloakException jwksFetchError(Throwable cause) {
        return new KeycloakException("Failed to fetch JWKS from Keycloak", cause);
    }

    public static KeycloakException jwksParseError(Throwable cause) {
        return new KeycloakException("Failed to parse JWKS response", cause);
    }

    public static KeycloakException noKeysFound() {
        return new KeycloakException("No keys found in JWKS response");
    }

    public static KeycloakException invalidKeyFormat(String keyId) {
        return new KeycloakException("Invalid key format for keyId: " + keyId);
    }
}
