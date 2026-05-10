package com.siuuuuu.logly_backend.global.config;

import com.siuuuuu.logly_backend.domain.auth.dto.KakaoOAuth2User;
import com.siuuuuu.logly_backend.domain.auth.entity.RefreshToken;
import com.siuuuuu.logly_backend.domain.auth.repository.RefreshTokenRepository;
import com.siuuuuu.logly_backend.global.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.transaction.Transactional;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    @Value("${app.frontend-scheme}")
    private String frontendScheme;

    @Transactional
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        KakaoOAuth2User oAuth2User = (KakaoOAuth2User) authentication.getPrincipal();

        String accessToken = jwtUtil.generateAccessToken(oAuth2User.getUserId(), oAuth2User.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken(oAuth2User.getUserId(), oAuth2User.getEmail());

        refreshTokenRepository.deleteByUserId(oAuth2User.getUserId());
        refreshTokenRepository.save(RefreshToken.builder()
                .token(refreshToken)
                .userId(oAuth2User.getUserId())
                .expiresAt(LocalDateTime.now().plusSeconds(refreshExpiration / 1000))
                .build());

        String redirectUrl = frontendScheme
                + "?accessToken=" + accessToken
                + "&refreshToken=" + refreshToken
                + "&userId=" + oAuth2User.getUserId()
                + "&nickname=" + URLEncoder.encode(oAuth2User.getNickname(), StandardCharsets.UTF_8);

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
