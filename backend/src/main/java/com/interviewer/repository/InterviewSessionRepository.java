package com.interviewer.repository;

import com.interviewer.entity.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {
    List<InterviewSession> findByInterviewIdOrderByQuestionOrderAsc(Long interviewId);
    Optional<InterviewSession> findByInterviewIdAndQuestionOrder(Long interviewId, Integer questionOrder);
}
