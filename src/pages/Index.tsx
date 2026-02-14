import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { ActionCenter } from "@/components/dashboard/ActionCenter";
import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { HealthScore } from "@/components/dashboard/HealthScore";
import {
  CheckCircle,
  CreditCard,
  Users,
  Activity,
  Rocket,
  FileText,
  GraduationCap,
  ShoppingCart,
  Wallet,
  BarChart3,
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si un abonnement est sélectionné
    const selectedTier = localStorage.getItem("demo_subscription_tier");
    if (!selectedTier) {
      // Rediriger vers la page de sélection d'abonnement
      navigate("/subscription-selector");
    }
  }, [navigate]);

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-6 md:mb-8 opacity-0 animate-slide-up" style={{ animationFillMode: "forwards" }}>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          Bienvenue, <span className="text-primary">SARL AgriTech Ivoire</span>
        </h1>
        <p className="text-muted-foreground">
          Voici un aperçu de votre activité et de vos tâches en attente.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 md:mb-8">
        <div className="opacity-0 animate-slide-up stagger-1" style={{ animationFillMode: "forwards" }}>
          <KPICard
            title="Statut compte"
            value="Actif"
            subtitle="KYC validé à 85%"
            icon={CheckCircle}
            variant="success"
            actions={[{ label: "Voir KYC" }, { label: "Support" }]}
          />
        </div>
        <div className="opacity-0 animate-slide-up stagger-2" style={{ animationFillMode: "forwards" }}>
          <KPICard
            title="Abonnement"
            value="Argent"
            subtitle="Expire dans 45 jours"
            icon={CreditCard}
            variant="primary"
            actions={[{ label: "Renouveler" }, { label: "Upgrader" }]}
          />
        </div>
        <div className="opacity-0 animate-slide-up stagger-3" style={{ animationFillMode: "forwards" }}>
          <KPICard
            title="Affiliation"
            value="COOPAGRI"
            subtitle="Filière Agroalimentaire"
            icon={Users}
            variant="default"
            actions={[{ label: "Changer affiliation" }]}
          />
        </div>
        <div className="opacity-0 animate-slide-up stagger-4" style={{ animationFillMode: "forwards" }}>
          <KPICard
            title="Pipeline business"
            value="12"
            subtitle="Opportunités actives"
            icon={Activity}
            variant="warning"
            actions={[{ label: "Ouvrir Action Center" }]}
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
