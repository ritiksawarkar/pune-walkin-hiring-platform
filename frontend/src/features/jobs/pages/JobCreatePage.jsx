import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jobService } from "../../../services/jobService";
import { useToast } from "../../../context/ToastContext";
import { JobForm } from "../components/JobForm";
import { Button } from "../../../components/ui/Button";
import { ArrowLeftIcon } from "../../../components/common/Icons";

export function JobCreatePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      const newJob = await jobService.createJob(formData);
      showToast(
        formData.status === "Draft"
          ? "Job saved as draft."
          : `Job opening "${newJob.title}" posted successfully!`
      );
      navigate("/employer/jobs");
    } catch (err) {
      showToast("Error creating job opening.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeftIcon}
          onClick={() => navigate("/employer/jobs")}
        >
          Back to Jobs
        </Button>
        <h2 className="text-lg font-bold text-slate-900">
          Create New Job Opening
        </h2>
      </div>

      <JobForm
        onSubmit={handleSubmit}
        onCancel={() => navigate("/employer/jobs")}
        loading={loading}
      />
    </div>
  );
}
