package com.siuuuuu.logly_backend.domain.place.service;

import com.siuuuuu.logly_backend.domain.place.dto.PlaceRequest;
import com.siuuuuu.logly_backend.domain.place.dto.PlaceResponse;
import com.siuuuuu.logly_backend.domain.place.entity.Place;
import com.siuuuuu.logly_backend.domain.place.mapper.PlaceMapper;
import com.siuuuuu.logly_backend.domain.place.repository.PlaceRepository;
import com.siuuuuu.logly_backend.global.exception.CustomException;
import com.siuuuuu.logly_backend.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PlaceService {

    private final PlaceRepository placeRepository;
    private final PlaceMapper placeMapper;

    @Transactional
    public PlaceResponse saveOrGet(PlaceRequest request) {
        return placeRepository
                .findByLatitudeAndLongitude(request.getLatitude(), request.getLongitude())
                .map(PlaceResponse::from)
                .orElseGet(() -> {
                    Place saved = placeRepository.save(request.toEntity());
                    return PlaceResponse.from(saved);
                });
    }

    @Transactional(readOnly = true)
    public PlaceResponse getById(Long id) {
        return placeMapper.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND));
    }
}
