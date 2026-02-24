package com.motori.user_service.controller;

import com.motori.user_service.dto.UserDto;
import com.motori.user_service.dto.auth.*;
import com.motori.user_service.models.User;
import com.motori.user_service.service.AuthService;
import com.motori.user_service.service.KeycloakService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final KeycloakService keycloakService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticate(@Valid @RequestBody AuthRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.authenticate(request, httpRequest.getRemoteAddr()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody RefreshTokenRequest request) {
        try {
            return ResponseEntity.ok(keycloakService.refreshToken(request.refreshToken(), request.email()));
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken == null || refreshToken.trim().isEmpty()) return ResponseEntity.badRequest().build();
        keycloakService.logout(refreshToken);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@RequestParam String email) {
        keycloakService.sendForgotPasswordEmail(email);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/change-password")
    public ResponseEntity<AuthResponse> changePassword(@RequestHeader("Authorization") String authorization, @Valid @RequestBody ChangePasswordRequest request) {
        try {
            String email = extractEmailFromAuthorization(authorization);
            return ResponseEntity.ok(keycloakService.changePassword(email, request.currentPassword(), request.newPassword()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private String extractEmailFromAuthorization(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) throw new IllegalArgumentException("Missing or invalid Authorization header");
        String token = authorizationHeader.substring(7);
        String[] parts = token.split("\\.");
        if (parts.length < 2) throw new IllegalArgumentException("Invalid JWT token");
        String payloadJson = new String(java.util.Base64.getUrlDecoder().decode(parts[1]), java.nio.charset.StandardCharsets.UTF_8);
        String email = extractJsonValue(payloadJson, "email");
        if (email == null || email.isBlank()) email = extractJsonValue(payloadJson, "preferred_username");
        if (email == null || email.isBlank()) throw new IllegalArgumentException("Email not found in token");
        return email;
    }

    private String extractJsonValue(String json, String key) {
        int keyIndex = json.indexOf("\"" + key + "\"");
        if (keyIndex == -1) return null;
        int startIndex = json.indexOf("\"", json.indexOf(":", keyIndex)) + 1;
        int endIndex = json.indexOf("\"", startIndex);
        return endIndex != -1 ? json.substring(startIndex, endIndex) : null;
    }

    @PostMapping("/create-user")
    public ResponseEntity<UserDto> createUser(@RequestBody CreateUserRequest request) {
        User user = authService.createUser(request);
        return ResponseEntity.ok(UserDto.fromEntity(user));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestParam String token, @RequestParam String email) {
        try {
            authService.verifyEmailAndActivate(token, email);
            return ResponseEntity.ok(Map.of("message", "Email verified successfully.", "status", "success"));
        } catch (IllegalStateException e) {
            if ("ALREADY_USED".equals(e.getMessage()))
                return ResponseEntity.ok(Map.of("message", "This link was already used.", "status", "already_used"));
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage(), "status", "error"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Verification failed: " + e.getMessage(), "status", "error"));
        }
    }
}
