import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check, X, Crown, Star, Sparkles, CreditCard,
  Building2, Users, Landmark, ArrowUpCircle, Loader2,
  CalendarDays, CheckCircle2, Clock, AlertCircle, RefreshCw, Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { TIER_CONFIGS } from "@/lib/permissions";
import type { SubscriptionTier } from "@/types/subscription";
import { abonnementsApi, paymentsApi, type AbonnementAPI, type Payment } from "@/lib/api";
import { UpgradeSubscriptionModal } from "@/components/subscription/UpgradeSubscriptionModal";

// ── Matrice des fonctionnalités (synchronisée avec permissions.ts) ─────────────

const planFeatures = [
  { name: "SSO Hub CPU-PME",               mi_basic: true,  mi_argent: true,  mi_or: true,  me_basic: true,  me_argent: true,  me_or: true,  organisation: true,  federation: true,  institutionnel: true  },
  { name: "Profil public & Annuaire",      mi_basic: true,  mi_argent: true,  mi_or: true,  me_basic: true,  me_argent: true,  me_or: true,  organisation: true,  federation: true,  institutionnel: true  },
  { name: "Gestion équipe",                mi_basic: false, mi_argent: false, mi_or: false, me_basic: "1",   me_argent: "3",   me_or: "5",   organisation: "10",  federation: "20",  institutionnel: "∞"   },
  { name: "Affiliation",                   mi_basic: false, mi_argent: false, mi_or: false, me_basic: false, me_argent: false, me_or: false, organisation: true,  federation: true,  institutionnel: false },
  { name: "Marketplace acheteur",          mi_basic: true,  mi_argent: true,  mi_or: true,  me_basic: true,  me_argent: true,  me_or: true,  organisation: true,  federation: true,  institutionnel: true  },
  { name: "Marketplace vendeur",           mi_basic: false, mi_argent: true,  mi_or: true,  me_basic: false, me_argent: true,  me_or: true,  organisation: true,  federation: true,  institutionnel: true  },
  { name: "Appels d'offres (consulter)",   mi_basic: true,  mi_argent: true,  mi_or: true,  me_basic: true,  me_argent: true,  me_or: true,  organisation: true,  federation: true,  institutionnel: true  },
  { name: "Appels d'offres (soumettre)",   mi_basic: false, mi_argent: true,  mi_or: true,  me_basic: false, me_argent: true,  me_or: true,  organisation: true,  federation: true,  institutionnel: false },
  { name: "Publication appels d'offres",   mi_basic: false, mi_argent: true,  mi_or: true,  me_basic: false, me_argent: true,  me_or: true,  organisation: true,  federation: true,  institutionnel: true  },
  { name: "Formation (apprenant)",         mi_basic: true,  mi_argent: true,  mi_or: true,  me_basic: true,  me_argent: true,  me_or: true,  organisation: true,  federation: true,  institutionnel: true  },
  { name: "Formation (créateur)",          mi_basic: false, mi_argent: false, mi_or: true,  me_basic: false, me_argent: false, me_or: true,  organisation: true,  federation: true,  institutionnel: true  },
  { name: "Incubateur & accompagnement",   mi_basic: false, mi_argent: true,  mi_or: true,  me_basic: false, me_argent: true,  me_or: true,  organisation: true,  federation: true,  institutionnel: true  },
  { name: "Financement (demander)",        mi_basic: false, mi_argent: true,  mi_or: true,  me_basic: false, me_argent: true,  me_or: true,  organisation: true,  federation: true,  institutionnel: false },
  { name: "Financement (donner)",          mi_basic: false, mi_argent: false, mi_or: false, me_basic: false, me_argent: false, me_or: false, organisation: false, federation: false, institutionnel: true  },
  { name: "Événements (participer)",       mi_basic: true,  mi_argent: true,  mi_or: true,  me_basic: true,  me_argent: true,  me_or: true,  organisation: true,  federation: true,  institutionnel: true  },
  { name: "Organiser un événement",        mi_basic: false, mi_argent: false, mi_or: true,  me_basic: false, me_argent: false, me_or: true,  organisation: true,  federation: true,  institutionnel: true  },
  { name: "Data Hub & Analytics",          mi_basic: false, mi_argent: false, mi_or: true,  me_basic: false, me_argent: false, me_or: true,  organisation: true,  federation: true,  institutionnel: true  },
  { name: "Exports (PDF/XLSX)",            mi_basic: false, mi_argent: false, mi_or: true,  me_basic: false, me_argent: false, me_or: true,  organisation: true,  federation: true,  institutionnel: true  },
  { name: "Support prioritaire",           mi_basic: false, mi_argent: true,  mi_or: true,  me_basic: false, me_argent: true,  me_or: true,  organisation: true,  federation: true,  institutionnel: true  },
  { name: "API & Intégrations",            mi_basic: false, mi_argent: false, mi_or: false, me_basic: false, me_argent: false, me_or: false, organisation: false, federation: false, institutionnel: true  },
];

