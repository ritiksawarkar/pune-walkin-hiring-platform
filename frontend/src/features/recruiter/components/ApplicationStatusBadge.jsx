import { Badge } from "../../../components/ui/Badge";

export function ApplicationStatusBadge({ status }) {
  const map = {
    Registered: { variant: "primary", dot: true, label: "Registered" },
    "Under Review": { variant: "warning", dot: true, label: "Under Review" },
    Shortlisted: { variant: "success", dot: true, label: "Shortlisted" },
    "Interview Scheduled": { variant: "indigo", dot: true, label: "Interview Scheduled" },
    Selected: { variant: "success", dot: false, label: "Selected" },
    "On Hold": { variant: "purple", dot: true, label: "On Hold" },
    Rejected: { variant: "danger", dot: false, label: "Rejected" },
  };

  const item = map[status] || { variant: "neutral", dot: false, label: status };

  return (
    <Badge variant={item.variant} dot={item.dot}>
      {item.label}
    </Badge>
  );
}
