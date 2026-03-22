package com.motori.user_service.service;

import com.motori.user_service.dto.UserBulkDto;
import com.motori.user_service.dto.UserDto;
import com.motori.user_service.dto.UserIdNameDto;
import com.motori.user_service.dto.auth.CreateUserRequest;
import com.motori.user_service.dto.auth.RegisterRequest;
import com.motori.user_service.exception.UserAlreadyExistsException;
import com.motori.user_service.exception.UserNotFoundException;
import com.motori.user_service.models.User;
import com.motori.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

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

    public Optional<UserDto> getProfileById(String keycloakUserId) {
        return userRepository.findByKeycloakId(keycloakUserId).map(UserDto::fromEntity);
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(UserDto::fromEntity).toList();
    }

    public List<UserIdNameDto> getUsersByRoleOrAll(String role) {
        if (role != null && !role.isBlank() && !"ALL".equalsIgnoreCase(role)) {
            try {
                User.Role r = User.Role.valueOf(role.toUpperCase());
                return userRepository.findByRole(r).stream()
                        .map(u -> new UserIdNameDto(u.getId(), u.getFirstname(), u.getLastname(), u.getRole().name()))
                        .toList();
            } catch (IllegalArgumentException e) {
                return List.of();
            }
        }
        return userRepository.findAll().stream()
                .map(u -> new UserIdNameDto(u.getId(), u.getFirstname(), u.getLastname(), u.getRole() != null ? u.getRole().name() : null))
                .toList();
    }

    public Optional<UserDto> getUserById(Long id) {
        return userRepository.findById(id).map(UserDto::fromEntity);
    }

    public Map<Long, UserBulkDto> getUsersByIdsBulk(List<Long> userIds) {
        return userRepository.findAllById(userIds).stream().collect(Collectors.toMap(User::getId, UserBulkDto::fromEntity));
    }

    public UserDto createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email()))
            throw new UserAlreadyExistsException("User with email " + request.email() + " already exists");
        String roleName = "ADMIN".equalsIgnoreCase(request.role()) ? "ADMIN" : "USER";
        RegisterRequest registerRequest = new RegisterRequest(
                request.firstname(),
                request.lastname(),
                request.email(),
                request.phone(),
                request.adress(),
                request.password(),
                null
        );
        keycloakService.register(registerRequest, roleName);
        User savedUser = userRepository.findByEmail(request.email()).orElseThrow(() -> new UserNotFoundException("User not found after registration"));
        return UserDto.fromEntity(savedUser);
    }

    public boolean deleteUser(Long id) {
        return userRepository.findById(id).map(user -> {
            userRepository.delete(user);
            return true;
        }).orElse(false);
    }

    /**
     * Vérifie si l'utilisateur connecté (keycloakId) est le propriétaire du compte userId ou un ADMIN.
     */
    public boolean isCurrentUserOrAdmin(String keycloakId, Long userId) {
        if (keycloakId == null) return false;
        Optional<User> current = userRepository.findByKeycloakId(keycloakId);
        if (current.isEmpty()) return false;
        if (current.get().getRole() == User.Role.ADMIN) return true;
        return current.get().getId().equals(userId);
    }

    /**
     * Récupère le keycloakId (sub) de l'utilisateur connecté depuis le contexte Spring Security.
     */
    public Optional<String> getCurrentUserKeycloakId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null && !"anonymousUser".equals(auth.getName()))
            return Optional.of(auth.getName());
        return Optional.empty();
    }
}
