package com.siuuuuu.logly_backend.domain.trip.service;

import com.siuuuuu.logly_backend.domain.auth.entity.User;
import com.siuuuuu.logly_backend.domain.auth.repository.UserRepository;
import com.siuuuuu.logly_backend.domain.record.dto.RecordResponse;
import com.siuuuuu.logly_backend.domain.record.mapper.RecordMapper;
import com.siuuuuu.logly_backend.domain.trip.dto.TripCreateRequest;
import com.siuuuuu.logly_backend.domain.trip.dto.TripDetailResponse;
import com.siuuuuu.logly_backend.domain.trip.dto.TripResponse;
import com.siuuuuu.logly_backend.domain.trip.dto.TripUpdateRequest;
import com.siuuuuu.logly_backend.domain.trip.entity.Trip;
import com.siuuuuu.logly_backend.domain.trip.mapper.TripMapper;
import com.siuuuuu.logly_backend.domain.trip.repository.TripRepository;
import com.siuuuuu.logly_backend.global.exception.CustomException;
import com.siuuuuu.logly_backend.global.exception.ErrorCode;
import com.siuuuuu.logly_backend.global.util.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final TripMapper tripMapper;
    private final RecordMapper recordMapper;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public TripResponse create(Long userId, TripCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Trip trip = Trip.builder()
                .createdBy(user)
                .title(request.getTitle())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();

        Trip saved = tripRepository.save(trip);

        return tripMapper.findById(saved.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.TRIP_NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public List<TripResponse> getMyTrips(Long userId) {
        return tripMapper.findAllByUserId(userId);
    }

    @Transactional(readOnly = true)
    public TripDetailResponse getDetail(Long tripId, Long userId) {
        TripResponse trip = tripMapper.findById(tripId)
                .orElseThrow(() -> new CustomException(ErrorCode.TRIP_NOT_FOUND));

        List<RecordResponse> records = recordMapper.findByTripId(tripId);

        return TripDetailResponse.from(trip, records);
    }

    @Transactional
    public TripResponse update(Long tripId, Long userId, TripUpdateRequest request) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new CustomException(ErrorCode.TRIP_NOT_FOUND));

        if (!trip.getCreatedBy().getId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        trip.update(request.getTitle(), request.getStartDate(), request.getEndDate(), request.getIsActive());

        return tripMapper.findById(tripId)
                .orElseThrow(() -> new CustomException(ErrorCode.TRIP_NOT_FOUND));
    }

    @Transactional
    public void delete(Long tripId, Long userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new CustomException(ErrorCode.TRIP_NOT_FOUND));

        if (!trip.getCreatedBy().getId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        tripRepository.delete(trip);
    }

    @Transactional
    public TripResponse uploadCoverImage(Long tripId, Long userId, MultipartFile file) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new CustomException(ErrorCode.TRIP_NOT_FOUND));

        if (!trip.getCreatedBy().getId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        if (trip.getCoverImageUrl() != null) {
            try {
                fileStorageService.delete(trip.getCoverImageUrl());
            } catch (Exception ignored) {
            }
        }

        String imageUrl = fileStorageService.upload(file, "trips/" + tripId);
        trip.updateCoverImage(imageUrl);

        return tripMapper.findById(tripId)
                .orElseThrow(() -> new CustomException(ErrorCode.TRIP_NOT_FOUND));
    }
}
