package com.krishimarg.backend.common.exceptions;

public class InvalidRouteStateException extends RuntimeException {
    public InvalidRouteStateException(String message) {
        super(message);
    }
}
