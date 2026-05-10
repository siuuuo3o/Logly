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
public class GoogleOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String providerId = (String) attributes.get("sub");
        String email = (String) attributes.getOrDefault("email", "google_" + providerId + "@google.com");
        String nickname = (String) attributes.getOrDefault("name", "구글사용자_" + providerId);
        String profileImageUrl = (String) attributes.getOrDefault("picture", null);

        User user = userRepository.findByProviderAndProviderId(User.Provider.GOOGLE, providerId)
                .orElseGet(() -> {
                    String uniqueEmail = userRepository.existsByEmail(email)
                            ? "google_" + providerId + "@google.com" : email;
                    return userRepository.save(User.builder()
                            .email(uniqueEmail)
                            .nickname(nickname)
                            .profileImageUrl(profileImageUrl)
                            .provider(User.Provider.GOOGLE)
                            .providerId(providerId)
                            .build());
                });

        return new KakaoOAuth2User(user.getId(), user.getEmail(), user.getNickname(),
                user.getProfileImageUrl(), attributes);
    }
}
