package com.motori.user_service.service;

import com.motori.user_service.dto.auth.AuthRequest;
import com.motori.user_service.dto.auth.AuthResponse;
import com.motori.user_service.dto.auth.RegisterRequest;
import com.motori.user_service.dto.auth.TokenResponse;
import com.motori.user_service.exception.AuthenticationException;
import com.motori.user_service.exception.UserAlreadyExistsException;
import com.motori.user_service.exception.UserNotApprovedException;
import com.motori.user_service.exception.UserNotFoundException;
import com.motori.user_service.models.User;
import com.motori.user_service.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
@RequiredArgsConstructor
@Slf4j
public class KeycloakService {

    private volatile HttpClient authHttpClient;
    private String tokenEndpoint;
    private String logoutEndpoint;

    private final UserRepository userRepository;
    private final CentralizedLogService logService;
    private final VerificationTokenService verificationTokenService;

    private volatile Keycloak adminKeycloak;
    private final ReentrantReadWriteLock keycloakLock = new ReentrantReadWriteLock();

    @Value("${keycloak.admin.server-url}")
    private String serverUrl;
    @Value("${keycloak.admin.realm}")
    private String realm;
    @Value("${keycloak.admin.client-id}")
    private String clientId;
    @Value("${keycloak.admin.client-secret}")
    private String clientSecret;
    @Value("${keycloak.auth-server-url}")
    private String legacyKeycloakUrl;
    @Value("${keycloak.realm}")
    private String legacyRealm;
    @Value("${keycloak.resource}")
    private String legacyClientId;
    @Value("${keycloak.credentials.secret}")
    private String legacyClientSecret;

    @PostConstruct
    public void initializeKeycloakClient() {
        this.tokenEndpoint = legacyKeycloakUrl + "/realms/" + legacyRealm + "/protocol/openid-connect/token";
        this.logoutEndpoint = legacyKeycloakUrl + "/realms/" + legacyRealm + "/protocol/openid-connect/logout";
        this.authHttpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .executor(ForkJoinPool.commonPool())
                .build();
        try {
            this.adminKeycloak = createKeycloakAdminClient();
            testKeycloakConnection();
            log.info("Keycloak admin client initialized successfully");
        } catch (Exception e) {
            this.adminKeycloak = null;
            logService.systemError("Keycloak not ready at startup, will retry on demand: " + e.getMessage(), "KeycloakService", e.toString());
            log.warn("Keycloak admin client initialization deferred: {}", e.getMessage());
        }
    }

    private Keycloak createKeycloakAdminClient() {
        return KeycloakBuilder.builder()
                .serverUrl(serverUrl)
                .realm(realm)
                .clientId("user-service")
                .clientSecret(clientSecret)
                .grantType(OAuth2Constants.CLIENT_CREDENTIALS)
                .build();
    }

    private void testKeycloakConnection() {
        var realmInfo = getKeycloakAdminClient().realm(realm).toRepresentation();
        log.info("Keycloak connection successful! Realm: {}", realmInfo.getRealm());
    }

    private Keycloak getKeycloakAdminClient() {
        keycloakLock.readLock().lock();
        try {
            if (adminKeycloak != null) return adminKeycloak;
        } finally {
            keycloakLock.readLock().unlock();
        }
        keycloakLock.writeLock().lock();
        try {
            if (adminKeycloak == null) adminKeycloak = createKeycloakAdminClient();
            return adminKeycloak;
        } finally {
            keycloakLock.writeLock().unlock();
        }
    }

    public RealmResource getRealmResource() {
        return executeWithRetry(keycloak -> keycloak.realm(realm), "getRealmResource");
    }

    private <T> T executeWithRetry(KeycloakOperation<T> operation, String operationName) {
        try {
            return operation.execute(getKeycloakAdminClient());
        } catch (RuntimeException e) {
            keycloakLock.writeLock().lock();
            try {
                if (adminKeycloak != null) {
                    try { adminKeycloak.close(); } catch (Exception ignored) {}
                }
                adminKeycloak = createKeycloakAdminClient();
            } finally {
                keycloakLock.writeLock().unlock();
            }
            try {
                return operation.execute(getKeycloakAdminClient());
            } catch (RuntimeException retryEx) {
                logService.externalServiceError("Keycloak operation '" + operationName + "' failed after retry: " + retryEx.getMessage(), "KeycloakService", "keycloak", retryEx.toString());
                throw retryEx;
            }
        }
    }

    @FunctionalInterface
    private interface KeycloakOperation<T> {
        T execute(Keycloak keycloak);
    }

