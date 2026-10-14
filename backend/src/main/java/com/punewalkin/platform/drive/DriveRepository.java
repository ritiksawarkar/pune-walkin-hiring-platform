package com.punewalkin.platform.drive;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DriveRepository extends JpaRepository<WalkInDrive, String> {

    List<WalkInDrive> findByCompanyId(String companyId);

    List<WalkInDrive> findByCreatedById(String createdById);

    Page<WalkInDrive> findByCompanyId(String companyId, Pageable pageable);

    Page<WalkInDrive> findByApprovalStatus(DriveApprovalStatus approvalStatus, Pageable pageable);

    List<WalkInDrive> findByApprovalStatus(DriveApprovalStatus approvalStatus);

    @Query("SELECT d FROM WalkInDrive d WHERE d.approvalStatus = 'APPROVED' AND d.driveStatus = 'PUBLISHED' AND " +
           "(:search IS NULL OR LOWER(d.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(d.city) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(d.venueAddress) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<WalkInDrive> searchPublishedDrives(@Param("search") String search, Pageable pageable);

    @Query("SELECT d FROM WalkInDrive d WHERE d.approvalStatus = 'APPROVED' AND d.driveStatus = 'PUBLISHED' AND " +
           "(:campusType IS NULL OR d.campusType = :campusType) AND " +
           "(:search IS NULL OR LOWER(d.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(d.city) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(d.venueAddress) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<WalkInDrive> searchPublishedDrivesWithCampus(@Param("search") String search, @Param("campusType") CampusType campusType, Pageable pageable);

    long countByApprovalStatus(DriveApprovalStatus approvalStatus);

    long countByDriveStatus(DriveStatus driveStatus);

    long countByCompanyId(String companyId);

    long countByCompanyIdAndApprovalStatus(String companyId, DriveApprovalStatus approvalStatus);

    Page<WalkInDrive> findByCampusType(CampusType campusType, Pageable pageable);

    Page<WalkInDrive> findByCompanyIdAndCampusType(String companyId, CampusType campusType, Pageable pageable);

    long countByCampusType(CampusType campusType);

    long countByCampusTypeAndApprovalStatus(CampusType campusType, DriveApprovalStatus approvalStatus);
}
