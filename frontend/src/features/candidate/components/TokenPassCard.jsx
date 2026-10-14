import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import {
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  ShieldCheckIcon,
  PrinterIcon,
  FileTextIcon,
} from "../../../components/common/Icons";

export function TokenPassCard({ application, drive, pass, qrBase64, onPrint }) {
  if (!application) return null;

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="rounded-2xl border-2 border-blue-500/30 bg-gradient-to-b from-blue-50/50 via-white to-slate-50 p-6 shadow-sm">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-blue-100 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-lg shadow-xs">
            PW
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                Official Walk-In Entry Pass
              </span>
              <ShieldCheckIcon className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Pune Walk-In Hiring Platform
            </h3>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-2xs text-slate-400 font-semibold uppercase">Token Number</span>
          <div className="font-mono text-xl font-extrabold text-blue-700 tracking-wider">
            {application.tokenNumber || "TS-W26-004"}
          </div>
        </div>
      </div>

      {/* Main Pass Content */}
      <div className="py-5 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Candidate Details */}
        <div className="space-y-3">
          <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">
            Candidate Information
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900">{application.candidateName}</p>
            <p className="text-xs text-slate-600">{application.email}</p>
            <p className="text-xs text-slate-600">{application.phone}</p>
            <p className="text-xs text-slate-500 mt-1">{application.qualification}</p>
          </div>
          <div>
            <Badge variant="primary" size="sm">
              Status: {application.status}
            </Badge>
          </div>
        </div>

        {/* Drive and Role */}
        <div className="space-y-3">
          <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">
            Recruitment Drive & Role
          </span>
          <div>
            <p className="text-xs text-blue-600 font-semibold">{application.jobTitle}</p>
            <h4 className="text-sm font-bold text-slate-900 mt-0.5 line-clamp-2">
              {application.driveTitle}
            </h4>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <CalendarIcon className="h-4 w-4 text-slate-400 shrink-0" />
            <span>Date: <strong>{drive?.interviewDate || application.registrationDate}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ClockIcon className="h-4 w-4 text-slate-400 shrink-0" />
            <span>Slot: <strong>{application.registrationSlot}</strong></span>
          </div>
        </div>

        {/* Reporting Venue */}
        <div className="space-y-3">
          <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">
            Pune Venue Address
          </span>
          <div className="flex items-start gap-2 text-xs text-slate-700">
            <MapPinIcon className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">{drive?.venueName || "TechSprint Auditorium"}</p>
              <p className="text-slate-600 text-xs mt-0.5">
                {drive?.venueAddress || "Tower B, Magarpatta Cybercity, Hadapsar, Pune"}
              </p>
            </div>
          </div>
          <p className="text-2xs text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded-lg">
            ⚠️ Security Check: Carry original Aadhaar/Govt ID card & 2 printed resumes.
          </p>
        </div>
      </div>

      {/* Pass Footer with QR Code visual, Pass Code, and print button */}
      <div className="pt-4 border-t border-dashed border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* QR Code and Pass Details */}
        <div className="flex items-center gap-3">
          {(qrBase64 || pass?.qrBase64) ? (
            <div className="h-16 w-16 shrink-0 bg-white p-1 rounded-lg border border-slate-200 shadow-xs flex items-center justify-center">
              <img
                src={qrBase64 || pass.qrBase64}
                alt="Entry QR Pass"
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-1 h-7">
                {[4, 2, 6, 2, 8, 3, 2, 5, 2, 7, 3, 2, 6, 4, 2, 8, 2, 3, 6, 2, 4].map((w, idx) => (
                  <div key={idx} className="bg-slate-800 h-full" style={{ width: `${w}px` }} />
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="text-3xs font-bold uppercase tracking-wider text-slate-400 block">
              Digital Walk-In Access Pass
            </span>
            <div className="font-mono text-xs font-black text-blue-700">
              {pass?.passCode || `PASS-${application.tokenNumber || "2026-ACTIVE"}`}
            </div>
            <div className="text-3xs text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Status: <strong>{pass?.status || "ACTIVE"}</strong> (Scan at Venue)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <Button
            variant="outline"
            size="sm"
            icon={PrinterIcon}
            onClick={handlePrint}
          >
            Print Hall Ticket
          </Button>
        </div>
      </div>
    </div>
  );
}
