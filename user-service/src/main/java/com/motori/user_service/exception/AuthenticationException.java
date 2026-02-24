package com.motori.user_service.exception;

public class AuthenticationException extends RuntimeException {
    private final String email;

    public AuthenticationException(String message) {
        super(message);
        this.email = null;
    }

    public AuthenticationException(String message, String email) {
        super(message);
        this.email = email;
    }

    public String getEmail() {
        return email;
    }
}
