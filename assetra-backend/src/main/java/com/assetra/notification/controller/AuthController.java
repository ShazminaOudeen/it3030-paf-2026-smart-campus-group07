package com.assetra.notification.controller;

import com.assetra.notification.dto.AuthResponse;
import com.assetra.notification.dto.RegisterRequest;
import com.assetra.notification.security.JwtService;
import com.assetra.shared.entity.User;
import com.assetra.shared.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Email already registered"));
        }
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");
        userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Registration successful"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid email or password"));
     }

        if (user.getPasswordHash() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "This account uses OAuth login. Please use Google or GitHub to sign in."));
     }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid email or password"));
     }

        String token = jwtService.generateToken(
            user.getEmail(), user.getRole(), user.getId().toString());

        return ResponseEntity.ok(new AuthResponse(
            token, user.getEmail(), user.getName(),
            user.getRole(), user.getPictureUrl(), user.getId().toString()));
    }
    @GetMapping("/generate-hash")
    public ResponseEntity<?> generateHash() {
        String hash = passwordEncoder.encode("Admin@123");
    return ResponseEntity.ok(Map.of("hash", hash));
    }
    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(new AuthResponse(
                token, user.getEmail(), user.getName(),
                user.getRole(), user.getPictureUrl(), user.getId().toString()));
    }
}