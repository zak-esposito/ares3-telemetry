package com.ares3.telemetry.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Request body for {@code POST /api/telemetry/simulate}: advance the simulation
 * by {@code sols} Martian days.
 */
public record SimulateRequest(
        @NotNull(message = "sols is required")
        @Min(value = 1, message = "sols must be at least 1")
        @Max(value = 1000, message = "sols must not exceed 1000")
        Integer sols
) {
}
