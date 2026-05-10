package com.siuuuuu.logly_backend.domain.auth.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StatsResponse {
    private long recordCount;
    private long tripCount;
    private long diaryCount;
}
