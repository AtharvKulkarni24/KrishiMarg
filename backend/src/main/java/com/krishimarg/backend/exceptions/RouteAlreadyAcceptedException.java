package com.krishimarg.backend.exceptions;

public class RouteAlreadyAcceptedException extends RuntimeException {
    public RouteAlreadyAcceptedException(String message) {
        super(message);
    }
}
