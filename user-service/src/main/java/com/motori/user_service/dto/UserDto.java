package com.motori.user_service.dto;

import com.motori.user_service.models.User;

import java.time.LocalDateTime;

public record UserDto(
    Long id,
    String firstname,
    String lastname,
    String email,
    String phone,
    String adress,
<<<<<<< HEAD
=======
    User.Role role,
>>>>>>> backoffice-frontend
    LocalDateTime createdAt,
    String keycloakId
) {
    public static UserDto fromEntity(User user) {
        return new UserDto(
            user.getId(),
            user.getFirstname(),
            user.getLastname(),
            user.getEmail(),
            user.getPhone(),
            user.getAdress(),
<<<<<<< HEAD
=======
            user.getRole(),
>>>>>>> backoffice-frontend
            user.getCreatedAt(),
            user.getKeycloakId()
        );
    }
}
