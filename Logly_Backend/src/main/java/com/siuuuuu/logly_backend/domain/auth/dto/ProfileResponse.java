package com.siuuuuu.logly_backend.domain.auth.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProfileResponse {
    private Long id;
    private String email;
    private String nickname;
    private String profileImageUrl;
}
