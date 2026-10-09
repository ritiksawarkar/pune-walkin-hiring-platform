import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { jobService } from "../../../services/jobService";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { AlertCircleIcon, PlusIcon } from "../../../components/common/Icons";

export function DriveForm({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  isEdit = false,
  preselectedJobId = "",
}) {
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const [formData, setFormData] = useState({
    title: initialData.title || "",
    jobId: initialData.jobId || preselectedJobId || "",
    description: initialData.description || "",
    interviewDate:
      initialData.interviewDate ||
      new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    startTime: initialData.startTime || "09:30",
    endTime: initialData.endTime || "17:00",
    registrationDeadline:
      initialData.registrationDeadline ||
      new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
    venueName: initialData.venueName || "TechSprint Delivery Centre, Pune",
    venueAddress:
      initialData.venueAddress ||
      "Tower B, Ground Floor Auditorium, Cybercity Magarpatta, Hadapsar",
    city: initialData.city || "Pune",
    state: initialData.state || "Maharashtra",
    pincode: initialData.pincode || "411028",
    vacancies: initialData.vacancies || 10,
    maxRegistrations: initialData.maxRegistrations || 100,
    selectionRounds: Array.isArray(initialData.selectionRounds)
      ? initialData.selectionRounds.join("\n")
      : initialData.selectionRounds ||
        "Round 1: Online Technical Aptitude & Coding (45 mins)\nRound 2: Technical Hands-on Discussion (45 mins)\nRound 3: HR & Cultural Fitment (20 mins)",
    requiredDocuments: Array.isArray(initialData.requiredDocuments)
      ? initialData.requiredDocuments.join("\n")
      : initialData.requiredDocuments ||
        "Two printed copies of updated resume\nOriginal Government Photo ID (Aadhaar / PAN Card)\nDegree marks sheets / provisional certificate\n2 Passport-sized photographs",
    recruiterName: initialData.recruiterName || "Ritik Sawarkar",
    recruiterEmail: initialData.recruiterEmail || "ritik.s@techsprint.io",
    recruiterPhone: initialData.recruiterPhone || "+91 98230 45678",
    candidateInstructions:
      initialData.candidateInstructions ||
      "Please report 30 minutes before your slot. Formal dress code is mandatory. Carry physical government ID for campus security entry.",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function loadJobs() {
      try {
        setLoadingJobs(true);
        const data = await jobService.getJobs();
        const activeOnly = data.filter((j) => j.status !== "Archived");
        setJobs(activeOnly);

        // If no jobId selected yet, default to first or preselected
        if (!formData.jobId && activeOnly.length > 0) {
          const match = preselectedJobId
            ? activeOnly.find((j) => j.id === preselectedJobId)
            : activeOnly[0];
          if (match) {
            setFormData((prev) => ({ ...prev, jobId: match.id }));
          }
        }
      } catch (err) {
        console.error("Error loading jobs for drive", err);
      } finally {
        setLoadingJobs(false);
      }
    }
    loadJobs();
  }, [preselectedJobId, formData.jobId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = "Drive title is required.";
    if (!formData.jobId) errs.jobId = "An associated job role must be selected.";
    if (!formData.description.trim()) errs.description = "Drive description is required.";
    if (!formData.interviewDate) errs.interviewDate = "Interview date is required.";
    if (!formData.startTime) errs.startTime = "Start time is required.";
    if (!formData.endTime) errs.endTime = "End time is required.";
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      errs.endTime = "End time must be later than start time.";
    }
    if (!formData.registrationDeadline) {
      errs.registrationDeadline = "Registration deadline is required.";
    } else if (formData.registrationDeadline > formData.interviewDate) {
      errs.registrationDeadline = "Registration deadline must be on or before the interview date.";
    }
    if (!formData.venueName.trim()) errs.venueName = "Venue name is required.";
    if (!formData.venueAddress.trim()) errs.venueAddress = "Venue address is required.";
    if (Number(formData.vacancies) <= 0) {
      errs.vacancies = "Vacancies must be a positive integer.";
    }
    if (Number(formData.maxRegistrations) <= 0) {
      errs.maxRegistrations = "Maximum registrations must be greater than zero.";
    }
    if (Number(formData.maxRegistrations) < Number(formData.vacancies)) {
      errs.maxRegistrations = "Registration capacity should be equal to or greater than vacancy count.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAction = (submitDirectly = false) => {
    if (!validate()) return;

    const selectedJob = jobs.find((j) => j.id === formData.jobId);
    const submission = {
      ...formData,
      jobTitle: selectedJob ? selectedJob.title : "Junior Full Stack Developer",
      vacancies: Number(formData.vacancies),
      maxRegistrations: Number(formData.maxRegistrations),
      selectionRounds: formData.selectionRounds.split("\n").filter(Boolean),
      requiredDocuments: formData.requiredDocuments.split("\n").filter(Boolean),
      submitDirectly,
    };
    onSubmit(submission);
  };

  if (!loadingJobs && jobs.length === 0) {
    return (
      <Card padding="p-8" className="text-center">
        <AlertCircleIcon className="h-10 w-10 text-amber-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900">
          No Active Jobs Found
        </h3>
        <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
          Walk-in interview drives must be tied to an existing job opening. Please create an active job position first before scheduling a walk-in drive.
        </p>
        <div className="mt-5">
          <Link to="/employer/jobs/new">
            <Button variant="primary" icon={PlusIcon}>
              Create Job First
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card title="Drive Basics & Role Association" padding="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Associated Job Opening"
              as="select"
              name="jobId"
              value={formData.jobId}
              onChange={handleChange}
              required
              error={errors.jobId}
            >
              <option value="">-- Select Active Job Position --</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j.department} • {j.vacancies} Vacancies • {j.location})
                </option>
              ))}
            </Input>
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Walk-In Drive Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              error={errors.title}
              placeholder="e.g. Mega Walk-In Drive for Freshers & Junior Developers - Pune 2026"
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              as="textarea"
              rows={3}
              label="Drive Overview & Summary"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              error={errors.description}
              placeholder="Explain the walk-in format, target candidates, and evaluation expectations..."
            />
          </div>

          <Input
            label="Open Vacancies"
            name="vacancies"
            type="number"
            min={1}
            value={formData.vacancies}
            onChange={handleChange}
            required
            error={errors.vacancies}
          />

          <Input
            label="Maximum Registration Capacity"
            name="maxRegistrations"
            type="number"
            min={1}
            value={formData.maxRegistrations}
            onChange={handleChange}
            required
            error={errors.maxRegistrations}
            helperText="Limits candidate registration slots on Yadit's candidate portal"
          />
        </div>
      </Card>

      <Card title="Walk-In Schedule & Deadlines" padding="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Interview Date"
            name="interviewDate"
            type="date"
            value={formData.interviewDate}
            onChange={handleChange}
            required
            error={errors.interviewDate}
          />

          <Input
            label="Slot Start Time"
            name="startTime"
            type="time"
            value={formData.startTime}
            onChange={handleChange}
            required
            error={errors.startTime}
          />

          <Input
            label="Slot End Time"
            name="endTime"
            type="time"
            value={formData.endTime}
            onChange={handleChange}
            required
            error={errors.endTime}
          />

          <div className="sm:col-span-3">
            <Input
              label="Candidate Registration Deadline"
              name="registrationDeadline"
              type="date"
              value={formData.registrationDeadline}
              onChange={handleChange}
              required
              error={errors.registrationDeadline}
              helperText="Cutoff date after which candidates can no longer register on the portal"
            />
          </div>
        </div>
      </Card>

      <Card title="Pune Venue & Reporting Details" padding="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Venue Name / Facility"
              name="venueName"
              value={formData.venueName}
              onChange={handleChange}
              required
              error={errors.venueName}
              placeholder="e.g. TechSprint Auditorium, Tower B"
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Full Physical Address"
              name="venueAddress"
              value={formData.venueAddress}
              onChange={handleChange}
              required
              error={errors.venueAddress}
              placeholder="e.g. Ground Floor Auditorium, Tower B, Cybercity Magarpatta, Hadapsar"
            />
          </div>

          <Input
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
          />

          <Input
            label="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
          />

          <Input
            label="Pincode"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
          />
        </div>
      </Card>

      <Card title="Recruitment Evaluation & Logistics" padding="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              as="textarea"
              rows={4}
              label="Selection Rounds (One per line)"
              name="selectionRounds"
              value={formData.selectionRounds}
              onChange={handleChange}
              helperText="Specify step-by-step interview rounds for candidates and interviewers"
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              as="textarea"
              rows={4}
              label="Required Documents (One per line)"
              name="requiredDocuments"
              value={formData.requiredDocuments}
              onChange={handleChange}
              helperText="Items candidates must bring to the venue for verification"
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              as="textarea"
              rows={3}
              label="Special Instructions for Candidates"
              name="candidateInstructions"
              value={formData.candidateInstructions}
              onChange={handleChange}
              placeholder="Reporting time, gate entry passes, dress code, laptop requirements..."
            />
          </div>

          <Input
            label="Primary Recruiter Name"
            name="recruiterName"
            value={formData.recruiterName}
            onChange={handleChange}
          />

          <Input
            label="Recruiter Contact Email"
            name="recruiterEmail"
            type="email"
            value={formData.recruiterEmail}
            onChange={handleChange}
          />
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-8">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>

        <div className="flex items-center gap-2">
          {!isEdit && (
            <Button
              variant="outline"
              onClick={() => handleAction(false)}
              disabled={loading}
            >
              Save as Draft
            </Button>
          )}

          <Button
            variant="primary"
            onClick={() => handleAction(true)}
            loading={loading}
          >
            {isEdit
              ? "Update & Keep in Review"
              : "Save & Submit for Admin Approval"}
          </Button>
        </div>
      </div>
    </div>
  );
}
