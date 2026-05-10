package com.siuuuuu.logly_backend.domain.record.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClusterDto {

    private Double latitude;
    private Double longitude;
    private int count;
    private String type;
    private List<Long> recordIds;
    private String placeName;
    private String categoryColor;
    private String categoryName;
    private String categoryIcon;
}
