-- =============================================================================
-- Pune Walk-In Drive & Hiring Management Platform
-- Database Migration: V4__interviews_and_access_passes.sql
-- =============================================================================

-- 1. Extend interviews table for virtual meetings, reporting notes, and email delivery auditing
ALTER TABLE interviews ADD COLUMN meeting_link VARCHAR(255) NULL;
ALTER TABLE interviews ADD COLUMN reporting_instructions TEXT NULL;
ALTER TABLE interviews ADD COLUMN email_status VARCHAR(30) NOT NULL DEFAULT 'NOT_ATTEMPTED';
ALTER TABLE interviews ADD COLUMN email_sent_at TIMESTAMP NULL;
ALTER TABLE interviews ADD COLUMN email_error TEXT NULL;

-- 2. Create interview_passes table for unique QR access passes
CREATE TABLE IF NOT EXISTS interview_passes (
    id VARCHAR(36) PRIMARY KEY,
    pass_code VARCHAR(64) NOT NULL UNIQUE,
    interview_id VARCHAR(36) NOT NULL UNIQUE,
    application_id VARCHAR(36) NOT NULL,
    candidate_id VARCHAR(36) NOT NULL,
    company_id VARCHAR(36) NOT NULL,
    drive_id VARCHAR(36) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    qr_payload VARCHAR(255) NOT NULL,
    used_at TIMESTAMP NULL,
    verified_by VARCHAR(36) NULL,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pass_interview FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
    CONSTRAINT fk_pass_app FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    CONSTRAINT fk_pass_candidate FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_pass_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_pass_drive FOREIGN KEY (drive_id) REFERENCES walk_in_drives(id) ON DELETE CASCADE,
    INDEX idx_pass_code (pass_code),
    INDEX idx_pass_status (status),
    INDEX idx_pass_candidate (candidate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Seed initial access pass for the demo interview int-001 (Pooja Rao / TechSprint)
INSERT INTO interview_passes (
    id, pass_code, interview_id, application_id, candidate_id, company_id, drive_id,
    status, qr_payload, created_at, updated_at
) VALUES (
    'pass-int-001',
    'PASS-2026-INT001',
    'int-001',
    'app-002',
    'cand-102',
    'comp-pune-01',
    'drive-01',
    'ACTIVE',
    'PUNE-PASS:PASS-2026-INT001',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
