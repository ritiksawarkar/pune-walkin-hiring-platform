import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { driveService } from "../../../services/driveService";
import { useToast } from "../../../context/ToastContext";
import { DriveForm } from "../components/DriveForm";
import { Button } from "../../../components/ui/Button";
import { ArrowLeftIcon } from "../../../components/common/Icons";

export function DriveEditPage() {
  const { driveId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [drive, setDrive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadDrive() {
      try {
        setLoading(true);
        const data = await driveService.getDriveById(driveId);
        setDrive(data);
      } catch (err) {
        showToast("Drive not found.", "error");
        navigate("/employer/drives");
      } finally {
        setLoading(false);
      }
    }
    loadDrive();
  }, [driveId, navigate, showToast]);

  const handleSubmit = async (formData) => {
    try {
      setSaving(true);
      if (drive.approvalStatus === "Changes Requested") {
        await driveService.updateDrive(driveId, formData);
        await driveService.resubmitDrive(
          driveId,
          "Revisions made as requested by administrator."
        );
        showToast("Walk-in drive revisions resubmitted for admin verification!");
      } else {
        await driveService.updateDrive(driveId, formData);
        showToast("Drive details updated successfully.");
      }
      navigate(`/employer/drives/${driveId}`);
    } catch (err) {
      showToast("Error updating drive.", "error");
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
          onClick={() => navigate(`/employer/drives/${driveId}`)}
        >
          Back to Details
        </Button>
        <h2 className="text-lg font-bold text-slate-900">
          Edit Walk-In Drive: {drive?.title}
        </h2>
      </div>

      {drive?.adminFeedback && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs sm:text-sm text-rose-800">
          <p className="font-bold">Admin Review Notes to Address (Sahil):</p>
          <p className="mt-1">{drive.adminFeedback}</p>
        </div>
      )}

      <DriveForm
        initialData={drive}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/employer/drives/${driveId}`)}
        loading={saving}
        isEdit={true}
      />
    </div>
  );
}
