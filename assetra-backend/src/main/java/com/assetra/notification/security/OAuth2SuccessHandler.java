package com.assetra.notification.security;

import com.assetra.shared.entity.User;
import com.assetra.shared.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        if (email == null) {
            String login = oAuth2User.getAttribute("login");
            email = login + "@github.com";
        }

        String name = oAuth2User.getAttribute("name");
        if (name == null) {
            name = oAuth2User.getAttribute("login");
        }

        String pictureUrl = oAuth2User.getAttribute("avatar_url");
        if (pictureUrl == null) {
            pictureUrl = oAuth2User.getAttribute("picture");
        }

        final String finalEmail = email;
        final String finalName = name;
        final String finalPicture = pictureUrl;

        User user = userRepository.findByEmail(finalEmail)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setName(finalName);
                    newUser.setEmail(finalEmail);
                    newUser.setRole("USER");
                    newUser.setProvider("oauth2");
                    newUser.setPictureUrl(finalPicture);
                    return userRepository.save(newUser);
                });

        String token = jwtService.generateToken(
                user.getEmail(), user.getRole(), user.getId().toString());

        String role = user.getRole().toUpperCase();

        // Add CORS headers before redirect
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
        response.setHeader("Access-Control-Allow-Credentials", "true");

        String frontendUrl = "http://localhost:5173/oauth2/success?token=" + token + "&role=" + role;
        response.sendRedirect(frontendUrl);
    }
}