package com.interviewer.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private Interview interview;

    @Column(nullable = false)
    private Integer overallScore;

    @Column(length = 20)
    private String overallGrade;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String summary;

    @Lob
    @Column(columnDefinition = "JSON")
    private String skillRadarData;

    @Lob
    @Column(columnDefinition = "JSON")
    private String categoryScores;

    @Lob
    @Column(columnDefinition = "JSON")
    private String strengths;

    @Lob
    @Column(columnDefinition = "JSON")
    private String weaknesses;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String recommendations;

    @Lob
    @Column(columnDefinition = "JSON")
    private String questionBreakdown;

    @Column(length = 30)
    private String recommendationLevel;

    @Column(length = 500)
    private String pdfPath;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
