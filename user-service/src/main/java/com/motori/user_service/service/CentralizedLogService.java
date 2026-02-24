package com.motori.user_service.service;

import com.motori.user_service.dto.feign.LogRequest;
import com.motori.user_service.feign.GatewayLoggingClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class CentralizedLogService {

    @Autowired(required = false)
    private GatewayLoggingClient gatewayLoggingClient;

    @Value("${logging.centralized.min-level:ERROR}")
    private String configuredMinLevel;

    @Value("${logging.centralized.enabled:true}")
    private boolean loggingEnabled;

    private static final String SERVICE_NAME = "user-service";
    private LogLevel minLogLevel;

    public enum LogLevel {
        TRACE, DEBUG, INFO, WARN, ERROR
    }

    public static String createLoggerName(String component) {
        return SERVICE_NAME + "." + component;
    }

    public static String createLoggerName(String component, String method) {
        return SERVICE_NAME + "." + component + "." + method;
    }

    private void initializeMinLogLevel() {
        if (minLogLevel == null) {
            try {
                minLogLevel = LogLevel.valueOf(configuredMinLevel.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid log level '{}', defaulting to ERROR", configuredMinLevel);
                minLogLevel = LogLevel.ERROR;
            }
        }
    }

    private boolean shouldSend(LogLevel level) {
        if (!loggingEnabled) return false;
        initializeMinLogLevel();
        return level.ordinal() >= minLogLevel.ordinal();
    }

    public void log(LogLevel level, String message, String loggerName) {
        if (!shouldSend(level)) return;
        log(level, message, loggerName, null, null, null, null, null, null);
    }

    public void log(LogLevel level, String message, String loggerName, String userEmail,
                    String ipAddress, String requestUrl, String methodName, String exception, LocalDateTime timestamp) {
        if (!shouldSend(level)) return;
        if (gatewayLoggingClient == null) {
            log.debug("[{}] {} - {}", level, loggerName, message);
            return;
        }
        try {
            LogRequest logRequest = LogRequest.builder()
                    .level(level.name())
                    .message(message)
                    .loggerName(loggerName)
                    .userEmail(userEmail)
                    .ipAddress(ipAddress)
                    .requestUrl(requestUrl)
                    .methodName(methodName)
                    .exception(exception)
                    .timestamp(timestamp != null ? timestamp : LocalDateTime.now())
                    .build();
            gatewayLoggingClient.saveLog(logRequest);
        } catch (Exception e) {
            log.error("Failed to send log to gateway: {}", e.getMessage());
        }
    }

    public void warn(String message, String loggerName) {
        log(LogLevel.WARN, message, loggerName);
    }

    public void authWarn(String message, String component, String userEmail) {
        log(LogLevel.WARN, message, createLoggerName(component, "auth"), userEmail, null, null, null, null, null);
    }

    public void authWarn(String message, String component, String userEmail, String ipAddress, String requestUrl, String methodName) {
        log(LogLevel.WARN, message, createLoggerName(component, "auth"), userEmail, ipAddress, requestUrl, methodName, null, null);
    }

    public void authWarn(String message, String component, String userEmail, String ipAddress, String requestUrl, String methodName, String exception) {
        log(LogLevel.WARN, message, createLoggerName(component, "auth"), userEmail, ipAddress, requestUrl, methodName, exception, null);
    }

    public void authError(String message, String component, String userEmail, String ipAddress, String requestUrl, String methodName, String exception) {
        log(LogLevel.ERROR, message, createLoggerName(component, "auth"), userEmail, ipAddress, requestUrl, methodName, exception, null);
    }

    public void systemError(String message, String component, String exception) {
        log(LogLevel.ERROR, message, createLoggerName(component, "system"), null, null, null, null, exception, null);
    }

    public void externalServiceError(String message, String component, String serviceName, String exception) {
        log(LogLevel.ERROR, message, createLoggerName(component, "external." + serviceName), null, null, null, null, exception, null);
    }

    public void businessWarn(String message, String component, String userEmail) {
        log(LogLevel.WARN, message, createLoggerName(component, "business"), userEmail, null, null, null, null, null);
    }

    public void businessError(String message, String component, String userEmail, String exception) {
        log(LogLevel.ERROR, message, createLoggerName(component, "business"), userEmail, null, null, null, exception, null);
    }

    public void validationWarn(String message, String component, String userEmail, String ipAddress, String requestUrl, String methodName) {
        log(LogLevel.WARN, message, createLoggerName(component, "validation"), userEmail, ipAddress, requestUrl, methodName, null, null);
    }

    public void externalServiceWarn(String message, String component, String serviceName, String userEmail) {
        log(LogLevel.WARN, message, createLoggerName(component, "external." + serviceName), userEmail, null, null, null, null, null);
    }
}
