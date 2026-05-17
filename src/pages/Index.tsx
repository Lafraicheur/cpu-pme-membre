import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { ActionCenter } from "@/components/dashboard/ActionCenter";
import { HealthScore } from "@/components/dashboard/HealthScore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  CreditCard,
  Users,
  Activity,
  Clock,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

const statutLabel: Record<string, string> = {
  approved: "Approuvé",
  pending:  "En attente",
  rejected: "Rejeté",
  active:   "Actif",
};

// ── Helpers décompte ──────────────────────────────────────────────────────────

function computeEndDate(startDate: string, period: "mensuel" | "annuel", endDateFromApi?: string): Date {
  if (endDateFromApi) return new Date(endDateFromApi);
  const start = new Date(startDate);
  const days = period === "annuel" ? 365 : 30;
  return new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
}

function computeTimeLeft(endDate: Date) {
  const diff = endDate.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, expired: true };
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    expired: false,
  };
}

// ── Widget décompte abonnement ─────────────────────────────────────────────────

function SubscriptionCountdown({
  startDate,
  period,
  endDateApi,
  planLibelle,
  onRenew,
}: {
  startDate: string;
  period: "mensuel" | "annuel";
  endDateApi?: string;
  planLibelle: string;
  onRenew: () => void;
}) {
  const endDate = computeEndDate(startDate, period, endDateApi);
  const [timeLeft, setTimeLeft] = useState(computeTimeLeft(endDate));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(computeTimeLeft(endDate)), 60_000);
    return () => clearInterval(id);
  }, [endDate]);

  const totalDays = period === "annuel" ? 365 : 30;
  const elapsed = totalDays - timeLeft.days;
  const progressPercent = Math.max(0, Math.min(100, (elapsed / totalDays) * 100));

  const isExpired = timeLeft.expired;
  const isUrgent  = !isExpired && timeLeft.days <= 5;
  const isWarning = !isExpired && !isUrgent && timeLeft.days <= 15;

  const accentClass = isExpired || isUrgent
    ? "border-red-200 bg-red-50/60 dark:bg-red-950/20"
    : isWarning
    ? "border-amber-200 bg-amber-50/60 dark:bg-amber-950/20"
    : "border-primary/20 bg-primary/5";

  const barColor = isExpired || isUrgent ? "bg-red-500" : isWarning ? "bg-amber-400" : "bg-primary";
  const textColor = isExpired || isUrgent ? "text-red-600" : isWarning ? "text-amber-600" : "text-primary";

  const endFmt = endDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <Card className={`rounded-sm border ${accentClass} min-w-[220px]`}>
      <CardContent className="p-4 space-y-3">
        {/* En-tête */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Clock className={`w-4 h-4 ${textColor}`} />
            <span className="text-xs font-semibold text-foreground">Abonnement</span>
          </div>
          <Badge variant="outline" className="text-[10px] h-4 px-1.5 capitalize">
            {period}
          </Badge>
        </div>

        {/* Plan */}
        <p className="text-[11px] text-muted-foreground truncate">{planLibelle}</p>

        {/* Décompte */}
        {isExpired ? (
          <div className="flex items-center gap-1.5 text-red-600">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="text-sm font-semibold">Expiré</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {[
              { val: timeLeft.days,    label: "j" },
              { val: timeLeft.hours,   label: "h" },
              { val: timeLeft.minutes, label: "m" },
            ].map(({ val, label }) => (
              <div key={label} className="text-center">
                <div className={`text-xl font-bold tabular-nums leading-none ${textColor}`}>
                  {String(val).padStart(2, "0")}
                </div>
                <div className="text-[10px] text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Barre de progression */}
        <div className="space-y-1">
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${barColor}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            Expire le {endFmt}
          </p>
        </div>

        {/* CTA */}
        <Button
          size="sm"
          variant={isExpired || isUrgent ? "destructive" : "outline"}
          className="w-full h-7 text-xs gap-1.5"
          onClick={onRenew}
        >
          <RefreshCw className="w-3 h-3" />
          {isExpired ? "Renouveler maintenant" : "Renouveler"}
        </Button>
      </CardContent>
    </Card>
  );
}

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [displayed, setDisplayed] = useState("");
  const tidRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Effet typewriter : alterne entre les deux messages
  useEffect(() => {
    if (!user?.name) return;

    const messages = [
      `Bienvenue, ${user.name}`,
      "Nous sommes content de vous revoir",
    ];
    let msgIdx = 0;
    let charIdx = 0;
    let deleting = false;

    const tick = () => {
      const current = messages[msgIdx];
      if (!deleting) {
        charIdx++;
        setDisplayed(current.slice(0, charIdx));
        if (charIdx === current.length) {
          deleting = true;
          tidRef.current = setTimeout(tick, 2000); // pause avant effacement
        } else {
          tidRef.current = setTimeout(tick, 65);
        }
      } else {
        charIdx--;
        setDisplayed(current.slice(0, charIdx));
        if (charIdx === 0) {
          deleting = false;
          msgIdx = (msgIdx + 1) % messages.length;
          tidRef.current = setTimeout(tick, 500); // pause entre les messages
        } else {
          tidRef.current = setTimeout(tick, 35);
        }
      }
    };

    tidRef.current = setTimeout(tick, 400);
    return () => { if (tidRef.current) clearTimeout(tidRef.current); };
  }, [user?.name]);

  if (isLoading || !isAuthenticated) return null;

  const statut     = user?.statut ? (statutLabel[user.statut] ?? user.statut) : "Actif";
  const entreprise = user?.organisationName || user?.companyName || user?.name || "Mon entreprise";
  const plan       = user?.planLibelle || user?.subscription?.tier || "—";
  const secteur    = user?.filiereNom || user?.secteurPrincipal || "—";
  const region     = [user?.communeNom, user?.regionNom].filter(Boolean).join(", ") || "—";

  const showCountdown = !!(user?.abonnementStartDate);

  // Sépare le préfixe "Bienvenue, " du nom pour colorer uniquement le nom
  const WELCOME_PREFIX = "Bienvenue, ";
  const isWelcomeMsg = displayed.startsWith(WELCOME_PREFIX);
  const textPrefix   = isWelcomeMsg ? WELCOME_PREFIX : "";
  const textName     = isWelcomeMsg ? displayed.slice(WELCOME_PREFIX.length) : "";
  const textOther    = isWelcomeMsg ? "" : displayed;

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-6 md:mb-8 opacity-0 animate-slide-up flex items-start justify-between gap-4" style={{ animationFillMode: "forwards" }}>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1 min-h-[2.25rem] flex items-center gap-0.5">
            {isWelcomeMsg ? (
              <>
                <span className="text-foreground">{textPrefix}</span>
                <span className="text-primary">{textName}</span>
              </>
            ) : (
              <span className="text-foreground">{textOther}</span>
            )}
            <span className="inline-block w-[2px] h-7 bg-foreground/60 rounded-full animate-pulse" />
          </h1>
          <p className="text-base font-medium text-foreground/80">{entreprise}</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Voici un aperçu de votre activité et de vos tâches en attente.
          </p>
        </div>

        {showCountdown && (
          <div className="shrink-0 hidden sm:block">
            <SubscriptionCountdown
              startDate={user!.abonnementStartDate!}
              period={user!.abonnementPeriod ?? "mensuel"}
              endDateApi={user!.abonnementEndDate}
              planLibelle={plan}
              onRenew={() => navigate("/parametres")}
            />
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 md:mb-8">
        <div className="opacity-0 animate-slide-up stagger-1" style={{ animationFillMode: "forwards" }}>
          <KPICard
            title="Statut compte"
            value={statut}
            subtitle={user?.typeMembre || "Membre"}
            icon={CheckCircle}
            variant="success"
            actions={[{ label: "Voir KYC" }, { label: "Support" }]}
          />
        </div>
        <div className="opacity-0 animate-slide-up stagger-2" style={{ animationFillMode: "forwards" }}>
          <KPICard
            title="Abonnement"
            value={plan}
            subtitle={user?.nombreEmployes ? `${user.nombreEmployes} employés` : "Mon plan"}
            icon={CreditCard}
            variant="primary"
            actions={[{ label: "Renouveler" }, { label: "Upgrader" }]}
          />
        </div>
        <div className="opacity-0 animate-slide-up stagger-3" style={{ animationFillMode: "forwards" }}>
          <KPICard
            title="Secteur & Filière"
            value={secteur}
            subtitle={user?.sousFiliereNom || region}
            icon={Users}
            variant="default"
            actions={[{ label: "Mon entreprise", onClick: () => navigate("/mon-entreprise") }]}
          />
        </div>
        <div className="opacity-0 animate-slide-up stagger-4" style={{ animationFillMode: "forwards" }}>
          <KPICard
            title="Localisation"
            value={user?.communeNom || user?.regionNom || "—"}
            subtitle={user?.interventionScope === "national" ? "Portée nationale" : region}
            icon={Activity}
            variant="warning"
            actions={[{ label: "Voir profil", onClick: () => navigate("/parametres") }]}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Action Center */}
        <div className="lg:col-span-2 opacity-0 animate-slide-up stagger-2" style={{ animationFillMode: "forwards" }}>
          <ActionCenter />
        </div>

        {/* Health Score */}
        <div className="opacity-0 animate-slide-up stagger-3" style={{ animationFillMode: "forwards" }}>
          <HealthScore
            score={72}
            breakdown={[
              { label: "Profil entreprise", score: 28, max: 30 },
              { label: "KYC & Documents", score: 22, max: 30 },
              { label: "Activité (30j)", score: 22, max: 40 },
            ]}
          />
        </div>
      </div>

      {/* Module Cards */}
      {/* <div className="mb-4 md:mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-3 md:mb-4">
          Vos modules
        </h2>
      </div> */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="opacity-0 animate-slide-up stagger-1" style={{ animationFillMode: "forwards" }}>
          <ModuleCard
            title="Incubateur"
            description="Développez votre projet avec nos experts"
            icon={Rocket}
            stats={[
              { label: "Projets actifs", value: 2 },
              { label: "Livrables en retard", value: 1 },
            ]}
            cta="Ouvrir projet"
            variant="primary"
          />
        </div>
        <div className="opacity-0 animate-slide-up stagger-2" style={{ animationFillMode: "forwards" }}>
          <ModuleCard
            title="Appels d'offres"
            description="Répondez et créez des appels d'offres"
            icon={FileText}
            stats={[
              { label: "AO ouverts", value: 8 },
              { label: "Échéances < 7j", value: 3 },
            ]}
            cta="Voir les AO"
            variant="secondary"
          />
        </div>
        <div className="opacity-0 animate-slide-up stagger-3" style={{ animationFillMode: "forwards" }}>
          <ModuleCard
            title="Formation"
            description="PME Academy - Formez vos équipes"
            icon={GraduationCap}
            stats={[
              { label: "Cours en cours", value: 4 },
              { label: "Certificats", value: 6 },
            ]}
            cta="Explorer les cours"
          />
        </div>
        <div className="opacity-0 animate-slide-up stagger-4" style={{ animationFillMode: "forwards" }}>
          <ModuleCard
            title="Marketplace"
            description="Achetez et vendez sur la plateforme"
            icon={ShoppingCart}
            stats={[
              { label: "Commandes", value: 15 },
              { label: "Produits actifs", value: 24 },
            ]}
            cta="Gérer ma boutique"
          />
        </div>
        <div className="opacity-0 animate-slide-up stagger-5" style={{ animationFillMode: "forwards" }}>
          <ModuleCard
            title="Financement"
            description="Accédez à des solutions de financement"
            icon={Wallet}
            stats={[
              { label: "Dossiers", value: 1 },
              { label: "En cours", value: 1 },
            ]}
            cta="Soumettre un dossier"
          />
        </div>
        <div className="opacity-0 animate-slide-up stagger-5" style={{ animationFillMode: "forwards" }}>
          <ModuleCard
            title="Data Hub"
            description="Analysez vos données et performances"
            icon={BarChart3}
            stats={[
              { label: "Rapports", value: 3 },
              { label: "Exports", value: 0 },
            ]}
            cta="Voir insights"
            locked
            requiredPlan="Argent"
          />
        </div>
      </div> */}
    </DashboardLayout>
  );
};

export default Index;
