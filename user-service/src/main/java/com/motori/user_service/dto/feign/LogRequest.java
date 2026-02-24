package com.motori.user_service.dto.feign;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
