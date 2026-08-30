package com.interviewer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class JobDescriptionRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200)
    private String title;

    @NotBlank(message = "Company is required")
    @Size(max = 200)
    private String company;

    @NotBlank(message = "Description is required")
    private String description;

    private String experienceLevel = "MID";

    @Size(max = 100)
    private String location;

    @Size(max = 50)
    private String employmentType;
}
