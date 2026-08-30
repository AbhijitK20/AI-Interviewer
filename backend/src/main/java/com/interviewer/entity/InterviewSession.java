package com.interviewer.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "interview_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private Interview interview;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(nullable = false)
    private Integer questionOrder;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String candidateAnswer;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String aiFollowUp;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String followUpAnswer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Status status = Status.PENDING;

    @Column(length = 20)
    private String difficultyUsed;

    @Column(length = 30)
    private String questionType;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime answeredAt;

    @OneToOne(mappedBy = "session", cascade = CascadeType.ALL)
    private Evaluation evaluation;

    public enum Status {
        PENDING, ANSWERED, EVALUATED, SKIPPED
    }
}
