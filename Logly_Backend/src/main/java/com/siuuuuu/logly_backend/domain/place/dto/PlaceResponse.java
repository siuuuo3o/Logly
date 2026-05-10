package com.siuuuuu.logly_backend.domain.place.dto;

import com.siuuuuu.logly_backend.domain.place.entity.Place;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaceResponse {

    private Long id;
    private String name;
    private String address;
    private Float latitude;
    private Float longitude;
    private LocalDateTime createdAt;

    public static PlaceResponse from(Place place) {
        return PlaceResponse.builder()
                .id(place.getId())
                .name(place.getName())
                .address(place.getAddress())
                .latitude(place.getLatitude())
                .longitude(place.getLongitude())
                .createdAt(place.getCreatedAt())
                .build();
    }
}
