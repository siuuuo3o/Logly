package com.siuuuuu.logly_backend.domain.ai.entity;

import com.siuuuuu.logly_backend.global.config.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ai_assist_log")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class AiAssistLog extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "record_id")
    private Long recordId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "assist_type", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private AssistType assistType;

    @Column(name = "prompt_summary", length = 500)
    private String promptSummary;

    public enum AssistType {
        DRAFT, CONTINUE, TITLE
    }
}
