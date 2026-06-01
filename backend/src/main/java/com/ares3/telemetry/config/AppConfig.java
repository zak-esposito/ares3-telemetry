package com.ares3.telemetry.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Random;

/**
 * Shared application beans.
 */
@Configuration
public class AppConfig {

    /**
     * Source of randomness for the simulation's random-event rolls. Exposed as a
     * bean so it can be constructor-injected into the service and mocked in tests
     * for deterministic behaviour.
     */
    @Bean
    public Random random() {
        return new Random();
    }
}
