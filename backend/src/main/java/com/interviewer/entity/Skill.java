package com.interviewer.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "skills")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private Category category = Category.OTHER;

    @Column(length = 500)
    private String description;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @ManyToMany(mappedBy = "skills")
    @Builder.Default
    private Set<Question> questions = new HashSet<>();

    public enum Category {
        PROGRAMMING_LANGUAGE, FRAMEWORK, DATABASE, CLOUD, DEVOPS,
        DATA_STRUCTURE, ALGORITHM, SYSTEM_DESIGN, SOFT_SKILL, OTHER
    }
}
