package com.motori.gateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "keycloak")
public class KeycloakConfig {

    private String authServerUrl;
    private String realm;
    private String clientSecret;
    private boolean enabled;

    public String getAuthServerUrl() { return authServerUrl; }
    public void setAuthServerUrl(String authServerUrl) { this.authServerUrl = authServerUrl; }
    public String getRealm() { return realm; }
    public void setRealm(String realm) { this.realm = realm; }
    public String getClientSecret() { return clientSecret; }
    public void setClientSecret(String clientSecret) { this.clientSecret = clientSecret; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
}
