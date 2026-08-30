package com.interviewer.repository;

import com.interviewer.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByCandidateIdOrderByCreatedAtDesc(Long candidateId);
    List<Interview> findByStatus(Interview.Status status);
    List<Interview> findByCandidateIdAndStatus(Long candidateId, Interview.Status status);
}
