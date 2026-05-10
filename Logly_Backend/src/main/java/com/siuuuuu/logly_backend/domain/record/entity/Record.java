package com.siuuuuu.logly_backend.domain.record.entity;

import com.siuuuuu.logly_backend.domain.auth.entity.User;
import com.siuuuuu.logly_backend.domain.category.entity.Category;
import com.siuuuuu.logly_backend.domain.place.entity.Place;
import com.siuuuuu.logly_backend.global.config.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "record")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Record extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private Long tripId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id")
    private Place place;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RecordType type = RecordType.DAILY;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String diaryTitle;

    private String weather;

    private Float temperature;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Visibility visibility = Visibility.PRIVATE;

    private LocalDate recordedAt;

    public void update(String content, String diaryTitle, String weather, Float temperature,
                       Visibility visibility, LocalDate recordedAt, Place place, Long tripId, Category category) {
        this.content = content;
        this.diaryTitle = diaryTitle;
        this.weather = weather;
        this.temperature = temperature;
        this.visibility = visibility;
        this.recordedAt = recordedAt;
        this.place = place;
        this.tripId = tripId;
        if (category != null) this.category = category;
    }

    public enum RecordType {
        DAILY, TRAVEL
    }

    public enum Visibility {
        PRIVATE, SHARED
    }
}
