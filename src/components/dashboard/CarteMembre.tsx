import { CreditCard, User, Building2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRef } from "react";

interface Props {
  isLoading: boolean;
  name: string;
  orgName: string;
  numeroMembre: string;
  plan: string;
  abonnementCreatedAt: string;
}

const PLAN_CONFIG: Record<string, { from: string; to: string; label: string }> = {
  basic:  { from: "#F97316", to: "#C2410C", label: "Basic"  },
  argent: { from: "#6B7280", to: "#374151", label: "Argent" },
  silver: { from: "#6B7280", to: "#374151", label: "Argent" },
  gold:   { from: "#D97706", to: "#92400E", label: "Or"     },
  or:     { from: "#D97706", to: "#92400E", label: "Or"     },
};

function formatExpiration(createdAt: string): string {
  if (!createdAt) return "—";
  const d = new Date(createdAt);
  if (isNaN(d.getTime())) return "—";
  d.setFullYear(d.getFullYear() + 1);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function CarteMembre({ isLoading, name, orgName, numeroMembre, plan, abonnementCreatedAt }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const planKey = plan.toLowerCase();
  const config = PLAN_CONFIG[planKey] ?? PLAN_CONFIG.basic;
  const expirationDate = formatExpiration(abonnementCreatedAt);

  function handleDownload() {
    if (!cardRef.current) return;
    import("html2canvas").then(({ default: html2canvas }) => {
      html2canvas(cardRef.current!, { scale: 3, useCORS: true, backgroundColor: null }).then((canvas) => {
        const link = document.createElement("a");
        link.download = `carte-membre-${numeroMembre}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }).catch(() => {
      window.print();
    });
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Votre Carte Membre</h2>
        <p className="text-muted-foreground text-sm">
          Présentez votre carte Pass PME chez nos partenaires pour bénéficier de réductions exclusives
        </p>
      </div>

      {/* Card */}
      <div className="flex justify-center px-4">
        {isLoading ? (
          <Skeleton className="w-full max-w-sm rounded-2xl" style={{ aspectRatio: "1.586" }} />
        ) : (
          <div
            ref={cardRef}
            className="relative w-full max-w-sm rounded-2xl overflow-hidden text-white select-none shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${config.from} 0%, ${config.to} 100%)`,
              aspectRatio: "1.586",
            }}
          >
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
              <span
                className="text-6xl font-black whitespace-nowrap tracking-widest"
                style={{ color: "rgba(255,255,255,0.12)", userSelect: "none" }}
              >
                CPU-PME.CI
              </span>
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col justify-between p-5">
              {/* Top row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 bg-white/25 rounded-full px-3 py-1">
                  <CreditCard className="w-3 h-3" />
                  <span className="text-xs font-semibold">Pass PME</span>
                </div>
                <span className="bg-white/25 rounded-full px-3 py-1 text-xs font-semibold">
                  {config.label}
                </span>
              </div>

              {/* Middle info */}
              <div className="space-y-0.5">
                <p className="text-[10px] tracking-widest opacity-70 uppercase">CPU-PME.CI</p>
                <div className="flex items-center gap-2 mt-1">
                  <User className="w-5 h-5 opacity-80 shrink-0" />
                  <span className="text-lg font-bold leading-tight truncate">{name || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 opacity-70 shrink-0" />
                  <span className="text-sm opacity-90 truncate">{orgName || "—"}</span>
                </div>
              </div>

              {/* Bottom */}
              <div className="space-y-1.5">
                <p className="text-[8px] font-bold uppercase tracking-wide opacity-50 leading-tight">
                  Confédération Patronale Unique<br />des PME de Côte d'Ivoire
                </p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[9px] opacity-60 uppercase tracking-wide">N° Membre</p>
                    <p className="text-xs font-bold">{numeroMembre || "—"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] opacity-60 uppercase tracking-wide">Valide jusqu'au</p>
                    <p className="text-xs font-bold">{expirationDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {!isLoading && (
        <div className="flex justify-center">
          <Button variant="outline" className="gap-2" onClick={handleDownload}>
            <Download className="w-4 h-4" />
            Télécharger la carte
          </Button>
        </div>
      )}
    </div>
  );
}
