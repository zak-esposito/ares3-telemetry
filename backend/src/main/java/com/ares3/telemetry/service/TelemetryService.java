package com.ares3.telemetry.service;

import com.ares3.telemetry.config.SimulationConstants;
import com.ares3.telemetry.dto.HabSnapshotDto;
import com.ares3.telemetry.exception.ResourceNotFoundException;
import com.ares3.telemetry.model.HabSnapshot;
import com.ares3.telemetry.model.SystemStatus;
import com.ares3.telemetry.repository.HabSnapshotRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * Core telemetry logic: serves snapshots and advances the Mars-habitat
 * simulation per the rules in CLAUDE.md. Holds no HTTP concerns.
 */
@Slf4j
@Service
public class TelemetryService {

    /** Random events that may strike per sol, and the system each degrades. */
    private enum RandomEvent {
        MICROMETEORITE_STRIKE,
        DUST_STORM,
        SYSTEM_GLITCH,
        CROP_DISEASE
    }

    private static final RandomEvent[] EVENTS = RandomEvent.values();

    private final HabSnapshotRepository repository;
    private final Random random;

    public TelemetryService(HabSnapshotRepository repository, Random random) {
        this.repository = repository;
        this.random = random;
    }

    /** Latest hab snapshot (highest sol). */
    @Transactional(readOnly = true)
    public HabSnapshotDto getCurrentSnapshot() {
        return HabSnapshotDto.from(latestOrThrow());
    }

    /** Last {@code sols} readings, newest first. */
    @Transactional(readOnly = true)
    public List<HabSnapshotDto> getHistory(int sols) {
        return repository.findByOrderBySolDesc(PageRequest.of(0, sols))
                .stream()
                .map(HabSnapshotDto::from)
                .toList();
    }

    /** Current status of each tracked life-support system, keyed by display name. */
    @Transactional(readOnly = true)
    public Map<String, SystemStatus> getSystemStatuses() {
        HabSnapshot s = latestOrThrow();
        Map<String, SystemStatus> statuses = new LinkedHashMap<>();
        statuses.put("Oxygenator", s.getOxygenatorStatus());
        statuses.put("Water Reclaimer", s.getWaterReclaimerStatus());
        statuses.put("Atmospheric Regulator", s.getAtmosphericRegulatorStatus());
        return statuses;
    }

    /**
     * Advance the simulation by {@code n} sols, persisting one snapshot per sol,
     * and return the final state.
     */
    @Transactional
    public HabSnapshotDto simulateSols(int n) {
        HabSnapshot current = latestOrThrow();
        log.info("Simulating {} sol(s) from Sol {}.", n, current.getSol());

        for (int i = 0; i < n; i++) {
            HabSnapshot next = advanceOneSol(current);
            current = repository.save(next);
        }

        log.info("Simulation complete at Sol {}.", current.getSol());
        return HabSnapshotDto.from(current);
    }

    // --- internals ---

    private HabSnapshot latestOrThrow() {
        return repository.findTopByOrderBySolDesc()
                .orElseThrow(() -> new ResourceNotFoundException("No hab snapshot available"));
    }

    /** Produce the next sol's (unsaved) snapshot from the previous one. */
    private HabSnapshot advanceOneSol(HabSnapshot prev) {
        HabSnapshot next = HabSnapshot.builder()
                .sol(prev.getSol() + 1)
                .foodSolsRemaining(prev.getFoodSolsRemaining())
                .waterLitres(prev.getWaterLitres())
                .o2Percentage(prev.getO2Percentage())
                .co2Percentage(prev.getCo2Percentage())
                .internalTempKelvin(prev.getInternalTempKelvin())
                .internalPressureKPa(prev.getInternalPressureKPa())
                .rtgWatts(prev.getRtgWatts())
                .solarWatts(prev.getSolarWatts())
                .batteryPercent(prev.getBatteryPercent())
                .farmAreaM2(prev.getFarmAreaM2())
                .cropDaysSincePlanted(prev.getCropDaysSincePlanted())
                .estimatedPotatoKg(prev.getEstimatedPotatoKg())
                .evaHoursRemaining(prev.getEvaHoursRemaining())
                .oxygenatorStatus(prev.getOxygenatorStatus())
                .waterReclaimerStatus(prev.getWaterReclaimerStatus())
                .atmosphericRegulatorStatus(prev.getAtmosphericRegulatorStatus())
                .lastEvent(null)
                .build();

        applyFood(next);
        applyEva(next);
        applyAtmosphere(next);
        applyWater(next);
        applyCrops(next);
        applyPower(next);
        maybeApplyRandomEvent(next);

        return next;
    }

    private void applyFood(HabSnapshot s) {
        double food = s.getFoodSolsRemaining() - SimulationConstants.FOOD_CONSUMED_PER_SOL;
        s.setFoodSolsRemaining(Math.max(SimulationConstants.FOOD_FLOOR, food));
    }

