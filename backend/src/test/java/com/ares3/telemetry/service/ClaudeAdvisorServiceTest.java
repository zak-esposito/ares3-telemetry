package com.ares3.telemetry.service;

import com.ares3.telemetry.dto.HabSnapshotDto;
import com.ares3.telemetry.dto.RiskLevel;
import com.ares3.telemetry.dto.WatneyAdviceDto;
import com.ares3.telemetry.model.SystemStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.web.client.RestTemplate;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClaudeAdvisorServiceTest {

    @Mock
    private RestTemplate restTemplate;

    private ClaudeAdvisorService service;

    @BeforeEach
    void setUp() {
        // @Value isn't applied by Mockito, so supply the key + model directly.
        service = new ClaudeAdvisorService(restTemplate, "test-key", "claude-sonnet-4-6");
    }

    /**
     * A fully nominal Sol 6 snapshot. Override individual fields with {@code with*}
     * helpers below to drive specific classification branches.
     */
    private HabSnapshotDto nominal() {
        return new HabSnapshotDto(
                6,        // sol
                400.0,    // foodSolsRemaining
                300.0,    // waterLitres
                21.0,     // o2Percentage
                0.04,     // co2Percentage
                295.0,    // internalTempKelvin
                101.0,    // internalPressureKPa
                100.0,    // rtgWatts
                45.0,     // solarWatts
                72.0,     // batteryPercent
                0.0,      // farmAreaM2
                0,        // cropDaysSincePlanted
                0.0,      // estimatedPotatoKg
                1500.0,   // evaHoursRemaining
                SystemStatus.NOMINAL,
                SystemStatus.NOMINAL,
                SystemStatus.NOMINAL,
                null);    // lastEvent
    }

    @Test
    void classify_allNominal_isLow() {
        assertThat(service.classify(nominal())).isEqualTo(RiskLevel.LOW);
    }

    @Test
    void classify_lowO2_isCritical() {
        HabSnapshotDto s = withO2(nominal(), 17.0);
        assertThat(service.classify(s)).isEqualTo(RiskLevel.CRITICAL);
    }

    @Test
    void classify_highCo2_isCritical() {
        HabSnapshotDto s = withCo2(nominal(), 3.5);
        assertThat(service.classify(s)).isEqualTo(RiskLevel.CRITICAL);
    }

    @Test
    void classify_starvation_isCritical() {
        HabSnapshotDto s = withFood(nominal(), 9.0);
        assertThat(service.classify(s)).isEqualTo(RiskLevel.CRITICAL);
    }

    @Test
    void classify_systemFailure_isHigh() {
        HabSnapshotDto s = withOxygenator(nominal(), SystemStatus.FAILURE);
        assertThat(service.classify(s)).isEqualTo(RiskLevel.HIGH);
    }

    @Test
    void classify_systemDegraded_isMedium() {
        HabSnapshotDto s = withOxygenator(nominal(), SystemStatus.DEGRADED);
        assertThat(service.classify(s)).isEqualTo(RiskLevel.MEDIUM);
    }

    @Test
    void classify_thinFoodMargin_isMedium() {
        HabSnapshotDto s = withFood(nominal(), 40.0);
        assertThat(service.classify(s)).isEqualTo(RiskLevel.MEDIUM);
    }

    @Test
    void classify_criticalTakesPriorityOverFailure() {
        HabSnapshotDto s = withOxygenator(withO2(nominal(), 17.0), SystemStatus.FAILURE);
        assertThat(service.classify(s)).isEqualTo(RiskLevel.CRITICAL);
    }

    @Test
    void analyse_returnsClaudeTextAndPopulatesMetadata() {
        ClaudeAdvisorService.AnthropicResponse canned = new ClaudeAdvisorService.AnthropicResponse(
                List.of(new ClaudeAdvisorService.ContentBlock("text", "I'm going to science the shit out of this.")));
        when(restTemplate.postForObject(any(String.class), any(HttpEntity.class), eq(ClaudeAdvisorService.AnthropicResponse.class)))
                .thenReturn(canned);

        WatneyAdviceDto result = service.analyse(nominal());

        assertThat(result.advice()).isEqualTo("I'm going to science the shit out of this.");
        assertThat(result.sol()).isEqualTo(6);
        assertThat(result.riskLevel()).isEqualTo(RiskLevel.LOW);
        assertThat(result.timestamp()).isNotNull();
    }

    // --- field-override helpers (records are immutable) ---

    private HabSnapshotDto withO2(HabSnapshotDto s, double o2) {
        return new HabSnapshotDto(s.sol(), s.foodSolsRemaining(), s.waterLitres(), o2,
                s.co2Percentage(), s.internalTempKelvin(), s.internalPressureKPa(), s.rtgWatts(),
                s.solarWatts(), s.batteryPercent(), s.farmAreaM2(), s.cropDaysSincePlanted(),
                s.estimatedPotatoKg(), s.evaHoursRemaining(), s.oxygenatorStatus(),
                s.waterReclaimerStatus(), s.atmosphericRegulatorStatus(), s.lastEvent());
    }

    private HabSnapshotDto withCo2(HabSnapshotDto s, double co2) {
        return new HabSnapshotDto(s.sol(), s.foodSolsRemaining(), s.waterLitres(), s.o2Percentage(),
                co2, s.internalTempKelvin(), s.internalPressureKPa(), s.rtgWatts(),
                s.solarWatts(), s.batteryPercent(), s.farmAreaM2(), s.cropDaysSincePlanted(),
                s.estimatedPotatoKg(), s.evaHoursRemaining(), s.oxygenatorStatus(),
                s.waterReclaimerStatus(), s.atmosphericRegulatorStatus(), s.lastEvent());
    }

    private HabSnapshotDto withFood(HabSnapshotDto s, double food) {
        return new HabSnapshotDto(s.sol(), food, s.waterLitres(), s.o2Percentage(),
                s.co2Percentage(), s.internalTempKelvin(), s.internalPressureKPa(), s.rtgWatts(),
                s.solarWatts(), s.batteryPercent(), s.farmAreaM2(), s.cropDaysSincePlanted(),
                s.estimatedPotatoKg(), s.evaHoursRemaining(), s.oxygenatorStatus(),
                s.waterReclaimerStatus(), s.atmosphericRegulatorStatus(), s.lastEvent());
    }

    private HabSnapshotDto withOxygenator(HabSnapshotDto s, SystemStatus status) {
        return new HabSnapshotDto(s.sol(), s.foodSolsRemaining(), s.waterLitres(), s.o2Percentage(),
                s.co2Percentage(), s.internalTempKelvin(), s.internalPressureKPa(), s.rtgWatts(),
                s.solarWatts(), s.batteryPercent(), s.farmAreaM2(), s.cropDaysSincePlanted(),
                s.estimatedPotatoKg(), s.evaHoursRemaining(), status,
                s.waterReclaimerStatus(), s.atmosphericRegulatorStatus(), s.lastEvent());
    }
}
