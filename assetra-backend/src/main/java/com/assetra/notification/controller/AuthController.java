package com.assetra.notification.controller;

import com.assetra.notification.dto.AuthResponse;
import com.assetra.notification.security.JwtService;
import com.assetra.shared.entity.User;
import com.assetra.shared.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    // This is called by Spring after Google OAuth login succeeds
    @GetMapping("/callback")
    public ResponseEntity<AuthResponse> callback(@AuthenticationPrincipal OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String token = jwtService.generateToken(user.getEmail(), user.getRole());
        return ResponseEntity.ok(new AuthResponse(
                token, user.getEmail(), user.getName(), user.getRole(), user.getPictureUrl()
        ));
    }

    // This is called by the frontend with a JWT token to get current user info
    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser(
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7); // Remove "Bearer "
        String email = jwtService.extractEmail(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String newToken = jwtService.generateToken(user.getEmail(), user.getRole());
        return ResponseEntity.ok(new AuthResponse(
                newToken, user.getEmail(), user.getName(), user.getRole(), user.getPictureUrl()
        ));
    }
}