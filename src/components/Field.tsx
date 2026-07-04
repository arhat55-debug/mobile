import type { ReactNode } from "react";
import { cn } from "../utils/cn";

export function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-xs font-medium text-white/70">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400/90">{error}</p>}
    </div>
  );
}

export const inputClass =
  "w-full rounded-xl border border-line bg-white/[0.03] px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/30 focus:bg-white/[0.05]";
