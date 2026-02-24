package com.motori.gateway.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.motori.gateway.config.KeycloakConfig;
import com.motori.gateway.constants.GatewayConstants;
import com.motori.gateway.exception.InvalidRequestException;
import com.motori.gateway.exception.JwtAuthenticationException;
import com.motori.gateway.exception.KeycloakException;
import com.motori.gateway.model.Log;
import com.motori.gateway.service.LogService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.math.BigInteger;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.RSAPublicKeySpec;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final KeycloakConfig keycloakConfig;
    private final ObjectMapper objectMapper;
    private final WebClient webClient;
    private final Map<String, PublicKey> publicKeyCache = new ConcurrentHashMap<>();
    private final LogService logService;

    public JwtAuthenticationFilter(KeycloakConfig keycloakConfig, ObjectMapper objectMapper, WebClient webClient, LogService logService) {
        this.keycloakConfig = keycloakConfig;
        this.objectMapper = objectMapper;
        this.webClient = webClient;
        this.logService = logService;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();
        String method = request.getMethod().name();
        String ipAddress = getClientIpAddress(request);

        if (isPublicEndpoint(path)) {
            return chain.filter(exchange);
        }

        try {
            String token = extractToken(request);
            if (!StringUtils.hasText(token)) {
                logService.authWarn("No JWT token found in request", "JwtAuthenticationFilter", null, ipAddress, path, method);
                return Mono.error(JwtAuthenticationException.missingToken());
            }

            return validateToken(token)
                    .<Void>flatMap(claims -> {
                        if (claims != null) {
                            String userEmail = claims.get(GatewayConstants.JWT_EMAIL_KEY, String.class);
                            logService.saveLog(Log.LogLevel.INFO, "JWT validated", LogService.createLoggerName("JwtAuthenticationFilter", "validateToken"), userEmail, ipAddress, path, method, null, null);
                            ServerHttpRequest modifiedRequest = addUserHeaders(request, claims);
                            return chain.filter(exchange.mutate().request(modifiedRequest).build());
                        }
                        return Mono.<Void>error(JwtAuthenticationException.invalidSignature("Token validation returned null"));
                    })
                    .onErrorResume(e -> {
                        if (e instanceof JwtAuthenticationException) {
                            logService.authWarn("JWT failed: " + String.valueOf(e.getMessage()), "JwtAuthenticationFilter", null, ipAddress, path, method, String.valueOf(e));
                        } else {
                            logService.systemError("Error validating JWT: " + String.valueOf(e.getMessage()), "JwtAuthenticationFilter", String.valueOf(e));
                        }
                        return Mono.<Void>error(e);
                    });
        } catch (Exception e) {
            logService.systemError("JWT filter error: " + String.valueOf(e.getMessage()), "JwtAuthenticationFilter", String.valueOf(e));
            return Mono.<Void>error(e);
        }
    }

    private String getClientIpAddress(ServerHttpRequest request) {
        String xForwardedFor = request.getHeaders().getFirst("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) return xForwardedFor.split(",")[0].trim();
        String xRealIp = request.getHeaders().getFirst("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) return xRealIp;
        return request.getRemoteAddress() != null ? request.getRemoteAddress().getAddress().getHostAddress() : "unknown";
    }

    private boolean isPublicEndpoint(String path) {
        return GatewayConstants.PUBLIC_ENDPOINTS.stream().anyMatch(path::startsWith)
                || GatewayConstants.PUBLIC_PATHS.contains(path);
    }

    private String extractToken(ServerHttpRequest request) {
        String bearerToken = request.getHeaders().getFirst(GatewayConstants.AUTHORIZATION_HEADER);
        if (!StringUtils.hasText(bearerToken)) throw InvalidRequestException.missingAuthorizationHeader();
        if (!bearerToken.startsWith(GatewayConstants.BEARER_PREFIX)) throw InvalidRequestException.invalidAuthorizationFormat();
        return bearerToken.substring(GatewayConstants.BEARER_PREFIX.length());
    }

    private Mono<Claims> validateToken(String token) {
        return extractKeyId(token)
                .flatMap(this::getPublicKey)
                .map(publicKey -> validateTokenWithKey(token, publicKey));
    }

    private Claims validateTokenWithKey(String token, PublicKey publicKey) {
        try {
            JwtParser parser = Jwts.parserBuilder().setSigningKey(publicKey).build();
            return parser.parseClaimsJws(token).getBody();
        } catch (ExpiredJwtException e) {
            throw JwtAuthenticationException.expiredToken();
        } catch (UnsupportedJwtException | MalformedJwtException | SignatureException | IllegalArgumentException e) {
            throw JwtAuthenticationException.invalidSignature(e.getMessage());
        }
    }

    private Mono<String> extractKeyId(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) throw JwtAuthenticationException.invalidTokenFormat();
            String header = new String(Base64.getUrlDecoder().decode(parts[0]));
            @SuppressWarnings("unchecked")
            Map<String, Object> headerMap = objectMapper.readValue(header, Map.class);
            String keyId = (String) headerMap.get(GatewayConstants.JWT_KID_HEADER);
            if (keyId == null) throw JwtAuthenticationException.invalidTokenFormat();
            return Mono.just(keyId);
        } catch (JwtAuthenticationException e) {
            return Mono.error(e);
        } catch (Exception e) {
            return Mono.error(JwtAuthenticationException.invalidTokenFormat());
        }
    }

    private Mono<PublicKey> getPublicKey(String keyId) {
        PublicKey cached = publicKeyCache.get(keyId);
        if (cached != null) return Mono.just(cached);
        String jwksUrl = keycloakConfig.getAuthServerUrl() + "/realms/" + keycloakConfig.getRealm() + GatewayConstants.JWKS_ENDPOINT;
        return webClient.get()
                .uri(jwksUrl)
                .retrieve()
                .bodyToMono(String.class)
                .map(jwksJson -> parseAndCachePublicKey(jwksJson, keyId))
                .onErrorMap(e -> KeycloakException.jwksFetchError(e));
    }

    private PublicKey parseAndCachePublicKey(String jwksJson, String keyId) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> jwks = objectMapper.readValue(jwksJson, Map.class);
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> keys = (List<Map<String, Object>>) jwks.get(GatewayConstants.JWT_KEYS_KEY);
            if (keys == null) throw KeycloakException.noKeysFound();
            for (Map<String, Object> key : keys) {
                if (keyId.equals(key.get(GatewayConstants.JWT_KID_HEADER))) {
                    PublicKey publicKey = createPublicKey(key, keyId);
                    publicKeyCache.put(keyId, publicKey);
                    return publicKey;
                }
            }
            throw JwtAuthenticationException.keyNotFound(keyId);
        } catch (KeycloakException | JwtAuthenticationException e) {
            throw e;
        } catch (Exception e) {
            throw KeycloakException.jwksParseError(e);
        }
    }

    private PublicKey createPublicKey(Map<String, Object> key, String keyId) throws Exception {
        String modulus = (String) key.get(GatewayConstants.JWT_MODULUS_KEY);
        String exponent = (String) key.get(GatewayConstants.JWT_EXPONENT_KEY);
        if (modulus == null || exponent == null) throw KeycloakException.invalidKeyFormat(keyId);
        BigInteger modulusBigInt = new BigInteger(1, Base64.getUrlDecoder().decode(modulus));
        BigInteger exponentBigInt = new BigInteger(1, Base64.getUrlDecoder().decode(exponent));
        RSAPublicKeySpec spec = new RSAPublicKeySpec(modulusBigInt, exponentBigInt);
        return KeyFactory.getInstance("RSA").generatePublic(spec);
    }

    private ServerHttpRequest addUserHeaders(ServerHttpRequest request, Claims claims) {
        String userId = claims.getSubject();
        String userEmail = claims.get(GatewayConstants.JWT_EMAIL_KEY, String.class);
        String userRoles = extractRoles(claims);
        return request.mutate()
                .header(GatewayConstants.USER_ID_HEADER, userId)
                .header(GatewayConstants.USER_EMAIL_HEADER, userEmail != null ? userEmail : "")
                .header(GatewayConstants.USER_ROLES_HEADER, userRoles)
                .build();
    }

    private String extractRoles(Claims claims) {
        try {
            Object realmAccess = claims.get(GatewayConstants.JWT_REALM_ACCESS_KEY);
            if (realmAccess instanceof Map) {
                @SuppressWarnings("unchecked")
                Object roles = ((Map<String, Object>) realmAccess).get(GatewayConstants.JWT_ROLES_KEY);
                if (roles instanceof List<?> list) {
                    return list.stream().map(String::valueOf).collect(Collectors.joining(","));
                }
            }
        } catch (Exception ignored) {}
        return "";
    }

    @Override
    public int getOrder() {
        return GatewayConstants.JWT_FILTER_ORDER;
    }
}
