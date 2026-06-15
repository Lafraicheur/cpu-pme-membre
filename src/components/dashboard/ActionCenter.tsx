import { useEffect, useState } from "react";
import {
  FileWarning, CreditCard, MessageSquare, FileText,
  Calendar, Users, ChevronRight, Shield, BookOpen,
  Loader2, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  kycApi, affiliationApi, mesCoursApi, rfqApi, evenementsApi,
  type KycMyRequiredDocumentsResponse, type AffiliationMeResponse,
  type MonInscription, type RFQFromAPI, type Evenement,
} from "@/lib/api";

interface ActionItem {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  module: string;
}

const priorityStyles: Record<ActionItem["priority"], string> = {
  high:   "border-l-destructive bg-destructive/5",
  medium: "border-l-warning bg-warning/5",
  low:    "border-l-muted bg-muted/30",
};

const priorityBadge: Record<ActionItem["priority"], string> = {
  high:   "bg-destructive/20 text-destructive",
  medium: "bg-warning/20 text-warning",
  low:    "bg-muted text-muted-foreground",
};

const PRIORITY_ORDER: Record<ActionItem["priority"], number> = { high: 0, medium: 1, low: 2 };

function deriveActions(
  kycData:     KycMyRequiredDocumentsResponse | null,
  affiliation: AffiliationMeResponse | null,
  formations:  MonInscription[] | null,
  rfqs:        RFQFromAPI[] | null,
  events:      Evenement[] | null,
  user:        { abonnementEndDate?: string; planLibelle?: string } | null,
): ActionItem[] {
  const items: ActionItem[] = [];

  // ── KYC ──────────────────────────────────────────────────────────────────
  if (kycData) {
    const { caseStatus, requiredDocuments } = kycData;
    if (caseStatus === "not_started") {
      items.push({
        id: "kyc-start", icon: Shield, priority: "high", module: "KYC",
        title: "Démarrez votre vérification KYC",
        description: "Obligatoire pour débloquer toutes les fonctionnalités",
      });
    } else if (caseStatus === "expired") {
      items.push({
        id: "kyc-expired", icon: FileWarning, priority: "high", module: "KYC",
        title: "KYC expiré",
        description: "Renouvelez vos documents pour maintenir l'accès",
      });
    } else if (caseStatus === "rejected") {
      items.push({
        id: "kyc-rejected", icon: FileWarning, priority: "high", module: "KYC",
        title: "KYC rejeté — documents à corriger",
        description: "Corrigez les documents signalés puis soumettez à nouveau",
      });
    } else if (caseStatus === "draft") {
      const missing = requiredDocuments.filter(d => d.isRequired && d.status === "missing").length;
      if (missing > 0) {
        items.push({
          id: "kyc-missing", icon: FileWarning, priority: "high", module: "KYC",
          title: `${missing} document${missing > 1 ? "s" : ""} KYC manquant${missing > 1 ? "s" : ""}`,
          description: "Documents obligatoires à fournir pour valider votre dossier",
        });
      } else {
        items.push({
          id: "kyc-submit", icon: FileText, priority: "medium", module: "KYC",
          title: "Soumettez votre dossier KYC",
          description: "Tous les documents sont prêts — envoyez pour validation",
        });
      }
    }
  }

  // ── Abonnement ────────────────────────────────────────────────────────────
  if (user?.abonnementEndDate) {
    const daysLeft = Math.floor(
      (new Date(user.abonnementEndDate).getTime() - Date.now()) / 86_400_000
    );
    if (daysLeft < 0) {
      items.push({
        id: "sub-expired", icon: CreditCard, priority: "high", module: "Abonnement",
        title: "Abonnement expiré",
        description: "Renouvelez votre abonnement pour rétablir l'accès complet",
      });
    } else if (daysLeft <= 15) {
      items.push({
        id: "sub-expiring",
        icon: CreditCard,
        priority: daysLeft <= 5 ? "high" : "medium",
        module: "Abonnement",
        title: `Abonnement expire dans ${daysLeft} jour${daysLeft > 1 ? "s" : ""}`,
        description: `${user.planLibelle ?? "Votre plan"} — renouvelez pour ne pas perdre l'accès`,
      });
    }
  }

  // ── Affiliation ───────────────────────────────────────────────────────────
  if (affiliation) {
    if (!affiliation.currentAffiliation && !affiliation.pendingRequest) {
      items.push({
        id: "affil-none", icon: Users, priority: "low", module: "Affiliation",
        title: "Aucune affiliation",
        description: "Rejoignez une organisation pour étendre votre réseau professionnel",
      });
    } else if (affiliation.pendingRequest) {
      items.push({
        id: "affil-pending", icon: Users, priority: "medium", module: "Affiliation",
        title: "Demande d'affiliation en attente",
        description: "Soumise — en cours d'examen par l'organisation",
      });
    }
  }

  // ── Formations en cours ───────────────────────────────────────────────────
  if (formations) {
    const inProgress = formations.filter(
      f => f.status === "started" || (f.status === "confirmed" && (f.progression ?? 0) < 100)
    );
    if (inProgress.length > 0) {
      items.push({
        id: "formation-progress", icon: BookOpen, priority: "low", module: "Formation",
        title: `${inProgress.length} formation${inProgress.length > 1 ? "s" : ""} en cours`,
        description: inProgress.slice(0, 2).map(f => f.formation.title).join(", "),
      });
    }
  }

  // ── RFQ sans réponse ──────────────────────────────────────────────────────
  if (rfqs) {
    const openStatuses = new Set(["open", "published", "pending", "active"]);
    const pending = rfqs.filter(r => openStatuses.has(r.status) && r.offersCount === 0);
    if (pending.length > 0) {
      items.push({
        id: "rfq-pending", icon: MessageSquare, priority: "medium", module: "Marketplace",
        title: `${pending.length} RFQ sans réponse`,
        description: "Vos demandes de devis n'ont pas encore reçu d'offres",
      });
    }
  }

  // ── Événements à venir (≤ 7 jours) ───────────────────────────────────────
  if (events) {
    const soon = events.filter(e => {
      const diff = new Date(e.date_debut).getTime() - Date.now();
      return diff > 0 && diff <= 7 * 86_400_000;
    });
    if (soon.length > 0) {
      const next = soon[0];
      const dateStr = new Date(next.date_debut).toLocaleDateString("fr-FR", {
        day: "numeric", month: "short",
      });
      items.push({
        id: "event-soon", icon: Calendar, priority: "low", module: "Événements",
        title: next.titre,
        description: `Le ${dateStr}${next.lieu ? ` • ${next.lieu}` : ""}`,
      });
    }
  }

  return items.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
}

