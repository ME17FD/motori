package com.motori.user_service.service;

import com.motori.user_service.dto.auth.AuthRequest;
import com.motori.user_service.dto.auth.AuthResponse;
import com.motori.user_service.dto.auth.CreateUserRequest;
import com.motori.user_service.dto.auth.RegisterRequest;
import com.motori.user_service.exception.UserAlreadyExistsException;
import com.motori.user_service.exception.UserNotApprovedException;
import com.motori.user_service.exception.UserNotFoundException;
import com.motori.user_service.models.User;
import com.motori.user_service.models.VerificationToken;
import com.motori.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CentralizedLogService logService;
    private final KeycloakService keycloakService;
    private final EmailTemplateService emailTemplateService;
    private final VerificationTokenService verificationTokenService;

    public AuthResponse register(RegisterRequest request) {
        AuthResponse response = keycloakService.register(request, User.Role.ADMIN.name());
        User savedUser = userRepository.findByEmail(request.email()).orElseThrow(() -> new UserNotFoundException("User not found after registration"));
        logService.log(CentralizedLogService.LogLevel.INFO, "User registered: " + savedUser.getEmail(), CentralizedLogService.createLoggerName("AuthService", "register"), savedUser.getEmail(), null, "/auth/register", "register", null, null);
        return response;
    }

    public AuthResponse authenticate(AuthRequest request, String clientIp) {
        User user = userRepository.findByEmail(request.email()).orElseThrow(() -> new UserNotFoundException("User not found"));
        if (Boolean.FALSE.equals(user.getApproved())) {
            logService.authWarn("Login failed: User not approved - " + request.email(), "AuthService", request.email(), null, "/auth/login", "authenticate");
            throw new UserNotApprovedException("User account is not approved");
        }
        if (Boolean.FALSE.equals(user.getActivated())) {
            logService.authWarn("Login failed: User not activated - " + request.email(), "AuthService", request.email(), null, "/auth/login", "authenticate");
            throw new UserNotApprovedException("User account is not activated. Please verify your email first.");
        }
        if (user.getStatus() == null || !(user.getStatus() == User.Status.TRIAL || user.getStatus() == User.Status.PAID)) {
            logService.authWarn("Login failed: Status not allowed - " + request.email(), "AuthService", request.email(), null, "/auth/login", "authenticate");
            throw new UserNotApprovedException("User status not allowed to login");
        }
        return keycloakService.authenticate(request);
    }

    public User createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            logService.authWarn("User creation failed: User already exists - " + request.email(), "AuthService", request.email());
            throw new UserAlreadyExistsException("User with email " + request.email() + " already exists");
        }
        User user = User.builder()
                .firstname(request.firstname())
                .lastname(request.lastname())
                .email(request.email())
                .phone(request.phone())
                .adress(request.adress())
                .approved(request.approved())
                .activated(request.activated() != null ? request.activated() : false)
                .role(User.Role.valueOf(request.role().toUpperCase()))
                .build();
        return userRepository.save(user);
    }

    public void verifyEmailAndActivate(String token, String email) {
        VerificationToken verificationToken = verificationTokenService.getTokenByToken(token).orElseThrow(() -> new IllegalArgumentException("Invalid verification token"));
        User user = verificationToken.getUser();
        if (!user.getEmail().equals(email)) throw new IllegalArgumentException("Email does not match the verification token");
        if (verificationToken.getUsed()) throw new IllegalStateException("ALREADY_USED");
        if (verificationToken.isExpired()) throw new IllegalArgumentException("Verification token has expired");
        verificationTokenService.markTokenAsUsed(token);
        keycloakService.verifyUserEmail(email);
        user.setActivated(true);
        userRepository.save(user);
        keycloakService.updateUserApproval(email, true);
        logService.log(CentralizedLogService.LogLevel.INFO, "Email verified and user activated: " + user.getEmail(), CentralizedLogService.createLoggerName("AuthService", "verifyEmailAndActivate"), user.getEmail(), null, "/auth/verify-email", "verifyEmailAndActivate", null, null);
    }
}
