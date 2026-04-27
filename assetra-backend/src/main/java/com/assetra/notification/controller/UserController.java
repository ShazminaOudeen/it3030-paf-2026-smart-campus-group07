package com.assetra.notification.controller;

import com.assetra.notification.dto.CreateStaffRequest;
import com.assetra.notification.security.JwtService;
import com.assetra.shared.entity.User;
import com.assetra.shared.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // GET /api/users — get all users (Admin only)
    // Returns: 200 OK
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // POST /api/users/create-staff — create technician or admin account
    // Returns: 201 Created, 400 Bad Request, 409 Conflict
    @PostMapping("/create-staff")
    public ResponseEntity<?> createStaff(@RequestBody CreateStaffRequest request) {

        // 400 Bad Request — missing fields
        if (request.getName() == null || request.getName().trim().isEmpty() ||
            request.getEmail() == null || request.getEmail().trim().isEmpty() ||
            request.getPassword() == null || request.getPassword().trim().isEmpty() ||
            request.getRole() == null || request.getRole().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Name, email, password and role are required"));
        }

        // 409 Conflict — email already taken
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Email already registered"));
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole().toUpperCase());
        userRepository.save(user);

        // 201 Created
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Staff account created successfully"));
    }

    // PUT /api/users/{id}/role — change user role (Admin only)
    // Returns: 200 OK, 400 Bad Request, 404 Not Found
    @PutMapping("/{id}/role")
    public ResponseEntity<?> updateRole(@PathVariable UUID id,
                                        @RequestBody Map<String, String> body) {
        // 400 Bad Request — missing role
        if (body.get("role") == null || body.get("role").trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Role is required"));
        }

        // 404 Not Found — user doesn't exist
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        user.setRole(body.get("role").toUpperCase());
        userRepository.save(user);

        // 200 OK
        return ResponseEntity.ok(Map.of("message", "Role updated successfully"));
    }

    // DELETE /api/users/{id} — delete a user (Admin only)
    // Returns: 204 No Content, 404 Not Found
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable UUID id) {

        // 404 Not Found — user doesn't exist
        if (!userRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        userRepository.deleteById(id);

        // 204 No Content — deleted successfully, no body
        return ResponseEntity.noContent().build();
    }

    // PUT /api/users/{id} — update profile (name and phone)
    // Returns: 200 OK, 400 Bad Request, 404 Not Found
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable UUID id,
                                           @RequestBody Map<String, String> body) {

        // 400 Bad Request — nothing to update
        if (!body.containsKey("name") && !body.containsKey("phone")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "At least name or phone must be provided"));
        }

        // 404 Not Found — user doesn't exist
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        if (body.containsKey("name") && !body.get("name").trim().isEmpty()) {
            user.setName(body.get("name"));
        }
        if (body.containsKey("phone")) {
            user.setPhone(body.get("phone"));
        }

        userRepository.save(user);

        // 200 OK — return updated user data
        return ResponseEntity.ok(Map.of(
                "id",    user.getId().toString(),
                "name",  user.getName(),
                "email", user.getEmail(),
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "role",  user.getRole()
        ));
    }
}