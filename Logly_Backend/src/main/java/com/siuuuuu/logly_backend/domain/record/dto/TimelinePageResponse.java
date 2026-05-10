package com.siuuuuu.logly_backend.domain.record.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class TimelinePageResponse {

    private List<RecordResponse> records;
    private int page;
    private int size;
    private long totalCount;
    private boolean hasNext;

    public static TimelinePageResponse of(List<RecordResponse> records, int page, int size, long totalCount) {
        return TimelinePageResponse.builder()
                .records(records)
                .page(page)
                .size(size)
                .totalCount(totalCount)
                .hasNext((long) (page + 1) * size < totalCount)
                .build();
    }
}
