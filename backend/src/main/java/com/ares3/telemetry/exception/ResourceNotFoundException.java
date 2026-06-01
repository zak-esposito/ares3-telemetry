package com.ares3.telemetry.exception;

/**
 * Thrown when a requested resource does not exist. Mapped to HTTP 404 by
 * {@code GlobalExceptionHandler}.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
