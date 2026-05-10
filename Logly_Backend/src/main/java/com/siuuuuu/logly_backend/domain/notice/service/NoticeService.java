package com.siuuuuu.logly_backend.domain.notice.service;

import com.siuuuuu.logly_backend.domain.notice.dto.NoticeResponse;
import com.siuuuuu.logly_backend.domain.notice.entity.Notice;
import com.siuuuuu.logly_backend.domain.notice.mapper.NoticeMapper;
import com.siuuuuu.logly_backend.domain.notice.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeMapper noticeMapper;
    private final NoticeRepository noticeRepository;

    public List<NoticeResponse> getAll() {
        return noticeMapper.findAll();
    }

    @Transactional
    public void create(String title, String content, boolean important) {
        noticeRepository.save(Notice.builder()
                .title(title)
                .content(content)
                .important(important)
                .build());
    }
}
