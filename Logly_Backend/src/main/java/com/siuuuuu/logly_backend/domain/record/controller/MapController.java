package com.siuuuuu.logly_backend.domain.record.controller;

import com.siuuuuu.logly_backend.domain.record.dto.ClusterDto;
import com.siuuuuu.logly_backend.domain.record.dto.MapRecordDto;
import com.siuuuuu.logly_backend.domain.record.service.MapService;
import com.siuuuuu.logly_backend.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("api/map")
@RequiredArgsConstructor
public class MapController {

    private final MapService mapService;

    /**
     * GET /api/map/pins
     * 전체 핀 목록 조회 (줌 레벨에 따라 클러스터링 적용)
     *
     * @param zoom 지도 줌 레벨 (기본값 13.0)
     *             zoom >= 14: 개별 핀, zoom < 14: 클러스터링
     */
    @GetMapping("/pins")
    public ResponseEntity<ApiResponse<List<ClusterDto>>> getPins(
            @AuthenticationPrincipal Long userId,
            @RequestParam(defaultValue = "13.0") double zoom
    ) {
        log.info("GET /api/map/pins - userId: {}, zoom: {}", userId, zoom);
        List<ClusterDto> clusters = mapService.getClusteredRecords(userId, zoom);
        return ResponseEntity.ok(ApiResponse.success(clusters));
    }

    /**
     * GET /api/map/trip/{tripId}/course
     * 특정 여행의 날짜순 기록 목록 조회 (코스 라인용)
     */
    @GetMapping("/trip/{tripId}/course")
    public ResponseEntity<ApiResponse<List<MapRecordDto>>> getTripCourse(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long tripId
    ) {
        log.info("GET /api/map/trip/{}/course - userId: {}", tripId, userId);
        List<MapRecordDto> course = mapService.getTripCourse(tripId);
        return ResponseEntity.ok(ApiResponse.success(course));
    }
}
