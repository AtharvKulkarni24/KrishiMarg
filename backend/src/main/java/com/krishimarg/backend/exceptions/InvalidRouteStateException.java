package com.krishimarg.backend.exceptions;

public class InvalidRouteStateException extends RuntimeException {
    public InvalidRouteStateException(String message) {
        super(message);
    }
}
