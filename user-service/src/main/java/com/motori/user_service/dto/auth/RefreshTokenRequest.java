package com.motori.user_service.dto.auth;

public record RefreshTokenRequest(String refreshToken, String email) {}
