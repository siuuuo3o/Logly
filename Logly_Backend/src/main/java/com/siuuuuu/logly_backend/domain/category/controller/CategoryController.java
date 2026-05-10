package com.siuuuuu.logly_backend.domain.category.controller;

import com.siuuuuu.logly_backend.domain.category.dto.CategoryRequest;
import com.siuuuuu.logly_backend.domain.category.dto.CategoryResponse;
import com.siuuuuu.logly_backend.domain.category.service.CategoryService;
import com.siuuuuu.logly_backend.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Category", description = "카테고리 API")
@RestController
@RequestMapping("api/category")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @Operation(summary = "내 카테고리 목록")
    @GetMapping("/")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> list(@AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.list(userId)));
    }

    @Operation(summary = "카테고리 생성")
    @PostMapping("/")
    public ResponseEntity<ApiResponse<CategoryResponse>> create(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(categoryService.create(userId, request), "카테고리가 생성되었습니다."));
    }

    @Operation(summary = "카테고리 수정 (이름/색상/아이콘)")
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> update(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.update(userId, id, request), "카테고리가 수정되었습니다."));
    }

    @Operation(summary = "카테고리 삭제 (기본 카테고리 불가)")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id) {
        categoryService.delete(userId, id);
        return ResponseEntity.ok(ApiResponse.success(null, "카테고리가 삭제되었습니다."));
    }
}
