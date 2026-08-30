package com.interviewer.controller;

import com.interviewer.dto.*;
import com.interviewer.entity.User;
import com.interviewer.security.JwtUtil;
import com.interviewer.service.InterviewService;
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
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;
    private final JwtUtil jwtUtil;

    @PostMapping("/start")
    public ResponseEntity<InterviewResponse> startInterview(@Valid @RequestBody InterviewStartRequest request) {
        Long userId = getCurrentUserId();
        InterviewResponse response = interviewService.startInterview(userId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{interviewId}/begin")
    public ResponseEntity<InterviewResponse> beginInterview(@PathVariable Long interviewId) {
        InterviewResponse response = interviewService.startInterviewSession(interviewId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{interviewId}/next-question")
    public ResponseEntity<SessionResponse> getNextQuestion(@PathVariable Long interviewId) {
        SessionResponse response = interviewService.getNextQuestion(interviewId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{interviewId}/answer")
    public ResponseEntity<SessionResponse> submitAnswer(
            @PathVariable Long interviewId,
            @Valid @RequestBody AnswerSubmitRequest request) {
        SessionResponse response = interviewService.submitAnswer(interviewId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{interviewId}/end")
    public ResponseEntity<InterviewResponse> endInterview(@PathVariable Long interviewId) {
        InterviewResponse response = interviewService.endInterview(interviewId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<InterviewResponse>> getUserInterviews() {
        Long userId = getCurrentUserId();
        List<InterviewResponse> responses = interviewService.getUserInterviews(userId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{interviewId}")
    public ResponseEntity<InterviewResponse> getInterview(@PathVariable Long interviewId) {
        InterviewResponse response = interviewService.getInterview(interviewId);
        return ResponseEntity.ok(response);
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