type FeatureKey = "mi_basic" | "mi_argent" | "mi_or" | "me_basic" | "me_argent" | "me_or" | "organisation" | "federation" | "institutionnel";

function normLibelle(raw: string): string {
  return raw.replace(/&amp;/g, "&").replace(/&#x2F;/gi, "/").replace(/&#x27;/gi, "'");
}

function planIcon(libelle: string) {
  const n = normLibelle(libelle).toLowerCase();
  if (n.includes("institutionnel")) return Landmark;
  if (n.includes("fédération") || n.includes("federation")) return Users;
  if (n.includes("association") || n.includes("coopérative") || n.includes("organisation")) return Building2;
  if (n.includes(" or ") || n.includes("gold")) return Crown;
  if (n.includes("argent") || n.includes("silver")) return Star;
  return Sparkles;
}

function planColors(libelle: string): { color: string; textColor: string; borderColor: string } {
  const n = normLibelle(libelle).toLowerCase();
  if (n.includes("institutionnel")) return { color: "bg-amber-500/10", textColor: "text-amber-500", borderColor: "border-amber-500" };
  if (n.includes("fédération") || n.includes("federation")) return { color: "bg-purple-500/10", textColor: "text-purple-500", borderColor: "border-purple-500" };
  if (n.includes("association") || n.includes("coopérative") || n.includes("organisation")) return { color: "bg-blue-500/10", textColor: "text-blue-500", borderColor: "border-blue-500" };
  if (n.includes(" or ") || n.includes("gold")) {
    if (n.includes("entreprise")) return { color: "bg-primary/10", textColor: "text-primary", borderColor: "border-primary" };
    return { color: "bg-yellow-500/10", textColor: "text-yellow-600", borderColor: "border-yellow-500" };
  }
  if (n.includes("argent") || n.includes("silver")) {
    if (n.includes("entreprise")) return { color: "bg-indigo-500/10", textColor: "text-indigo-600", borderColor: "border-indigo-400" };
    return { color: "bg-secondary/10", textColor: "text-secondary", borderColor: "border-secondary" };
  }
  if (n.includes("entreprise")) return { color: "bg-sky-500/10", textColor: "text-sky-600", borderColor: "border-sky-400" };
  return { color: "bg-muted", textColor: "text-muted-foreground", borderColor: "border-muted" };
}

// ── Règles d'évolution d'abonnement ───────────────────────────────────────────

// Tiers qui ne peuvent que se renouveler (pas de changement de type possible)
const RENEWAL_ONLY_TIERS = ["ME_OR", "ORGANISATION", "FEDERATION", "INSTITUTIONNEL"];

// Ordre des libellés pour le classement (doit correspondre à l'ordre dans le modal)
const LIBELLE_TIER_ORDER = [
  "basic individuel",
  "argent professionnel",
  "or professionnel",
  "basic entreprise",
  "argent entreprise",
  "or entreprise",
  "association",
  "fédération",
  "institutionnel",
];

function getPlanRank(libelle: string): number {
  const n = normLibelle(libelle).toLowerCase();
  const idx = LIBELLE_TIER_ORDER.findIndex((t) => n.includes(t));
  return idx === -1 ? 99 : idx;
}

function getPlanCategory(libelle: string): "collective" | "entreprise" | "individual" {
  const n = normLibelle(libelle).toLowerCase();
  if (
    n.includes("institutionnel") ||
    n.includes("fédération") || n.includes("federation") ||
    n.includes("association") || n.includes("coopérative") || n.includes("organisation")
  ) return "collective";
  if (n.includes("entreprise")) return "entreprise";
  return "individual";
}

function paymentStatusBadge(status: string) {
  switch (status?.toLowerCase()) {
    case "success": case "successful": case "paid":
      return <Badge className="bg-green-500/10 text-green-600 border-green-500/30 gap-1"><CheckCircle2 className="w-3 h-3" />Payé</Badge>;
    case "pending":
      return <Badge variant="outline" className="gap-1 text-amber-600 border-amber-400"><Clock className="w-3 h-3" />En attente</Badge>;
    case "failed": case "error":
      return <Badge variant="destructive" className="gap-1"><AlertCircle className="w-3 h-3" />Échoué</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function Abonnement() {
  const { user } = useAuth();

  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [plans, setPlans] = useState<AbonnementAPI[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<AbonnementAPI | null>(null);

  // Tier actuel
  const currentTier = user?.subscription?.tier ?? "ME_ARGENT";
  const tierConfig = TIER_CONFIGS[currentTier as SubscriptionTier] ?? TIER_CONFIGS["ME_ARGENT"];
  const currentLibelle = user?.planLibelle ?? tierConfig.name;

  // Règles d'évolution
  const isRenewalOnly = RENEWAL_ONLY_TIERS.includes(currentTier);
  const currentRank = getPlanRank(currentLibelle);

  useEffect(() => {
    abonnementsApi.getAll()
      .then((data) => setPlans(data.filter((p) => p.isActive)))
      .catch(() => {})
      .finally(() => setPlansLoading(false));
  }, []);

  useEffect(() => {
    if (!user?.id) { setPaymentsLoading(false); return; }
    paymentsApi.getByUser(user.id)
      .then(setPayments)
      .catch(() => {})
      .finally(() => setPaymentsLoading(false));
  }, [user?.id]);

  // Grouper les plans par type de membre
  const grouped = plans.reduce<Record<string, AbonnementAPI[]>>((acc, p) => {
    const key = p.typeMembre.name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  const isCurrentPlan = (p: AbonnementAPI) =>
    normLibelle(p.libelle).toLowerCase() === normLibelle(currentLibelle).toLowerCase();

  // Plan API correspondant à l'abonnement actuel (pour le renouvellement)
  const currentApiPlan = plans.find((p) => isCurrentPlan(p)) ?? null;

  // Détermine si un plan est une évolution valide pour l'utilisateur
  function isValidUpgrade(plan: AbonnementAPI): boolean {
    if (isCurrentPlan(plan)) return false;
    if (isRenewalOnly) return false;

    const planCat = getPlanCategory(normLibelle(plan.libelle));
    if (planCat === "collective") return false; // personne ne peut aller vers collectif depuis autre chose

    const planRankVal = getPlanRank(normLibelle(plan.libelle));

    if (tierConfig.category === "entreprise") {
      // Entreprise → uniquement montée en gamme dans entreprise
      return planCat === "entreprise" && planRankVal > currentRank;
    }

    // Individuel → individuel + entreprise avec rang supérieur
    return planRankVal > currentRank;
  }

  // Groupes filtrés selon les règles d'évolution
  const visibleGrouped = Object.entries(grouped).reduce<Record<string, AbonnementAPI[]>>(
    (acc, [typeName, typePlans]) => {
      if (isRenewalOnly) return acc; // aucun plan disponible pour changement

      const validPlans = typePlans.filter((p) => isCurrentPlan(p) || isValidUpgrade(p));
      if (validPlans.length > 0) acc[typeName] = validPlans;
      return acc;
    },
    {}
  );

  // Icône/couleurs du plan actuel
  const CurrentIcon = planIcon(currentLibelle);
  const { color: currentColor, textColor: currentTextColor } = planColors(currentLibelle);

  // Colonnes pour le tableau comparatif : plans affichés uniquement
  const featureCols: { key: FeatureKey; label: string; isCurrent: boolean }[] = [
    { key: "mi_basic",      label: "Basic Indiv.",   isCurrent: currentTier === "MI_BASIC" },
    { key: "mi_argent",     label: "Argent Indiv.",  isCurrent: currentTier === "MI_ARGENT" },
    { key: "mi_or",         label: "Or Indiv.",      isCurrent: currentTier === "MI_OR" },
    { key: "me_basic",      label: "Basic Entr.",    isCurrent: currentTier === "ME_BASIC" },
    { key: "me_argent",     label: "Argent Entr.",   isCurrent: currentTier === "ME_ARGENT" },
    { key: "me_or",         label: "Or Entr.",       isCurrent: currentTier === "ME_OR" },
    { key: "organisation",  label: "Organisation",   isCurrent: currentTier === "ORGANISATION" },
    { key: "federation",    label: "Fédération",     isCurrent: currentTier === "FEDERATION" },
    { key: "institutionnel",label: "Institutionnel", isCurrent: currentTier === "INSTITUTIONNEL" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Abonnement & Facturation</h1>
          <p className="text-muted-foreground mt-2">
            Gérez votre plan et vos paiements
          </p>
        </div>

        {/* Plan actuel */}
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6">
            <div className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0", currentColor)}>
                <CurrentIcon className={cn("w-6 h-6", currentTextColor)} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Plan actuel</p>
                <p className="text-xl font-bold">{normLibelle(currentLibelle)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {tierConfig.teamLimit === -1
                    ? "Équipe illimitée"
                    : tierConfig.teamLimit <= 1
                      ? "Individuel"
                      : `Jusqu'à ${tierConfig.teamLimit} utilisateurs`}
                  {tierConfig.price > 0 && ` · ${tierConfig.price.toLocaleString("fr-FR")} FCFA/mois`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Actif
              </Badge>
              {isRenewalOnly ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => { setSelectedPlanForUpgrade(currentApiPlan); setUpgradeOpen(true); }}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Renouveler l'abonnement
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => { setSelectedPlanForUpgrade(null); setUpgradeOpen(true); }}
                >
                  <ArrowUpCircle className="w-3.5 h-3.5" />
                  Changer de plan
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Toggle mensuel / annuel */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-1 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all",
                billingCycle === "monthly" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all",
                billingCycle === "yearly" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Annuel
              <Badge className="ml-2 bg-secondary text-secondary-foreground text-[10px] px-1.5">-17%</Badge>
            </button>
          </div>
        </div>

        {/* Grille des plans depuis l'API */}
        {plansLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : isRenewalOnly ? (
          /* ── Tiers à renouvellement uniquement ───────────────── */
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Abonnement fixe</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md">
                    Votre abonnement <span className="font-medium">{normLibelle(currentLibelle)}</span> est un
                    type unique. Il ne peut pas être changé pour un autre type — vous pouvez uniquement
                    le renouveler (mensuel ou annuel).
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="gap-1.5 shrink-0"
                onClick={() => { setSelectedPlanForUpgrade(currentApiPlan); setUpgradeOpen(true); }}
              >
                <RefreshCw className="w-4 h-4" />
                Renouveler
              </Button>
            </CardContent>
          </Card>
        ) : Object.keys(visibleGrouped).length === 0 ? (
          <p className="text-center text-muted-foreground py-6 text-sm">
            Aucun plan supérieur disponible pour votre catégorie.
          </p>
        ) : (
          Object.entries(visibleGrouped).map(([typeName, typePlans]) => (
            <div key={typeName} className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{typeName}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {typePlans.map((plan) => {
                  const current = isCurrentPlan(plan);
                  const Icon = planIcon(plan.libelle);
                  const { color, textColor, borderColor } = planColors(plan.libelle);
                  const montant = billingCycle === "monthly"
                    ? parseInt(plan.tarifMensuel)
                    : parseInt(plan.tarifAnnuel);

                  return (
                    <Card
                      key={plan.id}
                      className={cn(
                        "relative transition-all duration-300 border-2",
                        current
                          ? "ring-2 ring-primary ring-offset-2 shadow-xl"
                          : cn("hover:shadow-lg hover:scale-[1.01] cursor-pointer", borderColor)
                      )}
                    >
                      {current && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="bg-primary text-primary-foreground shadow">✓ Votre plan</Badge>
                        </div>
                      )}
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", color)}>
                            <Icon className={cn("w-5 h-5", textColor)} />
                          </div>
                          <Badge variant="outline" className="text-[10px]">{plan.typeMembre.name}</Badge>
                        </div>
                        <CardTitle className="text-base mt-2">{normLibelle(plan.libelle)}</CardTitle>
                        <CardDescription className="text-xs">{normLibelle(plan.description)}</CardDescription>
                        <div className="mt-2">
                          {plan.surDevis ? (
                            <span className={cn("text-xl font-bold", textColor)}>Sur devis</span>
                          ) : (
                            <>
                              <span className={cn("text-2xl font-bold", textColor)}>
                                {montant.toLocaleString("fr-FR")}
                              </span>
                              <span className="text-xs text-muted-foreground ml-1">
                                FCFA/{billingCycle === "monthly" ? "mois" : "an"}
                              </span>
                            </>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Avantages */}
                        {plan.avantages?.filter((a) => a.actif).length > 0 && (
                          <ul className="space-y-2">
                            {plan.avantages.filter((a) => a.actif).map((av) => (
                              <li key={av.id} className="flex items-start gap-2 text-sm">
                                <Check className={cn("w-4 h-4 shrink-0 mt-0.5", textColor)} />
                                <span className="text-muted-foreground leading-snug">{av.libelle}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        <Button
                          className="w-full"
                          variant={current ? "default" : "outline"}
                          disabled={current}
                          onClick={() => {
                            if (!current) {
                              setSelectedPlanForUpgrade(plan);
                              setUpgradeOpen(true);
                            }
                          }}
                        >
                          {current ? "Plan actif" : "Choisir ce plan"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* Tableau comparatif des fonctionnalités */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Comparaison des fonctionnalités</CardTitle>
            <CardDescription>Votre plan actuel est mis en évidence</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground min-w-[160px] sticky left-0 bg-background">
                      Fonctionnalité
                    </th>
                    {featureCols.map((col) => (
                      <th
                        key={col.key}
                        className={cn(
                          "text-center py-3 px-2 font-medium min-w-[80px]",
                          col.isCurrent && "text-primary bg-primary/5 rounded-t-md"
                        )}
                      >
                        {col.label}
                        {col.isCurrent && <div className="text-[9px] text-primary">← vous</div>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {planFeatures.map((feature, idx) => (
                    <tr key={feature.name} className={cn("border-b", idx % 2 === 0 && "bg-muted/20")}>
                      <td className="py-2.5 px-2 font-medium sticky left-0 bg-background">{feature.name}</td>
                      {featureCols.map((col) => {
                        const val = feature[col.key as keyof typeof feature];
                        return (
                          <td
                            key={col.key}
                            className={cn("text-center py-2.5 px-2", col.isCurrent && "bg-primary/5")}
                          >
                            {typeof val === "boolean" ? (
                              val
                                ? <Check className="w-3.5 h-3.5 text-green-500 mx-auto" />
                                : <X className="w-3.5 h-3.5 text-muted-foreground/30 mx-auto" />
                            ) : (
                              <span className={cn("font-semibold", col.isCurrent ? "text-primary" : "text-muted-foreground")}>
                                {val as string}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card> */}

        {/* Historique des paiements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Historique de facturation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">Aucun paiement enregistré</p>
                <p className="text-sm mt-1">Vos factures apparaîtront ici après votre premier paiement</p>
              </div>
            ) : (
              <div className="space-y-2">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <CreditCard className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          Paiement abonnement
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(p.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric", month: "long", year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {paymentStatusBadge(p.status)}
                      <span className="font-bold text-sm">
                        {parseInt(String(p.amount ?? 0)).toLocaleString("fr-FR")} FCFA
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Modal d'upgrade */}
      <UpgradeSubscriptionModal
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        initialPlan={selectedPlanForUpgrade}
      />
    </DashboardLayout>
  );
}
