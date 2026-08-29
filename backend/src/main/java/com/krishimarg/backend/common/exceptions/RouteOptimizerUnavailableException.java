// Trigger IDE re-parse
package com.krishimarg.backend.common.exceptions;

public class RouteOptimizerUnavailableException extends RuntimeException {
    public RouteOptimizerUnavailableException(String message) {
        super(message);
    }

    public RouteOptimizerUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
