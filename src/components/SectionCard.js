export default function SectionCard({ title, children, right }) {
  return (
    <section className="panel rounded-3xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 className="text-sm font-semibold tracking-wide text-slate-900">{title}</h2>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}