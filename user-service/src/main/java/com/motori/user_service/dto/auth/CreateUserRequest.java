package com.motori.user_service.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.lang.Nullable;

public record CreateUserRequest(
        @NotBlank(message = "First name is required")
        String firstname,

        @NotBlank(message = "Last name is required")
        String lastname,

        @NotBlank(message = "Email is required")
        @Email(message = "Email should be valid")
        String email,

        @Nullable
        String phone,

        @Nullable
        String adress,

        @NotBlank(message = "Password is required")
        String password

<<<<<<< HEAD

) {

=======
        @NotBlank(message = "Role is required (ADMIN or USER)")
        String role
) {
    public CreateUserRequest {
        if (role != null) {
            String r = role.toUpperCase();
            if (!"ADMIN".equals(r) && !"USER".equals(r))
                role = "USER";
        }
        if (role == null || role.isBlank()) role = "USER";
    }
>>>>>>> backoffice-frontend
}
