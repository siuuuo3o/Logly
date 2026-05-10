package com.siuuuuu.logly_backend.domain.notice.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class NoticeCreateRequest {
    private String title;
    private String content;
    private boolean important;
}
