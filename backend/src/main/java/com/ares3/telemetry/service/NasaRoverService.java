package com.ares3.telemetry.service;

import com.ares3.telemetry.dto.RoverPhotoDto;
import com.ares3.telemetry.exception.UpstreamServiceException;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

/**
 * Proxies NASA's Mars Rover Photos API for the Curiosity rover. Shields the
 * frontend from the upstream API key and JSON shape — callers only ever see
 * {@link RoverPhotoDto}. Holds no HTTP-controller concerns.
 */
@Slf4j
@Service
public class NasaRoverService {

    private static final String BASE_URL =
            "https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity";

    private final RestTemplate restTemplate;
    private final String apiKey;

    public NasaRoverService(RestTemplate restTemplate,
                            @Value("${nasa.api.key}") String apiKey) {
        this.restTemplate = restTemplate;
        this.apiKey = apiKey;
    }

    /** Curiosity photos taken on the given Martian sol. */
    public List<RoverPhotoDto> getPhotosBySol(int sol) {
        String url = UriComponentsBuilder.fromHttpUrl(BASE_URL + "/photos")
                .queryParam("sol", sol)
                .queryParam("api_key", apiKey)
                .toUriString();
        log.info("Fetching NASA rover photos for sol {}.", sol);
        NasaPhotosResponse response = get(url, NasaPhotosResponse.class);
        return toDtos(response == null ? null : response.photos());
    }

    /** The most recent Curiosity photos available. */
    public List<RoverPhotoDto> getLatestPhotos() {
        String url = UriComponentsBuilder.fromHttpUrl(BASE_URL + "/latest_photos")
                .queryParam("api_key", apiKey)
                .toUriString();
        log.info("Fetching latest NASA rover photos.");
        NasaLatestResponse response = get(url, NasaLatestResponse.class);
        return toDtos(response == null ? null : response.latestPhotos());
    }

    // --- internals ---

    private <T> T get(String url, Class<T> type) {
        try {
            return restTemplate.getForObject(url, type);
        } catch (RestClientException ex) {
            log.warn("NASA rover photos request failed: {}", ex.getMessage());
            throw new UpstreamServiceException("NASA rover photos unavailable", ex);
        }
    }

    private List<RoverPhotoDto> toDtos(List<NasaPhoto> photos) {
        if (photos == null || photos.isEmpty()) {
            return List.of();
        }
        return photos.stream().map(NasaRoverService::toDto).toList();
    }

    private static RoverPhotoDto toDto(NasaPhoto p) {
        return new RoverPhotoDto(
                p.sol(),
                p.earthDate(),
                p.imgSrc(),
                p.camera() == null ? null : p.camera().name(),
                p.rover() == null ? 0L : p.rover().id()
        );
    }

    // --- internal NASA wire DTOs (never exposed to clients) ---

    @JsonIgnoreProperties(ignoreUnknown = true)
    record NasaPhotosResponse(@JsonProperty("photos") List<NasaPhoto> photos) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record NasaLatestResponse(@JsonProperty("latest_photos") List<NasaPhoto> latestPhotos) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record NasaPhoto(
            long id,
            int sol,
            @JsonProperty("img_src") String imgSrc,
            @JsonProperty("earth_date") String earthDate,
            NasaCamera camera,
            NasaRover rover
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record NasaCamera(String name) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record NasaRover(long id) {
    }
}
