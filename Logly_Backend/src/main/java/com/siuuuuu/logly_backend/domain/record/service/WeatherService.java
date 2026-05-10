package com.siuuuuu.logly_backend.domain.record.service;

import com.siuuuuu.logly_backend.domain.record.dto.WeatherResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class WeatherService {

    private final RestTemplate restTemplate;

    @Value("${openweather.api-key:}")
    private String apiKey;

    private static final String BASE_URL =
            "https://api.openweathermap.org/data/2.5/weather?lat=%s&lon=%s&appid=%s&units=metric&lang=kr";

    @SuppressWarnings("unchecked")
    public WeatherResponse getWeather(double lat, double lon) {
        try {
            String url = String.format(BASE_URL, lat, lon, apiKey);

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null) {
                return WeatherResponse.builder().weather("알 수 없음").temperature(null).build();
            }

            // weather[0].description
            java.util.List<Map<String, Object>> weatherList =
                    (java.util.List<Map<String, Object>>) response.get("weather");
            String weatherDesc = weatherList != null && !weatherList.isEmpty()
                    ? (String) weatherList.get(0).get("description")
                    : "알 수 없음";

            // main.temp
            Map<String, Object> main = (Map<String, Object>) response.get("main");
            Float temperature = null;
            if (main != null && main.get("temp") != null) {
                temperature = ((Number) main.get("temp")).floatValue();
            }

            return WeatherResponse.builder()
                    .weather(weatherDesc)
                    .temperature(temperature)
                    .build();

        } catch (Exception e) {
            log.warn("날씨 조회 실패: lat={}, lon={}, error={}", lat, lon, e.getMessage());
            return WeatherResponse.builder().weather("알 수 없음").temperature(null).build();
        }
    }
}
