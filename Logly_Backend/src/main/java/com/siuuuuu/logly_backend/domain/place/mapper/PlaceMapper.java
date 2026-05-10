package com.siuuuuu.logly_backend.domain.place.mapper;

import com.siuuuuu.logly_backend.domain.place.dto.PlaceResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

@Mapper
public interface PlaceMapper {

    Optional<PlaceResponse> findById(@Param("id") Long id);
}
