package com.siuuuuu.logly_backend.domain.share.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShareGroupResponse {

    private Long id;
    private String inviteCode;
    private LocalDateTime createdAt;
    private List<MemberResponse> members;
}
