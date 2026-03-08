import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionLink,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-12 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200",
        className,
      )}
    >
      <div className="bg-white p-4 rounded-full shadow-sm mb-4">
        <Icon className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {actionLabel && actionLink && (
        <Link href={actionLink}>
          <Button className="rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
            {actionLabel}
          </Button>
        </Link>
      )}
    </div>
  );
}
