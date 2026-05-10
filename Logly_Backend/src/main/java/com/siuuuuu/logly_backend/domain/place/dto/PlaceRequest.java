package com.siuuuuu.logly_backend.domain.place.dto;

import com.siuuuuu.logly_backend.domain.place.entity.Place;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PlaceRequest {

    @NotBlank(message = "장소 이름은 필수입니다.")
    private String name;

    private String address;

    @NotNull(message = "위도는 필수입니다.")
    private Float latitude;

    @NotNull(message = "경도는 필수입니다.")
    private Float longitude;

    public Place toEntity() {
        return Place.builder()
                .name(name)
                .address(address)
                .latitude(latitude)
                .longitude(longitude)
                .build();
    }
}
