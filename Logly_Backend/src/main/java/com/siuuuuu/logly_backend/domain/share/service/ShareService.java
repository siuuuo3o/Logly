package com.siuuuuu.logly_backend.domain.share.service;

import com.siuuuuu.logly_backend.domain.auth.entity.User;
import com.siuuuuu.logly_backend.domain.auth.repository.UserRepository;
import com.siuuuuu.logly_backend.domain.share.dto.MemberResponse;
import com.siuuuuu.logly_backend.domain.share.dto.ShareGroupResponse;
import com.siuuuuu.logly_backend.domain.share.entity.ShareGroup;
import com.siuuuuu.logly_backend.domain.share.entity.ShareMember;
import com.siuuuuu.logly_backend.domain.record.dto.TimelinePageResponse;
import com.siuuuuu.logly_backend.domain.record.mapper.RecordMapper;
import com.siuuuuu.logly_backend.domain.share.mapper.ShareMapper;
import com.siuuuuu.logly_backend.domain.share.repository.ShareGroupRepository;
import com.siuuuuu.logly_backend.domain.share.repository.ShareMemberRepository;
import com.siuuuuu.logly_backend.global.exception.CustomException;
import com.siuuuuu.logly_backend.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShareService {

    private final ShareGroupRepository shareGroupRepository;
    private final ShareMemberRepository shareMemberRepository;
    private final UserRepository userRepository;
    private final ShareMapper shareMapper;
    private final RecordMapper recordMapper;

    // 그룹 생성 (OWNER)
    @Transactional
    public ShareGroupResponse createGroup(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 이미 그룹에 속해 있으면 기존 그룹 반환
        Optional<ShareGroupResponse> existing = shareMapper.findGroupByUserId(userId);
        if (existing.isPresent()) {
            Long groupId = existing.get().getId();
            List<MemberResponse> members = shareMapper.findMembersByGroupId(groupId);
            return ShareGroupResponse.builder()
                    .id(existing.get().getId())
                    .inviteCode(existing.get().getInviteCode())
                    .createdAt(existing.get().getCreatedAt())
                    .members(members)
                    .build();
        }

        String inviteCode = generateUniqueCode();

        ShareGroup group = ShareGroup.builder()
                .inviteCode(inviteCode)
                .build();
        ShareGroup saved = shareGroupRepository.save(group);

        ShareMember owner = ShareMember.builder()
                .shareGroup(saved)
                .user(user)
                .role(ShareMember.Role.OWNER)
                .build();
        shareMemberRepository.save(owner);

        List<MemberResponse> members = shareMapper.findMembersByGroupId(saved.getId());
        return ShareGroupResponse.builder()
                .id(saved.getId())
                .inviteCode(saved.getInviteCode())
                .createdAt(saved.getCreatedAt())
                .members(members)
                .build();
    }

    // 초대 코드로 참여
    @Transactional
    public ShareGroupResponse joinGroup(Long userId, String inviteCode) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        ShareGroup group = shareGroupRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new CustomException(ErrorCode.INVALID_INVITE_CODE));

        if (shareMemberRepository.existsByShareGroupAndUser(group, user)) {
            throw new CustomException(ErrorCode.ALREADY_IN_GROUP);
        }

        ShareMember member = ShareMember.builder()
                .shareGroup(group)
                .user(user)
                .role(ShareMember.Role.MEMBER)
                .build();
        shareMemberRepository.save(member);

        List<MemberResponse> members = shareMapper.findMembersByGroupId(group.getId());
        return ShareGroupResponse.builder()
                .id(group.getId())
                .inviteCode(group.getInviteCode())
                .createdAt(group.getCreatedAt())
                .members(members)
                .build();
    }

    // 내 그룹 조회
    @Transactional(readOnly = true)
    public ShareGroupResponse getMyGroup(Long userId) {
        ShareGroupResponse group = shareMapper.findGroupByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.SHARE_GROUP_NOT_FOUND));

        List<MemberResponse> members = shareMapper.findMembersByGroupId(group.getId());
        return ShareGroupResponse.builder()
                .id(group.getId())
                .inviteCode(group.getInviteCode())
                .createdAt(group.getCreatedAt())
                .members(members)
                .build();
    }

    // 그룹 탈퇴
    @Transactional
    public void leaveGroup(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        ShareMember membership = shareMemberRepository.findFirstByUserOrderByJoinedAtDesc(user)
                .orElseThrow(() -> new CustomException(ErrorCode.SHARE_GROUP_NOT_FOUND));

        shareMemberRepository.delete(membership);
    }

    // 멤버 강퇴 (OWNER만)
    @Transactional
    public void removeMember(Long groupId, Long targetUserId, Long requesterId) {
        ShareGroup group = shareGroupRepository.findById(groupId)
                .orElseThrow(() -> new CustomException(ErrorCode.SHARE_GROUP_NOT_FOUND));

        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        ShareMember requesterMembership = shareMemberRepository.findByShareGroupAndUser(group, requester)
                .orElseThrow(() -> new CustomException(ErrorCode.FORBIDDEN));

        if (requesterMembership.getRole() != ShareMember.Role.OWNER) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        ShareMember targetMembership = shareMemberRepository.findByShareGroupAndUser(group, target)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        shareMemberRepository.delete(targetMembership);
    }

    // 공유 그룹 타임라인 조회
    @Transactional(readOnly = true)
    public TimelinePageResponse getSharedTimeline(Long userId, int page, int size) {
        ShareGroupResponse group = shareMapper.findGroupByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.SHARE_GROUP_NOT_FOUND));

        int offset = page * size;
        var records = recordMapper.findSharedTimelineByGroupId(group.getId(), size, offset);
        long total = recordMapper.countSharedTimelineByGroupId(group.getId());

        return TimelinePageResponse.of(records, page, size, total);
    }

    private String generateUniqueCode() {
        String code;
        do {
            code = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        } while (shareGroupRepository.existsByInviteCode(code));
        return code;
    }
}
