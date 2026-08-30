package com.interviewer.dto;

import com.interviewer.entity.JobDescription;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class JobDescriptionResponse {
    private Long id;
    private String title;
    private String company;
    private String description;
    private String experienceLevel;
    private String location;
    private String employmentType;
    private LocalDateTime createdAt;

    public static JobDescriptionResponse from(JobDescription jd) {
        return JobDescriptionResponse.builder()
                .id(jd.getId())
                .title(jd.getTitle())
                .company(jd.getCompany())
                .description(jd.getDescription())
                .experienceLevel(jd.getExperienceLevel() != null ? jd.getExperienceLevel().name() : null)
                .location(jd.getLocation())
                .employmentType(jd.getEmploymentType())
                .createdAt(jd.getCreatedAt())
                .build();
    }
}
