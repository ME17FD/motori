package com.motori.user_service.dto.auth;

import com.motori.user_service.models.User;

public record AuthResponse(
        Long id,
        String token,
        String refreshToken,
        String email,
        String firstname,
        String lastname,
        String role,
        Boolean approved,
        Boolean activated,
        Boolean firstLogin,
        String status
) {
    public static AuthResponse fromUser(User user, String token, String refreshToken) {
        return new AuthResponse(
                user.getId(),
                token,
                refreshToken,
                user.getEmail(),
                user.getFirstname(),
                user.getLastname(),
                user.getRole().name(),
                user.getApproved(),
                user.getActivated(),
                user.getLastLoginAt() == null,
                user.getStatus() != null ? user.getStatus().name() : null
        );
    }

    public static AuthResponse fromUser(User user, String token) {
        return fromUser(user, token, null);
    }

    public static AuthResponse fromUser(User user) {
        return fromUser(user, null, null);
    }
}
