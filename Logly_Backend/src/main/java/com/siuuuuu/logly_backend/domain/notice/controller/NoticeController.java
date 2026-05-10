package com.siuuuuu.logly_backend.domain.notice.controller;

import com.siuuuuu.logly_backend.domain.notice.dto.NoticeCreateRequest;
import com.siuuuuu.logly_backend.domain.notice.dto.NoticeResponse;
import com.siuuuuu.logly_backend.domain.notice.service.NoticeService;
import com.siuuuuu.logly_backend.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/notice")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    @GetMapping("/")
    public ApiResponse<List<NoticeResponse>> getAll() {
        return ApiResponse.success(noticeService.getAll());
    }

    @PostMapping("/")
    public ApiResponse<Void> create(@RequestBody NoticeCreateRequest request) {
        noticeService.create(request.getTitle(), request.getContent(), request.isImportant());
        return ApiResponse.success();
    }
}
