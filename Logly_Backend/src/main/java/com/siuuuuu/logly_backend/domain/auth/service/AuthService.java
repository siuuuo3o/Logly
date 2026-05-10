package com.siuuuuu.logly_backend.domain.auth.service;

import com.siuuuuu.logly_backend.domain.auth.dto.*;
import com.siuuuuu.logly_backend.domain.auth.entity.RefreshToken;
import com.siuuuuu.logly_backend.domain.auth.entity.User;
import com.siuuuuu.logly_backend.domain.auth.mapper.UserMapper;
import com.siuuuuu.logly_backend.domain.auth.repository.RefreshTokenRepository;
import com.siuuuuu.logly_backend.domain.auth.repository.UserRepository;
import com.siuuuuu.logly_backend.domain.category.service.CategoryService;
import com.siuuuuu.logly_backend.domain.record.mapper.RecordMapper;
import com.siuuuuu.logly_backend.domain.trip.mapper.TripMapper;
import com.siuuuuu.logly_backend.global.exception.CustomException;
import com.siuuuuu.logly_backend.global.exception.ErrorCode;
import com.siuuuuu.logly_backend.global.util.FileStorageService;
import com.siuuuuu.logly_backend.global.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserMapper userMapper;
    private final RecordMapper recordMapper;
    private final TripMapper tripMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final FileStorageService fileStorageService;
    private final CategoryService categoryService;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .provider(User.Provider.LOCAL)
                .build();

        userRepository.save(user);
        categoryService.seedDefaults(user.getId());

        return buildAuthResponse(user.getId(), user.getEmail(), user.getNickname(), null);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        UserQueryDto user = userMapper.findByEmail(request.getEmail());

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_CREDENTIALS);
        }

        return buildAuthResponse(user.getId(), user.getEmail(), user.getNickname(), user.getProfileImageUrl());
    }

    @Transactional
    public AccessTokenResponse reissue(TokenReissueRequest request) {
        String token = request.getRefreshToken();

        if (!jwtUtil.isValid(token)) {
            throw new CustomException(ErrorCode.INVALID_TOKEN);
        }

        Long userId = jwtUtil.getUserId(token);
        UserQueryDto user = userMapper.findById(userId);

        if (user == null) {
            throw new CustomException(ErrorCode.USER_NOT_FOUND);
        }

        String newAccessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail());
        return AccessTokenResponse.builder().accessToken(newAccessToken).build();
    }

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(Long userId) {
        UserQueryDto user = userMapper.findById(userId);
        if (user == null) {
            throw new CustomException(ErrorCode.USER_NOT_FOUND);
        }
        return ProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }

    @Transactional
    public ProfileResponse updateProfile(Long userId, String nickname, MultipartFile profileImage) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (StringUtils.hasText(nickname)) {
            user.updateNickname(nickname);
        }

        if (profileImage != null && !profileImage.isEmpty()) {
            String imageUrl = fileStorageService.upload(profileImage, "profiles");
            user.updateProfileImageUrl(imageUrl);
        }

        return ProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }

    @Transactional(readOnly = true)
    public StatsResponse getStats(Long userId) {
        long recordCount = recordMapper.countByUserId(userId);
        long tripCount = tripMapper.countByUserId(userId);
        long diaryCount = recordMapper.countDiaryByUserId(userId);

        return StatsResponse.builder()
                .recordCount(recordCount)
                .tripCount(tripCount)
                .diaryCount(diaryCount)
                .build();
    }

    @Transactional
    public void updatePushToken(Long userId, String token) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        user.updateExpoPushToken(token);
    }

    private AuthResponse buildAuthResponse(Long userId, String email, String nickname, String profileImageUrl) {
        String accessToken = jwtUtil.generateAccessToken(userId, email);
        String refreshToken = jwtUtil.generateRefreshToken(userId, email);

        // 기존 토큰 삭제 후 새로 저장
        refreshTokenRepository.deleteByUserId(userId);
        refreshTokenRepository.save(RefreshToken.builder()
                .token(refreshToken)
                .userId(userId)
                .expiresAt(LocalDateTime.now().plusSeconds(refreshExpiration / 1000))
                .build());

        return AuthResponse.builder()
                .userId(userId)
                .nickname(nickname)
                .profileImageUrl(profileImageUrl)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }
}
