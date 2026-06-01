package com.ares3.telemetry.controller;

import com.ares3.telemetry.dto.RoverPhotoDto;
import com.ares3.telemetry.service.NasaRoverService;
import jakarta.validation.constraints.Min;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * HTTP surface for NASA Mars Rover photos. Thin by design — all upstream logic
 * lives in {@link NasaRoverService}; this class only maps request to response.
 */
@RestController
@RequestMapping("/api/rover")
@Validated
public class RoverPhotoController {

    private final NasaRoverService nasaRoverService;

    public RoverPhotoController(NasaRoverService nasaRoverService) {
        this.nasaRoverService = nasaRoverService;
    }

    /** Curiosity photos for the given sol. */
    @GetMapping("/photos")
    public ResponseEntity<List<RoverPhotoDto>> photos(
            @RequestParam
            @Min(value = 0, message = "sol must not be negative")
            int sol) {
        return ResponseEntity.ok(nasaRoverService.getPhotosBySol(sol));
    }

    /** Latest available Curiosity photos. */
    @GetMapping("/latest")
    public ResponseEntity<List<RoverPhotoDto>> latest() {
        return ResponseEntity.ok(nasaRoverService.getLatestPhotos());
    }
}
