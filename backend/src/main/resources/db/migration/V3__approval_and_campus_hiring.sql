-- =============================================================================
-- Pune Walk-In Drive & Hiring Management Platform
-- Database Migration: V3__approval_and_campus_hiring.sql
-- =============================================================================

-- 1. Extend users table for approval and rejection audit details
ALTER TABLE users ADD COLUMN rejection_reason TEXT NULL;
ALTER TABLE users ADD COLUMN approved_by VARCHAR(36) NULL;
ALTER TABLE users ADD COLUMN approved_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN rejected_at TIMESTAMP NULL;

-- 2. Extend candidate_profiles table for college affiliation and eligibility criteria
ALTER TABLE candidate_profiles ADD COLUMN college_name VARCHAR(200) NULL;
ALTER TABLE candidate_profiles ADD COLUMN degree VARCHAR(100) NULL;
ALTER TABLE candidate_profiles ADD COLUMN branch VARCHAR(100) NULL;
ALTER TABLE candidate_profiles ADD COLUMN graduation_year VARCHAR(10) NULL;
ALTER TABLE candidate_profiles ADD COLUMN cgpa DECIMAL(4, 2) NULL;
ALTER TABLE candidate_profiles ADD COLUMN backlogs INT NOT NULL DEFAULT 0;

-- 3. Extend walk_in_drives table for On-Campus vs Off-Campus classification and eligibility
ALTER TABLE walk_in_drives ADD COLUMN campus_type VARCHAR(30) NOT NULL DEFAULT 'OFF_CAMPUS';
ALTER TABLE walk_in_drives ADD COLUMN eligible_degree VARCHAR(150) NULL;
ALTER TABLE walk_in_drives ADD COLUMN eligible_branch VARCHAR(150) NULL;
ALTER TABLE walk_in_drives ADD COLUMN eligible_graduation_year_min INT NULL;
ALTER TABLE walk_in_drives ADD COLUMN eligible_graduation_year_max INT NULL;
ALTER TABLE walk_in_drives ADD COLUMN min_cgpa DECIMAL(4, 2) NULL;
ALTER TABLE walk_in_drives ADD COLUMN max_backlogs INT NULL;

-- 4. Create normalized table for multiple eligible colleges per walk-in drive
CREATE TABLE IF NOT EXISTS drive_eligible_colleges (
    id VARCHAR(36) PRIMARY KEY,
    drive_id VARCHAR(36) NOT NULL,
    college_name VARCHAR(200) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dec_drive FOREIGN KEY (drive_id) REFERENCES walk_in_drives(id) ON DELETE CASCADE,
    INDEX idx_dec_drive (drive_id),
    INDEX idx_dec_college (college_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Extend jobs table for campus classification
ALTER TABLE jobs ADD COLUMN campus_type VARCHAR(30) NOT NULL DEFAULT 'OFF_CAMPUS';

-- 6. Populate college profile details for seeded demo candidates
UPDATE candidate_profiles SET 
    college_name = 'Savitribai Phule Pune University (SPPU)',
    degree = 'Bachelor of Engineering (B.E.)',
    branch = 'Computer Engineering',
    graduation_year = '2025',
    cgpa = 8.4,
    backlogs = 0
WHERE id = 'cand-101';

UPDATE candidate_profiles SET 
    college_name = 'Pimpri Chinchwad College of Engineering (PCCOE)',
    degree = 'B.Tech',
    branch = 'Information Technology',
    graduation_year = '2025',
    cgpa = 8.8,
    backlogs = 0
WHERE id = 'cand-102';

UPDATE candidate_profiles SET 
    college_name = 'MIT World Peace University (MIT-WPU), Pune',
    degree = 'MCA',
    branch = 'Computer Applications',
    graduation_year = '2024',
    cgpa = 7.9,
    backlogs = 0
WHERE id = 'cand-103';

UPDATE candidate_profiles SET 
    college_name = 'COEP Technological University, Pune',
    degree = 'B.E.',
    branch = 'Electronics & Telecommunication',
    graduation_year = '2024',
    cgpa = 8.1,
    backlogs = 0
WHERE id = 'cand-104';
