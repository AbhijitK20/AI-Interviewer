package com.interviewer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationResponse {
    private Long id;
    private Integer score;
    private String grade;
    private String feedback;
    private String confidenceLevel;
    private String communicationScore;
    private String technicalDepth;
}
