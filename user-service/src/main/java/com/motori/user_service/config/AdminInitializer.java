package com.motori.user_service.config;

import com.motori.user_service.dto.auth.RegisterRequest;
import com.motori.user_service.models.User;
import com.motori.user_service.repository.UserRepository;
import com.motori.user_service.service.CentralizedLogService;
import com.motori.user_service.service.KeycloakService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CentralizedLogService logService;
    private final KeycloakService keycloakService;

    private static final String ADMIN_EMAIL = "admin@motori.com";

    @Override
    public void run(String... args) {
        boolean adminInDb = userRepository.countByRole(User.Role.ADMIN) > 0;
        String keycloakId = null;
        try {
            keycloakId = keycloakService.getKeycloakUserIdByEmail(ADMIN_EMAIL);
        } catch (Exception ignored) {}
        boolean adminInKeycloak = keycloakId != null;
        if (!adminInDb && !adminInKeycloak) {
            createFirstAdmin();
        } else if (!adminInDb && adminInKeycloak) {
            linkAdminInDb(keycloakId);
        }
    }

    private void createFirstAdmin() {
        System.out.println("Creating super admin...");
        try {
            RegisterRequest request = new RegisterRequest("Admin", "Motori", ADMIN_EMAIL, null, null, "admin123", null);
            keycloakService.register(request, User.Role.ADMIN.name());
            userRepository.findByEmail(ADMIN_EMAIL).ifPresent(u -> {
                u.setRole(User.Role.ADMIN);
                userRepository.save(u);
            });
        } catch (Exception e) {
            logService.log(CentralizedLogService.LogLevel.ERROR, "Failed to create first admin: " + e.getMessage(), "AdminInitializer");
        }
    }

    private void linkAdminInDb(String keycloakId) {
        User admin = User.builder()
                .firstname("Admin")
                .lastname("Motori")
                .email(ADMIN_EMAIL)
                .phone(null)
                .adress(null)
                .role(User.Role.ADMIN)
                .createdAt(LocalDateTime.now())
                .keycloakId(keycloakId)
                .build();
        userRepository.save(admin);
    }
}
