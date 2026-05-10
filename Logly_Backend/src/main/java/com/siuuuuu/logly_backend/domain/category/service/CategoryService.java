package com.siuuuuu.logly_backend.domain.category.service;

import com.siuuuuu.logly_backend.domain.auth.entity.User;
import com.siuuuuu.logly_backend.domain.auth.repository.UserRepository;
import com.siuuuuu.logly_backend.domain.category.dto.CategoryRequest;
import com.siuuuuu.logly_backend.domain.category.dto.CategoryResponse;
import com.siuuuuu.logly_backend.domain.category.entity.Category;
import com.siuuuuu.logly_backend.domain.category.mapper.CategoryMapper;
import com.siuuuuu.logly_backend.domain.category.repository.CategoryRepository;
import com.siuuuuu.logly_backend.global.exception.CustomException;
import com.siuuuuu.logly_backend.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final UserRepository userRepository;

    /**
     * 신규 회원가입 시 기본 카테고리 4종을 시드한다.
     * 이미 카테고리가 존재하면 건너뛴다 (멱등).
     */
    @Transactional
    public void seedDefaults(Long userId) {
        if (categoryRepository.countByUserId(userId) > 0) return;

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        for (DefaultCategory dc : DefaultCategory.values()) {
            categoryRepository.save(Category.builder()
                    .user(user)
                    .name(dc.name)
                    .color(dc.color)
                    .icon(dc.icon)
                    .isDefault(true)
                    .build());
        }
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> list(Long userId) {
        return categoryMapper.findAllByUserId(userId);
    }

    @Transactional
    public CategoryResponse create(Long userId, CategoryRequest request) {
        if (categoryRepository.existsByUserIdAndName(userId, request.getName())) {
            throw new CustomException(ErrorCode.CATEGORY_NAME_DUPLICATE);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Category saved = categoryRepository.save(Category.builder()
                .user(user)
                .name(request.getName())
                .color(request.getColor())
                .icon(request.getIcon())
                .isDefault(false)
                .build());

        return CategoryResponse.from(saved);
    }

    @Transactional
    public CategoryResponse update(Long userId, Long categoryId, CategoryRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CustomException(ErrorCode.CATEGORY_NOT_FOUND));

        if (!category.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        // 이름 변경이고 다른 카테고리와 중복되는지 확인
        if (!category.getName().equals(request.getName())
                && categoryRepository.existsByUserIdAndName(userId, request.getName())) {
            throw new CustomException(ErrorCode.CATEGORY_NAME_DUPLICATE);
        }

        category.update(request.getName(), request.getColor(), request.getIcon());
        return CategoryResponse.from(category);
    }

    @Transactional
    public void delete(Long userId, Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CustomException(ErrorCode.CATEGORY_NOT_FOUND));

        if (!category.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        if (category.isDefault()) {
            throw new CustomException(ErrorCode.CATEGORY_DEFAULT_CANNOT_DELETE);
        }

        categoryRepository.delete(category);
    }

    private enum DefaultCategory {
        CAFE("카페", "#B07A5C", "☕"),
        RESTAURANT("음식점", "#E07A5F", "🍽️"),
        NATURE("자연", "#6BAA5E", "🌿"),
        ETC("기타", "#888888", "📍");

        final String name;
        final String color;
        final String icon;

        DefaultCategory(String name, String color, String icon) {
            this.name = name;
            this.color = color;
            this.icon = icon;
        }
    }
}
