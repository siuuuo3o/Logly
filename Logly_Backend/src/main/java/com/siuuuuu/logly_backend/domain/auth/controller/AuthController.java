package com.siuuuuu.logly_backend.domain.auth.controller;

import com.siuuuuu.logly_backend.domain.auth.dto.*;
import com.siuuuuu.logly_backend.domain.auth.service.AuthService;
import com.siuuuuu.logly_backend.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Auth", description = "인증 API")
@RestController
@RequestMapping("api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "이메일 회원가입")
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AuthResponse>> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(authService.signup(request), "회원가입이 완료되었습니다."));
    }

    @Operation(summary = "로그인")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.login(request)));
    }

    @Operation(summary = "액세스 토큰 재발급")
    @PostMapping("/reissue")
    public ResponseEntity<ApiResponse<AccessTokenResponse>> reissue(@Valid @RequestBody TokenReissueRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.reissue(request)));
    }

    @Operation(summary = "내 프로필 조회")
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(@AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(ApiResponse.success(authService.getProfile(userId)));
    }

    @Operation(summary = "프로필 수정 (닉네임 + 프로필 이미지)")
    @PatchMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            @AuthenticationPrincipal Long userId,
            @RequestPart(value = "nickname", required = false) String nickname,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage) {
        return ResponseEntity.ok(ApiResponse.success(authService.updateProfile(userId, nickname, profileImage)));
    }

    @Operation(summary = "나의 통계 (기록 수, 여행 수, 일기 수)")
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<StatsResponse>> getStats(@AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(ApiResponse.success(authService.getStats(userId)));
    }

    @Operation(summary = "Expo 푸시 토큰 등록")
    @PostMapping("/push-token")
    public ResponseEntity<ApiResponse<Void>> registerPushToken(
            @AuthenticationPrincipal Long userId,
            @RequestBody java.util.Map<String, String> body) {
        authService.updatePushToken(userId, body.get("token"));
        return ResponseEntity.ok(ApiResponse.success(null, "푸시 토큰이 등록되었습니다."));
    }
}
