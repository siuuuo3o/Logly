package com.siuuuuu.logly_backend.domain.notice.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class NoticeResponse {
    private Long id;
    private String title;
    private String content;
    private boolean important;
    private String createdAt;
}
