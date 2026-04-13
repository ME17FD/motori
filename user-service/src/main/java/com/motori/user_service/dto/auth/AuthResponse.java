package com.motori.user_service.dto.auth;

import com.motori.user_service.models.User;

public record AuthResponse(
        Long id,
        String token,
        String refreshToken,
        String email,
        String firstname,
<<<<<<< HEAD
        String lastname
=======
        String lastname,
        String role
>>>>>>> backoffice-frontend
) {
    public static AuthResponse fromUser(User user, String token, String refreshToken) {
        return new AuthResponse(
                user.getId(),
                token,
                refreshToken,
                user.getEmail(),
                user.getFirstname(),
<<<<<<< HEAD
                user.getLastname()
=======
                user.getLastname(),
                user.getRole() != null ? user.getRole().name() : "USER"
>>>>>>> backoffice-frontend
        );
    }

    public static AuthResponse fromUser(User user, String token) {
        return fromUser(user, token, null);
    }

    public static AuthResponse fromUser(User user) {
        return fromUser(user, null, null);
    }
}
