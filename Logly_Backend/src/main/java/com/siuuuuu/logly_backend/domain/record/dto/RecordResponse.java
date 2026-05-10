package com.siuuuuu.logly_backend.domain.record.dto;

import com.siuuuuu.logly_backend.domain.category.dto.CategoryResponse;
import com.siuuuuu.logly_backend.domain.place.dto.PlaceResponse;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecordResponse {

    private Long id;
    private Long userId;
    private Long tripId;
    private String type;
    private String content;
    private String diaryTitle;
    private String weather;
    private Float temperature;
    private String visibility;
    private LocalDate recordedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private PlaceResponse place;
    private CategoryResponse category;
    private List<RecordImageDto> images;
}
