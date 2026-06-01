package com.ares3.telemetry.service;

import com.ares3.telemetry.dto.HabSnapshotDto;
import com.ares3.telemetry.dto.RiskLevel;
import com.ares3.telemetry.dto.WatneyAdviceDto;
import com.ares3.telemetry.exception.UpstreamServiceException;
import com.ares3.telemetry.model.SystemStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.List;

/**
 * Asks Claude (Anthropic Messages API) for a Mark Watney-style survival log
 * entry on the current habitat telemetry, and attaches a deterministic
 * {@link RiskLevel} derived from the raw numbers. Holds no HTTP-controller
 * concerns; the API key and model are injected, never hardcoded.
 */
@Slf4j
@Service
public class ClaudeAdvisorService {

    private static final String MESSAGES_URL = "https://api.anthropic.com/v1/messages";
    private static final String ANTHROPIC_VERSION = "2023-06-01";
    private static final int MAX_TOKENS = 300;

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String model;

    public ClaudeAdvisorService(RestTemplate restTemplate,
                                @Value("${anthropic.api.key}") String apiKey,
                                @Value("${anthropic.api.model}") String model) {
        this.restTemplate = restTemplate;
        this.apiKey = apiKey;
        this.model = model;
    }

    /** Generate a Watney-style log entry plus a risk classification for {@code snapshot}. */
    public WatneyAdviceDto analyse(HabSnapshotDto snapshot) {
        String advice = callClaude(buildPrompt(snapshot));
        return new WatneyAdviceDto(snapshot.sol(), advice, classify(snapshot), Instant.now());
    }

    // --- risk classification (deterministic, independent of Claude's text) ---

    /**
     * Classify severity in priority order: lethal atmosphere/starvation first,
     * then hard system failures, then degraded systems or a thin food margin.
     */
    RiskLevel classify(HabSnapshotDto s) {
        if (s.o2Percentage() < 18.0 || s.co2Percentage() > 3.0 || s.foodSolsRemaining() < 10.0) {
            return RiskLevel.CRITICAL;
        }
        if (anySystemIs(s, SystemStatus.FAILURE)) {
            return RiskLevel.HIGH;
        }
        if (anySystemIs(s, SystemStatus.DEGRADED) || s.foodSolsRemaining() < 50.0) {
            return RiskLevel.MEDIUM;
        }
        return RiskLevel.LOW;
    }

    private static boolean anySystemIs(HabSnapshotDto s, SystemStatus status) {
        return s.oxygenatorStatus() == status
                || s.waterReclaimerStatus() == status
                || s.atmosphericRegulatorStatus() == status;
    }

    // --- prompt construction ---

    private String buildPrompt(HabSnapshotDto s) {
        return """
                You are Mark Watney, stranded astronaut on Mars, writing a log entry. \
                Here is the current habitat telemetry on Sol %d:
                - Food: %.1f sols remaining
                - Water: %.1f litres
                - O2: %.2f%%   CO2: %.2f%%
                - Internal temp: %.1f K   Pressure: %.1f kPa
                - Power: RTG %.0f W, solar %.0f W, battery %.0f%%
                - Crops: %.1f m2 farm, %d sols since planting, est. %.1f kg potatoes
                - EVA: %.1f filter-hours remaining
                - Systems: Oxygenator %s, Water Reclaimer %s, Atmospheric Regulator %s

                Write a log entry of at most 150 words. Be practical, technically precise, \
                and darkly funny in Watney's voice. Focus on what matters most given these \
                numbers. Do not invent telemetry that isn't listed.""".formatted(
                s.sol(),
                s.foodSolsRemaining(),
                s.waterLitres(),
                s.o2Percentage(),
                s.co2Percentage(),
                s.internalTempKelvin(),
                s.internalPressureKPa(),
                s.rtgWatts(),
                s.solarWatts(),
                s.batteryPercent(),
                s.farmAreaM2(),
                s.cropDaysSincePlanted(),
                s.estimatedPotatoKg(),
                s.evaHoursRemaining(),
                s.oxygenatorStatus(),
                s.waterReclaimerStatus(),
                s.atmosphericRegulatorStatus()
        );
    }

    // --- Anthropic call ---

    private String callClaude(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", apiKey);
        headers.set("anthropic-version", ANTHROPIC_VERSION);

        AnthropicRequest body = new AnthropicRequest(
                model, MAX_TOKENS, List.of(new Message("user", prompt)));

        try {
            AnthropicResponse response =
                    restTemplate.postForObject(MESSAGES_URL, new HttpEntity<>(body, headers), AnthropicResponse.class);
            return extractText(response);
        } catch (RestClientException ex) {
            log.warn("Anthropic advisor request failed: {}", ex.getMessage());
            throw new UpstreamServiceException("Watney advisor unavailable", ex);
        }
    }

    private String extractText(AnthropicResponse response) {
        if (response == null || response.content() == null || response.content().isEmpty()) {
            throw new UpstreamServiceException("Watney advisor returned an empty response");
        }
        return response.content().stream()
                .filter(block -> "text".equals(block.type()) && block.text() != null)
                .map(ContentBlock::text)
                .findFirst()
                .orElseThrow(() -> new UpstreamServiceException("Watney advisor returned no text content"));
    }

    // --- internal Anthropic wire DTOs (never exposed to clients) ---

    record AnthropicRequest(
            String model,
            @JsonProperty("max_tokens") int maxTokens,
            List<Message> messages
    ) {
    }

    record Message(String role, String content) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record AnthropicResponse(List<ContentBlock> content) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record ContentBlock(String type, String text) {
    }
}
