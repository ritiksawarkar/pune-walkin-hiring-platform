import { useState } from "react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";

export function JobForm({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  isEdit = false,
}) {
  const [formData, setFormData] = useState({
    title: initialData.title || "",
    department: initialData.department || "Product Engineering",
    employmentType: initialData.employmentType || "Full-Time",
    workMode: initialData.workMode || "On-site (Walk-In)",
    location: initialData.location || "Magarpatta, Pune",
    vacancies: initialData.vacancies || 5,
    minExperience: initialData.minExperience !== undefined ? initialData.minExperience : 0,
    maxExperience: initialData.maxExperience !== undefined ? initialData.maxExperience : 2,
    salaryRange: initialData.salaryRange || "₹ 4,50,000 - ₹ 7,00,000 P.A.",
    qualification: initialData.qualification || "B.E. / B.Tech / MCA",
    eligibilityCriteria:
      initialData.eligibilityCriteria || "60% or 6.5 CGPA throughout academics.",
    requiredSkills: Array.isArray(initialData.requiredSkills)
      ? initialData.requiredSkills.join(", ")
      : initialData.requiredSkills || "React, Java, MySQL",
    description: initialData.description || "",
    deadline:
      initialData.deadline ||
      new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    status: initialData.status || "Active",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = "Job title is required.";
    if (!formData.department.trim()) errs.department = "Department is required.";
    if (!formData.location.trim()) errs.location = "Job location is required.";
    if (!formData.description.trim()) errs.description = "Job description is required.";
    if (!formData.qualification.trim()) errs.qualification = "Qualification is required.";
    if (Number(formData.vacancies) <= 0) {
      errs.vacancies = "Vacancies must be a positive number.";
    }
    if (Number(formData.minExperience) < 0) {
      errs.minExperience = "Min experience cannot be negative.";
    }
    if (Number(formData.maxExperience) < Number(formData.minExperience)) {
      errs.maxExperience = "Max experience cannot be less than minimum.";
    }
    if (!formData.deadline) {
      errs.deadline = "Application deadline is required.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (statusOverride) => {
    if (!validate()) return;
    const submission = {
      ...formData,
      status: statusOverride || formData.status,
      vacancies: Number(formData.vacancies),
      minExperience: Number(formData.minExperience),
      maxExperience: Number(formData.maxExperience),
      requiredSkills: formData.requiredSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    onSubmit(submission);
  };

  return (
    <div className="space-y-6">
      <Card title="Role Basics & Hierarchy" padding="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Job Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              error={errors.title}
              placeholder="e.g. Junior Full Stack Developer (React & Java)"
            />
          </div>

          <Input
            label="Department / POD"
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
            error={errors.department}
            placeholder="e.g. Product Engineering"
          />

          <Input
            label="Employment Type"
            as="select"
            name="employmentType"
            value={formData.employmentType}
            onChange={handleChange}
          >
            <option value="Full-Time">Full-Time (Permanent)</option>
            <option value="Internship">Internship to PPO</option>
            <option value="Contract">Contract (6-12 Months)</option>
          </Input>

          <Input
            label="Work Mode"
            as="select"
            name="workMode"
            value={formData.workMode}
            onChange={handleChange}
          >
            <option value="On-site (Walk-In)">On-site (Walk-In)</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Remote">Remote</option>
          </Input>

          <Input
            label="Pune Location / Hub"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            error={errors.location}
            placeholder="e.g. Magarpatta, Pune / Hinjawadi Phase 1"
          />

          <Input
            label="Number of Vacancies"
            name="vacancies"
            type="number"
            min={1}
            value={formData.vacancies}
            onChange={handleChange}
            required
            error={errors.vacancies}
            placeholder="e.g. 10"
          />

          <Input
            label="Salary Range (CTC)"
            name="salaryRange"
            value={formData.salaryRange}
            onChange={handleChange}
            placeholder="e.g. ₹ 4,50,000 - ₹ 7,00,000 P.A."
          />
        </div>
      </Card>

      <Card title="Eligibility & Candidate Requirements" padding="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Min Experience (Years)"
            name="minExperience"
            type="number"
            min={0}
            value={formData.minExperience}
            onChange={handleChange}
            error={errors.minExperience}
            placeholder="0 for freshers"
          />

          <Input
            label="Max Experience (Years)"
            name="maxExperience"
            type="number"
            min={0}
            value={formData.maxExperience}
            onChange={handleChange}
            error={errors.maxExperience}
            placeholder="2"
          />

          <div className="sm:col-span-2">
            <Input
              label="Minimum Qualification"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              required
              error={errors.qualification}
              placeholder="e.g. B.E. / B.Tech (CS/IT/EnTC), MCA or B.Sc Comp Sci"
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Eligibility Criteria"
              name="eligibilityCriteria"
              value={formData.eligibilityCriteria}
              onChange={handleChange}
              placeholder="e.g. 60% aggregate. No active backlogs. 2024/2025/2026 passouts."
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Required Skills (Comma-separated)"
              name="requiredSkills"
              value={formData.requiredSkills}
              onChange={handleChange}
              helperText="Separate multiple skills with commas, e.g. React.js, Java, Spring Boot, MySQL"
              placeholder="React, Java, Spring Boot, SQL"
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              as="textarea"
              rows={4}
              label="Detailed Job Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              error={errors.description}
              placeholder="Outline role responsibilities, tech stack, evaluation process, and career progression..."
            />
          </div>

          <Input
            label="Application Deadline"
            name="deadline"
            type="date"
            value={formData.deadline}
            onChange={handleChange}
            required
            error={errors.deadline}
          />

          <Input
            label="Posting Status"
            as="select"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Active">Active (Open for Drive Creation)</option>
            <option value="Draft">Draft (Save for Later)</option>
            <option value="Archived">Archived (Closed)</option>
          </Input>
        </div>
      </Card>

      <div className="flex items-center justify-end gap-3 pb-6">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        {!isEdit && (
          <Button
            variant="outline"
            onClick={() => handleSubmit("Draft")}
            disabled={loading}
          >
            Save as Draft
          </Button>
        )}
        <Button
          variant="primary"
          onClick={() => handleSubmit()}
          loading={loading}
        >
          {isEdit ? "Update Job Details" : "Publish Job Opening"}
        </Button>
      </div>
    </div>
  );
}
