package com.interviewer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InterviewStartRequest {

    @NotNull(message = "Job description ID is required")
    private Long jobDescriptionId;

    private Long resumeId;

    @NotBlank(message = "Title is required")
    private String title;

    private String mode = "TEXT";
    private Integer totalQuestions = 10;
    private Integer durationMinutes = 60;
    private String notes;
}
