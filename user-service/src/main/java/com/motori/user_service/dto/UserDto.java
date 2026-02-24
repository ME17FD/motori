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
    Boolean approved,
    Boolean activated,
    LocalDateTime createdAt,
    String role,
    Long managerId,
    String profilePictureId
) {
    public static UserDto fromEntity(User user) {
        return new UserDto(
            user.getId(),
            user.getFirstname(),
            user.getLastname(),
            user.getEmail(),
            user.getPhone(),
            user.getAdress(),
            user.getApproved(),
            user.getActivated(),
            user.getCreatedAt(),
            user.getRole() != null ? user.getRole().name() : null,
            user.getManager() != null ? user.getManager().getId() : null,
            user.getProfilePictureId()
        );
    }
}
