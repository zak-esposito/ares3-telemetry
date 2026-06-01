package com.ares3.telemetry.dto;

/**
 * API-facing view of a single NASA Mars Rover photo. Flattens NASA's nested
 * JSON ({@code camera.name}, {@code rover.id}) into a stable client contract so
 * no raw upstream shape leaks across the controller boundary.
 */
public record RoverPhotoDto(
        int sol,
        String earthDate,
        String imgSrc,
        String cameraName,
        long roverId
) {
}
