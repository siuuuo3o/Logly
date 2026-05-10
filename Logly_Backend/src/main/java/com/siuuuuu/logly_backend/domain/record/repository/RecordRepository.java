package com.siuuuuu.logly_backend.domain.record.repository;

import com.siuuuuu.logly_backend.domain.record.entity.Record;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecordRepository extends JpaRepository<Record, Long> {
}
