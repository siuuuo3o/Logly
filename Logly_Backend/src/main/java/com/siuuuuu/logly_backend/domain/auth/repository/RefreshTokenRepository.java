package com.siuuuuu.logly_backend.domain.auth.repository;

import com.siuuuuu.logly_backend.domain.auth.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    void deleteByUserId(Long userId);
}
