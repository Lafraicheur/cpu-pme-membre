import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { ActionCenter } from "@/components/dashboard/ActionCenter";
import { HealthScore } from "@/components/dashboard/HealthScore";
import {
  CheckCircle,
  CreditCard,
  Users,
  Activity,
} from "lucide-react";

const statutLabel: Record<string, string> = {
  approved: "Approuvé",
  pending:  "En attente",
  rejected: "Rejeté",
  active:   "Actif",
};

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

  // Sépare le préfixe "Bienvenue, " du nom pour colorer uniquement le nom
  const WELCOME_PREFIX = "Bienvenue, ";
  const isWelcomeMsg = displayed.startsWith(WELCOME_PREFIX);
  const textPrefix   = isWelcomeMsg ? WELCOME_PREFIX : "";
  const textName     = isWelcomeMsg ? displayed.slice(WELCOME_PREFIX.length) : "";
  const textOther    = isWelcomeMsg ? "" : displayed;

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-6 md:mb-8 opacity-0 animate-slide-up" style={{ animationFillMode: "forwards" }}>
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
