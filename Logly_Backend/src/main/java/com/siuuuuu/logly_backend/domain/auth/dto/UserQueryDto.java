package com.siuuuuu.logly_backend.domain.auth.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UserQueryDto {
    private Long id;
    private String email;
    private String password;
    private String nickname;
    private String profileImageUrl;
    private String provider;
    private String providerId;
}
