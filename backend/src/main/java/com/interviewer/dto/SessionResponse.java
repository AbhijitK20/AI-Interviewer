package com.interviewer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionResponse {
    private Long id;
    private Integer questionOrder;
    private String questionText;
    private String questionType;
    private String difficulty;
    private String expectedAnswer;
    private String candidateAnswer;
    private String aiFollowUp;
    private String followUpAnswer;
    private String status;
    private EvaluationResponse evaluation;
}
