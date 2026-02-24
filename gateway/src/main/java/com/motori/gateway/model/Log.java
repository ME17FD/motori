package com.motori.gateway.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "gateway_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Log {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    @Column(name = "level", nullable = false)
    private LogLevel level;

    @Column(name = "message", nullable = false, length = 1000)
    private String message;

    @Column(name = "logger_name")
    private String loggerName;

    @Column(name = "user_email")
    private String userEmail;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "request_url")
    private String requestUrl;

    @Column(name = "method_name")
    private String methodName;

    @Column(name = "exception", length = 2000)
    private String exception;

    public enum LogLevel {
        TRACE, DEBUG, INFO, WARN, ERROR
    }
}
