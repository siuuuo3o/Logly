package com.siuuuuu.logly_backend.domain.auth.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class KakaoAuthRequest {
    private String code;
    private String redirectUri;
}
