package com.siuuuuu.logly_backend.domain.record.controller;

import com.siuuuuu.logly_backend.domain.record.dto.*;
import com.siuuuuu.logly_backend.domain.record.service.RecordService;
import com.siuuuuu.logly_backend.domain.record.service.WeatherService;
import com.siuuuuu.logly_backend.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Tag(name = "Record", description = "기록 API")
@RestController
@RequestMapping("api/record")
@RequiredArgsConstructor
public class RecordController {

    private final RecordService recordService;
    private final WeatherService weatherService;

    @Operation(summary = "기록 생성")
    @PostMapping("/")
    public ResponseEntity<ApiResponse<RecordResponse>> create(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody RecordCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(recordService.create(userId, request), "기록이 생성되었습니다."));
    }

    @Operation(summary = "내 타임라인 조회")
    @GetMapping("/")
    public ResponseEntity<ApiResponse<TimelinePageResponse>> getTimeline(
            @AuthenticationPrincipal Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(recordService.getTimeline(userId, page, size)));
    }

    @Operation(summary = "기록 상세 조회")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RecordResponse>> getById(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(recordService.getById(id, userId)));
    }

    @Operation(summary = "기록 수정")
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<RecordResponse>> update(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id,
            @RequestBody RecordUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(recordService.update(id, userId, request), "기록이 수정되었습니다."));
    }

    @Operation(summary = "기록 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id) {
        recordService.delete(id, userId);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @Operation(summary = "이미지 업로드")
    @PostMapping("/{id}/images")
    public ResponseEntity<ApiResponse<List<RecordImageDto>>> uploadImages(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id,
            @RequestPart("files") MultipartFile[] files) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(recordService.uploadImages(id, userId, files), "이미지가 업로드되었습니다."));
    }

    @Operation(summary = "날씨 조회")
    @GetMapping("/weather")
    public ResponseEntity<ApiResponse<WeatherResponse>> getWeather(
            @RequestParam double lat,
            @RequestParam double lon) {
        return ResponseEntity.ok(ApiResponse.success(weatherService.getWeather(lat, lon)));
    }
}
