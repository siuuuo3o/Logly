package com.siuuuuu.logly_backend.domain.ai.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AiAssistRequest {

    private Long recordId;       // 선택 — 로그 연결용
    private String placeName;    // 장소 이름 (초안 제안에 활용)
    private String recordedAt;   // 날짜 (초안 제안에 활용)
    private String weather;      // 날씨 (초안 제안에 활용)
    private Double temperature;
    private String type;         // DAILY / TRAVEL
    private String content;      // 이어쓰기·제목 추천에 활용 (기존 본문)
}
