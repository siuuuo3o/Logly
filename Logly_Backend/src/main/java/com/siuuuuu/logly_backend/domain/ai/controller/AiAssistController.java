package com.siuuuuu.logly_backend.domain.ai.controller;

import com.siuuuuu.logly_backend.domain.ai.dto.AiAssistRequest;
import com.siuuuuu.logly_backend.domain.ai.dto.AiAssistResponse;
import com.siuuuuu.logly_backend.domain.ai.service.AiAssistService;
import com.siuuuuu.logly_backend.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "AI 글쓰기 보조", description = "AI 일기 초안·이어쓰기·제목 추천 (독립 모듈)")
@RestController
@RequestMapping("api/v1/ai")
@RequiredArgsConstructor
public class AiAssistController {

    private final AiAssistService aiAssistService;

    @Operation(summary = "AI 초안 제안")
    @PostMapping("/assist/draft")
    public ResponseEntity<ApiResponse<AiAssistResponse>> draft(
            @AuthenticationPrincipal Long userId,
            @RequestBody AiAssistRequest request) {
        return ResponseEntity.ok(ApiResponse.success(aiAssistService.draft(request, userId)));
    }

    @Operation(summary = "AI 이어 쓰기")
    @PostMapping("/assist/continue")
    public ResponseEntity<ApiResponse<AiAssistResponse>> continueWriting(
            @AuthenticationPrincipal Long userId,
            @RequestBody AiAssistRequest request) {
        return ResponseEntity.ok(ApiResponse.success(aiAssistService.continueWriting(request, userId)));
    }

    @Operation(summary = "AI 제목 추천")
    @PostMapping("/assist/title")
    public ResponseEntity<ApiResponse<AiAssistResponse>> title(
            @AuthenticationPrincipal Long userId,
            @RequestBody AiAssistRequest request) {
        return ResponseEntity.ok(ApiResponse.success(aiAssistService.title(request, userId)));
    }
}
