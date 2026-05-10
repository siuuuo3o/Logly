package com.siuuuuu.logly_backend.domain.record.dto;

import com.siuuuuu.logly_backend.domain.record.entity.Record;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class RecordCreateRequest {

    private Long tripId;

    private Long placeId;

    private Long categoryId;

    @NotNull(message = "기록 타입은 필수입니다.")
    private Record.RecordType type;

    private String content;

    private String diaryTitle;

    private String weather;

    private Float temperature;

    @NotNull(message = "공개 여부는 필수입니다.")
    private Record.Visibility visibility;

    @NotNull(message = "기록 날짜는 필수입니다.")
    private LocalDate recordedAt;
}
