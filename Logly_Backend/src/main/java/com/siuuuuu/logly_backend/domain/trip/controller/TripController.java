package com.siuuuuu.logly_backend.domain.trip.controller;

import com.siuuuuu.logly_backend.domain.trip.dto.TripCreateRequest;
import com.siuuuuu.logly_backend.domain.trip.dto.TripDetailResponse;
import com.siuuuuu.logly_backend.domain.trip.dto.TripResponse;
import com.siuuuuu.logly_backend.domain.trip.dto.TripUpdateRequest;
import com.siuuuuu.logly_backend.domain.trip.service.TripService;
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

@Tag(name = "Trip", description = "여행 앨범 API")
@RestController
@RequestMapping("api/trip")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @Operation(summary = "여행 생성")
    @PostMapping("/")
    public ResponseEntity<ApiResponse<TripResponse>> create(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody TripCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(tripService.create(userId, request), "여행이 생성되었습니다."));
    }

    @Operation(summary = "내 여행 목록 조회")
    @GetMapping("/")
    public ResponseEntity<ApiResponse<List<TripResponse>>> getMyTrips(
            @AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(ApiResponse.success(tripService.getMyTrips(userId)));
    }

    @Operation(summary = "여행 상세 조회")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TripDetailResponse>> getDetail(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(tripService.getDetail(id, userId)));
    }

    @Operation(summary = "여행 수정")
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<TripResponse>> update(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id,
            @RequestBody TripUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(tripService.update(id, userId, request), "여행이 수정되었습니다."));
    }

    @Operation(summary = "여행 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id) {
        tripService.delete(id, userId);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @Operation(summary = "커버 이미지 업로드")
    @PostMapping("/{id}/cover")
    public ResponseEntity<ApiResponse<TripResponse>> uploadCoverImage(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id,
            @RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success(tripService.uploadCoverImage(id, userId, file), "커버 이미지가 업로드되었습니다."));
    }
}
