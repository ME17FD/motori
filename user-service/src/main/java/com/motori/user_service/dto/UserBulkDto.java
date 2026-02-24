package com.motori.user_service.dto;

import com.motori.user_service.models.User;

public record UserBulkDto(
    Long id,
    String firstname,
    String lastname
) {
    public static UserBulkDto fromEntity(User user) {
        return new UserBulkDto(
            user.getId(),
            user.getFirstname(),
            user.getLastname()
        );
    }
}
