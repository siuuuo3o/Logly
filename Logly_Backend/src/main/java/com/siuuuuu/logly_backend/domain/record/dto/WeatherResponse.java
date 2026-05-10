package com.siuuuuu.logly_backend.domain.record.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WeatherResponse {

    private String weather;
    private Float temperature;
}
