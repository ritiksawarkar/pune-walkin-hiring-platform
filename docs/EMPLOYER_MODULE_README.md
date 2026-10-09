# Pune Walk-In Drive & Hiring Management Platform
## Employer & Recruitment Module — Developer Documentation

**Module Owner:** Ritik (Lead Recruiter & Employer Module)  
**Assigned Responsibility:** Employer Dashboard, Company Profile, Jobs Management, Walk-In Drive Management, Approval Status Tracking, Candidate Screening & Shortlisting, and Recruitment Pipeline.  
**Tech Stack:** React 19, Vite, Tailwind CSS v4, React Router DOM v7 (Frontend-Only, Zero Backend / Zero MySQL).

---

## 1. Module Overview

The **Employer & Recruitment Module** provides Pune-based employers and technical hiring teams with a complete suite to manage walk-in recruitment events, publish job specifications, coordinate campus and IT park venues, review candidate turnouts, shortlist applicants, and track candidates across the recruitment pipeline.

### Core Recruitment Workflow
$$\text{Company Profile} \longrightarrow \text{Job Creation} \longrightarrow \text{Walk-In Drive Scheduling} \longrightarrow \text{Submit for Admin Verification (Sahil)} \longrightarrow \text{Approved \& Live (Yadit)} \longrightarrow \text{Candidate Registrations} \longrightarrow \text{Screening \& Shortlisting (Ritik)} \longrightarrow \text{Interview Queue Handoff (Sahil)} \longrightarrow \text{Selection / Rejection / Hold}$$

---

## 2. Team Division & Shared Integration Contracts

| Developer | Assigned Domain | Integration Touchpoint with Ritik's Module |
|---|---|---|
| **Ritik** | **Employer & Recruitment Module** | Owns company profile, job vacancies, drive scheduling, candidate shortlisting, status transitions, and recruitment pipeline. |
| **Yadit** | Homepage, Auth UI, Candidate Profile, Drive Discovery, Walk-In Registration | Consumes approved drives (`approvalStatus === 'Approved'`). Provides candidate registrations matching the agreed schema (`candidateId`, `candidateName`, `email`, `driveId`, `jobId`, `tokenNumber`, `qualification`, `skills`). |
| **Sahil** | Admin Dashboard, Drive Approvals, Interview Scheduling, Queue Management & Evaluations | Sahil's admin panel reviews drives submitted with `Pending Approval` and sets `Approved` or `Changes Requested`. Sahil's interview queue consumes candidates when Ritik sets `status: 'Interview Scheduled'`. |

---

## 3. Route Map

All employer routes are nested under the responsive `EmployerLayout`:

| Route | Page Component | Description |
|---|---|---|
| `/employer/dashboard` | `EmployerDashboardPage` | Real-time stats, upcoming approved drives, recent registrations & activities. |
| `/employer/company` | `CompanyProfilePage` | Corporate details, office address, active Pune hubs, HR credentials. |
| `/employer/company/edit` | `CompanyEditPage` | Validated edit form for company information and contact details. |
| `/employer/jobs` | `JobsPage` | Searchable, filterable table of vacancies with View, Edit, and Archive actions. |
| `/employer/jobs/new` | `JobCreatePage` | Job creation form with qualifications, experience, and eligibility criteria. |
| `/employer/jobs/:jobId` | `JobDetailsPage` | Role description, skills badges, and associated walk-in drives list. |
| `/employer/jobs/:jobId/edit` | `JobEditPage` | Modify role criteria, salary, and vacancy count. |
| `/employer/drives` | `DrivesPage` | Listing of walk-in drives with approval badges, capacity, and action shortcuts. |
| `/employer/drives/new` | `DriveCreatePage` | Schedule drive with Pune venue, rounds, capacity, and submit for approval. |
| `/employer/drives/:driveId` | `DriveDetailsPage` | Schedule breakdown, Pune venue directions, selection rounds, and approval state. |
| `/employer/drives/:driveId/edit` | `DriveEditPage` | Revise drive parameters or address admin feedback. |
| `/employer/drives/:driveId/candidates` | `DriveCandidatesPage` | Scoped list of registered candidates for a specific drive with quick shortlisting. |
| `/employer/candidates` | `RecruiterApplicationsPage` | Global applicant pool across all drives and vacancies. |
| `/employer/applications` | `RecruiterApplicationsPage` | Screening, simulated resume preview, and status audit trail. |
| `/employer/pipeline` | `RecruitmentPipelinePage` | Stage-by-stage candidate funnel with percentage conversion metrics. |

