import { LucideIcon, Lock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  stats: { label: string; value: string | number }[];
  cta: string;
  locked?: boolean;
  requiredPlan?: string;
  variant?: "default" | "primary" | "secondary";
}

const variantStyles = {
  default: "bg-card hover:border-primary/30",
  primary:
    "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:border-primary/40",
  secondary:
    "bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20 hover:border-secondary/40",
};

export function ModuleCard({
  title,
  description,
  icon: Icon,
  stats,
  cta,
  locked = false,
  requiredPlan,
  variant = "default",
}: ModuleCardProps) {
  return (
    // <div
    //   className={cn(
    //     "relative rounded-lg border p-3 transition-all duration-300 group cursor-pointer",
    //     locked ? "opacity-60" : "hover:shadow-lg hover:-translate-y-1",
    //     variantStyles[variant]
    //   )}
    // >
    //   {locked && (
    //     <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] rounded-lg flex items-center justify-center z-10">
    //       <div className="text-center">
    //         <Lock size={20} className="mx-auto mb-1.5 text-muted-foreground" />
    //         <p className="text-xs font-medium text-muted-foreground">
    //           Plan {requiredPlan} requis
    //         </p>
    //       </div>
    //     </div>
    //   )}

    //   <div className="flex items-start justify-between mb-2">
    //     <div className={cn(
    //       "p-2 rounded-lg transition-all duration-300",
    //       variant === "primary"
    //         ? "bg-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
    //         : variant === "secondary"
    //         ? "bg-secondary/20 text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground"
    //         : "bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground"
    //     )}>
    //       <Icon size={20} />
    //     </div>
    //   </div>

    //   <h3 className="text-base font-semibold text-foreground mb-0.5">{title}</h3>
    //   <p className="text-sm text-muted-foreground mb-3 leading-snug">{description}</p>

    //   <div className="grid grid-cols-2 gap-2 mb-3">
    //     {stats.map((stat, idx) => (
    //       <div key={idx} className="bg-muted/50 rounded-md p-2">
    //         <p className="text-base font-bold text-foreground leading-tight">{stat.value}</p>
    //         <p className="text-xs text-muted-foreground">{stat.label}</p>
    //       </div>
    //     ))}
    //   </div>

    //   <button
    //     className={cn(
    //       "w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300",
    //       variant === "primary"
    //         ? "bg-primary text-primary-foreground hover:bg-primary/90"
    //         : variant === "secondary"
    //         ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
    //         : "bg-muted text-foreground hover:bg-primary hover:text-primary-foreground"
    //     )}
    //   >
    //     {cta}
    //     <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
    //   </button>
    // </div>
    <div
      className={cn(
        "relative rounded-lg border p-2.5 sm:p-3 transition-all duration-300 group cursor-pointer",
        locked ? "opacity-60" : ""
      )}
    >
      {locked && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <Lock size={20} className="mx-auto mb-1.5 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground">
              Plan {requiredPlan} requis
            </p>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-2">
        <div
          className={cn(
            "p-2 rounded-lg transition-all duration-300",
            variant === "primary"
              ? "bg-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
              : variant === "secondary"
              ? "bg-secondary/20 text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground"
              : "bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground"
          )}
        >
          <Icon size={20} />
        </div>
      </div>

      <h3 className="text-base font-semibold text-foreground mb-0.5">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mb-3 leading-snug">
        {description}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mb-3">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-muted/50 rounded-md p-2 flex flex-col items-center"
          >
            <p className="text-xs font-bold text-foreground leading-tight">
              {stat.value}
            </p>

            <p className="text-[10px] text-muted-foreground whitespace-nowrap truncate w-full text-center">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <button
        className={cn(
          "w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300",
          variant === "primary"
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : variant === "secondary"
            ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
            : "bg-muted text-foreground hover:bg-primary hover:text-primary-foreground"
        )}
      >
        {cta}
        <ArrowRight
          size={16}
          className="transition-transform group-hover:translate-x-1"
        />
      </button>
    </div>
  );
}
