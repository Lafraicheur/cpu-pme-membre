import { CreditCard, User, Building2, Download, Users, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import logoCpuPme from "@/assets/logo-cpu-pme.png";

interface Props {
  isLoading: boolean;
  name: string;
  orgName: string;
  numeroMembre: string;
  plan: string;
  abonnementCreatedAt: string;
  typeMembreNom?: string;
}

type PlanConfig = {
  from: string;
  to: string;
  label: string;
  type: "individual" | "entreprise" | "federation" | "organisation" | "institutionnel";
};

const PLAN_CONFIG: Record<string, PlanConfig> = {
  // Individuel / Entreprise
  basic:          { from: "#F97316", to: "#C2410C", label: "Basic",          type: "individual"    },
  argent:         { from: "#6B7280", to: "#374151", label: "Argent",         type: "individual"    },
  silver:         { from: "#6B7280", to: "#374151", label: "Argent",         type: "individual"    },
  gold:           { from: "#D97706", to: "#92400E", label: "Or",             type: "individual"    },
  or:             { from: "#D97706", to: "#92400E", label: "Or",             type: "individual"    },
  // Collectifs
  federation:     { from: "#7D3AED", to: "#3B0764", label: "Fédération",     type: "federation"    },
  fédération:     { from: "#7C3AED", to: "#3B0764", label: "Fédération",     type: "federation"    },
  organisation:   { from: "#2563EB", to: "#1E3A8A", label: "Organisation",   type: "organisation"  },
  association:    { from: "#2563EB", to: "#1E3A8A", label: "Organisation",   type: "organisation"  },
  "coopérative":  { from: "#2563EB", to: "#1E3A8A", label: "Organisation",   type: "organisation"  },
  institutionnel: { from: "#B45309", to: "#451A03", label: "Institutionnel", type: "institutionnel" },
};

function resolveConfig(plan: string, typeMembreNom: string): PlanConfig {
  const t = typeMembreNom.toLowerCase();
  if (t.includes("institutionnel"))                                         return PLAN_CONFIG.institutionnel;
  if (t.includes("fédération") || t.includes("federation"))                return PLAN_CONFIG.federation;
  if (t.includes("organisation") || t.includes("association") || t.includes("coopérative")) return PLAN_CONFIG.organisation;
  return PLAN_CONFIG[plan.toLowerCase()] ?? PLAN_CONFIG.basic;
}

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";

function formatExpiration(createdAt: string): string {
  if (!createdAt) return "—";
  const d = new Date(createdAt);
  if (isNaN(d.getTime())) return "—";
  d.setFullYear(d.getFullYear() + 1);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function fillRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(img);
    img.src = src;
  });
}

