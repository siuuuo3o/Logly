package com.siuuuuu.logly_backend.domain.share.repository;

import com.siuuuuu.logly_backend.domain.share.entity.ShareGroup;
import com.siuuuuu.logly_backend.domain.share.entity.ShareMember;
import com.siuuuuu.logly_backend.domain.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShareMemberRepository extends JpaRepository<ShareMember, Long> {

    boolean existsByShareGroupAndUser(ShareGroup shareGroup, User user);

    Optional<ShareMember> findByShareGroupAndUser(ShareGroup shareGroup, User user);

    List<ShareMember> findByShareGroup(ShareGroup shareGroup);

    Optional<ShareMember> findFirstByUserOrderByJoinedAtDesc(User user);
}
