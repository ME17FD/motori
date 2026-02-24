package com.motori.gateway.controller;

import com.motori.gateway.dto.LogRequest;
import com.motori.gateway.model.Log;
import com.motori.gateway.service.LogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/logs")
@RequiredArgsConstructor
public class LogController {

    private final LogService logService;

    @PostMapping("/save")
    public ResponseEntity<Void> saveLog(@RequestBody LogRequest logRequest) {
        try {
            Log.LogLevel level = Log.LogLevel.valueOf(logRequest.getLevel().toUpperCase());
            logService.saveLog(
                    level,
                    logRequest.getMessage(),
                    logRequest.getLoggerName(),
                    logRequest.getUserEmail(),
                    logRequest.getIpAddress(),
                    logRequest.getRequestUrl(),
                    logRequest.getMethodName(),
                    logRequest.getException(),
                    logRequest.getTimestamp()
            );
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<Page<Log>> getAllLogs(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(logService.getAllLogs(pageable));
    }
}
