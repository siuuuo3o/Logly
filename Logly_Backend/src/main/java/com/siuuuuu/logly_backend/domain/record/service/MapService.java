package com.siuuuuu.logly_backend.domain.record.service;

import com.siuuuuu.logly_backend.domain.record.dto.ClusterDto;
import com.siuuuuu.logly_backend.domain.record.dto.MapRecordDto;
import com.siuuuuu.logly_backend.domain.record.mapper.RecordMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class MapService {

    private final RecordMapper recordMapper;

    /**
     * 전체 기록 핀 목록 반환
     */
    public List<MapRecordDto> getMapRecords(Long userId) {
        log.debug("getMapRecords - userId: {}", userId);
        return recordMapper.findMapRecordsByUserId(userId);
    }

    /**
     * 줌 레벨에 따라 클러스터링된 핀 목록 반환
     * zoom >= 14: 개별 핀 (각 record를 count=1 cluster로 변환)
     * zoom <  14: 동일 위도/경도 기준으로 묶어서 ClusterDto 반환
     */
    public List<ClusterDto> getClusteredRecords(Long userId, double zoom) {
        log.debug("getClusteredRecords - userId: {}, zoom: {}", userId, zoom);
        List<MapRecordDto> records = recordMapper.findMapRecordsByUserId(userId);

        if (zoom >= 14) {
            List<ClusterDto> clusters = new ArrayList<>();
            for (MapRecordDto record : records) {
                clusters.add(ClusterDto.builder()
                        .latitude(record.getLatitude())
                        .longitude(record.getLongitude())
                        .count(1)
                        .type(record.getType())
                        .recordIds(List.of(record.getId()))
                        .placeName(record.getPlaceName())
                        .categoryColor(record.getCategoryColor())
                        .categoryName(record.getCategoryName())
                        .categoryIcon(record.getCategoryIcon())
                        .build());
            }
            return clusters;
        }

        Map<String, List<MapRecordDto>> grouped = new LinkedHashMap<>();
        for (MapRecordDto record : records) {
            String key = record.getLatitude() + "," + record.getLongitude();
            grouped.computeIfAbsent(key, k -> new ArrayList<>()).add(record);
        }

        List<ClusterDto> clusters = new ArrayList<>();
        for (Map.Entry<String, List<MapRecordDto>> entry : grouped.entrySet()) {
            List<MapRecordDto> group = entry.getValue();
            MapRecordDto first = group.get(0);

            String clusterType = resolveClusterType(group);
            List<Long> recordIds = group.stream()
                    .map(MapRecordDto::getId)
                    .toList();

            // 그룹 내 가장 많이 등장한 카테고리의 색을 클러스터 색으로 사용
            MapRecordDto dominant = resolveDominantCategory(group);

            clusters.add(ClusterDto.builder()
                    .latitude(first.getLatitude())
                    .longitude(first.getLongitude())
                    .count(group.size())
                    .type(clusterType)
                    .recordIds(recordIds)
                    .placeName(first.getPlaceName())
                    .categoryColor(dominant != null ? dominant.getCategoryColor() : null)
                    .categoryName(dominant != null ? dominant.getCategoryName() : null)
                    .categoryIcon(dominant != null ? dominant.getCategoryIcon() : null)
                    .build());
        }

        return clusters;
    }

    /**
     * 특정 여행의 기록들을 날짜순으로 반환 (코스 라인용)
     */
    public List<MapRecordDto> getTripCourse(Long tripId) {
        log.debug("getTripCourse - tripId: {}", tripId);
        return recordMapper.findMapRecordsByTripId(tripId);
    }

    private String resolveClusterType(List<MapRecordDto> group) {
        boolean hasDaily = group.stream().anyMatch(r -> "DAILY".equals(r.getType()));
        boolean hasTravel = group.stream().anyMatch(r -> "TRAVEL".equals(r.getType()));

        if (hasDaily && hasTravel) return "MIXED";
        if (hasTravel) return "TRAVEL";
        return "DAILY";
    }

    private MapRecordDto resolveDominantCategory(List<MapRecordDto> group) {
        Map<Long, Long> categoryCounts = new LinkedHashMap<>();
        for (MapRecordDto r : group) {
            if (r.getCategoryId() == null) continue;
            categoryCounts.merge(r.getCategoryId(), 1L, Long::sum);
        }
        if (categoryCounts.isEmpty()) return null;

        Long topId = categoryCounts.entrySet().stream()
                .max(Comparator.comparingLong(Map.Entry::getValue))
                .map(Map.Entry::getKey)
                .orElse(null);

        return group.stream()
                .filter(r -> topId.equals(r.getCategoryId()))
                .findFirst()
                .orElse(null);
    }
}
