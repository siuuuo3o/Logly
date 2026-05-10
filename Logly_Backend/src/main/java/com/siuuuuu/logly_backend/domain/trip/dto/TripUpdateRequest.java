package com.siuuuuu.logly_backend.domain.trip.dto;

import lombok.Getter;

import java.time.LocalDate;

@Getter
public class TripUpdateRequest {

    private String title;

    private LocalDate startDate;

    private LocalDate endDate;

    private Boolean isActive;
}
