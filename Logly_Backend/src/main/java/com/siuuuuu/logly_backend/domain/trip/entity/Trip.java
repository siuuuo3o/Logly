package com.siuuuuu.logly_backend.domain.trip.entity;

import com.siuuuuu.logly_backend.domain.auth.entity.User;
import com.siuuuuu.logly_backend.global.config.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "trip")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Trip extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long shareGroupId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(nullable = false)
    private String title;

    private String coverImageUrl;

    private LocalDate startDate;

    private LocalDate endDate;

    @Builder.Default
    private boolean isActive = true;

    public void update(String title, LocalDate startDate, LocalDate endDate, Boolean isActive) {
        if (title != null) this.title = title;
        if (startDate != null) this.startDate = startDate;
        if (endDate != null) this.endDate = endDate;
        if (isActive != null) this.isActive = isActive;
    }

    public void updateCoverImage(String coverImageUrl) {
        this.coverImageUrl = coverImageUrl;
    }
}
