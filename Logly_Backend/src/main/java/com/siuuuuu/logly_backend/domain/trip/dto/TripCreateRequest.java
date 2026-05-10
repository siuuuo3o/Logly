package com.siuuuuu.logly_backend.domain.trip.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class TripCreateRequest {

    @NotBlank
    private String title;

    private LocalDate startDate;

    private LocalDate endDate;
}
