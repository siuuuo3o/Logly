package com.siuuuuu.logly_backend.domain.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CombinedOAuth2UserService extends DefaultOAuth2UserService {

    private final KakaoOAuth2UserService kakaoOAuth2UserService;
    private final GoogleOAuth2UserService googleOAuth2UserService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        return switch (registrationId) {
            case "kakao" -> kakaoOAuth2UserService.loadUser(userRequest);
            case "google" -> googleOAuth2UserService.loadUser(userRequest);
            default -> super.loadUser(userRequest);
        };
    }
}
