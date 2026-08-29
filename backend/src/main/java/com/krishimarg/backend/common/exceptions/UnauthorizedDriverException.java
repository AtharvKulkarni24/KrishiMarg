package com.krishimarg.backend.common.exceptions;

public class UnauthorizedDriverException extends RuntimeException {
    public UnauthorizedDriverException(String message) {
        super(message);
    }
}
