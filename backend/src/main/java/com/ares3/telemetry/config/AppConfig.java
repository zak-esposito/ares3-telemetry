package com.ares3.telemetry.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

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

    /**
     * Shared HTTP client for outbound calls to external APIs (NASA, Anthropic).
     * Exposed as a bean so services receive it by constructor injection and can
     * mock it in unit tests.
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    /**
     * Allows the React dev server (Vite on 5173, CRA on 3000) and the deployed
     * Vercel frontend to call the API across origins.
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins(
                                "http://localhost:3000",
                                "http://localhost:5173",
                                "https://ares3-telemetry.vercel.app")
                        .allowedMethods("GET", "POST");
            }
        };
    }
}
