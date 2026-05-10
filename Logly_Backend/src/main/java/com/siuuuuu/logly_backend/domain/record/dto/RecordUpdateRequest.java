package com.siuuuuu.logly_backend.domain.record.dto;

import com.siuuuuu.logly_backend.domain.record.entity.Record;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class RecordUpdateRequest {

    private Long tripId;

    private Long placeId;

    private Long categoryId;

    private String content;

    private String diaryTitle;

    private String weather;

    private Float temperature;

    private Record.Visibility visibility;

    private LocalDate recordedAt;
}