---

## 4. Features & Implementation Details

### Phase 1: Employer Dashboard
- Welcome card with active company name and verified badge.
- Dynamic metric cards calculated directly from shared mock data:
  - Total Jobs & Active Jobs
  - Total Walk-In Drives & Approved Drives
  - Drives Pending Admin Approval
  - Total Registered Candidates & Shortlisted Count
  - Final Selections / Offers
- Upcoming approved drives with registration capacity progress bar.
- Recent recruitment activity stream.
- Recent candidate registrations table with quick "Review" shortcut.

### Phase 2: Employer Layout & Navigation
- Modern dark-surfaced sidebar (`EmployerSidebar`) with brand icon, active route highlighting, and recruiter tag (`Ritik Sawarkar`).
- Mobile responsive off-canvas drawer with toggle button.
- Dynamic header (`EmployerHeader`) with contextual page titles, quick buttons (`+ Post Job`, `+ New Walk-In`), and a demo data reset utility.
- Breadcrumb navigation for nested sub-pages.

### Phase 3: Company Profile Management
- Displays verified corporate details, headquarters at Magarpatta Cybercity Pune, and active Pune interview hubs (Hinjawadi, Kharadi, Magarpatta).
- Contact info: official recruitment email, phone, and website.
- Edit form with field-level validations (mandatory checks, regex email validation).
- Saves reactively into local storage.

### Phase 4: Job Management
- Jobs list with multi-facet filters: Search keyword, Status (`Active`, `Draft`, `Archived`), Department, and Sorting.
- Create & Edit forms with validation:
  - Title, department, employment type, work mode, Pune location.
  - Positive vacancy count, min/max experience range validation.
  - Comma-separated technical skills badges.
- Job Details page displaying full description, qualifications, and associated walk-in drives.

### Phase 5 & 6: Walk-In Drive Management & Approval Lifecycle
- Scheduling form with:
  - Associated active job dropdown.
  - Interview date, start time, end time (validated end time > start time), and cutoff deadline.
  - Pune venue name, street address, and instructions.
  - Selection rounds list & required document checklist.
  - Vacancy and maximum candidate registration capacity.
- **Employer Approval Lifecycle (Admin coordination with Sahil):**
  - `Draft`: Drive created by employer. Employer can edit or click **Submit for Approval**.
  - `Pending Approval`: Drive locked for administrative verification by Sahil.
  - `Changes Requested`: Shows reviewer feedback from Sahil; enables employer to edit and resubmit revisions.
  - `Approved`: Live on platform for candidate registrations.
  - `Cancelled`: Employer can cancel an active drive with a reason.
  *(Employers cannot self-approve their own drives, maintaining role separation with Sahil).*

### Phase 7 & 8: Candidate Registrations, Shortlisting & Status
- Drive-wise candidate view (`/employer/drives/:driveId/candidates`) and global application view (`/employer/applications`).
- Candidate details modal showing:
  - Token number, registration slot, contact numbers.
  - College / university credentials (SPPU, PCCOE, COEP, MIT, Sinhgad).
  - Skills chips, experience summary, and simulated PDF resume preview.
  - Status change audit history with timestamps and notes.
- Status updates modal supporting:
  - `Under Review`
  - `Shortlisted`
  - `Interview Scheduled` (Handoff notice to Sahil's queue)
  - `Selected`
  - `On Hold` (requires hold justification)
  - `Rejected` (requires rejection reason)

### Phase 9: Recruitment Pipeline
- Funnel distribution bar showing percentage conversion across all 7 recruitment stages.
- Filter pipeline by specific drive or aggregate across all company drives.
- Stage cards with direct links to filtered candidate review lists.

---

## 5. Storage & Mock Service Architecture

All entities use centralized frontend mock services backed by `localStorage` persistence (`storageService.js`):
- `companyService.js`: Profile retrieval and updates.
- `jobService.js`: CRUD operations, filtering, and archiving.
- `driveService.js`: Scheduling, venue updates, approval submissions, and cancellation.
- `recruitmentService.js`: Candidate queries, status transitions with audit logs, and pipeline aggregations.

*Note: A "Reset Demo" button in the header allows restoring sample data anytime.*

---

## 6. How to Run Locally

```bash
cd frontend
npm install
npm run dev
```

Visit: `http://localhost:5173/employer/dashboard`
