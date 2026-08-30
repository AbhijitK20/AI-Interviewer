package com.interviewer.repository;

import com.interviewer.entity.JobDescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobDescriptionRepository extends JpaRepository<JobDescription, Long> {
    List<JobDescription> findByActiveTrueOrderByCreatedAtDesc();
    List<JobDescription> findByCreatedByIdOrderByCreatedAtDesc(Long userId);
}
