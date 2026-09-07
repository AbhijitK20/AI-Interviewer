package com.interviewer.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ProfileResponse {
    Long id;
    String email;
    String fullName;
    String phone;
    String profileSummary;
    String linkedinUrl;
    String githubUrl;
    String role;
}
