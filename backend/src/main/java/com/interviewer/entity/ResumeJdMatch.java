package com.interviewer.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "resume_jd_matches")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeJdMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_description_id", nullable = false)
    private JobDescription jobDescription;

    @Column(nullable = false)
    private Double matchScore;

    @Lob
    @Column(columnDefinition = "JSON")
    private String matchedSkills;

    @Lob
    @Column(columnDefinition = "JSON")
    private String missingSkills;

    @Lob
    @Column(columnDefinition = "JSON")
    private String analysisDetails;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
