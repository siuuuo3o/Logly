package com.siuuuuu.logly_backend.domain.trip.repository;

import com.siuuuuu.logly_backend.domain.trip.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TripRepository extends JpaRepository<Trip, Long> {
}