    private void applyEva(HabSnapshot s) {
        double eva = s.getEvaHoursRemaining() - SimulationConstants.EVA_HOURS_PER_SOL;
        s.setEvaHoursRemaining(Math.max(SimulationConstants.EVA_FLOOR, eva));
    }

    private void applyAtmosphere(HabSnapshot s) {
        switch (s.getOxygenatorStatus()) {
            case NOMINAL -> {
                s.setO2Percentage(SimulationConstants.O2_NOMINAL_TARGET);
                s.setCo2Percentage(SimulationConstants.CO2_NOMINAL_TARGET);
            }
            case DEGRADED -> {
                s.setO2Percentage(driftToward(s.getO2Percentage(),
                        SimulationConstants.O2_DEGRADED_TARGET, SimulationConstants.DEGRADED_DRIFT_RATE));
                s.setCo2Percentage(driftToward(s.getCo2Percentage(),
                        SimulationConstants.CO2_DEGRADED_TARGET, SimulationConstants.DEGRADED_DRIFT_RATE));
            }
            case FAILURE -> {
                s.setO2Percentage(Math.max(SimulationConstants.O2_FLOOR,
                        s.getO2Percentage() - SimulationConstants.FAILURE_O2_DROP_PER_SOL));
                s.setCo2Percentage(Math.min(SimulationConstants.CO2_CEILING,
                        s.getCo2Percentage() + SimulationConstants.FAILURE_CO2_RISE_PER_SOL));
            }
        }
    }

    private void applyWater(HabSnapshot s) {
        if (s.getWaterReclaimerStatus() == SystemStatus.NOMINAL) {
            s.setWaterLitres(s.getWaterLitres() + SimulationConstants.WATER_RECOVERY_PER_SOL);
        }
        // DEGRADED / FAILURE: no condensate recovery this sol.
        s.setWaterLitres(Math.max(SimulationConstants.WATER_FLOOR, s.getWaterLitres()));
    }

    private void applyCrops(HabSnapshot s) {
        if (s.getFarmAreaM2() <= 0.0) {
            return;
        }
        int days = s.getCropDaysSincePlanted() + 1;
        if (days >= SimulationConstants.CROP_HARVEST_SOL) {
            double harvestKg = s.getFarmAreaM2() * SimulationConstants.CROP_YIELD_KG_PER_M2;
            s.setEstimatedPotatoKg(s.getEstimatedPotatoKg() + harvestKg);
            s.setFoodSolsRemaining(s.getFoodSolsRemaining()
                    + harvestKg / SimulationConstants.POTATO_KG_PER_FOOD_SOL);
            s.setCropDaysSincePlanted(0);
        } else {
            s.setCropDaysSincePlanted(days);
        }
    }

    private void applyPower(HabSnapshot s) {
        s.setSolarWatts(s.getSolarWatts() * SimulationConstants.SOLAR_DEGRADATION_FACTOR);
        s.setRtgWatts(SimulationConstants.INITIAL_RTG_WATTS);
    }

    private void maybeApplyRandomEvent(HabSnapshot s) {
        if (random.nextDouble() >= SimulationConstants.RANDOM_EVENT_CHANCE) {
            return;
        }
        RandomEvent event = EVENTS[random.nextInt(EVENTS.length)];
        s.setLastEvent(event.name());
        switch (event) {
            case MICROMETEORITE_STRIKE -> degrade(s, SystemStatus.DEGRADED, "atmospheric");
            case DUST_STORM -> {
                s.setSolarWatts(s.getSolarWatts() * 0.5);
                degrade(s, SystemStatus.DEGRADED, "oxygenator");
            }
            case SYSTEM_GLITCH -> degrade(s, SystemStatus.DEGRADED, "water");
            case CROP_DISEASE -> s.setEstimatedPotatoKg(s.getEstimatedPotatoKg() * 0.5);
        }
        log.info("Random event on Sol {}: {}", s.getSol(), event);
    }

    /** Knock a system to the given status if it is currently healthier. */
    private void degrade(HabSnapshot s, SystemStatus to, String system) {
        switch (system) {
            case "oxygenator" -> {
                if (s.getOxygenatorStatus() == SystemStatus.NOMINAL) {
                    s.setOxygenatorStatus(to);
                }
            }
            case "water" -> {
                if (s.getWaterReclaimerStatus() == SystemStatus.NOMINAL) {
                    s.setWaterReclaimerStatus(to);
                }
            }
            case "atmospheric" -> {
                if (s.getAtmosphericRegulatorStatus() == SystemStatus.NOMINAL) {
                    s.setAtmosphericRegulatorStatus(to);
                }
            }
            default -> { /* no-op */ }
        }
    }

    private static double driftToward(double current, double target, double rate) {
        return current + (target - current) * rate;
    }
}
