package com.ares3.telemetry.controller;

import com.ares3.telemetry.dto.HabSnapshotDto;
import com.ares3.telemetry.dto.SimulateRequest;
import com.ares3.telemetry.model.SystemStatus;
import com.ares3.telemetry.service.TelemetryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * HTTP surface for habitat telemetry. Thin by design — all logic lives in
 * {@link TelemetryService}; this class only handles request/response mapping.
 */
@RestController
@RequestMapping("/api/telemetry")
@Validated
public class TelemetryController {

    private final TelemetryService telemetryService;

    public TelemetryController(TelemetryService telemetryService) {
        this.telemetryService = telemetryService;
    }

    /** Latest hab snapshot. */
    @GetMapping("/current")
    public ResponseEntity<HabSnapshotDto> current() {
        return ResponseEntity.ok(telemetryService.getCurrentSnapshot());
    }

    /** Last {@code sols} readings, newest first. */
    @GetMapping("/history")
    public ResponseEntity<List<HabSnapshotDto>> history(
            @RequestParam(defaultValue = "10")
            @Min(value = 1, message = "sols must be at least 1")
            @Max(value = 1000, message = "sols must not exceed 1000")
            int sols) {
        return ResponseEntity.ok(telemetryService.getHistory(sols));
    }

    /** Current status of each tracked life-support system. */
    @GetMapping("/systems")
    public ResponseEntity<Map<String, SystemStatus>> systems() {
        return ResponseEntity.ok(telemetryService.getSystemStatuses());
    }

    /** Advance the simulation by {@code sols} and return the resulting state. */
    @PostMapping("/simulate")
    public ResponseEntity<HabSnapshotDto> simulate(@Valid @RequestBody SimulateRequest request) {
        return ResponseEntity.ok(telemetryService.simulateSols(request.sols()));
    }
}
