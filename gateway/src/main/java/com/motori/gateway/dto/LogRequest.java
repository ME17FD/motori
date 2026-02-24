package com.motori.gateway.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogRequest {
    private String level;
    private String message;
    private String loggerName;
    private String userEmail;
    private String ipAddress;
    private String requestUrl;
    private String methodName;
    private String exception;
    private LocalDateTime timestamp;
}
