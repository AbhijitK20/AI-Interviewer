package com.interviewer.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "evaluations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private InterviewSession session;

    @Column(nullable = false)
    private Integer score;

    @Column(length = 20)
    private String grade;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Lob
    @Column(columnDefinition = "JSON")
    private String skillScores;

    @Lob
    @Column(columnDefinition = "JSON")
    private String strengths;

    @Lob
    @Column(columnDefinition = "JSON")
    private String weaknesses;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String improvementSuggestions;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String sampleResponse;

    @Column(length = 30)
    private String confidenceLevel;

    @Column(length = 30)
    private String communicationScore;

    @Column(length = 30)
    private String technicalDepth;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
