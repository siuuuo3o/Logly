package com.siuuuuu.logly_backend.domain.share.repository;

import com.siuuuuu.logly_backend.domain.share.entity.ShareGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ShareGroupRepository extends JpaRepository<ShareGroup, Long> {

    Optional<ShareGroup> findByInviteCode(String inviteCode);

    boolean existsByInviteCode(String inviteCode);
}
