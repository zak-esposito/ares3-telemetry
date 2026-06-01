package com.ares3.telemetry;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * ARES 3 Telemetry Dashboard — backend entry point.
 * Mission control for Mark Watney's survival on Mars.
 */
@SpringBootApplication
public class Ares3TelemetryApplication {

    public static void main(String[] args) {
        SpringApplication.run(Ares3TelemetryApplication.class, args);
    }
}
