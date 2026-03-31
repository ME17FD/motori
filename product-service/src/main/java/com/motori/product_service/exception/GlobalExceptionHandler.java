package com.motori.product_service.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import lombok.extern.slf4j.Slf4j;

/**
 * Global exception handler for the application.
 * 
 * This class handles all exceptions thrown across the application and converts them
 * to appropriate HTTP responses. It intercepts exceptions at the controller level
 * and returns meaningful error messages to API clients.
 * 
 * Handled exceptions include:
 * - Validation errors (MethodArgumentNotValidException)
 * - Resource not found errors (ResourceNotFoundException)
 * - Duplicate resource errors (DuplicateResourceException)
 * - Type mismatch and argument errors
 * - File upload size limit exceeded
 * - Missing request parameters and headers
 * - Unsupported media types and HTTP methods
 * - Generic unhandled exceptions
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles validation errors when request body validation fails.
     * Returns HTTP 400 Bad Request with field-level error details.
     * 
     * @param ex the validation exception
     * @return ResponseEntity with validation error details mapped by field name
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(
            MethodArgumentNotValidException ex) {
        log.warn("Validation failed : {}", ex.getMessage());
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
            .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(errors);
    }

    /**
     * Handles IllegalArgumentException thrown during request processing.
     * Returns HTTP 400 Bad Request.
     * 
     * @param ex the illegal argument exception
     * @return ResponseEntity with error message
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("Illegal argument : {}", ex.getMessage());
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ex.getMessage());
    }

    /**
     * Handles malformed request body errors.
     * Occurs when the request body is invalid JSON or cannot be parsed.
     * Returns HTTP 400 Bad Request.
     * 
     * @param ex the HTTP message not readable exception
     * @return ResponseEntity with error message
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<String> handleNotReadable(HttpMessageNotReadableException ex) {
        log.warn("Message not readable : {}", ex.getMessage());
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body("Le corps de la requete est invalide ou mal forme");
    }

    /**
     * Handles missing required request parameters.
     * Returns HTTP 400 Bad Request with the name of the missing parameter.
     * 
     * @param ex the missing request parameter exception
     * @return ResponseEntity with error message
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<String> handleMissingParam(
            MissingServletRequestParameterException ex) {
        log.warn("Missing request parameter : {}", ex.getMessage());
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body("Parametre manquant : " + ex.getParameterName());
    }

    /**
     * Handles type mismatch errors when parameter types don't match expected types.
     * For example, passing a string when expecting a number.
     * Returns HTTP 400 Bad Request.
     * 
     * @param ex the method argument type mismatch exception
     * @return ResponseEntity with error message
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<String> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex) {
        log.warn("Type mismatch : {}", ex.getMessage());
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body("Valeur invalide '" + ex.getValue() +
                  "' pour le parametre '" + ex.getName() + "'");
    }

    /**
     * Handles missing required request headers.
     * Returns HTTP 400 Bad Request with the name of the missing header.
     * 
     * @param ex the missing request header exception
     * @return ResponseEntity with error message
     */
    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<String> handleMissingHeader(MissingRequestHeaderException ex) {
        log.warn("Missing header : {}", ex.getMessage());
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body("Header manquant : " + ex.getHeaderName());
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<String> handleNotFound(ResourceNotFoundException ex) {
        log.warn("Resource not found : {}", ex.getMessage());
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(ex.getMessage());
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<String> handleNoResourceFound(NoResourceFoundException ex) {
        log.warn("No resource found : {}", ex.getMessage());
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body("Endpoint introuvable : " + ex.getResourcePath());
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<String> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException ex) {
        log.warn("Method not supported : {}", ex.getMessage());
        return ResponseEntity
            .status(HttpStatus.METHOD_NOT_ALLOWED)
            .body("Methode HTTP non supportee : " + ex.getMethod());
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<String> handleDuplicate(DuplicateResourceException ex) {
        log.warn("Duplicate resource : {}", ex.getMessage());
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(ex.getMessage());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<String> handleMaxUploadSize(
            MaxUploadSizeExceededException ex) {
        log.warn("File too large : {}", ex.getMessage());
        return ResponseEntity
            .status(HttpStatus.PAYLOAD_TOO_LARGE)
            .body("Le fichier est trop volumineux");
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<String> handleMediaTypeNotSupported(
            HttpMediaTypeNotSupportedException ex) {
        log.warn("Media type not supported : {}", ex.getMessage());
        return ResponseEntity
            .status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
            .body("Type de contenu non supporte : " + ex.getContentType());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleIllegalState(IllegalStateException ex) {
        log.warn("Illegal state : {}", ex.getMessage());
        return ResponseEntity
            .status(HttpStatus.UNPROCESSABLE_ENTITY)
            .body(ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGeneric(Exception ex) {
        log.error("Unexpected error : {}", ex.getMessage(), ex);
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body("Une erreur inattendue est survenue");
    }
}