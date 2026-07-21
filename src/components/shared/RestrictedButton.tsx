import { forwardRef } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface RestrictedButtonProps extends ButtonProps {
  /** Si false, le bouton est désactivé et affiche `reason` dans une tooltip. */
  allowed: boolean;
  reason?: string;
}

/** Bouton standard qui se désactive automatiquement avec une tooltip explicative
 * quand l'accès au service (KYC, abonnement, etc.) n'est pas accordé. */
export const RestrictedButton = forwardRef<HTMLButtonElement, RestrictedButtonProps>(
  ({ allowed, reason, className, children, ...props }, ref) => {
    if (allowed) {
      return (
        <Button ref={ref} className={className} {...props}>
          {children}
        </Button>
      );
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0} className="inline-flex">
            <Button
              ref={ref}
              {...props}
              className={cn(className, "pointer-events-none")}
              disabled
            >
              {children}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-[240px] text-sm">
            {reason || "Accès restreint : conditions KYC non remplies."}
          </p>
        </TooltipContent>
      </Tooltip>
    );
  }
);
RestrictedButton.displayName = "RestrictedButton";
