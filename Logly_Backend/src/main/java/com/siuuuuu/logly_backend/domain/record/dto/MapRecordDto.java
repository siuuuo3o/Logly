package com.siuuuuu.logly_backend.domain.record.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MapRecordDto {

    private Long id;
    private String type;
    private String placeName;
    private Double latitude;
    private Double longitude;
    private String representativeImageUrl;
    private String recordedAt;
    private Long tripId;
    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private String categoryIcon;
}
