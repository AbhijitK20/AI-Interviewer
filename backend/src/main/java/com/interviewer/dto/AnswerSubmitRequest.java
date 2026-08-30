package com.interviewer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AnswerSubmitRequest {

    @NotNull(message = "Session ID is required")
    private Long sessionId;

    @NotBlank(message = "Answer is required")
    private String answer;

    private String followUpAnswer;
}
