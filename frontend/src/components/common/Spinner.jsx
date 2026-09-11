import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

export default function Spinner({ size = 20, className, label = "Loading" }) {
  return (
    <span role="status" aria-label={label} className="inline-flex items-center">
      <Loader2 className={cn("animate-spin text-brand-600", className)} style={{ width: size, height: size }} />
      <span className="sr-only">{label}</span>
    </span>
  );
}
