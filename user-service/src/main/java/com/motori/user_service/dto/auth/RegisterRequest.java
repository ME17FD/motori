package com.motori.user_service.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.lang.Nullable;

public record RegisterRequest(
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

        @Nullable
        Long managerId
) {}
