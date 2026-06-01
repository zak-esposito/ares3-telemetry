package com.ares3.telemetry.service;

import com.ares3.telemetry.config.SimulationConstants;
import com.ares3.telemetry.dto.HabSnapshotDto;
import com.ares3.telemetry.model.HabSnapshot;
import com.ares3.telemetry.model.SystemStatus;
import com.ares3.telemetry.repository.HabSnapshotRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TelemetryServiceTest {

    @Mock
    private HabSnapshotRepository repository;

    @Mock
    private Random random;

    @InjectMocks
    private TelemetryService service;

    /** A pristine Sol 6 snapshot, matching the documented initial state. */
    private HabSnapshot sol6() {
        return HabSnapshot.builder()
                .id(1L)
                .sol(SimulationConstants.INITIAL_SOL)
                .foodSolsRemaining(SimulationConstants.INITIAL_FOOD_SOLS)
                .waterLitres(SimulationConstants.INITIAL_WATER_LITRES)
                .o2Percentage(SimulationConstants.INITIAL_O2_PCT)
                .co2Percentage(SimulationConstants.INITIAL_CO2_PCT)
                .internalTempKelvin(SimulationConstants.INITIAL_TEMP_KELVIN)
                .internalPressureKPa(SimulationConstants.INITIAL_PRESSURE_KPA)
                .rtgWatts(SimulationConstants.INITIAL_RTG_WATTS)
                .solarWatts(SimulationConstants.INITIAL_SOLAR_WATTS)
                .batteryPercent(SimulationConstants.INITIAL_BATTERY_PCT)
                .farmAreaM2(SimulationConstants.INITIAL_FARM_AREA_M2)
                .cropDaysSincePlanted(SimulationConstants.INITIAL_CROP_DAYS)
                .estimatedPotatoKg(SimulationConstants.INITIAL_POTATO_KG)
                .evaHoursRemaining(SimulationConstants.INITIAL_EVA_HOURS)
                .oxygenatorStatus(SystemStatus.NOMINAL)
                .waterReclaimerStatus(SystemStatus.NOMINAL)
                .atmosphericRegulatorStatus(SystemStatus.NOMINAL)
                .build();
    }

    /** Returns the saved entity so the simulation can carry state forward across sols. */
    private void echoSaves() {
        when(repository.save(any(HabSnapshot.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    /** Suppress random events (roll above the event threshold). */
    private void noRandomEvents() {
        when(random.nextDouble()).thenReturn(0.99);
    }

    @Test
    void simulateOneSolFromSol6_incrementsSolAndConsumesOneFoodSol() {
        when(repository.findTopByOrderBySolDesc()).thenReturn(Optional.of(sol6()));
        echoSaves();
        noRandomEvents();

        HabSnapshotDto result = service.simulateSols(1);

        ArgumentCaptor<HabSnapshot> saved = ArgumentCaptor.forClass(HabSnapshot.class);
        verify(repository, times(1)).save(saved.capture());

        assertThat(saved.getValue().getSol()).isEqualTo(7);
        assertThat(saved.getValue().getFoodSolsRemaining())
                .isEqualTo(SimulationConstants.INITIAL_FOOD_SOLS - 1.0);
        assertThat(result.sol()).isEqualTo(7);
        assertThat(result.foodSolsRemaining()).isEqualTo(399.0);
    }

    @Test
    void simulatingPastFoodExhaustion_neverGoesNegative() {
        HabSnapshot almostStarving = sol6();
        almostStarving.setFoodSolsRemaining(0.5);
        when(repository.findTopByOrderBySolDesc()).thenReturn(Optional.of(almostStarving));
        echoSaves();
        noRandomEvents();

        service.simulateSols(3);

        ArgumentCaptor<HabSnapshot> saved = ArgumentCaptor.forClass(HabSnapshot.class);
        verify(repository, times(3)).save(saved.capture());

        assertThat(saved.getAllValues())
                .extracting(HabSnapshot::getFoodSolsRemaining)
                .allSatisfy(food -> assertThat(food).isGreaterThanOrEqualTo(0.0));
    }

    @Test
    void getSystemStatuses_reflectsOxygenatorFailure() {
        HabSnapshot failing = sol6();
        failing.setOxygenatorStatus(SystemStatus.FAILURE);
        when(repository.findTopByOrderBySolDesc()).thenReturn(Optional.of(failing));

        Map<String, SystemStatus> statuses = service.getSystemStatuses();

        assertThat(statuses).containsEntry("Oxygenator", SystemStatus.FAILURE);
        assertThat(statuses).containsEntry("Water Reclaimer", SystemStatus.NOMINAL);
        assertThat(statuses).containsEntry("Atmospheric Regulator", SystemStatus.NOMINAL);
    }

    @Test
    void simulatingWithOxygenatorInFailure_deterioratesAtmosphere() {
        HabSnapshot failing = sol6();
        failing.setOxygenatorStatus(SystemStatus.FAILURE);
        when(repository.findTopByOrderBySolDesc()).thenReturn(Optional.of(failing));
        echoSaves();
        noRandomEvents();

        HabSnapshotDto result = service.simulateSols(1);

        assertThat(result.o2Percentage()).isLessThan(SimulationConstants.INITIAL_O2_PCT);
        assertThat(result.co2Percentage()).isGreaterThan(SimulationConstants.INITIAL_CO2_PCT);
    }

    @Test
    void getHistory_returnsMappedDtosNewestFirst() {
        HabSnapshot a = sol6();
        HabSnapshot b = sol6();
        b.setSol(7);
        when(repository.findByOrderBySolDesc(any())).thenReturn(List.of(b, a));

        List<HabSnapshotDto> history = service.getHistory(2);

        assertThat(history).hasSize(2);
        assertThat(history.get(0).sol()).isEqualTo(7);
        assertThat(history.get(1).sol()).isEqualTo(6);
    }
}
