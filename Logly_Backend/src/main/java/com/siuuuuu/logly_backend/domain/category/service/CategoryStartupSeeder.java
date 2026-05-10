package com.siuuuuu.logly_backend.domain.category.service;

import com.siuuuuu.logly_backend.domain.auth.entity.User;
import com.siuuuuu.logly_backend.domain.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 앱 기동 시 기존 모든 유저에게 기본 카테고리 4종을 시드한다.
 * CategoryService.seedDefaults 가 멱등(이미 카테고리가 있으면 skip) 하므로
 * 매 부팅마다 호출돼도 안전.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CategoryStartupSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final CategoryService categoryService;

    @Override
    public void run(ApplicationArguments args) {
        List<User> users = userRepository.findAll();
        int seededCount = 0;
        for (User user : users) {
            try {
                categoryService.seedDefaults(user.getId());
                seededCount++;
            } catch (Exception e) {
                log.warn("Failed to seed default categories for userId={}: {}", user.getId(), e.getMessage());
            }
        }
        log.info("Category startup seed complete: processed {} users.", seededCount);
    }
}
