package com.interviewer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewResponse {
    private Long id;
    private String title;
    private String status;
    private String mode;
    private Integer totalQuestions;
    private Integer currentQuestionIndex;
    private Integer durationMinutes;
    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private String jobDescriptionTitle;
    private String companyName;
    private List<SessionResponse> sessions;
}
