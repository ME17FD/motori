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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/by-role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserIdNameDto>> getUsersByRoleOrAll(@RequestParam(name = "role", required = false) String role) {
        return ResponseEntity.ok(userService.getUsersByRoleOrAll(role));
    }

    /** ADMIN : tous les utilisateurs. USER : uniquement son propre profil (id = utilisateur connecté). */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userService.isCurrentUserOrAdmin(authentication.name, #id)")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return userService.getUserById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/bulk")
    public ResponseEntity<Map<Long, UserBulkDto>> getUsersByIds(@RequestBody List<Long> userIds) {
        return ResponseEntity.ok(userService.getUsersByIdsBulk(userIds));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(userService.createUser(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        return userService.deleteUser(id) ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
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
