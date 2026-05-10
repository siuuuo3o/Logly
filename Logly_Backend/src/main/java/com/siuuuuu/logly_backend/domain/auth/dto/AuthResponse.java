package com.siuuuuu.logly_backend.domain.auth.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {
    private Long userId;
    private String nickname;
    private String profileImageUrl;
    private String accessToken;
    private String refreshToken;
}
