package com.motori.user_service.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.lang.Nullable;

public record CreateUserRequest(
        @NotBlank(message = "First name is required")
        String firstname,

        @NotBlank(message = "Last name is required")
        String lastname,

        @NotBlank(message = "Email is required")
        @Email(message = "Email should be valid")
        String email,

        String phone,
        String adress,

        @NotBlank(message = "Password is required")
        String password,

        @NotNull(message = "Role is required")
        String role,

        @NotNull(message = "Approved status is required")
        Boolean approved,

        Boolean activated,

        @Nullable
        Long managerId
) {
    public CreateUserRequest {
        if (approved == null) {
            approved = true;
        }
        if (activated == null) {
            activated = false;
        }
    }
}
