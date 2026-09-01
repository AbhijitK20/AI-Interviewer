package com.interviewer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {
    private Long id;
    private Long interviewId;
    private Integer overallScore;
    private String overallGrade;
    private String summary;
    private String skillRadarData;
    private String categoryScores;
    private String strengths;
    private String weaknesses;
    private String recommendations;
    private String recommendationLevel;
    private String questionBreakdown;
    private LocalDateTime createdAt;
}
