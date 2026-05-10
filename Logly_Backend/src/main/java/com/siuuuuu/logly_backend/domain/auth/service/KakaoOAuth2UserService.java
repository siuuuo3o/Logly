package com.siuuuuu.logly_backend.domain.auth.service;

import com.siuuuuu.logly_backend.domain.auth.dto.KakaoOAuth2User;
import com.siuuuuu.logly_backend.domain.auth.entity.User;
import com.siuuuuu.logly_backend.domain.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class KakaoOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    @SuppressWarnings("unchecked")
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String providerId = String.valueOf(attributes.get("id"));

        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.getOrDefault("kakao_account", Map.of());
        Map<String, Object> profile = (Map<String, Object>) kakaoAccount.getOrDefault("profile", Map.of());

        String email = kakaoAccount.containsKey("email")
                ? (String) kakaoAccount.get("email")
                : "kakao_" + providerId + "@kakao.com";
        String nickname = profile.containsKey("nickname")
                ? (String) profile.get("nickname")
                : "카카오사용자_" + providerId;
        String profileImageUrl = (String) profile.getOrDefault("profile_image_url", null);

        User user = userRepository.findByProviderAndProviderId(User.Provider.KAKAO, providerId)
                .orElseGet(() -> {
                    String uniqueEmail = userRepository.existsByEmail(email)
                            ? "kakao_" + providerId + "@kakao.com" : email;
                    return userRepository.save(User.builder()
                            .email(uniqueEmail)
                            .nickname(nickname)
                            .profileImageUrl(profileImageUrl)
                            .provider(User.Provider.KAKAO)
                            .providerId(providerId)
                            .build());
                });

        return new KakaoOAuth2User(user.getId(), user.getEmail(), user.getNickname(),
                user.getProfileImageUrl(), attributes);
    }
}
