import { Badge } from "../../../components/ui/Badge";

export function DriveStatusBadge({ status }) {
  const map = {
    Published: { variant: "success", dot: true, label: "Published" },
    Draft: { variant: "neutral", dot: true, label: "Draft" },
    Ongoing: { variant: "primary", dot: true, label: "Ongoing" },
    Completed: { variant: "purple", dot: false, label: "Completed" },
    Cancelled: { variant: "danger", dot: false, label: "Cancelled" },
  };

  const item = map[status] || { variant: "neutral", dot: false, label: status };

  return (
    <Badge variant={item.variant} dot={item.dot}>
      {item.label}
    </Badge>
  );
}
