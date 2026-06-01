package com.ares3.telemetry.config;

/**
 * Canonical simulation constants from <i>The Martian</i> (Andy Weir) and the
 * per-sol simulation rules in CLAUDE.md. Centralised here so no magic numbers
 * leak into service logic.
 */
public final class SimulationConstants {

    private SimulationConstants() {
    }

    // --- Sol 6 initial state (mission abort) ---
    public static final int INITIAL_SOL = 6;
    public static final double INITIAL_FOOD_SOLS = 400.0;
    public static final double INITIAL_WATER_LITRES = 300.0;
    public static final double INITIAL_O2_PCT = 21.0;
    public static final double INITIAL_CO2_PCT = 0.04;
    public static final double INITIAL_TEMP_KELVIN = 295.0;
    public static final double INITIAL_PRESSURE_KPA = 101.0;
    public static final double INITIAL_RTG_WATTS = 100.0;
    public static final double INITIAL_SOLAR_WATTS = 45.0;
    public static final double INITIAL_BATTERY_PCT = 72.0;
    public static final double INITIAL_FARM_AREA_M2 = 0.0;
    public static final int INITIAL_CROP_DAYS = 0;
    public static final double INITIAL_POTATO_KG = 0.0;
    public static final double INITIAL_EVA_HOURS = 1500.0;

    // --- Per-sol simulation rates ---
    /** Food ration consumed per sol (in food-sols). */
    public static final double FOOD_CONSUMED_PER_SOL = 1.0;
    /** Standard EVA day draws this many CO2-filter hours. */
    public static final double EVA_HOURS_PER_SOL = 4.0;
    /** Condensate recovered per sol when the water reclaimer is NOMINAL. */
    public static final double WATER_RECOVERY_PER_SOL = 0.5;
    /** Multiplicative solar-panel degradation per sol (dust accumulation). */
    public static final double SOLAR_DEGRADATION_FACTOR = 0.9995;

    // --- Crop farm ---
    /** Sols from planting to harvest. */
    public static final int CROP_HARVEST_SOL = 80;
    /** Potato yield estimate per m² of farm at harvest. */
    public static final double CROP_YIELD_KG_PER_M2 = 0.038;
    /** kg of potato per food-sol (1,500 kcal) — used to convert harvest into rations. */
    public static final double POTATO_KG_PER_FOOD_SOL = 0.4;

    // --- Atmosphere drift targets / rates ---
    public static final double O2_NOMINAL_TARGET = 21.0;
    public static final double CO2_NOMINAL_TARGET = 0.04;
    public static final double O2_DEGRADED_TARGET = 18.0;
    public static final double CO2_DEGRADED_TARGET = 2.0;
    /** Fraction of the gap toward target closed per sol while DEGRADED. */
    public static final double DEGRADED_DRIFT_RATE = 0.2;
    /** O2 percentage points lost per sol while the oxygenator is in FAILURE. */
    public static final double FAILURE_O2_DROP_PER_SOL = 3.0;
    /** CO2 percentage points gained per sol while the oxygenator is in FAILURE. */
    public static final double FAILURE_CO2_RISE_PER_SOL = 1.5;

    // --- Random events ---
    /** Probability that a random event occurs on any given simulated sol. */
    public static final double RANDOM_EVENT_CHANCE = 0.10;

    // --- Floors ---
    public static final double FOOD_FLOOR = 0.0;
    public static final double WATER_FLOOR = 0.0;
    public static final double EVA_FLOOR = 0.0;
    public static final double O2_FLOOR = 0.0;
    public static final double CO2_CEILING = 100.0;
}
