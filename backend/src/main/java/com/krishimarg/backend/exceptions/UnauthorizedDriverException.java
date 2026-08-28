package com.krishimarg.backend.exceptions;

public class UnauthorizedDriverException extends RuntimeException {
    public UnauthorizedDriverException(String message) {
        super(message);
    }
}
