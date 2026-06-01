package com.ares3.telemetry.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A point-in-time reading of the ARES 3 Hab on a given sol.
 *
 * <p>One row per simulated sol — the table doubles as the telemetry history.
 * This is a JPA entity and must never be returned directly from a controller;
 * map it to {@code HabSnapshotDto} first.
 */
@Entity
@Table(name = "hab_snapshot")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Martian sol number (mission day). */
    @Column(nullable = false)
    private int sol;

    // --- Resources ---
    /** Sols of food remaining at the 1,500 kcal/sol survival ration. */
    private double foodSolsRemaining;
    /** Litres of water available in the Hab. */
    private double waterLitres;

    // --- Atmosphere ---
    private double o2Percentage;
    private double co2Percentage;
    private double internalTempKelvin;
    private double internalPressureKPa;

    // --- Power ---
    /** RTG output (W) — nuclear, constant. */
    private double rtgWatts;
    /** Rover solar array output (W) — degrades with dust. */
    private double solarWatts;
    private double batteryPercent;

    // --- Crop farm ---
    private double farmAreaM2;
    private int cropDaysSincePlanted;
    private double estimatedPotatoKg;

    // --- EVA ---
    /** CO2-filter hours remaining for surface excursions. */
    private double evaHoursRemaining;

    // --- System statuses ---
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SystemStatus oxygenatorStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SystemStatus waterReclaimerStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SystemStatus atmosphericRegulatorStatus;

    /** Name of the random event (if any) that occurred on this sol; null otherwise. */
    private String lastEvent;
}
