package com.krishimarg.backend.exceptions;

public class RouteOptimizerUnavailableException extends RuntimeException {
    public RouteOptimizerUnavailableException(String message) {
        super(message);
    }

    public RouteOptimizerUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
