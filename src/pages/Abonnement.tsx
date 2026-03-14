import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Crown, Star, Sparkles, Smartphone, CreditCard, Building2, Users, Landmark, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { TIER_CONFIGS } from "@/lib/permissions";

interface PlanFeature {
  name: string;
  mi_basic: boolean | string;
  mi_argent: boolean | string;
  mi_or: boolean | string;
  me_basic: boolean | string;
  me_argent: boolean | string;
  me_or: boolean | string;
  organisation: boolean | string;
  federation: boolean | string;
  institutionnel: boolean | string;
}

const planFeatures: PlanFeature[] = [
  { name: "SSO Hub CPU-PME",                  mi_basic: true,  mi_argent: true,  mi_or: true,  me_basic: true,  me_argent: true,  me_or: true,  organisation: true,  federation: true,  institutionnel: true  },
  { name: "Profil public (fiche)",             mi_basic: false, mi_argent: false, mi_or: false, me_basic: true,  me_argent: true,  me_or: true,  organisation: true,  federation: true,  institutionnel: false },
  { name: "Annuaire CPU-PME",                  mi_basic: false, mi_argent: false, mi_or: false, me_basic: true,  me_argent: true,  me_or: true,  organisation: true,  federation: true,  institutionnel: true  },
  { name: "Gestion équipe",                    mi_basic: false, mi_argent: false, mi_or: false, me_basic: "5",   me_argent: "10",  me_or: "20",  organisation: "50",  federation: "100", institutionnel: "∞"   },
  { name: "Affiliation",                       mi_basic: false, mi_argent: false, mi_or: false, me_basic: false, me_argent: false, me_or: false, organisation: true,  federation: false, institutionnel: false },
  { name: "Marketplace (acheteur)",            mi_basic: true,  mi_argent: true,  mi_or: true,  me_basic: false, me_argent: true,  me_or: true,  organisation: true,  federation: true,  institutionnel: true  },
  { name: "Marketplace (vendeur)",             mi_basic: false, mi_argent: false, mi_or: false, me_basic: false, me_argent: true,  me_or: true,  organisation: true,  federation: true,  institutionnel: false },
  { name: "Appels d'offres (consultation)",    mi_basic: true,  mi_argent: true,  mi_or: true,  me_basic: true,  me_argent: true,  me_or: true,  organisation: true,  federation: true,  institutionnel: true  },
  { name: "Appels d'offres (soumission)",      mi_basic: false, mi_argent: false, mi_or: true,  me_basic: false, me_argent: true,  me_or: true,  organisation: true,  federation: true,  institutionnel: false },
  { name: "Publication appels d'offres",       mi_basic: false, mi_argent: false, mi_or: false, me_basic: false, me_argent: false, me_or: true,  organisation: true,  federation: true,  institutionnel: false },
  { name: "Formation (apprenant)",             mi_basic: true,  mi_argent: true,  mi_or: true,  me_basic: true,  me_argent: true,  me_or: true,  organisation: true,  federation: true,  institutionnel: true  },
  { name: "Formation (créateur)",              mi_basic: false, mi_argent: false, mi_or: true,  me_basic: false, me_argent: false, me_or: true,  organisation: true,  federation: true,  institutionnel: true  },
  { name: "Incubateur & accompagnement",       mi_basic: true,  mi_argent: true,  mi_or: true,  me_basic: true,  me_argent: true,  me_or: true,  organisation: true,  federation: true,  institutionnel: false },
  { name: "Financement (demandes)",            mi_basic: false, mi_argent: false, mi_or: false, me_basic: false, me_argent: true,  me_or: true,  organisation: false, federation: true,  institutionnel: false },
  { name: "Financement (donner)",              mi_basic: false, mi_argent: false, mi_or: false, me_basic: false, me_argent: false, me_or: true,  organisation: false, federation: true,  institutionnel: true  },
  { name: "Événements (participant)",          mi_basic: true,  mi_argent: true,  mi_or: true,  me_basic: true,  me_argent: true,  me_or: true,  organisation: true,  federation: true,  institutionnel: true  },
  { name: "Événements B2B",                    mi_basic: false, mi_argent: true,  mi_or: true,  me_basic: true,  me_argent: true,  me_or: true,  organisation: true,  federation: true,  institutionnel: true  },
  { name: "Organiser un événement",            mi_basic: false, mi_argent: false, mi_or: false, me_basic: false, me_argent: false, me_or: false, organisation: true,  federation: true,  institutionnel: true  },
  { name: "Data Hub & Analytics",              mi_basic: false, mi_argent: false, mi_or: false, me_basic: false, me_argent: false, me_or: false, organisation: true,  federation: true,  institutionnel: true  },
  { name: "Exports (PDF/XLSX)",                mi_basic: false, mi_argent: false, mi_or: false, me_basic: false, me_argent: false, me_or: false, organisation: true,  federation: true,  institutionnel: true  },
  { name: "API & Intégrations",                mi_basic: false, mi_argent: false, mi_or: false, me_basic: false, me_argent: false, me_or: false, organisation: false, federation: false, institutionnel: true  },
];

