import {
  FileWarning,
  CreditCard,
  Package,
  MessageSquare,
  FileText,
  Calendar,
  Wallet,
  Users,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionItem {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  module: string;
}

const actions: ActionItem[] = [
  {
    id: "1",
    icon: FileWarning,
    title: "Documents KYC expirés",
    description: "RCCM et attestation fiscale à renouveler",
    priority: "high",
    module: "KYC",
  },
  {
    id: "2",
    icon: CreditCard,
    title: "Facture impayée",
    description: "Abonnement Argent - Échéance dépassée",
    priority: "high",
    module: "Abonnement",
  },
  {
    id: "3",
    icon: Package,
    title: "3 commandes à expédier",
    description: "Délai de livraison dans 2 jours",
    priority: "medium",
    module: "Marketplace",
  },
  {
    id: "4",
    icon: MessageSquare,
    title: "2 RFQ en attente",
    description: "Demandes de devis à traiter",
    priority: "medium",
    module: "Marketplace",
  },
  {
    id: "5",
    icon: FileText,
    title: "AO à soumettre",
    description: "Fourniture équipements - J-5",
    priority: "medium",
    module: "Appels d'offres",
  },
  {
    id: "6",
    icon: Calendar,
    title: "Session mentorat",
    description: "Demain à 14h00 - Coach: M. Koné",
    priority: "low",
    module: "Incubateur",
  },
  {
    id: "7",
    icon: Wallet,
    title: "Pièces complémentaires",
    description: "Dossier financement - 2 documents",
    priority: "medium",
    module: "Financement",
  },
  {
    id: "8",
    icon: Users,
    title: "Événement B2B",
    description: "3 demandes de RDV à confirmer",
    priority: "low",
    module: "Événements",
  },
];

const priorityStyles = {
  high: "border-l-destructive bg-destructive/5",
  medium: "border-l-warning bg-warning/5",
  low: "border-l-muted bg-muted/30",
};

const priorityBadge = {
  high: "bg-destructive/20 text-destructive",
  medium: "bg-warning/20 text-warning",
  low: "bg-muted text-muted-foreground",
};

export function ActionCenter() {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-3 sm:p-4 md:p-5 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Centre d'actions
          </h2>
          <p className="text-sm text-muted-foreground">
            {actions.length} tâches en attente
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
          To-Do
        </span>
      </div>

      <div className="divide-y divide-border max-h-[300px] sm:max-h-[350px] md:max-h-[400px] overflow-y-auto">
        {actions.map((action, idx) => (
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
              <p className="font-medium text-foreground truncate">
                {action.title}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {action.description}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "px-2 py-1 rounded text-xs font-medium hidden sm:block",
                  priorityBadge[action.priority]
                )}
              >
                {action.module}
              </span>
              <ChevronRight
                size={16}
                className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 sm:p-4 border-t border-border bg-muted/30">
        <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors w-full text-center">
          Voir toutes les actions →
        </button>
      </div>
    </div>
  );
}
