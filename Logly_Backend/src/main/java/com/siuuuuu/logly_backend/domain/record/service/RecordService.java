package com.siuuuuu.logly_backend.domain.record.service;

import com.siuuuuu.logly_backend.domain.category.entity.Category;
import com.siuuuuu.logly_backend.domain.category.repository.CategoryRepository;
import com.siuuuuu.logly_backend.domain.place.entity.Place;
import com.siuuuuu.logly_backend.domain.place.repository.PlaceRepository;
import com.siuuuuu.logly_backend.domain.auth.entity.User;
import com.siuuuuu.logly_backend.domain.auth.repository.UserRepository;
import com.siuuuuu.logly_backend.domain.record.dto.*;
import com.siuuuuu.logly_backend.domain.record.entity.Record;
import com.siuuuuu.logly_backend.domain.record.entity.RecordImage;
import com.siuuuuu.logly_backend.domain.record.mapper.RecordMapper;
import com.siuuuuu.logly_backend.domain.record.repository.RecordImageRepository;
import com.siuuuuu.logly_backend.domain.record.repository.RecordRepository;
import com.siuuuuu.logly_backend.domain.share.mapper.ShareMapper;
import com.siuuuuu.logly_backend.global.exception.CustomException;
import com.siuuuuu.logly_backend.global.exception.ErrorCode;
import com.siuuuuu.logly_backend.global.util.ExpoPushService;
import com.siuuuuu.logly_backend.global.util.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecordService {

    private final RecordRepository recordRepository;
    private final RecordImageRepository recordImageRepository;
    private final RecordMapper recordMapper;
    private final PlaceRepository placeRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final ShareMapper shareMapper;
    private final ExpoPushService expoPushService;

    @Transactional
    public RecordResponse create(Long userId, RecordCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Place place = null;
        if (request.getPlaceId() != null) {
            place = placeRepository.findById(request.getPlaceId())
                    .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND));
        }

        Category category = resolveCategoryForUser(userId, request.getCategoryId());

        Record record = Record.builder()
                .user(user)
                .tripId(request.getTripId())
                .place(place)
                .category(category)
                .type(request.getType())
                .content(request.getContent())
                .diaryTitle(request.getDiaryTitle())
                .weather(request.getWeather())
                .temperature(request.getTemperature())
                .visibility(request.getVisibility())
                .recordedAt(request.getRecordedAt())
                .build();

        Record saved = recordRepository.save(record);

        // SHARED 기록이면 공유 그룹 멤버에게 푸시 알림
        if (saved.getVisibility() == Record.Visibility.SHARED) {
            shareMapper.findGroupByUserId(userId).ifPresent(group -> {
                List<String> tokens = shareMapper.findPushTokensByGroupIdExcluding(group.getId(), userId);
                expoPushService.sendPush(tokens, "새로운 기록이 도착했어요",
                        user.getNickname() + "님이 새 기록을 남겼어요 📸");
            });
        }

        return recordMapper.findByIdWithDetails(saved.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.RECORD_NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public TimelinePageResponse getTimeline(Long userId, int page, int size) {
        int offset = page * size;
        List<RecordResponse> records = recordMapper.findTimelineByUserId(userId, size, offset);
        long total = recordMapper.countByUserId(userId);
        return TimelinePageResponse.of(records, page, size, total);
    }

    @Transactional(readOnly = true)
    public RecordResponse getById(Long recordId, Long userId) {
        RecordResponse response = recordMapper.findByIdWithDetails(recordId)
                .orElseThrow(() -> new CustomException(ErrorCode.RECORD_NOT_FOUND));

        if (!response.getUserId().equals(userId)
                && response.getVisibility().equals("PRIVATE")) {
            throw new CustomException(ErrorCode.RECORD_ACCESS_DENIED);
        }

        return response;
    }

    @Transactional
    public RecordResponse update(Long recordId, Long userId, RecordUpdateRequest request) {
        Record record = recordRepository.findById(recordId)
                .orElseThrow(() -> new CustomException(ErrorCode.RECORD_NOT_FOUND));

        if (!record.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.RECORD_ACCESS_DENIED);
        }

        Place place = null;
        if (request.getPlaceId() != null) {
            place = placeRepository.findById(request.getPlaceId())
                    .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND));
        }

        Category category = request.getCategoryId() != null
                ? resolveCategoryForUser(userId, request.getCategoryId())
                : null;

        record.update(
                request.getContent(),
                request.getDiaryTitle(),
                request.getWeather(),
                request.getTemperature(),
                request.getVisibility() != null ? request.getVisibility() : record.getVisibility(),
                request.getRecordedAt() != null ? request.getRecordedAt() : record.getRecordedAt(),
                place,
                request.getTripId(),
                category
        );

        return recordMapper.findByIdWithDetails(record.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.RECORD_NOT_FOUND));
    }

    @Transactional
    public void delete(Long recordId, Long userId) {
        Record record = recordRepository.findById(recordId)
                .orElseThrow(() -> new CustomException(ErrorCode.RECORD_NOT_FOUND));

        if (!record.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.RECORD_ACCESS_DENIED);
        }

        // Delete images from S3 then DB
        List<RecordImage> images = recordImageRepository.findByRecordId(recordId);
        for (RecordImage image : images) {
            try {
                fileStorageService.delete(image.getImageUrl());
            } catch (Exception ignored) {
                // S3 삭제 실패해도 DB 삭제는 진행
            }
        }
        recordImageRepository.deleteByRecordId(recordId);
        recordRepository.delete(record);
    }

    @Transactional
    public List<RecordImageDto> uploadImages(Long recordId, Long userId, MultipartFile[] files) {
        Record record = recordRepository.findById(recordId)
                .orElseThrow(() -> new CustomException(ErrorCode.RECORD_NOT_FOUND));

        if (!record.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.RECORD_ACCESS_DENIED);
        }

        List<RecordImage> existingImages = recordImageRepository.findByRecordId(recordId);
        boolean hasRepresentative = existingImages.stream()
                .anyMatch(RecordImage::isRepresentative);
        int nextOrder = existingImages.size();

        List<RecordImageDto> result = new ArrayList<>();
        for (int i = 0; i < files.length; i++) {
            MultipartFile file = files[i];
            String imageUrl = fileStorageService.upload(file, "records/" + recordId);

            boolean isFirst = !hasRepresentative && i == 0;
            RecordImage image = RecordImage.builder()
                    .record(record)
                    .imageUrl(imageUrl)
                    .isRepresentative(isFirst)
                    .orderIndex(nextOrder + i)
                    .build();

            RecordImage saved = recordImageRepository.save(image);
            result.add(RecordImageDto.builder()
                    .id(saved.getId())
                    .imageUrl(saved.getImageUrl())
                    .isRepresentative(saved.isRepresentative())
                    .orderIndex(saved.getOrderIndex())
                    .build());
        }

        return result;
    }

    private Category resolveCategoryForUser(Long userId, Long categoryId) {
        if (categoryId == null) return null;
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CustomException(ErrorCode.CATEGORY_NOT_FOUND));
        if (!category.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }
        return category;
    }
}
