package com.ares3.telemetry.dto;

import com.ares3.telemetry.model.HabSnapshot;
import com.ares3.telemetry.model.SystemStatus;

/**
 * API-facing view of a {@link HabSnapshot}. Decouples the wire format from the
 * JPA entity so the persistence model can evolve without breaking clients.
 */
public record HabSnapshotDto(
        int sol,
        double foodSolsRemaining,
        double waterLitres,
        double o2Percentage,
        double co2Percentage,
        double internalTempKelvin,
        double internalPressureKPa,
        double rtgWatts,
        double solarWatts,
        double batteryPercent,
        double farmAreaM2,
        int cropDaysSincePlanted,
        double estimatedPotatoKg,
        double evaHoursRemaining,
        SystemStatus oxygenatorStatus,
        SystemStatus waterReclaimerStatus,
        SystemStatus atmosphericRegulatorStatus,
        String lastEvent
) {

    /** Maps a persistence entity to its API representation. */
    public static HabSnapshotDto from(HabSnapshot s) {
        return new HabSnapshotDto(
                s.getSol(),
                s.getFoodSolsRemaining(),
                s.getWaterLitres(),
                s.getO2Percentage(),
                s.getCo2Percentage(),
                s.getInternalTempKelvin(),
                s.getInternalPressureKPa(),
                s.getRtgWatts(),
                s.getSolarWatts(),
                s.getBatteryPercent(),
                s.getFarmAreaM2(),
                s.getCropDaysSincePlanted(),
                s.getEstimatedPotatoKg(),
                s.getEvaHoursRemaining(),
                s.getOxygenatorStatus(),
                s.getWaterReclaimerStatus(),
                s.getAtmosphericRegulatorStatus(),
                s.getLastEvent()
        );
    }
}
