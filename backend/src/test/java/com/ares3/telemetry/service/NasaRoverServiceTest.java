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

    private static final String TEST_KEY = "test-key-123";

    @Mock
    private RestTemplate restTemplate;

    private NasaRoverService service;

    @BeforeEach
    void setUp() {
        // @Value isn't applied by Mockito, so wire the key in by hand.
        service = new NasaRoverService(restTemplate, TEST_KEY);
    }

    @Test
    void getPhotosBySol_buildsCorrectUrl() {
        when(restTemplate.getForObject(anyString(), eq(NasaRoverService.NasaPhotosResponse.class)))
                .thenReturn(new NasaRoverService.NasaPhotosResponse(List.of()));

        service.getPhotosBySol(1000);

        ArgumentCaptor<String> url = ArgumentCaptor.forClass(String.class);
        org.mockito.Mockito.verify(restTemplate)
                .getForObject(url.capture(), eq(NasaRoverService.NasaPhotosResponse.class));
        assertThat(url.getValue())
                .contains("/rovers/curiosity/photos")
                .contains("sol=1000")
                .contains("api_key=" + TEST_KEY);
    }

    @Test
    void getLatestPhotos_buildsCorrectUrl() {
        when(restTemplate.getForObject(anyString(), eq(NasaRoverService.NasaLatestResponse.class)))
                .thenReturn(new NasaRoverService.NasaLatestResponse(List.of()));

        service.getLatestPhotos();

        ArgumentCaptor<String> url = ArgumentCaptor.forClass(String.class);
        org.mockito.Mockito.verify(restTemplate)
                .getForObject(url.capture(), eq(NasaRoverService.NasaLatestResponse.class));
        assertThat(url.getValue())
                .contains("/rovers/curiosity/latest_photos")
                .contains("api_key=" + TEST_KEY);
    }

    @Test
    void getPhotosBySol_mapsNestedJsonToFlatDto() {
        NasaRoverService.NasaPhoto photo = new NasaRoverService.NasaPhoto(
                42L,
                1000,
                "https://mars.nasa.gov/img.jpg",
                "2024-01-15",
                new NasaRoverService.NasaCamera("MAST"),
                new NasaRoverService.NasaRover(5L));
        when(restTemplate.getForObject(anyString(), eq(NasaRoverService.NasaPhotosResponse.class)))
                .thenReturn(new NasaRoverService.NasaPhotosResponse(List.of(photo)));

        List<RoverPhotoDto> result = service.getPhotosBySol(1000);

        assertThat(result).hasSize(1);
        RoverPhotoDto dto = result.get(0);
        assertThat(dto.sol()).isEqualTo(1000);
        assertThat(dto.earthDate()).isEqualTo("2024-01-15");
        assertThat(dto.imgSrc()).isEqualTo("https://mars.nasa.gov/img.jpg");
        assertThat(dto.cameraName()).isEqualTo("MAST");
        assertThat(dto.roverId()).isEqualTo(5L);
    }

    @Test
    void getPhotosBySol_nullPhotosYieldsEmptyList() {
        when(restTemplate.getForObject(anyString(), eq(NasaRoverService.NasaPhotosResponse.class)))
                .thenReturn(new NasaRoverService.NasaPhotosResponse(null));

        assertThat(service.getPhotosBySol(1000)).isEmpty();
    }

    @Test
    void getLatestPhotos_upstreamFailureWrappedAsUpstreamServiceException() {
        when(restTemplate.getForObject(anyString(), eq(NasaRoverService.NasaLatestResponse.class)))
                .thenThrow(new RestClientException("connection refused"));

        assertThatThrownBy(() -> service.getLatestPhotos())
                .isInstanceOf(UpstreamServiceException.class)
                .hasMessageContaining("NASA rover photos unavailable");
    }
}
