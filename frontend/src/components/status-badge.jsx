const statusStyles = {
  pending: "border-yellow-200 bg-yellow-50 text-yellow-800",
  accepted: "border-green-200 bg-green-50 text-green-800",
  approved: "border-green-200 bg-green-50 text-green-800",
  rejected: "border-red-200 bg-red-50 text-red-800",
  cancelled: "border-gray-200 bg-gray-100 text-gray-700",
};

export default function StatusBadge({ status }) {
  const normalizedStatus = status?.toLowerCase() ?? "";
  const label = normalizedStatus
    ? normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)
    : "Unknown";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
        statusStyles[normalizedStatus] ??
        "border-border bg-muted text-muted-foreground"
      }`}
    >
      {label}
    </span>
  );
}
