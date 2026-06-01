package com.ares3.telemetry.service;

import com.ares3.telemetry.dto.RoverPhotoDto;
import com.ares3.telemetry.exception.UpstreamServiceException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NasaRoverServiceTest {

    @Mock
    private RestTemplate restTemplate;

    private NasaRoverService service;

    @BeforeEach
    void setUp() {
        service = new NasaRoverService(restTemplate);
    }

    @Test
    void getPhotosBySol_buildsSolKeywordSearchUrl() {
        when(restTemplate.getForObject(anyString(), eq(NasaRoverService.NasaSearchResponse.class)))
                .thenReturn(emptyResponse());

        service.getPhotosBySol(1000);

        ArgumentCaptor<String> url = ArgumentCaptor.forClass(String.class);
        org.mockito.Mockito.verify(restTemplate)
                .getForObject(url.capture(), eq(NasaRoverService.NasaSearchResponse.class));
        assertThat(url.getValue())
                .contains("images-api.nasa.gov/search")
                .contains("media_type=image")
                .contains("curiosity")
                .contains("sol")
                .contains("1000")
                .doesNotContain("api_key");
    }

    @Test
    void getLatestPhotos_buildsDefaultCuriositySearchUrl() {
        when(restTemplate.getForObject(anyString(), eq(NasaRoverService.NasaSearchResponse.class)))
                .thenReturn(emptyResponse());

        service.getLatestPhotos();

        ArgumentCaptor<String> url = ArgumentCaptor.forClass(String.class);
        org.mockito.Mockito.verify(restTemplate)
                .getForObject(url.capture(), eq(NasaRoverService.NasaSearchResponse.class));
        assertThat(url.getValue())
                .contains("images-api.nasa.gov/search")
                .contains("media_type=image")
                .contains("curiosity")
                .doesNotContain("api_key");
    }

    @Test
    void getPhotosBySol_mapsCollectionItemToFlatDto() {
        NasaRoverService.NasaItem item = new NasaRoverService.NasaItem(
                List.of(new NasaRoverService.NasaItemData(
                        "Curiosity at Gale Crater",
                        "2024-01-15T00:00:00Z",
                        List.of("MAST", "Mars", "Curiosity"),
                        "A Curiosity self-portrait.")),
                List.of(new NasaRoverService.NasaItemLink(
                        "https://images-assets.nasa.gov/image/PIA12345/PIA12345~thumb.jpg",
                        "preview",
                        "image")));
        when(restTemplate.getForObject(anyString(), eq(NasaRoverService.NasaSearchResponse.class)))
                .thenReturn(responseOf(item));

        List<RoverPhotoDto> result = service.getPhotosBySol(1000);

        assertThat(result).hasSize(1);
        RoverPhotoDto dto = result.get(0);
        assertThat(dto.sol()).isEqualTo(1000);
        assertThat(dto.earthDate()).isEqualTo("2024-01-15");
        assertThat(dto.imgSrc())
                .isEqualTo("https://images-assets.nasa.gov/image/PIA12345/PIA12345~thumb.jpg");
        assertThat(dto.cameraName()).isEqualTo("MAST");
        assertThat(dto.roverId()).isEqualTo(1L);
    }

    @Test
    void getLatestPhotos_usesSolZeroAndFallsBackToTitleForCamera() {
        NasaRoverService.NasaItem item = new NasaRoverService.NasaItem(
                List.of(new NasaRoverService.NasaItemData(
                        "Curiosity Panorama",
                        "2023-05-01T12:00:00Z",
                        List.of(),
                        "A wide view.")),
                List.of(new NasaRoverService.NasaItemLink(
                        "https://images-assets.nasa.gov/image/abc/abc~thumb.jpg",
                        "preview",
                        "image")));
        when(restTemplate.getForObject(anyString(), eq(NasaRoverService.NasaSearchResponse.class)))
                .thenReturn(responseOf(item));

        List<RoverPhotoDto> result = service.getLatestPhotos();

        assertThat(result).hasSize(1);
        RoverPhotoDto dto = result.get(0);
        assertThat(dto.sol()).isZero();
        assertThat(dto.cameraName()).isEqualTo("Curiosity Panorama");
    }

    @Test
    void getPhotosBySol_skipsItemsWithNoImageLink() {
        NasaRoverService.NasaItem withImage = new NasaRoverService.NasaItem(
                List.of(new NasaRoverService.NasaItemData(
                        "Has image", "2024-01-15T00:00:00Z", List.of("MAST"), null)),
                List.of(new NasaRoverService.NasaItemLink(
                        "https://images-assets.nasa.gov/image/a/a.jpg", "preview", "image")));
        NasaRoverService.NasaItem withoutImage = new NasaRoverService.NasaItem(
                List.of(new NasaRoverService.NasaItemData(
                        "No image", "2024-01-15T00:00:00Z", List.of("MAST"), null)),
                List.of());
        when(restTemplate.getForObject(anyString(), eq(NasaRoverService.NasaSearchResponse.class)))
                .thenReturn(responseOf(withImage, withoutImage));

        assertThat(service.getPhotosBySol(1000)).hasSize(1);
    }

    @Test
    void getPhotosBySol_nullCollectionYieldsEmptyList() {
        when(restTemplate.getForObject(anyString(), eq(NasaRoverService.NasaSearchResponse.class)))
                .thenReturn(new NasaRoverService.NasaSearchResponse(null));

        assertThat(service.getPhotosBySol(1000)).isEmpty();
    }

    @Test
    void getLatestPhotos_upstreamFailureWrappedAsUpstreamServiceException() {
        when(restTemplate.getForObject(anyString(), eq(NasaRoverService.NasaSearchResponse.class)))
                .thenThrow(new RestClientException("connection refused"));

        assertThatThrownBy(() -> service.getLatestPhotos())
                .isInstanceOf(UpstreamServiceException.class)
                .hasMessageContaining("NASA rover photos unavailable");
    }

    // --- helpers ---

    private static NasaRoverService.NasaSearchResponse emptyResponse() {
        return new NasaRoverService.NasaSearchResponse(
                new NasaRoverService.NasaCollection(List.of()));
    }

    private static NasaRoverService.NasaSearchResponse responseOf(NasaRoverService.NasaItem... items) {
        return new NasaRoverService.NasaSearchResponse(
                new NasaRoverService.NasaCollection(List.of(items)));
    }
}
