package com.interviewer.repository;

import com.interviewer.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByActiveTrue();
    List<Question> findByTypeAndActiveTrue(Question.Type type);
    List<Question> findByDifficultyAndActiveTrue(Question.Difficulty difficulty);

    @Query("SELECT q FROM Question q JOIN q.skills s WHERE s.id IN :skillIds AND q.active = true")
    List<Question> findBySkillIds(@Param("skillIds") List<Long> skillIds);

    @Query("SELECT q FROM Question q JOIN q.skills s WHERE s.name IN :skillNames AND q.active = true")
    List<Question> findBySkillNames(@Param("skillNames") List<String> skillNames);
}
