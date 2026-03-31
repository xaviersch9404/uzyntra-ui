export function formatTimestamp(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function severityClasses(severity) {
  const key = String(severity || "").toLowerCase();

  switch (key) {
    case "critical":
      return "bg-red-100 text-red-700 ring-1 ring-red-200";
    case "high":
      return "bg-orange-100 text-orange-700 ring-1 ring-orange-200";
    case "medium":
      return "bg-amber-100 text-amber-700 ring-1 ring-amber-200";
    case "low":
      return "bg-sky-100 text-sky-700 ring-1 ring-sky-200";
    default:
      return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  }
}

export function modeClasses(mode) {
  const key = String(mode || "").toLowerCase();

  switch (key) {
    case "block":
      return "bg-red-100 text-red-700 ring-1 ring-red-200";
    case "recommend":
      return "bg-violet-100 text-violet-700 ring-1 ring-violet-200";
    case "detect_only":
      return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
    default:
      return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  }
}