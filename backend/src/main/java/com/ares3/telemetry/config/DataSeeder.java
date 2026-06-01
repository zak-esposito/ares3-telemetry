package com.ares3.telemetry.config;

import com.ares3.telemetry.model.HabSnapshot;
import com.ares3.telemetry.model.SystemStatus;
import com.ares3.telemetry.repository.HabSnapshotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Seeds the database with the Sol 6 mission-abort state on first run, so the API
 * always has a current snapshot to serve. No-op if data already exists.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final HabSnapshotRepository repository;

    @Override
    public void run(String... args) {
        if (repository.count() > 0) {
            log.info("Hab snapshots already present ({}); skipping seed.", repository.count());
            return;
        }

        HabSnapshot sol6 = HabSnapshot.builder()
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
                .lastEvent(null)
                .build();

        repository.save(sol6);
        log.info("Seeded initial Hab snapshot at Sol {}.", SimulationConstants.INITIAL_SOL);
    }
}
