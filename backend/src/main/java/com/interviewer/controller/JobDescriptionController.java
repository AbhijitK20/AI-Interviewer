package com.interviewer.controller;

import com.interviewer.dto.JobDescriptionRequest;
import com.interviewer.dto.JobDescriptionResponse;
import com.interviewer.security.JwtUtil;
import com.interviewer.service.JobDescriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;

@RestController
@RequestMapping("/api/job-descriptions")
@RequiredArgsConstructor
public class JobDescriptionController {

    private final JobDescriptionService jobDescriptionService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<JobDescriptionResponse> create(@Valid @RequestBody JobDescriptionRequest request) {
        Long userId = getCurrentUserId();
        JobDescriptionResponse response = jobDescriptionService.create(userId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<JobDescriptionResponse>> getUserJobDescriptions() {
        Long userId = getCurrentUserId();
        List<JobDescriptionResponse> responses = jobDescriptionService.getUserJobDescriptions(userId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobDescriptionResponse> getJobDescription(@PathVariable Long id) {
        JobDescriptionResponse response = jobDescriptionService.getJobDescription(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJobDescription(@PathVariable Long id) {
        jobDescriptionService.deleteJobDescription(id);
        return ResponseEntity.ok(java.util.Map.of("message", "Job description deleted"));
    }

    private Long getCurrentUserId() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs != null) {
            String auth = attrs.getRequest().getHeader("Authorization");
            if (auth != null && auth.startsWith("Bearer ")) {
                try {
                    return jwtUtil.extractUserId(auth.substring(7));
                } catch (Exception ignored) {
                }
            }
        }
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return Long.parseLong(authentication.getName());
    }
}