const plans = [
  // ── Membre Individuel ──────────────────────────────────────────
  {
    id: "mi_basic",
    name: "Basic Individuel",
    category: "Membre Individuel",
    price: "1 000",
    period: "FCFA/mois",
    priceYearly: "10 000",
    description: "Pour démarrer et découvrir",
    icon: Sparkles,
    color: "bg-muted",
    textColor: "text-muted-foreground",
    borderColor: "border-muted",
    popular: false,
  },
  {
    id: "mi_argent",
    name: "Argent Professionnel",
    category: "Membre Individuel",
    price: "4 000",
    period: "FCFA/mois",
    priceYearly: "40 000",
    description: "Pour les professionnels actifs",
    icon: Star,
    color: "bg-secondary/10",
    textColor: "text-secondary",
    borderColor: "border-secondary",
    popular: false,
  },
  {
    id: "mi_or",
    name: "Or Professionnel",
    category: "Membre Individuel",
    price: "7 000",
    period: "FCFA/mois",
    priceYearly: "80 000",
    description: "Pour les consultants et experts",
    icon: Crown,
    color: "bg-yellow-500/10",
    textColor: "text-yellow-600",
    borderColor: "border-yellow-500",
    popular: false,
  },
  // ── Membre Entreprise ──────────────────────────────────────────
  {
    id: "me_basic",
    name: "Basic Entreprise",
    category: "Membre Entreprise",
    price: "2 500",
    period: "FCFA/mois",
    priceYearly: "30 000",
    description: "Pour les PME qui démarrent",
    icon: Building2,
    color: "bg-sky-500/10",
    textColor: "text-sky-600",
    borderColor: "border-sky-400",
    popular: false,
  },
  {
    id: "me_argent",
    name: "Argent Entreprise",
    category: "Membre Entreprise",
    price: "5 000",
    period: "FCFA/mois",
    priceYearly: "50 000",
    description: "Pour les PME en croissance",
    icon: Star,
    color: "bg-indigo-500/10",
    textColor: "text-indigo-600",
    borderColor: "border-indigo-400",
    popular: true,
  },
  {
    id: "me_or",
    name: "Or Entreprise",
    category: "Membre Entreprise",
    price: "10 000",
    period: "FCFA/mois",
    priceYearly: "100 000",
    description: "Pour les entreprises leaders",
    icon: Crown,
    color: "bg-primary/10",
    textColor: "text-primary",
    borderColor: "border-primary",
    popular: false,
  },
  // ── Collectif ──────────────────────────────────────────────────
  {
    id: "organisation",
    name: "Organisation",
    category: "Collectif",
    price: "17 500",
    period: "FCFA/mois",
    priceYearly: "200 000",
    description: "Accès opérationnel complet",
    icon: Building2,
    color: "bg-blue-500/10",
    textColor: "text-blue-500",
    borderColor: "border-blue-500",
    popular: false,
  },
  {
    id: "federation",
    name: "Fédération",
    category: "Collectif",
    price: "30 000",
    period: "FCFA/mois",
    priceYearly: "350 000",
    description: "Pilotage de filière",
    icon: Users,
    color: "bg-purple-500/10",
    textColor: "text-purple-500",
    borderColor: "border-purple-500",
    popular: false,
  },
  {
    id: "institutionnel",
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
    popular: false,
  },
];

