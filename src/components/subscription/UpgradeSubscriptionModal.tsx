import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, ArrowUpCircle, CheckCircle2, Crown, ExternalLink,
  Loader2, Lock, Phone, Smartphone, XCircle, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { abonnementsApi, clapayApi, type AbonnementAPI, type CountryData, type OperatorData } from "@/lib/api";

type Step = "plan" | "payment" | "redirect";
type PayStatus = "pending" | "success" | "failed";

const LIBELLE_TIER_ORDER = [
  "Plan Basic Individuel",
  "Plan Argent Professionnel",
  "Plan Or Professionnel",
  "Plan Basic Entreprise",
  "Plan Argent Entreprise",
  "Plan Or Entreprise",
  "Abonnement Association",
  "Abonnement Fédération",
  "Plan Institutionnel",
];

function planRank(libelle: string): number {
  const idx = LIBELLE_TIER_ORDER.findIndex((l) =>
    libelle.toLowerCase().includes(l.toLowerCase().split(" ").slice(0, 3).join(" ").toLowerCase())
  );
  return idx === -1 ? 99 : idx;
}

function normLibelle(raw: string): string {
  return raw.replace(/&amp;/g, "&").replace(/&#x2F;/gi, "/").replace(/&#x27;/gi, "'");
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureLabel?: string;
  initialPlan?: AbonnementAPI | null;
}

export function UpgradeSubscriptionModal({ open, onOpenChange, featureLabel, initialPlan }: Props) {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("plan");

  // Step 1
  const [plans, setPlans] = useState<AbonnementAPI[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<AbonnementAPI | null>(null);

  // Step 2
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [operators, setOperators] = useState<OperatorData[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<OperatorData | null>(null);
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  // Step 3 – redirect + polling
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [payStatus, setPayStatus] = useState<PayStatus>("pending");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCount = useRef(0);
  const MAX_POLLS = 60; // 5 min à 5s d'intervalle

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // Démarrer le polling quand on a une signature
  useEffect(() => {
    if (step !== "redirect" || !signature) return;
    pollCount.current = 0;
    setPayStatus("pending");

    pollRef.current = setInterval(async () => {
      pollCount.current += 1;
      console.log(`[Polling] tentative ${pollCount.current}/${MAX_POLLS} — signature: ${signature}`);
      try {
        const res = await clapayApi.checkPaymentStatus(signature);
        console.log("[Polling] statut reçu →", res.status, "| objet complet →", res);
        const s = (res.status ?? "").toLowerCase();
        if (s === "success" || s === "successful" || s === "paid") {
          setPayStatus("success");
          stopPolling();
          // Recharger le profil depuis l'API pour mettre à jour le localStorage et l'état
          refreshProfile()
            .then(() => {
              // Rediriger vers la page abonnement après 2s pour que l'utilisateur voie la confirmation
              setTimeout(() => {
                onOpenChange(false);
                navigate("/abonnement");
              }, 2000);
            })
            .catch(() => {
              // En cas d'erreur de refresh, on recharge la page
              setTimeout(() => window.location.reload(), 2000);
            });
        } else if (s === "failed" || s === "cancelled" || s === "error") {
          setPayStatus("failed");
          stopPolling();
        } else {
          console.log("[Polling] statut non-final →", res.status, "— on continue");
        }
      } catch (err) {
        console.warn("[Polling] erreur lors du check →", err);
      }
      if (pollCount.current >= MAX_POLLS) {
        console.warn("[Polling] timeout atteint, arrêt.");
        stopPolling();
      }
    }, 5000);

    return stopPolling;
  }, [step, signature, stopPolling]);

  // Reset à l'ouverture
  useEffect(() => {
    if (!open) {
      stopPolling();
      return;
    }
    setPaymentUrl(null);
    setSignature(null);
    setPayError(null);
    setPayStatus("pending");
    stopPolling();

    if (initialPlan) {
      setSelectedPlan(initialPlan);
      setStep("payment");
      setPlans([]);
      return;
    }

    setStep("plan");
    setSelectedPlan(null);
    setPlansLoading(true);
    abonnementsApi
      .getAll()
      .then((data) => {
        const active = data.filter((p) => p.isActive && !p.surDevis);
        const currentLibelle = user?.planLibelle ?? "";
        const currentRank = planRank(currentLibelle);
        const upgrades = active.filter((p) => planRank(normLibelle(p.libelle)) > currentRank);
        setPlans(upgrades.length > 0 ? upgrades : active);
      })
      .catch(() => setPlans([]))
      .finally(() => setPlansLoading(false));
  }, [open, initialPlan, stopPolling]);

  // Pays
  useEffect(() => {
    if (step !== "payment") return;
    clapayApi.getCountries().then(setCountries).catch(() => {});
  }, [step]);

  // Opérateurs
  useEffect(() => {
    if (!selectedCountry) return;
    setOperators([]);
    setSelectedOperator(null);
    clapayApi.getOperators(selectedCountry.code).then(setOperators).catch(() => {});
  }, [selectedCountry]);

  function handleClose() {
    stopPolling();
    onOpenChange(false);
  }

  function handleSelectPlan(plan: AbonnementAPI) {
    setSelectedPlan(plan);
    setStep("payment");
  }

  async function handlePay() {
    if (!selectedPlan || !selectedCountry || !selectedOperator || !phone || !user) return;
    setPaying(true);
    setPayError(null);
    try {
      const nameParts = (user.name ?? "").trim().split(/\s+/);
      const firstname = nameParts[0] ?? "";
      const lastname = nameParts.slice(1).join(" ") || firstname;
      const localPhone = phone.replace(/\s/g, "");

      const res = await clapayApi.initSubscriptionPayment({
        amount: Math.round(parseFloat(selectedPlan.tarifMensuel)),
        currency: selectedCountry.currency,
        countryCode: selectedCountry.code,
        operatorsCode: [selectedOperator.codeoperator],
        returnUrl: (import.meta.env.VITE_APP_URL ?? window.location.origin) + "/abonnement",
        payerUserId: user.id,
        adhesionPayload: {
          name: user.name,
          email: user.email,
          phone: localPhone,
          typeMembreId: selectedPlan.typeMembreId,
          abonnementId: selectedPlan.id,
        },
        customerFirstname: firstname,
        customerLastname: lastname,
        customerPhone: localPhone,
      });

      setPaymentUrl(res.payment_url);
      setSignature(res.signature);
      setStep("redirect");
      // Ouvrir la page de paiement automatiquement
      window.open(res.payment_url, "_blank");
    } catch (err: unknown) {
      setPayError(err instanceof Error ? err.message : "Erreur lors de l'initialisation du paiement.");
    } finally {
      setPaying(false);
    }
  }

  const grouped = plans.reduce<Record<string, AbonnementAPI[]>>((acc, p) => {
    const key = p.typeMembre.name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  const canPay = !!selectedCountry && !!selectedOperator && phone.length >= 7;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step !== "plan" && step !== "redirect" && (
              <button
                type="button"
                onClick={() => setStep("plan")}
                className="p-1 rounded hover:bg-muted"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <ArrowUpCircle className="w-5 h-5 text-amber-500" />
            {step === "plan" && "Choisissez votre nouveau plan"}
            {step === "payment" && "Paiement Mobile Money"}
            {step === "redirect" && (
              payStatus === "success" ? "Paiement confirmé !" :
              payStatus === "failed" ? "Paiement échoué" :
              "En attente du paiement..."
            )}
          </DialogTitle>
        </DialogHeader>

        {/* ── STEP 1 : Plans ─────────────────────────────────────── */}
        {step === "plan" && (
          <div className="space-y-4 py-2">
            {featureLabel && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  La fonctionnalité <span className="font-semibold">«&nbsp;{featureLabel}&nbsp;»</span> nécessite un plan supérieur.
                </p>
              </div>
            )}

            {plansLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : plans.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">Aucun plan disponible.</p>
            ) : (
              Object.entries(grouped).map(([typeName, typePlans]) => (
                <div key={typeName} className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{typeName}</p>
                  <div className="grid gap-2">
                    {typePlans.map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => handleSelectPlan(plan)}
                        className={cn(
                          "w-full text-left p-4 rounded-lg border-2 transition-all",
                          "hover:border-primary hover:bg-primary/5",
                          "flex items-center justify-between gap-4"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                            <Crown className="w-4 h-4 text-amber-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{normLibelle(plan.libelle)}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{normLibelle(plan.description)}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-primary text-sm">
                            {parseInt(plan.tarifMensuel).toLocaleString("fr-FR")} FCFA
                          </p>
                          <p className="text-xs text-muted-foreground">/ mois</p>
                          <p className="text-xs text-muted-foreground">
                            {parseInt(plan.tarifAnnuel).toLocaleString("fr-FR")} / an
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── STEP 2 : Paiement ──────────────────────────────────── */}
        {step === "payment" && selectedPlan && (
          <div className="space-y-5 py-2">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Plan sélectionné</p>
                <p className="font-semibold">{normLibelle(selectedPlan.libelle)}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary">
                  {parseInt(selectedPlan.tarifMensuel).toLocaleString("fr-FR")} FCFA
                </p>
                <p className="text-xs text-muted-foreground">/ mois</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Pays</Label>
              <Select
                value={selectedCountry?.code ?? ""}
                onValueChange={(code) => {
                  const c = countries.find((c) => c.code === code) ?? null;
                  setSelectedCountry(c);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un pays" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name} ({c.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {operators.length > 0 && (
              <div className="space-y-2">
                <Label>Opérateur Mobile Money</Label>
                <RadioGroup
                  value={selectedOperator?.codeoperator ?? ""}
                  onValueChange={(code) => {
                    setSelectedOperator(operators.find((o) => o.codeoperator === code) ?? null);
                  }}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {operators.map((op) => (
                      <div key={op.codeoperator}>
                        <RadioGroupItem value={op.codeoperator} id={op.codeoperator} className="peer sr-only" />
                        <Label
                          htmlFor={op.codeoperator}
                          className={cn(
                            "flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all",
                            "hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary"
                          )}
                        >
                          <img src={op.logo} alt={op.name} className="w-8 h-8 object-contain rounded" />
                          <span className="text-xs font-medium leading-tight">{op.name}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {selectedCountry && (
              <div className="space-y-2">
                <Label>Numéro de téléphone</Label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 bg-muted rounded-md border text-sm text-muted-foreground shrink-0">
                    <Phone className="w-3 h-3 mr-1" />
                    {selectedCountry.indicatif}
                  </div>
                  <Input
                    placeholder={`${selectedCountry.phone_length} chiffres`}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="tel"
                    maxLength={selectedCountry.phone_length + 2}
                  />
                </div>
              </div>
            )}

            {selectedOperator?.instruction.MERCHANT && (
              <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground space-y-1">
                <p className="font-medium flex items-center gap-1">
                  <Smartphone className="w-3 h-3" /> Instructions :
                </p>
                <p className="leading-relaxed whitespace-pre-line">{selectedOperator.instruction.MERCHANT}</p>
              </div>
            )}

            {payError && <p className="text-sm text-destructive">{payError}</p>}

            <Button
              className="w-full gap-2"
              disabled={!canPay || paying}
              onClick={handlePay}
            >
              {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpCircle className="w-4 h-4" />}
              {paying ? "Initialisation..." : `Payer ${parseInt(selectedPlan.tarifMensuel).toLocaleString("fr-FR")} FCFA`}
            </Button>
          </div>
        )}

        {/* ── STEP 3 : Statut paiement ───────────────────────────── */}
        {step === "redirect" && (
          <div className="py-8 text-center space-y-5">
            {/* Icône statut */}
            {payStatus === "pending" && (
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            )}
            {payStatus === "success" && (
              <div className="w-20 h-20 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
            )}
            {payStatus === "failed" && (
              <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
            )}

            {/* Message statut */}
            <div className="space-y-1">
              {payStatus === "pending" && (
                <>
                  <h3 className="font-semibold text-lg">En attente du paiement</h3>
                  <p className="text-sm text-muted-foreground">
                    Complétez le paiement sur votre téléphone. Cette page se mettra à jour automatiquement.
                  </p>
                </>
              )}
              {payStatus === "success" && (
                <>
                  <h3 className="font-semibold text-lg text-green-600">Paiement confirmé !</h3>
                  <p className="text-sm text-muted-foreground">
                    Votre abonnement <span className="font-medium">{selectedPlan ? normLibelle(selectedPlan.libelle) : ""}</span> a été activé avec succès.
                  </p>
                </>
              )}
              {payStatus === "failed" && (
                <>
                  <h3 className="font-semibold text-lg text-destructive">Paiement échoué</h3>
                  <p className="text-sm text-muted-foreground">
                    Le paiement n'a pas pu être traité. Veuillez réessayer.
                  </p>
                </>
              )}
            </div>

            {selectedPlan && (
              <Badge variant="outline" className="font-mono text-xs">
                {normLibelle(selectedPlan.libelle)}
              </Badge>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {payStatus === "pending" && paymentUrl && (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => window.open(paymentUrl, "_blank")}
                >
                  <ExternalLink className="w-4 h-4" />
                  Rouvrir la page de paiement
                </Button>
              )}
              {payStatus === "failed" && (
                <Button
                  className="w-full gap-2"
                  onClick={() => setStep("payment")}
                >
                  <RefreshCw className="w-4 h-4" />
                  Réessayer
                </Button>
              )}
              {payStatus === "success" && (
                <Button className="w-full" onClick={handleClose}>
                  Fermer
                </Button>
              )}
              {payStatus !== "success" && (
                <Button variant="ghost" className="w-full" onClick={handleClose}>
                  {payStatus === "pending" ? "Continuer plus tard" : "Fermer"}
                </Button>
              )}
            </div>

            {payStatus === "pending" && (
              <p className="text-xs text-muted-foreground">
                Vérification automatique toutes les 5 secondes…
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
