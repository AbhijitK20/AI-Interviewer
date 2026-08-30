package com.interviewer.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "interviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private User candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_description_id")
    private JobDescription jobDescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id")
    private Resume resume;

    @Column(nullable = false, length = 200)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Status status = Status.SCHEDULED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private InterviewMode mode = InterviewMode.TEXT;

    @Column(nullable = false)
    @Builder.Default
    private Integer totalQuestions = 10;

    @Column(nullable = false)
    @Builder.Default
    private Integer currentQuestionIndex = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer durationMinutes = 60;

    @Column(length = 500)
    private String notes;

    @Lob
    @Column(columnDefinition = "JSON")
    private String interviewConfig;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    @OneToMany(mappedBy = "interview", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("questionOrder ASC")
    @Builder.Default
    private List<InterviewSession> sessions = new ArrayList<>();

    @OneToOne(mappedBy = "interview", cascade = CascadeType.ALL)
    private Report report;

    public enum Status {
        SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, EXPIRED
    }

    public enum InterviewMode {
        TEXT, VOICE, VIDEO, CODING
    }
}