export function ActionCenter() {
  const { user } = useAuth();
  const [loading,     setLoading]     = useState(true);
  const [kycData,     setKycData]     = useState<KycMyRequiredDocumentsResponse | null>(null);
  const [affiliation, setAffiliation] = useState<AffiliationMeResponse | null>(null);
  const [formations,  setFormations]  = useState<MonInscription[] | null>(null);
  const [rfqs,        setRfqs]        = useState<RFQFromAPI[] | null>(null);
  const [events,      setEvents]      = useState<Evenement[] | null>(null);

  useEffect(() => {
    (async () => {
      const [kyc, aff, form, rfq, evt] = await Promise.allSettled([
        kycApi.getMyRequiredDocuments(),
        affiliationApi.getMe(),
        mesCoursApi.getMesFormations(),
        rfqApi.getAll(),
        evenementsApi.getRecentUpcoming(),
      ]);
      if (kyc.status  === "fulfilled") setKycData(kyc.value);
      if (aff.status  === "fulfilled") setAffiliation(aff.value);
      if (form.status === "fulfilled") setFormations(form.value);
      if (rfq.status  === "fulfilled") setRfqs(rfq.value);
      if (evt.status  === "fulfilled") setEvents(evt.value);
      setLoading(false);
    })();
  }, []);

  const actions = deriveActions(kycData, affiliation, formations, rfqs, events, user);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden h-full flex flex-col">
      <div className="p-3 sm:p-4 md:p-5 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Centre d'actions</h2>
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Chargement…"
              : `${actions.length} tâche${actions.length !== 1 ? "s" : ""} en attente`}
          </p>
        </div>
        {/* <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
          To-Do
        </span> */}
      </div>

      <div className="divide-y divide-border max-h-[192px] md:max-h-[228px] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : actions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <p className="text-sm">Aucune action requise — tout est à jour !</p>
          </div>
        ) : (
          actions.map((action, idx) => (
            <div
              key={action.id}
              className={cn(
                "p-2.5 sm:p-3 md:p-4 flex items-center gap-2 sm:gap-3 md:gap-4 border-l-4 hover:bg-muted/50 transition-colors cursor-pointer group opacity-0 animate-slide-up",
                priorityStyles[action.priority]
              )}
              style={{ animationDelay: `${idx * 0.05}s`, animationFillMode: "forwards" }}
            >
              <div className="p-2 rounded-lg bg-background">
                <action.icon size={18} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{action.title}</p>
                <p className="text-sm text-muted-foreground truncate">{action.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn(
                  "px-2 py-1 rounded text-xs font-medium hidden sm:block",
                  priorityBadge[action.priority]
                )}>
                  {action.module}
                </span>
                <ChevronRight
                  size={16}
                  className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
