package com.siuuuuu.logly_backend.domain.share.entity;

import com.siuuuuu.logly_backend.domain.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "share_member",
        uniqueConstraints = @UniqueConstraint(columnNames = {"share_group_id", "user_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class ShareMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "share_group_id", nullable = false)
    private ShareGroup shareGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.MEMBER;

    @Builder.Default
    private LocalDateTime joinedAt = LocalDateTime.now();

    public enum Role {
        OWNER, MEMBER
    }
}
