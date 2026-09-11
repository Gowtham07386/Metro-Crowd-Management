import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

export default function Card({
  children,
  className,
  as: Tag = "div",
  padding = "p-5",
  hover = false,
  animate = true,
  delay = 0,
  ...rest
}) {
  const Comp = animate ? motion.div : Tag;
  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.35, delay },
      }
    : {};

  return (
    <Comp
      className={cn(
        "glass-panel rounded-2xl",
        padding,
        hover && "transition-transform duration-200 hover:-translate-y-1 hover:shadow-premium",
        className
      )}
      {...motionProps}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export function CardHeader({ title, subtitle, action, className }) {
  return (
    <div className={cn("mb-4 flex items-start justify-between gap-3", className)}>
      <div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
