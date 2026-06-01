package com.ares3.telemetry.service;

import com.ares3.telemetry.dto.RoverPhotoDto;
import com.ares3.telemetry.exception.UpstreamServiceException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NasaRoverServiceTest {

    @Mock
    private RestTemplate restTemplate;

    private NasaRoverService service;

    @BeforeEach
    void setUp() {
        // Real ObjectMapper so the tests exercise the actual record mapping.
        service = new NasaRoverService(restTemplate, new ObjectMapper());
    }

    @Test
    void getPhotosBySol_buildsSolKeywordSearchUri() {
        when(restTemplate.getForObject(any(URI.class), eq(String.class)))
                .thenReturn(emptyResponseJson());

        service.getPhotosBySol(1000);

        URI uri = captureRequestUri();
        // Spaces must be encoded exactly once — %20, never the double-encoded %2520.
        assertThat(uri.toString())
                .contains("images-api.nasa.gov/search")
                .contains("media_type=image")
                .contains("curiosity")
                .contains("sol")
                .contains("1000")
                .contains("%20")
                .doesNotContain("%2520")
                .doesNotContain("api_key");
    }

    @Test
    void getLatestPhotos_buildsDefaultCuriositySearchUri() {
        when(restTemplate.getForObject(any(URI.class), eq(String.class)))
                .thenReturn(emptyResponseJson());

        service.getLatestPhotos();

        URI uri = captureRequestUri();
        assertThat(uri.toString())
                .contains("images-api.nasa.gov/search")
                .contains("media_type=image")
                .contains("curiosity")
                .doesNotContain("%2520")
                .doesNotContain("api_key");
    }

    @Test
    void getPhotosBySol_mapsCollectionItemToFlatDto() {
        String json = """
                {"collection":{"items":[
                  {"data":[{"title":"Curiosity at Gale Crater",
                            "date_created":"2024-01-15T00:00:00Z",
                            "keywords":["MAST","Mars","Curiosity"],
                            "description":"A Curiosity self-portrait."}],
                   "links":[{"href":"https://images-assets.nasa.gov/image/PIA12345/PIA12345~thumb.jpg",
                             "rel":"preview","render":"image"}]}
                ]}}""";
        when(restTemplate.getForObject(any(URI.class), eq(String.class))).thenReturn(json);

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
        String json = """
                {"collection":{"items":[
                  {"data":[{"title":"Curiosity Panorama",
                            "date_created":"2023-05-01T12:00:00Z",
                            "keywords":[],
                            "description":"A wide view."}],
                   "links":[{"href":"https://images-assets.nasa.gov/image/abc/abc~thumb.jpg",
                             "rel":"preview","render":"image"}]}
                ]}}""";
        when(restTemplate.getForObject(any(URI.class), eq(String.class))).thenReturn(json);

        List<RoverPhotoDto> result = service.getLatestPhotos();

        assertThat(result).hasSize(1);
        RoverPhotoDto dto = result.get(0);
        assertThat(dto.sol()).isZero();
        assertThat(dto.cameraName()).isEqualTo("Curiosity Panorama");
    }

    @Test
    void getPhotosBySol_skipsItemsWithNoImageLink() {
        String json = """
                {"collection":{"items":[
                  {"data":[{"title":"Has image","date_created":"2024-01-15T00:00:00Z","keywords":["MAST"]}],
                   "links":[{"href":"https://images-assets.nasa.gov/image/a/a.jpg","rel":"preview","render":"image"}]},
                  {"data":[{"title":"No image","date_created":"2024-01-15T00:00:00Z","keywords":["MAST"]}],
                   "links":[]}
                ]}}""";
        when(restTemplate.getForObject(any(URI.class), eq(String.class))).thenReturn(json);

        assertThat(service.getPhotosBySol(1000)).hasSize(1);
    }

    @Test
    void getPhotosBySol_emptyCollectionYieldsEmptyList() {
        when(restTemplate.getForObject(any(URI.class), eq(String.class)))
                .thenReturn("{\"collection\":{}}");

        assertThat(service.getPhotosBySol(1000)).isEmpty();
    }

    @Test
    void getLatestPhotos_blankBodyYieldsEmptyList() {
        when(restTemplate.getForObject(any(URI.class), eq(String.class))).thenReturn("");

        assertThat(service.getLatestPhotos()).isEmpty();
    }

    @Test
    void getLatestPhotos_upstreamFailureWrappedAsUpstreamServiceException() {
        when(restTemplate.getForObject(any(URI.class), eq(String.class)))
                .thenThrow(new RestClientException("connection refused"));

        assertThatThrownBy(() -> service.getLatestPhotos())
                .isInstanceOf(UpstreamServiceException.class)
                .hasMessageContaining("NASA rover photos unavailable");
    }

    @Test
    void getLatestPhotos_unparseableBodyWrappedAsUpstreamServiceException() {
        when(restTemplate.getForObject(any(URI.class), eq(String.class)))
                .thenReturn("not json at all <<<");

        assertThatThrownBy(() -> service.getLatestPhotos())
                .isInstanceOf(UpstreamServiceException.class)
                .hasMessageContaining("NASA rover photos unavailable");
    }

    // --- helpers ---

    private URI captureRequestUri() {
        ArgumentCaptor<URI> uri = ArgumentCaptor.forClass(URI.class);
        org.mockito.Mockito.verify(restTemplate).getForObject(uri.capture(), eq(String.class));
        return uri.getValue();
    }

    private static String emptyResponseJson() {
        return "{\"collection\":{\"items\":[]}}";
    }
}
