package com.motori.user_service.dto.auth;

public record TokenResponse(
        String accessToken,
        String refreshToken
) {}
