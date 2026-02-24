package com.motori.gateway.service;

import com.motori.gateway.model.Log;
import com.motori.gateway.repository.LogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LogService {

    private final LogRepository logRepository;
    private static final String SERVICE_NAME = "gateway";
    private Log.LogLevel minLogLevel = Log.LogLevel.ERROR;

    public static String createLoggerName(String component) {
        return SERVICE_NAME + "." + component;
    }

    public static String createLoggerName(String component, String method) {
        return SERVICE_NAME + "." + component + "." + method;
    }

    private boolean shouldSave(Log.LogLevel level) {
        return level.ordinal() >= minLogLevel.ordinal();
    }

    public Log saveLog(Log.LogLevel level, String message, String loggerName, String userEmail,
                       String ipAddress, String requestUrl, String methodName, String exception, LocalDateTime createdAt) {
        if (!shouldSave(level)) return null;
        return logRepository.save(Log.builder()
                .level(level)
                .message(message)
                .loggerName(loggerName)
                .userEmail(userEmail)
                .ipAddress(ipAddress)
                .requestUrl(requestUrl)
                .methodName(methodName)
                .exception(exception)
                .timestamp(createdAt != null ? createdAt : LocalDateTime.now())
                .build());
    }

    public void authWarn(String message, String component, String userEmail, String ipAddress, String requestUrl, String methodName) {
        saveLog(Log.LogLevel.WARN, message, createLoggerName(component, "auth"), userEmail, ipAddress, requestUrl, methodName, null, null);
    }

    public void authWarn(String message, String component, String userEmail, String ipAddress, String requestUrl, String methodName, String exception) {
        saveLog(Log.LogLevel.WARN, message, createLoggerName(component, "auth"), userEmail, ipAddress, requestUrl, methodName, exception, null);
    }

    public void authError(String message, String component, String userEmail, String ipAddress, String requestUrl, String methodName, String exception) {
        saveLog(Log.LogLevel.ERROR, message, createLoggerName(component, "auth"), userEmail, ipAddress, requestUrl, methodName, exception, null);
    }

    public void systemError(String message, String component, String exception) {
        saveLog(Log.LogLevel.ERROR, message, createLoggerName(component, "system"), null, null, null, null, exception, null);
    }

    public Page<Log> getAllLogs(Pageable pageable) {
        return logRepository.findAllByOrderByTimestampDesc(pageable);
    }

    public List<Log> getLogsByLevel(Log.LogLevel level) {
        return logRepository.findByLevel(level);
    }

    public long getTotalLogCount() {
        return logRepository.count();
    }

    public long getLogCountByLevel(Log.LogLevel level) {
        return logRepository.countByLevel(level);
    }
}
