package com.interviewer.controller;

import com.interviewer.dto.ProfileResponse;
import com.interviewer.dto.ProfileUpdateRequest;
import com.interviewer.entity.User;
import com.interviewer.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> getProfile(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(toResponse(findUser(principal)));
    }

    @PutMapping("/profile")
    public ResponseEntity<ProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody ProfileUpdateRequest request) {
        User user = findUser(principal);
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setProfileSummary(request.getProfileSummary());
        user.setLinkedinUrl(request.getLinkedinUrl());
        user.setGithubUrl(request.getGithubUrl());
        return ResponseEntity.ok(toResponse(userRepository.save(user)));
    }

    private User findUser(UserDetails principal) {
        if (principal == null) throw new RuntimeException("Authenticated user required");
        return userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private ProfileResponse toResponse(User user) {
        return ProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .profileSummary(user.getProfileSummary())
                .linkedinUrl(user.getLinkedinUrl())
                .githubUrl(user.getGithubUrl())
                .role(user.getRole().name())
                .build();
    }
}
