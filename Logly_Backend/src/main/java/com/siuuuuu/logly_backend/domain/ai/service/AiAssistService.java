package com.siuuuuu.logly_backend.domain.ai.service;

import com.siuuuuu.logly_backend.domain.ai.dto.AiAssistRequest;
import com.siuuuuu.logly_backend.domain.ai.dto.AiAssistResponse;
import com.siuuuuu.logly_backend.domain.ai.entity.AiAssistLog;
import com.siuuuuu.logly_backend.domain.ai.repository.AiAssistLogRepository;
import com.siuuuuu.logly_backend.global.exception.CustomException;
import com.siuuuuu.logly_backend.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiAssistService {

    private final AiAssistLogRepository aiAssistLogRepository;
    private final RestTemplate restTemplate;

    @Value("${gemini.api-key:}")
    private String geminiApiKey;

    private static final String GEMINI_MODEL = "gemini-2.5-flash";
    private static final String GEMINI_BASE_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/";

    public AiAssistResponse draft(AiAssistRequest req, Long userId) {
        String prompt = buildDraftPrompt(req);
        String result = callGemini(prompt);
        saveLog(userId, req.getRecordId(), AiAssistLog.AssistType.DRAFT, req.getPlaceName());
        return new AiAssistResponse(result);
    }

    public AiAssistResponse continueWriting(AiAssistRequest req, Long userId) {
        String prompt = buildContinuePrompt(req);
        String result = callGemini(prompt);
        saveLog(userId, req.getRecordId(), AiAssistLog.AssistType.CONTINUE, req.getPlaceName());
        return new AiAssistResponse(result);
    }

    public AiAssistResponse title(AiAssistRequest req, Long userId) {
        String prompt = buildTitlePrompt(req);
        String result = callGemini(prompt);
        saveLog(userId, req.getRecordId(), AiAssistLog.AssistType.TITLE, req.getPlaceName());
        return new AiAssistResponse(result);
    }

    // ── 프롬프트 빌더 ──────────────────────────────────────────

    private String buildDraftPrompt(AiAssistRequest req) {
        StringBuilder sb = new StringBuilder();

        sb.append("당신은 트렌디한 감성을 가진 전문 카피라이터이자 일기 작가입니다.\n");
        sb.append("아래 정보를 바탕으로, 인스타그램 캡션처럼 담백하면서도 여운이 남는 일기 초안을 작성해주세요.\n\n");

        sb.append("[작성 가이드라인]\n");
        sb.append("- 3~5문장으로 작성할 것.\n");
        sb.append("- '~했다', '~이었다' 같은 딱딱한 종결어미 대신 부드러운 구어체를 사용할 것.\n");
        sb.append("- 오감(시각, 청각, 촉각, 후각, 미각) 중 하나 이상을 자연스럽게 녹일 것.\n");
        sb.append("- 상투적인 감정 표현('너무 좋았다', '행복했다') 대신 구체적인 장면을 묘사할 것.\n");
        if (req.getType() != null && "TRAVEL".equals(req.getType())) {
            sb.append("- 여행 기록이므로 그 장소에서만 느낄 수 있는 고유한 분위기를 담을 것.\n");
        }
        sb.append("\n");

        if (req.getPlaceName() != null) sb.append("장소: ").append(req.getPlaceName()).append("\n");
        if (req.getRecordedAt() != null) sb.append("날짜: ").append(req.getRecordedAt()).append("\n");
        if (req.getWeather() != null) {
            sb.append("날씨: ").append(req.getWeather());
            if (req.getTemperature() != null) sb.append(" ").append(req.getTemperature()).append("°C");
            sb.append("\n");
        }

        sb.append("\n설명이나 인사말 없이 일기 본문만 바로 작성하세요.");
        return sb.toString();
    }

    private String buildContinuePrompt(AiAssistRequest req) {
        String existing = req.getContent() != null ? req.getContent().trim() : "";
        StringBuilder sb = new StringBuilder();

        sb.append("당신은 트렌디한 감성을 가진 전문 카피라이터이자 일기 작가입니다.\n");
        sb.append("아래 일기의 이어쓰기를 작성해주세요.\n\n");

        sb.append("[작성 가이드라인]\n");
        sb.append("- 2~4문장으로 작성할 것.\n");
        sb.append("- 앞 내용의 문체와 톤을 자연스럽게 이어갈 것.\n");
        sb.append("- 앞 내용을 반복하거나 요약하지 말 것.\n");
        sb.append("- 새로운 감각이나 생각을 한 겹 더 얹어주는 느낌으로 작성할 것.\n\n");

        sb.append("지금까지 쓴 내용:\n").append(existing).append("\n\n");
        sb.append("설명 없이 이어쓰기 본문만 바로 작성하세요.");
        return sb.toString();
    }

    private String buildTitlePrompt(AiAssistRequest req) {
        String content = req.getContent() != null ? req.getContent().trim() : "";
        StringBuilder sb = new StringBuilder();

        sb.append("당신은 트렌디한 감성을 가진 전문 카피라이터이자 일기 작가입니다.\n");
        sb.append("사용자의 일기를 읽고, SNS(인스타그램, 스레드)에 올릴 법한 세련되고 담백한 제목 3개를 추천해주세요.\n\n");

        sb.append("[작성 가이드라인]\n");
        sb.append("- 너무 상투적이거나 오글거리는 표현(예: '행복한 하루', '슬픔의 바다')은 피할 것.\n");
        sb.append("- 일상적인 단어를 조합해 신선한 느낌을 줄 것.\n");
        sb.append("- 은유적인 표현이나 일기의 핵심 장면을 포착할 것.\n");
        sb.append("- 각 제목은 공백 포함 15자 이내로 작성할 것.\n\n");

        if (!content.isEmpty()) sb.append("일기 내용:\n").append(content).append("\n\n");
        if (req.getPlaceName() != null) sb.append("장소: ").append(req.getPlaceName()).append("\n");

        sb.append("\n설명 없이 제목만 줄바꿈으로 구분하여 3개 출력하세요.");
        return sb.toString();
    }

    // ── Gemini 호출 ──────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private String callGemini(String prompt) {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", prompt)))
                )
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            String url = GEMINI_BASE_URL + GEMINI_MODEL + ":generateContent?key=" + geminiApiKey;
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    request,
                    new org.springframework.core.ParameterizedTypeReference<>() {}
            );

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            return (String) parts.get(0).get("text");

        } catch (Exception e) {
            log.error("Gemini API 호출 실패: {}", e.getMessage(), e);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    private void saveLog(Long userId, Long recordId, AiAssistLog.AssistType type, String summary) {
        aiAssistLogRepository.save(AiAssistLog.builder()
                .userId(userId)
                .recordId(recordId)
                .assistType(type)
                .promptSummary(summary)
                .build());
    }
}
