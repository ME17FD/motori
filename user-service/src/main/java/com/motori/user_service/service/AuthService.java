package com.motori.user_service.service;

import com.motori.user_service.dto.auth.AuthRequest;
import com.motori.user_service.dto.auth.AuthResponse;
import com.motori.user_service.dto.auth.CreateUserRequest;
import com.motori.user_service.dto.auth.RegisterRequest;
import com.motori.user_service.exception.UserAlreadyExistsException;
import com.motori.user_service.exception.UserNotFoundException;
import com.motori.user_service.models.User;
import com.motori.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CentralizedLogService logService;
    private final KeycloakService keycloakService;

    /** Inscription publique : rôle USER par défaut */
    public AuthResponse register(RegisterRequest request) {
        AuthResponse response = keycloakService.register(request, User.Role.USER.name());
        User savedUser = userRepository.findByEmail(request.email()).orElseThrow(() -> new UserNotFoundException("User not found after registration"));
        logService.log(CentralizedLogService.LogLevel.INFO, "User registered: " + savedUser.getEmail(), CentralizedLogService.createLoggerName("AuthService", "register"), savedUser.getEmail(), null, "/auth/register", "register", null, null);
        return response;
    }

    public AuthResponse authenticate(AuthRequest request, String clientIp) {
        userRepository.findByEmail(request.email()).orElseThrow(() -> new UserNotFoundException("User not found"));
        return keycloakService.authenticate(request);
    }

    /** Création d'utilisateur (ADMIN ou USER) : réservé aux ADMIN */
    public User createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            logService.authWarn("User creation failed: User already exists - " + request.email(), "AuthService", request.email());
            throw new UserAlreadyExistsException("User with email " + request.email() + " already exists");
        }
        String roleName = "ADMIN".equalsIgnoreCase(request.role()) ? "ADMIN" : "USER";
        keycloakService.register(
                new RegisterRequest(request.firstname(), request.lastname(), request.email(), request.phone(), request.adress(), request.password(), null),
                roleName
        );
        return userRepository.findByEmail(request.email()).orElseThrow(() -> new UserNotFoundException("User not found after creation"));
    }
}
