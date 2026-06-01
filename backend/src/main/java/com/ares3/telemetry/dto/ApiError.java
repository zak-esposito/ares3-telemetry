package com.ares3.telemetry.dto;

import java.time.Instant;

/**
 * Consistent error payload returned by {@code GlobalExceptionHandler}.
 * Never carries stack traces or internal detail to the client.
 */
public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path
) {
    public static ApiError of(int status, String error, String message, String path) {
        return new ApiError(Instant.now(), status, error, message, path);
    }
}
