import { Badge } from "../../../components/ui/Badge";

export function JobStatusBadge({ status }) {
  const map = {
    Active: { variant: "success", dot: true, label: "Active" },
    Draft: { variant: "neutral", dot: true, label: "Draft" },
    Archived: { variant: "neutral", dot: false, label: "Archived" },
  };

  const item = map[status] || { variant: "neutral", dot: false, label: status };

  return (
    <Badge variant={item.variant} dot={item.dot}>
      {item.label}
    </Badge>
  );
}
