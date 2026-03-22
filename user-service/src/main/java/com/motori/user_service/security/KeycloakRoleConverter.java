package com.motori.user_service.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Mappe les rôles Keycloak vers les {@link GrantedAuthority} Spring ({@code ROLE_*}).
 * <p>
 * Logs (pour debug) : realm_access.roles, resource_access, et les autorités finales.
 */
@Component
public class KeycloakRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    private static final Logger log = LoggerFactory.getLogger(KeycloakRoleConverter.class);

    @Value("${keycloak.resource:user-service}")
    private String oauthClientId;

    @Value("${keycloak.admin.client-id:user-service}")
    private String adminClientId;

    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        List<String> realmRoleNames = extractRealmRoleNames(jwt);
        Map<String, List<String>> clientRoleNamesByClient = extractClientRoleNamesByClient(jwt);

        Set<GrantedAuthority> authorities = new LinkedHashSet<>();
        realmRoleNames.forEach(r -> authorities.add(toAuthority(r)));
        clientRoleNamesByClient.values().forEach(list -> list.forEach(r -> authorities.add(toAuthority(r))));

        if (log.isInfoEnabled()) {
            List<String> authorityStrings = authorities.stream().map(GrantedAuthority::getAuthority).toList();
            log.info(
                    "JWT roles mapping: sub={}, realmRoles={}, clientRoles={}, authorities={}",
                    jwt.getSubject(),
                    realmRoleNames,
                    clientRoleNamesByClient,
                    authorityStrings
            );
        }

        return authorities;
    }

    private List<String> extractRealmRoleNames(Jwt jwt) {
        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        if (realmAccess == null) return List.of();
        Object rolesRaw = realmAccess.get("roles");
        if (!(rolesRaw instanceof List<?> rolesList)) return List.of();
        return rolesList.stream().map(String::valueOf).collect(Collectors.toList());
    }

    private Map<String, List<String>> extractClientRoleNamesByClient(Jwt jwt) {
        Map<String, Object> resourceAccess = jwt.getClaim("resource_access");
        if (resourceAccess == null || resourceAccess.isEmpty()) return Map.of();

        Set<String> preferredClients = new LinkedHashSet<>();
        if (oauthClientId != null && !oauthClientId.isBlank()) preferredClients.add(oauthClientId);
        if (adminClientId != null && !adminClientId.isBlank()) preferredClients.add(adminClientId);

        // si on ne trouve rien sur les clients préférés, on tente tous les clients du token
        Map<String, List<String>> rolesByClient = new LinkedHashMap<>();
        for (String clientKey : preferredClients) {
            List<String> roles = extractRolesForClient(resourceAccess, clientKey);
            if (!roles.isEmpty()) rolesByClient.put(clientKey, roles);
        }
        if (!rolesByClient.isEmpty()) return rolesByClient;

        for (String clientKey : resourceAccess.keySet()) {
            List<String> roles = extractRolesForClient(resourceAccess, clientKey);
            if (!roles.isEmpty()) rolesByClient.put(clientKey, roles);
        }
        return rolesByClient;
    }

    private List<String> extractRolesForClient(Map<String, Object> resourceAccess, String clientId) {
        Object raw = resourceAccess.get(clientId);
        if (!(raw instanceof Map<?, ?> rawMap)) return List.of();
        Object rolesRaw = rawMap.get("roles");
        if (!(rolesRaw instanceof List<?> rolesList)) return List.of();
        return rolesList.stream().map(String::valueOf).collect(Collectors.toList());
    }

    private SimpleGrantedAuthority toAuthority(String roleName) {
        if (roleName == null) return new SimpleGrantedAuthority("ROLE_USER");
        String r = roleName.trim().toUpperCase();
        if (r.startsWith("ROLE_")) return new SimpleGrantedAuthority(r);
        return new SimpleGrantedAuthority("ROLE_" + r);
    }
}