const paymentMethods = [
  { id: "orange", name: "Orange Money", icon: "🟠", color: "bg-orange-500" },
  { id: "mtn", name: "MTN MoMo", icon: "🟡", color: "bg-yellow-500" },
  { id: "wave", name: "Wave", icon: "🔵", color: "bg-blue-500" },
  { id: "card", name: "Carte bancaire", icon: "💳", color: "bg-gray-500" },
];

export default function Abonnement() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>("basic");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // Obtenir le tier actuel et le plan correspondant
  const currentTier = user?.subscription?.tier || 'ME_ARGENT';
  const tierConfig = TIER_CONFIGS[currentTier];
  const currentPlanId = currentTier.toLowerCase();
  const currentPlan = plans.find(p => p.id === currentPlanId);

  // Icône et couleur du plan actuel
  const CurrentIcon = currentPlan?.icon || Sparkles;
  const currentColor = currentPlan?.color || "bg-muted";
  const currentTextColor = currentPlan?.textColor || "text-muted-foreground";

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Abonnement & Facturation</h1>
          <p className="text-muted-foreground mt-2">
            Choisissez le plan adapté à vos besoins et développez votre entreprise
          </p>
        </div>

        {/* Current Plan Summary */}
        <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", currentColor)}>
                <CurrentIcon className={cn("w-6 h-6", currentTextColor)} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plan actuel</p>
                <p className="text-xl font-bold text-foreground">
                  {currentPlan?.name} {currentPlan?.price === "0" ? "(Gratuit)" : `(${currentPlan?.price} ${currentPlan?.period})`}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {tierConfig.teamLimit === -1 ? "Équipe illimitée" : `${tierConfig.teamLimit} membre(s) max`}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="outline" className="text-secondary border-secondary">
                ✓ Actif
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Mode Simulation
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all",
                billingCycle === "monthly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all",
                billingCycle === "yearly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Annuel
              <Badge className="ml-2 bg-secondary text-secondary-foreground">-20%</Badge>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === currentPlanId;
            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative transition-all duration-300",
                  isCurrentPlan
                    ? "ring-2 ring-primary ring-offset-2 shadow-xl"
                    : "hover:shadow-lg hover:scale-[1.02] cursor-pointer",
                  plan.popular && !isCurrentPlan && "border-secondary"
                )}
                onClick={() => !isCurrentPlan && setSelectedPlan(plan.id)}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground shadow-lg">
                      ✓ Votre plan actuel
                    </Badge>
                  </div>
                )}
                {plan.popular && !isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-secondary text-secondary-foreground shadow-lg">
                      Plus populaire
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div
                    className={cn(
                      "w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4",
                      plan.color
                    )}
                  >
                    <plan.icon className={cn("w-8 h-8", plan.textColor)} />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">
                      {billingCycle === "yearly" ? plan.priceYearly : plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-muted-foreground ml-1">
                        {billingCycle === "yearly" ? "FCFA/an" : plan.period}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    className={cn("w-full")}
                    variant={isCurrentPlan ? "default" : "outline"}
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan ? "Plan actif" : "Choisir ce plan"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Comparison */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Comparaison des fonctionnalités</CardTitle>
            <CardDescription>
              Découvrez ce qui est inclus dans chaque plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-3 font-medium text-muted-foreground sticky left-0 bg-background">
                      Fonctionnalité
                    </th>
                    <th className="text-center py-4 px-2 font-medium text-xs">
                      <div className={cn("flex flex-col items-center gap-1", currentTier === 'BASIC' && "text-primary")}>
                        <Sparkles className="w-4 h-4" />
                        <span>Basic</span>
                      </div>
                    </th>
                    <th className="text-center py-4 px-2 font-medium text-xs">
                      <div className={cn("flex flex-col items-center gap-1", currentTier === 'ARGENT' && "text-secondary")}>
                        <Star className="w-4 h-4" />
                        <span>Argent</span>
                      </div>
                    </th>
                    <th className="text-center py-4 px-2 font-medium text-xs">
                      <div className={cn("flex flex-col items-center gap-1", currentTier === 'OR' && "text-primary")}>
                        <Crown className="w-4 h-4" />
                        <span>Or</span>
                      </div>
                    </th>
                    <th className="text-center py-4 px-2 font-medium text-xs">
                      <div className={cn("flex flex-col items-center gap-1", currentTier === 'ORGANISATION' && "text-blue-500")}>
                        <Building2 className="w-4 h-4" />
                        <span>Orga</span>
                      </div>
                    </th>
                    <th className="text-center py-4 px-2 font-medium text-xs">
                      <div className={cn("flex flex-col items-center gap-1", currentTier === 'FEDERATION' && "text-purple-500")}>
                        <Users className="w-4 h-4" />
                        <span>Fédé</span>
                      </div>
                    </th>
                    <th className="text-center py-4 px-2 font-medium text-xs">
                      <div className={cn("flex flex-col items-center gap-1", currentTier === 'INSTITUTIONNEL' && "text-amber-500")}>
                        <Landmark className="w-4 h-4" />
                        <span>Instit</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {planFeatures.map((feature, idx) => (
                    <tr
                      key={feature.name}
                      className={cn("border-b", idx % 2 === 0 && "bg-muted/30")}
                    >
                      <td className="py-3 px-3 text-sm text-foreground sticky left-0 bg-background">
                        {feature.name}
                      </td>
                      <td className="text-center py-3 px-2">
                        {typeof feature.basic === "boolean" ? (
                          feature.basic ? (
                            <Check className="w-4 h-4 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                          )
                        ) : (
                          <span className="text-xs text-muted-foreground">{feature.basic}</span>
                        )}
                      </td>
                      <td className="text-center py-3 px-2">
                        {typeof feature.argent === "boolean" ? (
                          feature.argent ? (
                            <Check className="w-4 h-4 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                          )
                        ) : (
                          <span className="text-xs font-medium text-secondary">
                            {feature.argent}
                          </span>
                        )}
                      </td>
                      <td className="text-center py-3 px-2">
                        {typeof feature.or === "boolean" ? (
                          feature.or ? (
                            <Check className="w-4 h-4 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                          )
                        ) : (
                          <span className="text-xs font-medium text-primary">{feature.or}</span>
                        )}
                      </td>
                      <td className="text-center py-3 px-2">
                        {typeof feature.organisation === "boolean" ? (
                          feature.organisation ? (
                            <Check className="w-4 h-4 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                          )
                        ) : (
                          <span className="text-xs font-medium text-blue-500">{feature.organisation}</span>
                        )}
                      </td>
                      <td className="text-center py-3 px-2">
                        {typeof feature.federation === "boolean" ? (
                          feature.federation ? (
                            <Check className="w-4 h-4 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                          )
                        ) : (
                          <span className="text-xs font-medium text-purple-500">{feature.federation}</span>
                        )}
                      </td>
                      <td className="text-center py-3 px-2">
                        {typeof feature.institutionnel === "boolean" ? (
                          feature.institutionnel ? (
                            <Check className="w-4 h-4 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                          )
                        ) : (
                          <span className="text-xs font-medium text-amber-500">{feature.institutionnel}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card> */}

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Modes de paiement
            </CardTitle>
            <CardDescription>
              Payez facilement via Mobile Money ou carte bancaire
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-200"
                >
                  <span className="text-4xl">{method.icon}</span>
                  <span className="text-sm font-medium text-foreground">{method.name}</span>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <Button size="lg" className="gap-2">
                Procéder au paiement
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Historique de facturation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucune facture pour le moment</p>
              <p className="text-sm">Vos factures apparaîtront ici après votre premier paiement</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