    public AuthResponse register(RegisterRequest request, String roleName) {
        if (userRepository.existsByEmail(request.email())) {
            logService.businessWarn("Registration failed: User already exists - " + request.email(), "KeycloakService", request.email());
            throw new UserAlreadyExistsException("User with email " + request.email() + " already exists");
        }
        User manager = request.managerId() != null ? userRepository.findById(request.managerId()).orElse(null) : null;
        User user = User.builder()
                .firstname(request.firstname())
                .lastname(request.lastname())
                .email(request.email())
                .phone(request.phone())
                .adress(request.adress())
                .approved(true)
                .activated(false)
                .status(User.Status.TRIAL)
                .role(User.Role.valueOf(roleName.toUpperCase()))
                .manager(manager)
                .build();
        User savedUser = userRepository.save(user);
        try {
            String userId = executeWithRetry(keycloak -> {
                UsersResource usersResource = keycloak.realm(realm).users();
                UserRepresentation ur = new UserRepresentation();
                ur.setUsername(request.email());
                ur.setEmail(request.email());
                ur.setFirstName(request.firstname());
                ur.setLastName(request.lastname());
                ur.setEnabled(true);
                ur.setEmailVerified(false);
                CredentialRepresentation cred = new CredentialRepresentation();
                cred.setType(CredentialRepresentation.PASSWORD);
                cred.setValue(request.password());
                cred.setTemporary(false);
                ur.setCredentials(Collections.singletonList(cred));
                var response = usersResource.create(ur);
                return response.getLocation().getPath().substring(response.getLocation().getPath().lastIndexOf('/') + 1);
            }, "createUser");
            savedUser.setKeycloakId(userId);
            userRepository.save(savedUser);
            assignRoleToUser(userId, roleName);
            logService.log(CentralizedLogService.LogLevel.INFO, "User registered in Keycloak: " + request.email(), CentralizedLogService.createLoggerName("KeycloakService", "register"), request.email(), null, "/auth/register", "register", null, null);
            return AuthResponse.fromUser(savedUser, null);
        } catch (Exception e) {
            userRepository.delete(savedUser);
            logService.externalServiceError("Failed to create user in Keycloak: " + e.getMessage(), "KeycloakService", "keycloak", e.toString());
            throw new AuthenticationException("Failed to create user in authentication system");
        }
    }

    public AuthResponse authenticate(AuthRequest request) {
        User user = userRepository.findByEmail(request.email()).orElseThrow(() -> new UserNotFoundException("User not found"));
        if (Boolean.FALSE.equals(user.getApproved())) {
            logService.authWarn("Login failed: User not approved - " + request.email(), "KeycloakService", request.email(), null, "/auth/login", "authenticate");
            throw new UserNotApprovedException("User account is not approved");
        }
        if (Boolean.FALSE.equals(user.getActivated())) {
            logService.authWarn("Login failed: User not activated - " + request.email(), "KeycloakService", request.email(), null, "/auth/login", "authenticate");
            throw new UserNotApprovedException("User account is not activated. Please verify your email first.");
        }
        if (user.getStatus() == null || !(user.getStatus() == User.Status.TRIAL || user.getStatus() == User.Status.PAID)) {
            logService.authWarn("Login failed: Status not allowed - " + request.email(), "KeycloakService", request.email(), null, "/auth/login", "authenticate");
            throw new UserNotApprovedException("User status not allowed to login");
        }
        TokenResponse tokenResponse = generateTokensFast(request.email(), request.password());
        logService.log(CentralizedLogService.LogLevel.INFO, "User authenticated: " + request.email(), CentralizedLogService.createLoggerName("KeycloakService", "authenticate"), request.email(), null, "/auth/login", "authenticate", null, null);
        return AuthResponse.fromUser(user, tokenResponse.accessToken(), tokenResponse.refreshToken());
    }

