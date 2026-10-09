import { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { PIPELINE_STAGES } from "../../../services/recruitmentService";
import { AlertCircleIcon } from "../../../components/common/Icons";

export function StatusChangeModal({
  isOpen,
  onClose,
  application,
  onConfirm,
  loading = false,
}) {
  const [newStatus, setNewStatus] = useState("Shortlisted");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (application) {
      setNewStatus(application.status || "Shortlisted");
      setReason("");
      setNote("");
    }
  }, [application]);

  if (!application) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(application.id, newStatus, reason, note);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Recruitment Status"
      subtitle={`Candidate: ${application.candidateName} • Current Status: ${application.status}`}
      maxWidth="max-w-lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            loading={loading}
          >
            Confirm Status Update
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
        <Input
          label="Target Recruitment Stage"
          as="select"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          required
        >
          {PIPELINE_STAGES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label} ({s.description})
            </option>
          ))}
        </Input>

        {newStatus === "Interview Scheduled" && (
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-xs text-indigo-900 flex items-start gap-2">
            <AlertCircleIcon className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Interview Queue Handoff (Sahil)</p>
              <p className="mt-0.5 text-indigo-800">
                Marking this candidate as "Interview Scheduled" hands them off to Sahil's interview room scheduling, token verification, and evaluator scoring queue.
              </p>
            </div>
          </div>
        )}

        {newStatus === "Rejected" && (
          <Input
            label="Rejection Reason"
            as="textarea"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            placeholder="e.g. Candidate does not meet the minimum experience criteria for automated testing."
          />
        )}

        {newStatus === "On Hold" && (
          <Input
            label="Reason for Hold"
            as="textarea"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            placeholder="e.g. Awaiting final semester transcript / degree certificate verification."
          />
        )}

        <Input
          label="Internal Recruiter Notes"
          as="textarea"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional notes regarding technical interview performance, score, or comments..."
        />
      </form>
    </Modal>
  );
}
