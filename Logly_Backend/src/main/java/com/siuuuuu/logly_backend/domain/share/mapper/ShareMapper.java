package com.siuuuuu.logly_backend.domain.share.mapper;

import com.siuuuuu.logly_backend.domain.share.dto.MemberResponse;
import com.siuuuuu.logly_backend.domain.share.dto.ShareGroupResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface ShareMapper {

    Optional<ShareGroupResponse> findGroupByUserId(@Param("userId") Long userId);

    List<MemberResponse> findMembersByGroupId(@Param("groupId") Long groupId);

    List<String> findPushTokensByGroupIdExcluding(@Param("groupId") Long groupId, @Param("excludeUserId") Long excludeUserId);
}
