package com.siuuuuu.logly_backend.domain.share.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberResponse {

    private Long userId;
    private String nickname;
    private String profileImageUrl;
    private String role;
    private LocalDateTime joinedAt;
}
