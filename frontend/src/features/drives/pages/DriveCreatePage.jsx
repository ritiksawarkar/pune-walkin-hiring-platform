import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { driveService } from "../../../services/driveService";
import { useToast } from "../../../context/ToastContext";
import { DriveForm } from "../components/DriveForm";
import { Button } from "../../../components/ui/Button";
import { ArrowLeftIcon } from "../../../components/common/Icons";

export function DriveCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedJobId = searchParams.get("jobId") || "";
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      const newDrive = await driveService.createDrive(formData);
      showToast(
        formData.submitDirectly
          ? `Walk-In Drive "${newDrive.title}" submitted for Admin verification!`
          : `Walk-In Drive draft "${newDrive.title}" saved successfully.`
      );
      navigate("/employer/drives");
    } catch (err) {
      showToast("Error scheduling walk-in drive.", "error");
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
          onClick={() => navigate("/employer/drives")}
        >
          Back to Drives
        </Button>
        <h2 className="text-lg font-bold text-slate-900">
          Schedule Walk-In Drive
        </h2>
      </div>

      <DriveForm
        onSubmit={handleSubmit}
        onCancel={() => navigate("/employer/drives")}
        loading={loading}
        preselectedJobId={preselectedJobId}
      />
    </div>
  );
}
