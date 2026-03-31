export default function EmptyState({
  title = "No data",
  text = "Nothing to show right now.",
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-10 text-center">
      <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-slate-100" />
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
    </div>
  );
}