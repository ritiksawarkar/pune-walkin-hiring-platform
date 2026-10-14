package com.punewalkin.platform.interview;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewPassRepository extends JpaRepository<InterviewPass, String> {

    Optional<InterviewPass> findByPassCode(String passCode);

    Optional<InterviewPass> findByInterviewId(String interviewId);

    Optional<InterviewPass> findFirstByApplicationId(String applicationId);

    List<InterviewPass> findByCandidateId(String candidateId);

    List<InterviewPass> findByCompanyId(String companyId);
}
