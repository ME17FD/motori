package com.motori.gateway.exception;

import org.springframework.http.HttpStatus;

public class InvalidRequestException extends GatewayException {

    public static final String ERROR_CODE = "INVALID_REQUEST";

    public InvalidRequestException(String message) {
        super(message, ERROR_CODE, HttpStatus.BAD_REQUEST.value());
    }

    public static InvalidRequestException missingAuthorizationHeader() {
        return new InvalidRequestException("Missing Authorization header");
    }

    public static InvalidRequestException invalidAuthorizationFormat() {
        return new InvalidRequestException("Invalid Authorization header format");
    }
}
