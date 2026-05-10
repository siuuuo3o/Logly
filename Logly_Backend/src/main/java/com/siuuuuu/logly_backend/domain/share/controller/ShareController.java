package com.siuuuuu.logly_backend.domain.share.controller;

import com.siuuuuu.logly_backend.domain.record.dto.TimelinePageResponse;
import com.siuuuuu.logly_backend.domain.share.dto.JoinGroupRequest;
import com.siuuuuu.logly_backend.domain.share.dto.ShareGroupResponse;
import com.siuuuuu.logly_backend.domain.share.service.ShareService;
import com.siuuuuu.logly_backend.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Share", description = "공유 그룹 API")
@RestController
@RequestMapping("api/share")
@RequiredArgsConstructor
public class ShareController {

    private final ShareService shareService;

    @Operation(summary = "공유 그룹 생성 (초대 코드 발급)")
    @PostMapping("/")
    public ResponseEntity<ApiResponse<ShareGroupResponse>> createGroup(
            @AuthenticationPrincipal Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(shareService.createGroup(userId), "공유 그룹이 생성되었습니다."));
    }

    @Operation(summary = "초대 코드로 그룹 참여")
    @PostMapping("/join")
    public ResponseEntity<ApiResponse<ShareGroupResponse>> joinGroup(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody JoinGroupRequest request) {
        return ResponseEntity.ok(ApiResponse.success(shareService.joinGroup(userId, request.getInviteCode()), "그룹에 참여했습니다."));
    }

    @Operation(summary = "내 공유 그룹 조회")
    @GetMapping("/")
    public ResponseEntity<ApiResponse<ShareGroupResponse>> getMyGroup(
            @AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(ApiResponse.success(shareService.getMyGroup(userId)));
    }

    @Operation(summary = "그룹 탈퇴")
    @DeleteMapping("/leave")
    public ResponseEntity<ApiResponse<Void>> leaveGroup(
            @AuthenticationPrincipal Long userId) {
        shareService.leaveGroup(userId);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @Operation(summary = "멤버 강퇴 (OWNER 전용)")
    @DeleteMapping("/{groupId}/members/{targetUserId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long groupId,
            @PathVariable Long targetUserId) {
        shareService.removeMember(groupId, targetUserId, userId);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @Operation(summary = "공유 그룹 타임라인 조회 (멤버 전체의 SHARED 기록)")
    @GetMapping("/timeline")
    public ResponseEntity<ApiResponse<TimelinePageResponse>> getSharedTimeline(
            @AuthenticationPrincipal Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(shareService.getSharedTimeline(userId, page, size)));
    }
}
