package com.interviewer.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private Type type = Type.TECHNICAL;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Difficulty difficulty = Difficulty.MEDIUM;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String expectedAnswer;

    @Lob
    @Column(columnDefinition = "JSON")
    private String evaluationCriteria;

    @Column(length = 100)
    private String source;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @ManyToMany
    @JoinTable(
        name = "question_skills",
        joinColumns = @JoinColumn(name = "question_id"),
        inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    @Builder.Default
    private Set<Skill> skills = new HashSet<>();

    public enum Type {
        TECHNICAL, BEHAVIORAL, SITUATIONAL, CODING, SYSTEM_DESIGN, STAR
    }

    public enum Difficulty {
        EASY, MEDIUM, HARD, EXPERT
    }
}
