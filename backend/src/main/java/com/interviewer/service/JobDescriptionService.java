package com.interviewer.service;

import com.interviewer.dto.JobDescriptionRequest;
import com.interviewer.dto.JobDescriptionResponse;
import com.interviewer.entity.JobDescription;
import com.interviewer.entity.User;
import com.interviewer.repository.JobDescriptionRepository;
import com.interviewer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobDescriptionService {

    private final JobDescriptionRepository jobDescriptionRepository;
    private final UserRepository userRepository;

    @Transactional
    public JobDescriptionResponse create(Long userId, JobDescriptionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        JobDescription.ExperienceLevel level;
        try {
            level = JobDescription.ExperienceLevel.valueOf(
                    request.getExperienceLevel() != null ? request.getExperienceLevel().toUpperCase() : "MID");
        } catch (IllegalArgumentException e) {
            level = JobDescription.ExperienceLevel.MID;
        }

        JobDescription jd = JobDescription.builder()
                .createdBy(user)
                .title(request.getTitle())
                .company(request.getCompany())
                .description(request.getDescription())
                .experienceLevel(level)
                .location(request.getLocation())
                .employmentType(request.getEmploymentType())
                .active(true)
                .build();

        jd = jobDescriptionRepository.save(jd);
        return JobDescriptionResponse.from(jd);
    }

    public List<JobDescriptionResponse> getUserJobDescriptions(Long userId) {
        return jobDescriptionRepository.findByCreatedByIdOrderByCreatedAtDesc(userId).stream()
                .map(JobDescriptionResponse::from)
                .toList();
    }

    public JobDescriptionResponse getJobDescription(Long id) {
        JobDescription jd = jobDescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job description not found"));
        return JobDescriptionResponse.from(jd);
    }

    @Transactional
    public void deleteJobDescription(Long id) {
        JobDescription jd = jobDescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job description not found"));
        jobDescriptionRepository.delete(jd);
    }
}
