package com.siuuuuu.logly_backend.domain.category.repository;

import com.siuuuuu.logly_backend.domain.category.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    boolean existsByUserIdAndName(Long userId, String name);

    long countByUserId(Long userId);

    List<Category> findAllByUserId(Long userId);
}
