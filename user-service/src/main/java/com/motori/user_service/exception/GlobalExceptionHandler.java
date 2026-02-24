package com.motori.user_service.exception;

import com.motori.user_service.service.CentralizedLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    private final CentralizedLogService logService;

    public GlobalExceptionHandler(CentralizedLogService logService) {
        this.logService = logService;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleMethodArgumentNotValid(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            errors.put(fieldName, error.getDefaultMessage());
        });
        String path = request.getRequestURI();
        ApiError apiError = new ApiError(HttpStatus.BAD_REQUEST.value(), "Validation Error", errors.toString(), path);
        logService.validationWarn("Validation failed: " + errors, "GlobalExceptionHandler", null, null, path, "POST");
        return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler({UserNotFoundException.class})
    public ResponseEntity<ApiError> handleUserNotFound(UserNotFoundException ex, HttpServletRequest request) {
        String message = ex.getMessage() != null ? ex.getMessage() : "User not found";
        ApiError apiError = new ApiError(HttpStatus.NOT_FOUND.value(), "User Not Found", message, request.getRequestURI());
        return new ResponseEntity<>(apiError, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler({UserAlreadyExistsException.class})
    public ResponseEntity<ApiError> handleUserAlreadyExists(UserAlreadyExistsException ex, HttpServletRequest request) {
        String message = ex.getMessage() != null ? ex.getMessage() : "User already exists";
        ApiError apiError = new ApiError(HttpStatus.CONFLICT.value(), "User Already Exists", message, request.getRequestURI());
        return new ResponseEntity<>(apiError, HttpStatus.CONFLICT);
    }

    @ExceptionHandler({UserNotApprovedException.class})
    public ResponseEntity<ApiError> handleUserNotApproved(UserNotApprovedException ex, HttpServletRequest request) {
        String message = ex.getMessage() != null ? ex.getMessage() : "User not approved";
        ApiError apiError = new ApiError(HttpStatus.FORBIDDEN.value(), "User Not Approved", message, request.getRequestURI());
        return new ResponseEntity<>(apiError, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler({AuthenticationException.class})
    public ResponseEntity<ApiError> handleAuthentication(AuthenticationException ex, HttpServletRequest request) {
        String message = ex.getMessage() != null ? ex.getMessage() : "Authentication failed";
        ApiError apiError = new ApiError(HttpStatus.UNAUTHORIZED.value(), "Authentication Failed", message, request.getRequestURI());
        logService.authWarn("Authentication failed: " + message, "GlobalExceptionHandler", null, request.getRemoteAddr(), request.getRequestURI(), request.getMethod(), ex.toString());
        return new ResponseEntity<>(apiError, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleAll(Exception ex, HttpServletRequest request) {
        String message = ex.getMessage() != null ? ex.getMessage() : ex.getClass().getSimpleName();
        ApiError apiError = new ApiError(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Internal Server Error", message, request.getRequestURI());
        logService.log(CentralizedLogService.LogLevel.ERROR, message, "GlobalExceptionHandler", null, request.getRemoteAddr(), request.getRequestURI(), request.getMethod(), ex.toString(), null);
        return new ResponseEntity<>(apiError, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
