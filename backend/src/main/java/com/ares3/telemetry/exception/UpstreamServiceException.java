package com.ares3.telemetry.exception;

/**
 * Thrown when a call to an external upstream API (NASA Mars Rover Photos,
 * Anthropic Messages) fails or returns malformed data. Mapped to HTTP 502
 * (Bad Gateway) by {@code GlobalExceptionHandler} so clients see a clean error
 * rather than a leaked stack trace.
 */
public class UpstreamServiceException extends RuntimeException {

    public UpstreamServiceException(String message) {
        super(message);
    }

    public UpstreamServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
