package com.siuuuuu.logly_backend.global.util;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExpoPushService {

    private static final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

    private final RestTemplate restTemplate;

    @Async
    public void sendPush(List<String> tokens, String title, String body) {
        if (tokens == null || tokens.isEmpty()) return;

        List<Map<String, Object>> messages = tokens.stream()
                .map(token -> Map.<String, Object>of(
                        "to", token,
                        "title", title,
                        "body", body,
                        "sound", "default"
                ))
                .toList();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<List<Map<String, Object>>> request = new HttpEntity<>(messages, headers);

        try {
            restTemplate.postForEntity(EXPO_PUSH_URL, request, String.class);
            log.info("[ExpoPush] {}명에게 푸시 전송 완료", tokens.size());
        } catch (Exception e) {
            log.warn("[ExpoPush] 푸시 전송 실패: {}", e.getMessage());
        }
    }
}
