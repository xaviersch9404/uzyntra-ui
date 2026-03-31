export default function MetricCard({ title, value, hint }) {
  const displayValue =
    value === null || value === undefined || value === "" ? "0" : value;

  return (
    <div className="panel rounded-3xl p-6 transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
      <p className="text-sm font-medium text-slate-500">{title}</p>

      <p className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
        {displayValue}
      </p>

      {hint ? <p className="mt-3 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}