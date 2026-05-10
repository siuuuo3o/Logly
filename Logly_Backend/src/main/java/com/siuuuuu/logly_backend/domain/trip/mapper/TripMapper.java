package com.siuuuuu.logly_backend.domain.trip.mapper;

import com.siuuuuu.logly_backend.domain.trip.dto.TripResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface TripMapper {

    List<TripResponse> findAllByUserId(@Param("userId") Long userId);

    Optional<TripResponse> findById(@Param("id") Long id);

    long countByUserId(@Param("userId") Long userId);
}
