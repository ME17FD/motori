package com.motori.user_service.controller;

import com.motori.user_service.dto.*;
import com.motori.user_service.dto.auth.CreateUserRequest;
import com.motori.user_service.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserDto> getProfile(@RequestHeader(value = "Authorization", required = false) String authorization) {
        String userId = null;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null && !"anonymousUser".equals(auth.getName())) {
            userId = auth.getName();
        } else if (authorization != null && authorization.startsWith("Bearer ")) {
            try {
                userId = extractUserIdFromJwt(authorization.substring(7));
            } catch (Exception e) {
                return ResponseEntity.status(401).build();
            }
        }
        if (userId == null) return ResponseEntity.status(401).build();
        return userService.getProfileById(userId).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/by-role")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<List<UserIdNameDto>> getUsersByRoleOrAll(@RequestParam(name = "role", required = false) String role) {
        return ResponseEntity.ok(userService.getUsersByRoleOrAll(role));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return userService.getUserById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/bulk")
    public ResponseEntity<Map<Long, UserBulkDto>> getUsersByIds(@RequestBody List<Long> userIds) {
        return ResponseEntity.ok(userService.getUsersByIdsBulk(userIds));
    }

    @GetMapping("/admin/{adminId}/agents")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<List<UserDto>> getAgentsByAdmin(@PathVariable Long adminId) {
        return ResponseEntity.ok(userService.getAgentsByAdmin(adminId));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<UserDto> approveUser(@PathVariable Long id) {
        return userService.approveUser(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/disapprove")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<UserDto> disapproveUser(@PathVariable Long id) {
        return userService.disapproveUser(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<UserDto> activateUser(@PathVariable Long id) {
        return userService.activateUser(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<UserDto> deactivateUser(@PathVariable Long id) {
        return userService.deactivateUser(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(userService.createUser(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        return userService.deleteUser(id) ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/profile-picture")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN') or @userService.isOwnerOrManager(#id)")
    public ResponseEntity<UserDto> updateProfilePicture(@PathVariable Long id, @Valid @RequestBody UpdateUserFileRequest request) {
        return userService.updateProfilePicture(id, request).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/id-front-picture")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN') or @userService.isOwnerOrManager(#id)")
    public ResponseEntity<UserDto> updateIdFrontPicture(@PathVariable Long id, @Valid @RequestBody UpdateUserFileRequest request) {
        return userService.updateIdFrontPicture(id, request).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/id-back-picture")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN') or @userService.isOwnerOrManager(#id)")
    public ResponseEntity<UserDto> updateIdBackPicture(@PathVariable Long id, @Valid @RequestBody UpdateUserFileRequest request) {
        return userService.updateIdBackPicture(id, request).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/profile-picture")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN') or @userService.isOwnerOrManager(#id)")
    public ResponseEntity<UserDto> removeProfilePicture(@PathVariable Long id) {
        return userService.removeProfilePicture(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/id-front-picture")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN') or @userService.isOwnerOrManager(#id)")
    public ResponseEntity<UserDto> removeIdFrontPicture(@PathVariable Long id) {
        return userService.removeIdFrontPicture(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/id-back-picture")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN') or @userService.isOwnerOrManager(#id)")
    public ResponseEntity<UserDto> removeIdBackPicture(@PathVariable Long id) {
        return userService.removeIdBackPicture(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    private String extractUserIdFromJwt(String token) {
        try {
            String[] chunks = token.split("\\.");
            if (chunks.length != 3) return null;
            String payload = new String(Base64.getUrlDecoder().decode(chunks[1]));
            if (payload.contains("\"sub\"")) {
                int subStart = payload.indexOf("\"sub\"") + 6;
                int subEnd = payload.indexOf("\"", subStart);
                if (subEnd > subStart) return payload.substring(subStart, subEnd);
            }
            if (payload.contains("\"preferred_username\"")) {
                int uStart = payload.indexOf("\"preferred_username\"") + 21;
                int uEnd = payload.indexOf("\"", uStart);
                if (uEnd > uStart) return payload.substring(uStart, uEnd);
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }
}
