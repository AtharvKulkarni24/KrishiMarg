package com.krishimarg.backend.common.exceptions;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(RouteNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleRouteNotFound(RouteNotFoundException ex) {
        log.warn("Route not found: {}", ex.getMessage());
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(RouteAlreadyAcceptedException.class)
    public ResponseEntity<Map<String, Object>> handleRouteAlreadyAccepted(RouteAlreadyAcceptedException ex) {
        log.warn("Route already accepted: {}", ex.getMessage());
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(UnauthorizedDriverException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorizedDriver(UnauthorizedDriverException ex) {
        log.warn("Unauthorized driver: {}", ex.getMessage());
        return buildResponse(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(InvalidRouteStateException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidRouteState(InvalidRouteStateException ex) {
        log.warn("Invalid route state: {}", ex.getMessage());
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(RouteOptimizerUnavailableException.class)
    public ResponseEntity<Map<String, Object>> handleOptimizerUnavailable(RouteOptimizerUnavailableException ex) {
        log.error("Route optimizer unavailable: {}", ex.getMessage());
        return buildResponse(HttpStatus.SERVICE_UNAVAILABLE, ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("Illegal argument: {}", ex.getMessage());
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        log.error("Unhandled error: ", ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An internal server error occurred: " + ex.getMessage());
    }

    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }
}
