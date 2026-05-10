package com.siuuuuu.logly_backend.domain.trip.dto;

import com.siuuuuu.logly_backend.domain.record.dto.RecordResponse;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripDetailResponse {

    private Long id;
    private Long userId;
    private String title;
    private String coverImageUrl;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean isActive;
    private long recordCount;
    private long diaryCount;
    private LocalDateTime createdAt;
    private List<RecordResponse> records;

    public static TripDetailResponse from(TripResponse trip, List<RecordResponse> records) {
        return TripDetailResponse.builder()
                .id(trip.getId())
                .userId(trip.getUserId())
                .title(trip.getTitle())
                .coverImageUrl(trip.getCoverImageUrl())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .isActive(trip.isActive())
                .recordCount(trip.getRecordCount())
                .diaryCount(trip.getDiaryCount())
                .createdAt(trip.getCreatedAt())
                .records(records)
                .build();
    }
}
