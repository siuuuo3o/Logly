package com.siuuuuu.logly_backend.domain.place.controller;

import com.siuuuuu.logly_backend.domain.place.dto.PlaceRequest;
import com.siuuuuu.logly_backend.domain.place.dto.PlaceResponse;
import com.siuuuuu.logly_backend.domain.place.service.PlaceService;
import com.siuuuuu.logly_backend.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Place", description = "장소 API")
@RestController
@RequestMapping("api/place")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService placeService;

    @Operation(summary = "장소 저장 (중복 시 기존 반환)")
    @PostMapping("/")
    public ResponseEntity<ApiResponse<PlaceResponse>> saveOrGet(@Valid @RequestBody PlaceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(placeService.saveOrGet(request), "장소가 저장되었습니다."));
    }

    @Operation(summary = "장소 단건 조회")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PlaceResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(placeService.getById(id)));
    }
}
