import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, Sparkles, Building2, Users, Landmark, ArrowRight } from "lucide-react";
import { SubscriptionTier } from "@/types/subscription";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const plans = [
  {
    tier: "BASIC" as SubscriptionTier,
    name: "Basic",
    category: "Individuel",
    price: "1 000",
    period: "FCFA/mois",
    priceYearly: "10 000 FCFA/an",
    description: "Pour démarrer et découvrir la plateforme",
    icon: Sparkles,
    color: "bg-muted",
    textColor: "text-muted-foreground",
    borderColor: "border-muted",
    features: [
      "1 utilisateur (entreprise)",
      "Profil public & Annuaire",
      "Consultation d'appels d'offres",
      "Formation en ligne (apprenant)",
      "Support standard",
    ],
  },
  {
    tier: "ARGENT" as SubscriptionTier,
    name: "Argent",
    category: "Individuel",
    price: "5 000",
    period: "FCFA/mois",
    priceYearly: "50 000 FCFA/an",
    description: "Pour les PME en croissance",
    icon: Star,
    color: "bg-secondary/10",
    textColor: "text-secondary",
    borderColor: "border-secondary",
    popular: true,
    features: [
      "3 utilisateurs (entreprise)",
      "Marketplace (achat + vente)",
      "AO (soumission + publication)",
      "Incubateur & Financement",
      "Support prioritaire",
    ],
  },
  {
    tier: "OR" as SubscriptionTier,
    name: "Or",
    category: "Individuel",
    price: "10 000",
    period: "FCFA/mois",
    priceYearly: "100 000 FCFA/an",
    description: "Pour les entreprises leaders",
    icon: Crown,
    color: "bg-primary/10",
    textColor: "text-primary",
    borderColor: "border-primary",
    features: [
      "5 utilisateurs (entreprise)",
      "Création de formations",
      "Organisation d'événements",
      "Data Hub & Analytics",
      "Exports PDF/XLSX",
    ],
  },
  {
    tier: "ORGANISATION" as SubscriptionTier,
    name: "Organisation",
    category: "Collectif",
    price: "17 500",
    period: "FCFA/mois",
    priceYearly: "200 000 FCFA/an",
    description: "Accès opérationnel complet",
    icon: Building2,
    color: "bg-blue-500/10",
    textColor: "text-blue-500",
    borderColor: "border-blue-500",
    features: [
      "10 utilisateurs",
      "Affiliation activée",
      "Analytics avancés",
      "Tous les modules activés",
      "Support prioritaire",
    ],
  },
  {
    tier: "FEDERATION" as SubscriptionTier,
    name: "Fédération",
    category: "Collectif",
    price: "30 000",
    period: "FCFA/mois",
    priceYearly: "350 000 FCFA/an",
    description: "Analyse sectorielle avancée",
    icon: Users,
    color: "bg-purple-500/10",
    textColor: "text-purple-500",
    borderColor: "border-purple-500",
    features: [
      "20 utilisateurs",
      "Analytics secteur",
      "Pilotage filière",
      "Outils collaboratifs avancés",
      "Support premium",
    ],
  },
  {
    tier: "INSTITUTIONNEL" as SubscriptionTier,
    name: "Institutionnel",
    category: "Collectif",
    price: "Sur devis",
    period: "",
    priceYearly: "Sur devis",
    description: "Accès illimité premium",
    icon: Landmark,
    color: "bg-amber-500/10",
    textColor: "text-amber-500",
    borderColor: "border-amber-500",
    features: [
      "Utilisateurs illimités",
      "API & Intégrations",
      "Réception de dons",
      "Analytics complets",
      "Support premium dédié",
    ],
  },
];

export default function SubscriptionSelector() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSelectPlan = async (tier: SubscriptionTier) => {
    // Effacer l'ancien utilisateur pour forcer une nouvelle connexion
    localStorage.removeItem("cpu-pme-user");

    // Stocker le tier sélectionné dans localStorage
    localStorage.setItem("demo_subscription_tier", tier);

    // Connecter automatiquement l'utilisateur avec ce tier
    await login("demo@cpu-pme.com", "demo123");

    // Forcer un rechargement pour appliquer les changements
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-[1600px] space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">CPU-PME Dashboard</h1>
          </div>
          <h2 className="text-2xl font-semibold text-foreground">
            Mode Simulation - Sélectionnez un Abonnement
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Cliquez sur un niveau d'abonnement pour simuler l'expérience utilisateur avec les fonctionnalités correspondantes
          </p>
          <Badge variant="outline" className="text-sm">
            Environnement de Test - Données Fictives
          </Badge>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.tier}
                className={cn(
                  "relative cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105",
                  "border-2 hover:border-primary/50",
                  plan.borderColor,
                  plan.color
                )}
                onClick={() => handleSelectPlan(plan.tier)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-primary to-secondary">
                      Plus populaire
                    </Badge>
                  </div>
                )}

                <CardHeader className="space-y-2 pb-3">
                  <div className="flex items-start justify-between">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", plan.color)}>
                      <Icon className={cn("w-5 h-5", plan.textColor)} />
                    </div>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                      {plan.category}
                    </Badge>
                  </div>

                  <div>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <CardDescription className="mt-1 text-xs">{plan.description}</CardDescription>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className={cn("text-xl font-bold", plan.textColor)}>
                      {plan.price}
                    </span>
                    {plan.price !== "0" && (
                      <span className="text-xs text-muted-foreground">{plan.period}</span>
                    )}
                    {plan.price === "0" && (
                      <span className="text-xs text-muted-foreground ml-2">{plan.period}</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-2 pt-3">
                  <ul className="space-y-1.5">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-1.5 text-xs">
                        <ArrowRight className={cn("w-3 h-3 mt-0.5 flex-shrink-0", plan.textColor)} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className={cn(
                    "mt-3 p-2 rounded-lg text-center text-xs font-medium transition-colors",
                    "bg-background/50 hover:bg-primary hover:text-primary-foreground"
                  )}>
                    Tester cet abonnement
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>
            💡 Vous pouvez changer d'abonnement à tout moment depuis le header du dashboard
          </p>
          <p className="text-xs">
            Cette interface est uniquement pour la simulation. En production, l'abonnement sera géré via paiement.
          </p>
        </div>
      </div>
    </div>
  );
}
