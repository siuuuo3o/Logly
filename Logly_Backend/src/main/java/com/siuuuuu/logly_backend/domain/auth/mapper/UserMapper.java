package com.siuuuuu.logly_backend.domain.auth.mapper;

import com.siuuuuu.logly_backend.domain.auth.dto.UserQueryDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    UserQueryDto findByEmail(@Param("email") String email);
    UserQueryDto findById(@Param("id") Long id);
}
