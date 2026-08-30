package com.interviewer.controller;

import com.interviewer.dto.ReportResponse;
import com.interviewer.entity.Report;
import com.interviewer.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportRepository reportRepository;

    @GetMapping("/{interviewId}")
    public ResponseEntity<?> getReportByInterviewId(@PathVariable Long interviewId) {
        Report report = reportRepository.findByInterviewId(interviewId)
                .orElseThrow(() -> new RuntimeException("Report not found for this interview"));

        ReportResponse response = ReportResponse.builder()
                .id(report.getId())
                .interviewId(report.getInterview().getId())
                .overallScore(report.getOverallScore())
                .overallGrade(report.getOverallGrade())
                .summary(report.getSummary())
                .skillRadarData(report.getSkillRadarData())
                .categoryScores(report.getCategoryScores())
                .strengths(report.getStrengths())
                .weaknesses(report.getWeaknesses())
                .recommendations(report.getRecommendations())
                .recommendationLevel(report.getRecommendationLevel())
                .createdAt(report.getCreatedAt())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{interviewId}/full")
    public ResponseEntity<?> getFullReport(@PathVariable Long interviewId) {
        Report report = reportRepository.findByInterviewId(interviewId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        Map<String, Object> fullReport = new HashMap<>();
        fullReport.put("id", report.getId());
        fullReport.put("interviewId", report.getInterview().getId());
        fullReport.put("overallScore", report.getOverallScore());
        fullReport.put("overallGrade", report.getOverallGrade());
        fullReport.put("summary", report.getSummary());
        fullReport.put("skillRadarData", report.getSkillRadarData());
        fullReport.put("categoryScores", report.getCategoryScores());
        fullReport.put("strengths", report.getStrengths());
        fullReport.put("weaknesses", report.getWeaknesses());
        fullReport.put("recommendations", report.getRecommendations());
        fullReport.put("recommendationLevel", report.getRecommendationLevel());
        fullReport.put("questionBreakdown", report.getQuestionBreakdown());
        fullReport.put("pdfPath", report.getPdfPath());
        fullReport.put("createdAt", report.getCreatedAt());

        return ResponseEntity.ok(fullReport);
    }
}
