package com.punewalkin.platform.interview;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, String> {

    List<Interview> findByCandidateId(String candidateId);

    List<Interview> findByCandidateIdAndStatus(String candidateId, InterviewStatus status);

    List<Interview> findByCompanyId(String companyId);

    List<Interview> findByDriveId(String driveId);

    List<Interview> findByApplicationId(String applicationId);

    Optional<Interview> findFirstByApplicationId(String applicationId);

    Optional<Interview> findFirstByApplicationIdAndStatusNot(String applicationId, InterviewStatus status);
}
