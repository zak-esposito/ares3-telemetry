package com.ares3.telemetry.model;

/**
 * Operational state of a life-support system in the Hab.
 *
 * <ul>
 *   <li>{@code NOMINAL}  — operating within spec.</li>
 *   <li>{@code DEGRADED} — impaired; output drifting away from targets.</li>
 *   <li>{@code FAILURE}  — offline; rapid, life-threatening deterioration.</li>
 * </ul>
 */
public enum SystemStatus {
    NOMINAL,
    DEGRADED,
    FAILURE
}
