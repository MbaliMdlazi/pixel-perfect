import { ShieldCheck } from "lucide-react";

export function AiDisclaimer({ className = "" }: { className?: string }) {
  return (
    <p
      className={`flex items-start gap-2 rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground ${className}`}
    >
      <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
      <span>
        Responsible AI: assistant output can be incomplete or inaccurate. Review, edit and verify it
        before using it professionally.
      </span>
    </p>
  );
}
