import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger" | "primary";
  actions?: { label: string; onClick?: () => void }[];
  className?: string;
}

const variantStyles = {
  default: "bg-card border-border",
  success: "bg-success/10 border-success/20",
  warning: "bg-warning/10 border-warning/20",
  danger: "bg-destructive/10 border-destructive/20",
  primary: "bg-primary/10 border-primary/20",
};

const iconVariantStyles = {
  default: "bg-muted text-muted-foreground",
  success: "bg-success/20 text-success",
  warning: "bg-warning/20 text-warning",
  danger: "bg-destructive/20 text-destructive",
  primary: "bg-primary/20 text-primary",
};

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  actions,
  className,
}: KPICardProps) {
  return (
    // <div
    //   className={cn(
    //     "rounded-lg border p-2.5 transition-all duration-300 group",
    //     variantStyles[variant],
    //     className
    //   )}
    // >
    //   <div className="flex items-start justify-between mb-1.5">
    //     <div
    //       className={cn(
    //         "p-1.5 rounded-md transition-transform duration-300 group-hover:scale-110",
    //         iconVariantStyles[variant]
    //       )}
    //     >
    //       <Icon size={16} />
    //     </div>
    //   </div>

    //   <div className="space-y-0">
    //     <p className="text-xs font-medium text-muted-foreground">{title}</p>
    //     <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
    //     {subtitle && (
    //       <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
    //     )}
    //   </div>

    //   {actions && actions.length > 0 && (
    //     <div className="mt-2.5 pt-2.5 border-t border-border/50 flex flex-wrap gap-1.5">
    //       {actions.map((action, idx) => (
    //         <button
    //           key={idx}
    //           onClick={action.onClick}
    //           className="px-2.5 py-1 text-xs font-medium text-primary rounded-md transition-all duration-200 hover:scale-105 border border-primary/20"
    //         >
    //           {action.label}
    //         </button>
    //       ))}
    //     </div>
    //   )}
    // </div>
    <div
      className={cn(
        "rounded-sm border p-2 sm:p-2.5 transition-all duration-300 group bg-white",
        className
      )}
    >
      {/* ICON + TITLE SUR LA MÊME LIGNE */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5">
        <div
          className={cn(
            "p-1.5 rounded-md transition-transform duration-300",
            iconVariantStyles[variant]
          )}
        >
          <Icon size={16} />
        </div>

        <p className="text-[15px] font-medium text-muted-foreground">{title}</p>
      </div>

      {/* VALUE + SUBTITLE */}
      <div className="space-y-0">
        <p className="text-sm font-bold text-foreground leading-tight">
          {value}
        </p>

        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>

      {actions && actions.length > 0 && (
        <div className="mt-2.5 pt-2.5 border-t border-orange-50 border-border/50 flex flex-wrap gap-1.5">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.onClick}
              className="px-2.5 py-1 text-xs font-medium text-primary rounded-sm transition-all hover:scale-105 duration-200 border border-primary/20"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