    private TokenResponse generateTokensFast(String username, String password) {
        try {
            String requestBody = buildTokenRequestBody(username, password, "password");
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(tokenEndpoint))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .header("Accept", "application/json")
                    .timeout(Duration.ofSeconds(10))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();
            HttpResponse<String> response = authHttpClient.send(req, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                String errorMsg = response.body() != null && response.body().contains("invalid_grant") ? "Invalid username or password" : "Authentication failed. Status: " + response.statusCode();
                throw new AuthenticationException(errorMsg);
            }
            return parseTokenResponseFast(response.body());
        } catch (IOException | InterruptedException e) {
            logService.authWarn("Failed to generate tokens: " + e.getMessage(), "KeycloakService", username, null, "/auth/login", "generateTokensFast", e.toString());
            throw new AuthenticationException("Authentication service unavailable");
        }
    }

    private String urlEncode(String value) {
        try {
            return URLEncoder.encode(value, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return value.replace(" ", "%20").replace("&", "%26").replace("=", "%3D");
        }
    }

    private String buildTokenRequestBody(String username, String tokenOrPassword, String grantType) {
        StringBuilder body = new StringBuilder(200);
        body.append("grant_type=").append(grantType);
        if ("password".equals(grantType)) {
            body.append("&username=").append(urlEncode(username)).append("&password=").append(urlEncode(tokenOrPassword));
        } else if ("refresh_token".equals(grantType)) {
            body.append("&refresh_token=").append(urlEncode(tokenOrPassword));
        }
        body.append("&client_id=").append(urlEncode(legacyClientId)).append("&client_secret=").append(urlEncode(legacyClientSecret));
        return body.toString();
    }

    private TokenResponse parseTokenResponseFast(String json) {
        int accessStart = json.indexOf("\"access_token\":\"");
        if (accessStart == -1) throw new AuthenticationException("Access token not found in response");
        accessStart += 16;
        int accessEnd = json.indexOf("\"", accessStart);
        String accessToken = accessEnd != -1 ? json.substring(accessStart, accessEnd) : null;
        int refreshStart = json.indexOf("\"refresh_token\":\"");
        String refreshToken = null;
        if (refreshStart != -1) {
            refreshStart += 17;
            int refreshEnd = json.indexOf("\"", refreshStart);
            if (refreshEnd != -1) refreshToken = json.substring(refreshStart, refreshEnd);
        }
        if (accessToken == null) throw new AuthenticationException("Access token not found in response");
        return new TokenResponse(accessToken, refreshToken);
    }

    public void assignRoleToUser(String userId, String roleName) {
        executeWithRetry(keycloak -> {
            RealmResource realmResource = keycloak.realm(realm);
            RoleRepresentation roleRepresentation = realmResource.roles().get(roleName).toRepresentation();
            realmResource.users().get(userId).roles().realmLevel().add(Collections.singletonList(roleRepresentation));
            return true;
        }, "assignRole");
    }

    public void updateUserApproval(String email, boolean approved) {
        executeWithRetry(keycloak -> {
            UsersResource usersResource = keycloak.realm(realm).users();
            List<UserRepresentation> users = usersResource.search(email, true);
            if (users.isEmpty()) {
                logService.businessWarn("User not found in Keycloak for approval update: " + email, "KeycloakService", email);
                return false;
            }
            UserRepresentation user = users.get(0);
            user.setEnabled(approved);
            usersResource.get(user.getId()).update(user);
            return true;
        }, "updateUserApproval");
    }

    public AuthResponse refreshToken(String refreshToken, String userEmail) {
        if (refreshToken == null || refreshToken.trim().isEmpty()) throw new AuthenticationException("Refresh token is required");
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new UserNotFoundException("User not found"));
        if (!user.getApproved()) {
            logService.authWarn("Token refresh failed: User not approved - " + userEmail, "KeycloakService", userEmail, null, "/auth/refresh", "refreshToken");
            throw new UserNotApprovedException("User account is not approved");
        }
        TokenResponse newTokens = refreshKeycloakTokens(refreshToken);
        return AuthResponse.fromUser(user, newTokens.accessToken(), newTokens.refreshToken());
    }

    private TokenResponse refreshKeycloakTokens(String refreshToken) {
        try {
            String endpoint = legacyKeycloakUrl + "/realms/" + legacyRealm + "/protocol/openid-connect/token";
            String requestBody = "grant_type=refresh_token&refresh_token=" + URLEncoder.encode(refreshToken, StandardCharsets.UTF_8)
                    + "&client_id=" + URLEncoder.encode(legacyClientId, StandardCharsets.UTF_8)
                    + "&client_secret=" + URLEncoder.encode(legacyClientSecret, StandardCharsets.UTF_8);
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) throw new AuthenticationException("Failed to refresh token. Status: " + response.statusCode());
            return parseTokenResponse(response.body());
        } catch (Exception e) {
            logService.authWarn("Failed to refresh Keycloak tokens: " + e.getMessage(), "KeycloakService", null, null, "/auth/refresh", "refreshKeycloakTokens", e.toString());
            throw new AuthenticationException("Failed to refresh token with Keycloak: " + e.getMessage());
        }
    }

    private TokenResponse parseTokenResponse(String jsonResponse) {
        String accessToken = extractJsonValue(jsonResponse, "access_token");
        String refreshToken = extractJsonValue(jsonResponse, "refresh_token");
        return new TokenResponse(accessToken, refreshToken);
    }

    private String extractJsonValue(String json, String key) {
        String searchKey = "\"" + key + "\"";
        int keyIndex = json.indexOf(searchKey);
        if (keyIndex == -1) throw new AuthenticationException("Key '" + key + "' not found in response");
        int colonIndex = json.indexOf(":", keyIndex);
        int startIndex = json.indexOf("\"", colonIndex) + 1;
        int endIndex = json.indexOf("\"", startIndex);
        if (startIndex == 0 || endIndex == -1) throw new AuthenticationException("Failed to extract " + key);
        return json.substring(startIndex, endIndex);
    }

    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.trim().isEmpty()) throw new AuthenticationException("Refresh token is required for logout");
        try {
            String requestBody = "client_id=" + URLEncoder.encode(legacyClientId, StandardCharsets.UTF_8)
                    + "&client_secret=" + URLEncoder.encode(legacyClientSecret, StandardCharsets.UTF_8)
                    + "&refresh_token=" + URLEncoder.encode(refreshToken, StandardCharsets.UTF_8);
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(logoutEndpoint))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 204 && response.statusCode() != 200)
                throw new AuthenticationException("Failed to logout from Keycloak. Status: " + response.statusCode());
        } catch (AuthenticationException e) {
            throw e;
        } catch (Exception e) {
            logService.authWarn("Logout failed: " + e.getMessage(), "KeycloakService", null, null, "/auth/logout", "logout", e.toString());
            throw new AuthenticationException("Failed to logout: " + e.getMessage());
        }
    }

    public String generateVerificationToken(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException("User not found: " + email));
        return verificationTokenService.generateVerificationToken(user);
    }

    public void sendForgotPasswordEmail(String email) {
        executeWithRetry(keycloak -> {
            UsersResource usersResource = keycloak.realm(realm).users();
            List<UserRepresentation> users = usersResource.search(email, true);
            if (users.isEmpty()) {
                logService.businessWarn("User not found for password reset: " + email, "KeycloakService", email);
                return false;
            }
            usersResource.get(users.get(0).getId()).executeActionsEmail(Collections.singletonList("UPDATE_PASSWORD"));
            return true;
        }, "sendForgotPasswordEmail");
    }

    public AuthResponse changePassword(String email, String currentPassword, String newPassword) {
        generateTokensFast(email, currentPassword);
        executeWithRetry(keycloak -> {
            UsersResource usersResource = keycloak.realm(realm).users();
            List<UserRepresentation> users = usersResource.search(email, true);
            if (users.isEmpty()) throw new UserNotFoundException("User not found");
            CredentialRepresentation credential = new CredentialRepresentation();
            credential.setType(CredentialRepresentation.PASSWORD);
            credential.setValue(newPassword);
            credential.setTemporary(false);
            usersResource.get(users.get(0).getId()).resetPassword(credential);
            return true;
        }, "changePassword");
        TokenResponse tokenResponse = generateTokensFast(email, newPassword);
        User user = userRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException("User not found"));
        return AuthResponse.fromUser(user, tokenResponse.accessToken(), tokenResponse.refreshToken());
    }

    public String getKeycloakUserIdByEmail(String email) {
        return executeWithRetry(keycloak -> {
            List<UserRepresentation> users = keycloak.realm(realm).users().search(email, true);
            return !users.isEmpty() ? users.get(0).getId() : null;
        }, "getKeycloakUserIdByEmail");
    }

    public void verifyUserEmail(String email) {
        executeWithRetry(keycloak -> {
            UsersResource usersResource = keycloak.realm(realm).users();
            List<UserRepresentation> users = usersResource.search(email, true);
            if (users.isEmpty()) {
                logService.businessWarn("User not found in Keycloak for email verification: " + email, "KeycloakService", email);
                return false;
            }
            UserRepresentation user = users.get(0);
            user.setEmailVerified(true);
            usersResource.get(user.getId()).update(user);
            return true;
        }, "verifyUserEmail");
    }

    @PreDestroy
    public void cleanup() {
        keycloakLock.writeLock().lock();
        try {
            if (adminKeycloak != null) {
                adminKeycloak.close();
                adminKeycloak = null;
            }
        } finally {
            keycloakLock.writeLock().unlock();
        }
    }
}
