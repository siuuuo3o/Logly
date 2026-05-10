package com.siuuuuu.logly_backend.domain.record.repository;

import com.siuuuuu.logly_backend.domain.record.entity.RecordImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecordImageRepository extends JpaRepository<RecordImage, Long> {

    List<RecordImage> findByRecordId(Long recordId);

    void deleteByRecordId(Long recordId);
}
