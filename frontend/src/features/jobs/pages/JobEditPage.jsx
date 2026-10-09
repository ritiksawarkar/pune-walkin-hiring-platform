import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jobService } from "../../../services/jobService";
import { useToast } from "../../../context/ToastContext";
import { JobForm } from "../components/JobForm";
import { Button } from "../../../components/ui/Button";
import { ArrowLeftIcon } from "../../../components/common/Icons";

export function JobEditPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadJob() {
      try {
        setLoading(true);
        const data = await jobService.getJobById(jobId);
        setJob(data);
      } catch (err) {
        showToast("Job not found.", "error");
        navigate("/employer/jobs");
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [jobId, navigate, showToast]);

  const handleSubmit = async (formData) => {
    try {
      setSaving(true);
      await jobService.updateJob(jobId, formData);
      showToast(`Job "${formData.title}" updated successfully!`);
      navigate(`/employer/jobs/${jobId}`);
    } catch (err) {
      showToast("Failed to update job.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeftIcon}
          onClick={() => navigate(`/employer/jobs/${jobId}`)}
        >
          Back to Details
        </Button>
        <h2 className="text-lg font-bold text-slate-900">
          Edit Job: {job?.title}
        </h2>
      </div>

      <JobForm
        initialData={job}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/employer/jobs/${jobId}`)}
        loading={saving}
        isEdit={true}
      />
    </div>
  );
}