export function CarteMembre({ isLoading, name, orgName, numeroMembre, plan, abonnementCreatedAt, typeMembreNom = "" }: Props) {
  const config = resolveConfig(plan, typeMembreNom);
  const expirationDate = formatExpiration(abonnementCreatedAt);

  const isCollective = config.type === "federation" || config.type === "organisation" || config.type === "institutionnel";
  const CardIcon      = config.type === "institutionnel" ? Landmark : config.type === "federation" ? Users : Building2;

  async function handleDownload() {
    // Dimensions carte bancaire standard ×10
    const W = 856;
    const H = 540;
    const PAD = 52;

    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // ── Clip arrondi ──────────────────────────────────────────
    ctx.beginPath();
    ctx.moveTo(40, 0);
    ctx.lineTo(W - 40, 0);
    ctx.quadraticCurveTo(W, 0, W, 40);
    ctx.lineTo(W, H - 40);
    ctx.quadraticCurveTo(W, H, W - 40, H);
    ctx.lineTo(40, H);
    ctx.quadraticCurveTo(0, H, 0, H - 40);
    ctx.lineTo(0, 40);
    ctx.quadraticCurveTo(0, 0, 40, 0);
    ctx.closePath();
    ctx.clip();

    // ── Gradient de fond ──────────────────────────────────────
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, config.from);
    grad.addColorStop(1, config.to);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // ── Logo watermark (multiply efface le fond blanc du PNG) ─
    const logo = await loadImage(logoCpuPme);
    if (logo.complete && logo.naturalWidth > 0) {
      const padding = W * 0.08;
      const availW = W - padding * 2;
      const availH = H - padding * 2;
      const imgRatio = logo.naturalWidth / logo.naturalHeight;
      let drawW = availW;
      let drawH = drawW / imgRatio;
      if (drawH > availH) { drawH = availH; drawW = drawH * imgRatio; }
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(logo, (W - drawW) / 2, (H - drawH) / 2, drawW, drawH);
      ctx.restore();
    }

    // ── Badge "Pass PME" (haut gauche) ───────────────────────
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    fillRoundRect(ctx, PAD, PAD, 150, 38, 19);
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold 17px ${FONT}`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText("⊟  Pass PME", PAD + 16, PAD + 19);

    // ── Badge type/plan (haut droit) ─────────────────────────
    ctx.font = `bold 17px ${FONT}`;
    const planW = ctx.measureText(config.label).width + 36;
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    fillRoundRect(ctx, W - PAD - planW, PAD, planW, 38, 19);
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "right";
    ctx.fillText(config.label, W - PAD - 18, PAD + 19);

    // ── CPU-PME.CI label ──────────────────────────────────────
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = `13px ${FONT}`;
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillText("CPU-PME.CI", PAD, 158);

    // ── Nom ───────────────────────────────────────────────────
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold 50px ${FONT}`;
    ctx.fillText(name || "—", PAD, 184, W - PAD * 2 - 10);

    // ── Organisation ──────────────────────────────────────────
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = `30px ${FONT}`;
    ctx.fillText(orgName || "—", PAD, 250, W - PAD * 2 - 10);

    // ── Texte confédération ───────────────────────────────────
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = `bold 13px ${FONT}`;
    ctx.fillText("CONFÉDÉRATION PATRONALE UNIQUE DES PME DE CÔTE D'IVOIRE", PAD, H - 138, W - PAD * 2);

    // ── Séparateur ────────────────────────────────────────────
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.fillRect(PAD, H - 112, W - PAD * 2, 1);

    // ── N° Membre ─────────────────────────────────────────────
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = `13px ${FONT}`;
    ctx.textAlign = "left";
    ctx.fillText("N° Membre", PAD, H - 100);

    ctx.fillStyle = "#ffffff";
    ctx.font = `bold 24px ${FONT}`;
    ctx.fillText(numeroMembre || "—", PAD, H - 78);

    // ── Valide jusqu'au ───────────────────────────────────────
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = `13px ${FONT}`;
    ctx.textAlign = "right";
    ctx.fillText("Valide jusqu'au", W - PAD, H - 100);

    ctx.fillStyle = "#ffffff";
    ctx.font = `bold 24px ${FONT}`;
    ctx.fillText(expirationDate, W - PAD, H - 78);

    // ── Déclencher le téléchargement ──────────────────────────
    const link = document.createElement("a");
    link.download = `carte-membre-${numeroMembre}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
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

      {/* Carte affichée */}
      <div className="flex justify-center px-4">
        {isLoading ? (
          <Skeleton className="w-full max-w-lg rounded-2xl" style={{ aspectRatio: "1.586" }} />
        ) : (
          <div
            className="relative w-full max-w-lg rounded-2xl overflow-hidden text-white select-none shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${config.from} 0%, ${config.to} 100%)`,
              aspectRatio: "1.586",
            }}
          >
            {/* Logo watermark — mix-blend-mode:multiply efface le fond blanc du PNG */}
            <img
              src={logoCpuPme}
              alt=""
              draggable={false}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{
                objectFit: "contain",
                padding: "8%",
                opacity: 0.22,
                mixBlendMode: "multiply",
              }}
            />

            {/* Contenu */}
            <div className="relative h-full flex flex-col justify-between p-5">
              {/* Top */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 bg-white/25 rounded-full px-3 py-1">
                  <CreditCard className="w-3 h-3" />
                  <span className="text-xs font-semibold">Pass PME</span>
                </div>
                <span className="bg-white/25 rounded-full px-3 py-1 text-xs font-semibold">
                  {config.label}
                </span>
              </div>

              {/* Infos */}
              <div className="space-y-0.5">
                <p className="text-[10px] tracking-widest opacity-70 uppercase">CPU-PME.CI</p>
                <div className="flex items-center gap-2 mt-1">
                  {isCollective
                    ? <CardIcon className="w-5 h-5 opacity-80 shrink-0" />
                    : <User className="w-5 h-5 opacity-80 shrink-0" />
                  }
                  <span className="text-lg font-bold leading-tight truncate">{name || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 opacity-70 shrink-0" />
                  <span className="text-sm opacity-90 truncate">{orgName || "—"}</span>
                </div>
              </div>

              {/* Bas */}
              <div className="space-y-1.5">
                <p className="text-[8px] font-bold uppercase tracking-wide opacity-50 leading-tight">
                  Confédération Patronale Unique<br />des PME de Côte d'Ivoire
                </p>
                <div className="flex items-end justify-between border-t border-white/20 pt-1.5">
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

      {/* Bouton télécharger */}
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
