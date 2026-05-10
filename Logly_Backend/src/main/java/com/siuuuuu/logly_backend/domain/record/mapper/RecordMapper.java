package com.siuuuuu.logly_backend.domain.record.mapper;

import com.siuuuuu.logly_backend.domain.record.dto.MapRecordDto;
import com.siuuuuu.logly_backend.domain.record.dto.RecordResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface RecordMapper {

    List<RecordResponse> findTimelineByUserId(@Param("userId") Long userId,
                                              @Param("limit") int limit,
                                              @Param("offset") int offset);

    Optional<RecordResponse> findByIdWithDetails(@Param("id") Long id);

    long countByUserId(@Param("userId") Long userId);

    List<RecordResponse> findByTripId(@Param("tripId") Long tripId);

    List<MapRecordDto> findMapRecordsByUserId(@Param("userId") Long userId);

    List<MapRecordDto> findMapRecordsByTripId(@Param("tripId") Long tripId);

    List<RecordResponse> findSharedTimelineByGroupId(@Param("groupId") Long groupId,
                                                     @Param("limit") int limit,
                                                     @Param("offset") int offset);

    long countSharedTimelineByGroupId(@Param("groupId") Long groupId);

    long countDiaryByUserId(@Param("userId") Long userId);
}
