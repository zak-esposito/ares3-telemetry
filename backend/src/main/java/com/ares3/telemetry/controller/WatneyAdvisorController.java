package com.ares3.telemetry.controller;

import com.ares3.telemetry.dto.HabSnapshotDto;
import com.ares3.telemetry.dto.WatneyAdviceDto;
import com.ares3.telemetry.service.ClaudeAdvisorService;
import com.ares3.telemetry.service.TelemetryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * HTTP surface for the Claude survival advisor. Thin by design — it fetches the
 * current snapshot from {@link TelemetryService} and delegates analysis to
 * {@link ClaudeAdvisorService}.
 */
@RestController
@RequestMapping("/api/advisor")
public class WatneyAdvisorController {

    private final TelemetryService telemetryService;
    private final ClaudeAdvisorService advisorService;

    public WatneyAdvisorController(TelemetryService telemetryService,
                                   ClaudeAdvisorService advisorService) {
        this.telemetryService = telemetryService;
        this.advisorService = advisorService;
    }

    /** Analyse the current habitat telemetry and return a Watney-style log entry. */
    @PostMapping("/analyse")
    public ResponseEntity<WatneyAdviceDto> analyse() {
        HabSnapshotDto current = telemetryService.getCurrentSnapshot();
        return ResponseEntity.ok(advisorService.analyse(current));
    }
}
