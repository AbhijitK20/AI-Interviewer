package com.interviewer.repository;

import com.interviewer.entity.ResumeJdMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResumeJdMatchRepository extends JpaRepository<ResumeJdMatch, Long> {
    List<ResumeJdMatch> findByResumeId(Long resumeId);
    List<ResumeJdMatch> findByJobDescriptionId(Long jobDescriptionId);
}
