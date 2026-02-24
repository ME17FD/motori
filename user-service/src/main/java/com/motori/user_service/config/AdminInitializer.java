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

    @Override
    public void run(String... args) {
        boolean superAdminInDb = userRepository.countByRole(User.Role.SUPERADMIN) > 0;
        String superAdminEmail = "admin@motori.com";
        String keycloakId = null;
        try {
            keycloakId = keycloakService.getKeycloakUserIdByEmail(superAdminEmail);
        } catch (Exception ignored) {}
        boolean superAdminInKeycloak = keycloakId != null;
        if (!superAdminInDb && !superAdminInKeycloak) {
            createSuperAdmin();
        } else if (!superAdminInDb && superAdminInKeycloak) {
            createSuperAdminInDb(keycloakId);
        }
    }

    private void createSuperAdmin() {
        try {
            RegisterRequest request = new RegisterRequest("Super", "Admin", "admin@motori.com", "+1234567890", "System", "admin123", null);
            keycloakService.register(request, User.Role.SUPERADMIN.name());
            userRepository.findByEmail("admin@motori.com").ifPresent(u -> {
                u.setApproved(true);
                u.setActivated(true);
                userRepository.save(u);
                try { keycloakService.verifyUserEmail("admin@motori.com"); } catch (Exception e) { logService.warn("Verify email failed: " + e.getMessage(), "AdminInitializer"); }
            });
        } catch (Exception e) {
            logService.log(CentralizedLogService.LogLevel.ERROR, "Failed to create super admin: " + e.getMessage(), "AdminInitializer");
        }
    }

    private void createSuperAdminInDb(String keycloakId) {
        User superAdmin = User.builder()
                .firstname("Super")
                .lastname("Admin")
                .email("admin@motori.com")
                .phone("+1234567890")
                .adress("System")
                .createdAt(LocalDateTime.now())
                .approved(true)
                .activated(true)
                .role(User.Role.SUPERADMIN)
                .keycloakId(keycloakId)
                .status(User.Status.PAID)
                .build();
        userRepository.save(superAdmin);
    }
}
