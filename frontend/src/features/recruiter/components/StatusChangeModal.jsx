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

  // Interview scheduling fields
  const [scheduledAt, setScheduledAt] = useState("");
  const [venue, setVenue] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [reportingInstructions, setReportingInstructions] = useState("");

  useEffect(() => {
    if (application) {
      setNewStatus(application.status || "Shortlisted");
      setReason("");
      setNote("");

      // Set default scheduled time to tomorrow 10:00 AM
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(10, 0, 0, 0);
      const isoLocal = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setScheduledAt(isoLocal);

      setVenue(application.drive?.venueAddress || application.driveVenue || "Tower B, Magarpatta Cybercity, Pune");
      setMeetingLink("");
      setReportingInstructions(
        application.drive?.candidateInstructions ||
        "Report 20 minutes before allocated slot. Carry original Govt photo ID (Aadhaar / PAN) & 2 printed resumes."
      );
    }
  }, [application]);

  if (!application) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(application.id, newStatus, reason, note, {
      scheduledAt: scheduledAt ? scheduledAt + ":00" : null,
      venueOrLocation: venue,
      meetingLink,
      reportingInstructions,
      instructions: note,
    });
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
          <div className="space-y-3 rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
            <div className="flex items-center gap-2 text-indigo-950">
              <AlertCircleIcon className="h-4 w-4 text-indigo-600 shrink-0" />
              <p className="font-bold text-xs">Interview Scheduling & Access Pass Details</p>
            </div>
            <p className="text-2xs text-indigo-800">
              Confirming this interview generates a unique QR-Code Access Pass, stores it in the database, notifies the candidate in-app, and dispatches an official confirmation email.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <Input
                label="Interview Date & Time"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
              />
              <Input
                label="Virtual Meeting Link (Optional)"
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/xyz-abc"
              />
            </div>

            <Input
              label="Interview Venue Address"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Tower B, Magarpatta Cybercity, Hadapsar, Pune - 411028"
              required
            />

            <Input
              label="Candidate Reporting Instructions"
              as="textarea"
              rows={2}
              value={reportingInstructions}
              onChange={(e) => setReportingInstructions(e.target.value)}
              placeholder="e.g. Report 20 minutes before allocated slot. Carry Govt photo ID (Aadhaar / PAN) & 2 resumes."
            />
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
