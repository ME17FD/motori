package com.motori.user_service.service;

import com.motori.user_service.dto.UserBulkDto;
import com.motori.user_service.dto.UserDto;
import com.motori.user_service.dto.UserIdNameDto;
import com.motori.user_service.dto.UpdateUserFileRequest;
import com.motori.user_service.dto.auth.CreateUserRequest;
import com.motori.user_service.dto.auth.RegisterRequest;
import com.motori.user_service.exception.UserNotFoundException;
import com.motori.user_service.models.User;
import com.motori.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CentralizedLogService logService;
    private final KeycloakService keycloakService;
    private final EmailTemplateService emailTemplateService;

    public Optional<UserDto> getProfileById(String keycloakUserId) {
        return userRepository.findByKeycloakId(keycloakUserId).map(UserDto::fromEntity);
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(UserDto::fromEntity).toList();
    }

    public List<UserIdNameDto> getUsersByRoleOrAll(String role) {
        List<User> users = (role == null || role.isBlank() || role.equalsIgnoreCase("ALL"))
                ? userRepository.findAll()
                : userRepository.findAll().stream().filter(u -> u.getRole() == User.Role.valueOf(role.toUpperCase())).toList();
        return users.stream().map(u -> new UserIdNameDto(u.getId(), u.getFirstname(), u.getLastname(), u.getRole() != null ? u.getRole().name() : null)).toList();
    }

    public Optional<UserDto> getUserById(Long id) {
        return userRepository.findById(id).map(UserDto::fromEntity);
    }

    public Map<Long, UserBulkDto> getUsersByIdsBulk(List<Long> userIds) {
        return userRepository.findAllById(userIds).stream().collect(Collectors.toMap(User::getId, UserBulkDto::fromEntity));
    }

    public Optional<UserDto> approveUser(Long id) {
        return userRepository.findById(id).map(user -> {
            user.setApproved(true);
            User saved = userRepository.save(user);
            try { keycloakService.updateUserApproval(saved.getEmail(), true); } catch (Exception e) { logService.warn("Failed to update Keycloak approval: " + e.getMessage(), "UserService"); }
            return UserDto.fromEntity(saved);
        });
    }

    public Optional<UserDto> disapproveUser(Long id) {
        return userRepository.findById(id).map(user -> {
            user.setApproved(false);
            User saved = userRepository.save(user);
            try { keycloakService.updateUserApproval(saved.getEmail(), false); } catch (Exception e) { logService.warn("Failed to update Keycloak approval: " + e.getMessage(), "UserService"); }
            return UserDto.fromEntity(saved);
        });
    }

    public UserDto createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email())) throw new UserNotFoundException("User with email " + request.email() + " already exists");
        User manager = request.managerId() != null ? userRepository.findById(request.managerId()).orElseThrow(() -> new UserNotFoundException("Manager not found")) : null;
        if (manager != null && manager.getRole() != User.Role.ADMIN && manager.getRole() != User.Role.SUPERADMIN)
            throw new IllegalArgumentException("Manager must have ADMIN or SUPERADMIN role");
        RegisterRequest registerRequest = new RegisterRequest(request.firstname(), request.lastname(), request.email(), request.phone(), request.adress(), request.password(), request.managerId());
        keycloakService.register(registerRequest, request.role());
        User savedUser = userRepository.findByEmail(request.email()).orElseThrow(() -> new UserNotFoundException("User not found after registration"));
        savedUser.setApproved(true);
        userRepository.save(savedUser);
        return UserDto.fromEntity(savedUser);
    }

    public boolean deleteUser(Long id) {
        return userRepository.findById(id).map(user -> {
            userRepository.delete(user);
            return true;
        }).orElse(false);
    }

    public List<UserDto> getAgentsByAdmin(Long adminId) {
        return userRepository.findById(adminId)
                .map(admin -> userRepository.findByRoleAndManager(User.Role.USER, admin).stream().map(UserDto::fromEntity).toList())
                .orElse(new ArrayList<>());
    }

    public Optional<UserDto> activateUser(Long id) {
        return userRepository.findById(id).map(user -> {
            user.setActivated(true);
            User saved = userRepository.save(user);
            try { keycloakService.updateUserApproval(saved.getEmail(), true); } catch (Exception e) { logService.warn("Failed to update Keycloak: " + e.getMessage(), "UserService"); }
            return UserDto.fromEntity(saved);
        });
    }

    public Optional<UserDto> deactivateUser(Long id) {
        return userRepository.findById(id).map(user -> {
            user.setActivated(false);
            User saved = userRepository.save(user);
            try { keycloakService.updateUserApproval(saved.getEmail(), false); } catch (Exception e) { logService.warn("Failed to update Keycloak: " + e.getMessage(), "UserService"); }
            return UserDto.fromEntity(saved);
        });
    }

    public List<UserDto> createMockData() {
        List<UserDto> list = new ArrayList<>();
        String[] firstnames = {"John", "Jane"}, lastnames = {"Doe", "Smith"}, emails = {"john@example.com", "jane@example.com"};
        for (int i = 0; i < firstnames.length; i++) {
            try {
                list.add(createUser(new CreateUserRequest(firstnames[i], lastnames[i], emails[i], "+1", "Addr", "pass123", "USER", true, false, null)));
            } catch (Exception e) { logService.log(CentralizedLogService.LogLevel.ERROR, "Mock user failed: " + e.getMessage(), "UserService"); }
        }
        return list;
    }

    public Optional<UserDto> updateProfilePicture(Long userId, UpdateUserFileRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException("User not found"));
        user.setProfilePictureId(request.fileId());
        return Optional.of(UserDto.fromEntity(userRepository.save(user)));
    }

    public Optional<UserDto> updateIdFrontPicture(Long userId, UpdateUserFileRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException("User not found"));
        user.setIdFrontPictureId(request.fileId());
        return Optional.of(UserDto.fromEntity(userRepository.save(user)));
    }

    public Optional<UserDto> updateIdBackPicture(Long userId, UpdateUserFileRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException("User not found"));
        user.setIdBackPictureId(request.fileId());
        return Optional.of(UserDto.fromEntity(userRepository.save(user)));
    }

    public Optional<UserDto> removeProfilePicture(Long userId) {
        return userRepository.findById(userId).map(user -> {
            user.setProfilePictureId(null);
            return UserDto.fromEntity(userRepository.save(user));
        });
    }

    public Optional<UserDto> removeIdFrontPicture(Long userId) {
        return userRepository.findById(userId).map(user -> {
            user.setIdFrontPictureId(null);
            return UserDto.fromEntity(userRepository.save(user));
        });
    }

    public Optional<UserDto> removeIdBackPicture(Long userId) {
        return userRepository.findById(userId).map(user -> {
            user.setIdBackPictureId(null);
            return UserDto.fromEntity(userRepository.save(user));
        });
    }

    public boolean isOwnerOrManager(Long userId) {
        return true;
    }
}
