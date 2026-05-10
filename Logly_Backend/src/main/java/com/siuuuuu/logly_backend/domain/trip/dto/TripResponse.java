package com.siuuuuu.logly_backend.domain.trip.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripResponse {

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
}
