package com.siuuuuu.logly_backend.domain.record.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecordImageDto {

    private Long id;
    private String imageUrl;
    private boolean isRepresentative;
    private int orderIndex;
}
