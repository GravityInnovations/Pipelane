import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  detail,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  detail?: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        {Icon ? (
          <Icon aria-hidden="true" className="size-4 text-slate-400" />
        ) : null}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-950">
        {value}
      </p>
      {detail ? <p className="mt-1 text-xs text-slate-500">{detail}</p> : null}
    </section>
  );
}
