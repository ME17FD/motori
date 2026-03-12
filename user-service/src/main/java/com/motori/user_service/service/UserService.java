package com.motori.user_service.service;

import com.motori.user_service.dto.UserBulkDto;
import com.motori.user_service.dto.UserDto;
import com.motori.user_service.dto.UserIdNameDto;
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

    public Optional<UserDto> getProfileById(String keycloakUserId) {
        return userRepository.findByKeycloakId(keycloakUserId).map(UserDto::fromEntity);
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(UserDto::fromEntity).toList();
    }

    public List<UserIdNameDto> getUsersByRoleOrAll(String role) {
        return userRepository.findAll().stream()
                .map(u -> new UserIdNameDto(u.getId(), u.getFirstname(), u.getLastname()))
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
            throw new UserNotFoundException("User with email " + request.email() + " already exists");
        RegisterRequest registerRequest = new RegisterRequest(request.firstname(), request.lastname(), request.email(), request.phone(), request.adress(), request.password(), null);
        keycloakService.register(registerRequest, "USER");
        User savedUser = userRepository.findByEmail(request.email()).orElseThrow(() -> new UserNotFoundException("User not found after registration"));
        return UserDto.fromEntity(savedUser);
    }

    public boolean deleteUser(Long id) {
        return userRepository.findById(id).map(user -> {
            userRepository.delete(user);
            return true;
        }).orElse(false);
    }


}
