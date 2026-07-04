import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import { cn } from "../utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-xl", className)} />;
}

export function CardSkeleton() {
  return (
    <div className="glass overflow-hidden rounded-[20px]">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  message,
  icon,
  action,
}: {
  title: string;
  message: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass flex flex-col items-center gap-4 rounded-[20px] px-8 py-16 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-white/[0.03]">
        {icon ?? <Inbox className="h-7 w-7 text-white/60" />}
      </div>
      <div className="space-y-1">
        <h3 className="font-display text-xl text-white">{title}</h3>
        <p className="mx-auto max-w-sm text-sm text-white/50">{message}</p>
      </div>
      {action}
    </motion.div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="glass flex flex-col items-center gap-4 rounded-[20px] px-8 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-white/[0.03]">
        <AlertTriangle className="h-7 w-7 text-white/70" />
      </div>
      <div className="space-y-1">
        <h3 className="font-display text-xl text-white">Алдаа гарлаа</h3>
        <p className="mx-auto max-w-md text-sm text-white/50">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-xl border border-line bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-white/90"
        >
          Дахин оролдох
        </button>
      )}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-5 w-5 animate-spin", className)} />;
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-line bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/70",
        className,
      )}
    >
      {children}
    </span>
  );
}
