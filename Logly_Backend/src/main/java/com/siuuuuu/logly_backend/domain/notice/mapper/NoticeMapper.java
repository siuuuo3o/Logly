package com.siuuuuu.logly_backend.domain.notice.mapper;

import com.siuuuuu.logly_backend.domain.notice.dto.NoticeResponse;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface NoticeMapper {
    List<NoticeResponse> findAll();
}
