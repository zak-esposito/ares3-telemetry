package com.ares3.telemetry.service;

import com.ares3.telemetry.dto.RoverPhotoDto;
import com.ares3.telemetry.exception.UpstreamServiceException;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

/**
 * Proxies NASA's Image and Video Library API (images-api.nasa.gov) for
 * Curiosity surface imagery. Shields the frontend from the upstream JSON shape
 * — callers only ever see {@link RoverPhotoDto}. No API key required.
 *
 * <p>Replaces the retired Mars Rover Photos API. Sol numbers no longer map to a
 * real upstream parameter, so they are folded into a keyword search instead and
 * echoed back on each DTO; Curiosity is the only rover, hence a fixed roverId.
 */
@Slf4j
@Service
public class NasaRoverService {

    private static final String BASE_URL = "https://images-api.nasa.gov/search";
    private static final String DEFAULT_QUERY = "curiosity mars rover";
    private static final long CURIOSITY_ROVER_ID = 1L;

    private final RestTemplate restTemplate;

    public NasaRoverService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /** Curiosity imagery matched to the given Martian sol via keyword search. */
    public List<RoverPhotoDto> getPhotosBySol(int sol) {
        log.info("Searching NASA image library for Curiosity sol {}.", sol);
        return search("curiosity mars sol " + sol, sol);
    }

    /** A default page of recent Curiosity surface imagery. */
    public List<RoverPhotoDto> getLatestPhotos() {
        log.info("Searching NASA image library for latest Curiosity imagery.");
        return search(DEFAULT_QUERY, 0);
    }

    // --- internals ---

    private List<RoverPhotoDto> search(String query, int sol) {
        String url = UriComponentsBuilder.fromHttpUrl(BASE_URL)
                .queryParam("q", query)
                .queryParam("media_type", "image")
                .toUriString();
        NasaSearchResponse response = get(url);
        return toDtos(response, sol);
    }

    private NasaSearchResponse get(String url) {
        try {
            return restTemplate.getForObject(url, NasaSearchResponse.class);
        } catch (RestClientException ex) {
            log.warn("NASA image library request failed: {}", ex.getMessage());
            throw new UpstreamServiceException("NASA rover photos unavailable", ex);
        }
    }

    private List<RoverPhotoDto> toDtos(NasaSearchResponse response, int sol) {
        if (response == null
                || response.collection() == null
                || response.collection().items() == null) {
            return List.of();
        }
        return response.collection().items().stream()
                .map(item -> toDto(item, sol))
                .filter(dto -> dto.imgSrc() != null)
                .toList();
    }

    private static RoverPhotoDto toDto(NasaItem item, int sol) {
        NasaItemData data = firstData(item);
        return new RoverPhotoDto(
                sol,
                earthDate(data),
                imgSrc(item),
                cameraName(data),
                CURIOSITY_ROVER_ID
        );
    }

    private static NasaItemData firstData(NasaItem item) {
        if (item.data() == null || item.data().isEmpty()) {
            return null;
        }
        return item.data().get(0);
    }

    /** First image link's href — the thumbnail or original asset. */
    private static String imgSrc(NasaItem item) {
        if (item.links() == null) {
            return null;
        }
        return item.links().stream()
                .filter(link -> link.href() != null)
                .map(NasaItemLink::href)
                .findFirst()
                .orElse(null);
    }

    /** date_created trimmed to its calendar date (drops the time component). */
    private static String earthDate(NasaItemData data) {
        if (data == null || data.dateCreated() == null) {
            return null;
        }
        String created = data.dateCreated();
        int t = created.indexOf('T');
        return t > 0 ? created.substring(0, t) : created;
    }

    /** Best-effort camera label from keywords, falling back to the title. */
    private static String cameraName(NasaItemData data) {
        if (data == null) {
            return null;
        }
        if (data.keywords() != null && !data.keywords().isEmpty()) {
            return data.keywords().get(0);
        }
        return data.title();
    }

    // --- internal NASA wire DTOs (never exposed to clients) ---

    @JsonIgnoreProperties(ignoreUnknown = true)
    record NasaSearchResponse(@JsonProperty("collection") NasaCollection collection) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record NasaCollection(@JsonProperty("items") List<NasaItem> items) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record NasaItem(
            @JsonProperty("data") List<NasaItemData> data,
            @JsonProperty("links") List<NasaItemLink> links
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record NasaItemData(
            String title,
            @JsonProperty("date_created") String dateCreated,
            List<String> keywords,
            String description
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record NasaItemLink(String href, String rel, String render) {
    }
}
