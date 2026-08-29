package com.krishimarg.backend.common.exceptions;

public class RouteAlreadyAcceptedException extends RuntimeException {
    public RouteAlreadyAcceptedException(String message) {
        super(message);
    }
}
