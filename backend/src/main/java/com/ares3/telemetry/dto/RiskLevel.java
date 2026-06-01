package com.ares3.telemetry.dto;

/**
 * Severity of the habitat's current situation, derived deterministically from
 * telemetry thresholds (not from Claude's prose). Ordered least to most severe.
 */
public enum RiskLevel {
    LOW,
    MEDIUM,
    HIGH,
    CRITICAL
}
