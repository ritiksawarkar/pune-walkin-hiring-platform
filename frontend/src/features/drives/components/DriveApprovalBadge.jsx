import { Badge } from "../../../components/ui/Badge";

export function DriveApprovalBadge({ status }) {
  const map = {
    Approved: { variant: "success", dot: true, label: "Approved" },
    "Pending Approval": { variant: "warning", dot: true, label: "Pending Approval" },
    "Changes Requested": { variant: "danger", dot: true, label: "Changes Requested" },
    Draft: { variant: "neutral", dot: false, label: "Draft" },
    Rejected: { variant: "danger", dot: false, label: "Rejected" },
  };

  const item = map[status] || { variant: "neutral", dot: false, label: status };

  return (
    <Badge variant={item.variant} dot={item.dot}>
      {item.label}
    </Badge>
  );
}
