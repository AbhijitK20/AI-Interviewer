package com.interviewer.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "job_descriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobDescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 200)
    private String company;

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Lob
    @Column(columnDefinition = "JSON")
    private String parsedRequirements;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ExperienceLevel experienceLevel = ExperienceLevel.MID;

    @Column(length = 100)
    private String location;

    @Column(length = 50)
    private String employmentType;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "jobDescription", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<ResumeJdMatch> matches = new HashSet<>();

    public enum ExperienceLevel {
        JUNIOR, MID, SENIOR, LEAD, ARCHITECT
    }
}
