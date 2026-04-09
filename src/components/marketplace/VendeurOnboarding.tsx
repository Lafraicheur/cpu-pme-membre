import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Store,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  CreditCard,
  FileText,
  Award,
  ArrowRight,
  Loader2,
  Upload,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { marketplaceVendeurApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type VendeurStatus = "NotEligible" | "Eligible" | "PendingReview" | "Active" | "Rejected" | "Suspended";

interface VendeurOnboardingProps {
  onActivated?: () => void;
}

// Icône par step ID
const STEP_ICONS: Record<string, React.ElementType> = {
  plan_minimum: Award,
  kyc_valide: Shield,
  payment_method_configured: CreditCard,
  shop_profile_completed: Store,
};

export function VendeurOnboarding({ onActivated }: VendeurOnboardingProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showBoutiqueDialog, setShowBoutiqueDialog] = useState(false);
  const [boutiqueStep, setBoutiqueStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [boutiqueData, setBoutiqueData] = useState({
    name: "",
    description: "",
    slogan: "",
    phone: "",
    email: "",
    website: "",
    preparationDelayHours: "24",
    returnPolicy: "",
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleNextStep = () => {
    if (!boutiqueData.name.trim() || !boutiqueData.description.trim()) {
      toast({ title: "Champs requis", description: "Le nom et la description sont obligatoires.", variant: "destructive" });
      return;
    }
    setBoutiqueStep(2);
  };

  const handleCreateBoutique = async () => {
    setIsSubmitting(true);
    try {
      const vendorId = user?.id || (() => {
        try {
          const adhesion = JSON.parse(localStorage.getItem("cpu-adhesion") || "{}");
          return adhesion?.id as string;
        } catch { return ""; }
      })();
      await marketplaceVendeurApi.createBoutique({
        vendorId,
        name: boutiqueData.name,
        description: boutiqueData.description,
        slogan: boutiqueData.slogan || undefined,
        phone: boutiqueData.phone || undefined,
        email: boutiqueData.email || undefined,
        website: boutiqueData.website || undefined,
        preparationDelayHours: Number(boutiqueData.preparationDelayHours) || 24,
        returnPolicy: boutiqueData.returnPolicy || undefined,
      });
      toast({ title: "Boutique créée !", description: "Votre boutique a été configurée avec succès." });
      setShowBoutiqueDialog(false);
      setBoutiqueStep(1);
      queryClient.invalidateQueries({ queryKey: ["vendeur-status"] });
      queryClient.invalidateQueries({ queryKey: ["vendeur-onboarding-checklist"] });
      onActivated?.();
    } catch (err) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Impossible de créer la boutique.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const { data: vendeurStatus, isLoading: isLoadingStatus } = useQuery({
    queryKey: ["vendeur-status"],
    queryFn: marketplaceVendeurApi.getStatus,
    staleTime: 5 * 60 * 1000,
  });

  const { data: checklist, isLoading: isLoadingChecklist } = useQuery({
    queryKey: ["vendeur-onboarding-checklist"],
    queryFn: marketplaceVendeurApi.getOnboardingChecklist,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = isLoadingStatus || isLoadingChecklist;

  const status: VendeurStatus = (vendeurStatus?.status as VendeurStatus) ?? "Eligible";
  const progress = vendeurStatus?.progress ?? 0;
  const steps = checklist?.steps ?? [];
  const completedCount = vendeurStatus?.completedSteps?.length ?? steps.filter((s) => s.completed).length;

  const statusConfig: Record<VendeurStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
    NotEligible: { label: "Non éligible", color: "text-muted-foreground", icon: AlertCircle },
    Eligible: { label: "Éligible", color: "text-blue-500", icon: Clock },
    PendingReview: { label: "En cours de vérification", color: "text-amber-500", icon: Clock },
    Active: { label: "Actif", color: "text-green-500", icon: CheckCircle2 },
    Rejected: { label: "Refusé", color: "text-destructive", icon: AlertCircle },
    Suspended: { label: "Suspendu", color: "text-destructive", icon: AlertCircle },
  };

  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="space-y-6">
      {/* Header Status */}
      <Card className={cn(
        "border-2",
        status === "Active" && "border-green-500/50 bg-green-500/5",
        status === "PendingReview" && "border-amber-500/50 bg-amber-500/5",
        status === "Eligible" && "border-blue-500/50 bg-blue-500/5",
        status === "Rejected" && "border-destructive/50 bg-destructive/5"
      )}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-xl bg-background", currentStatus.color)}>
                <StatusIcon className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Statut Vendeur</h2>
                {isLoadingStatus
                  ? <Skeleton className="h-5 w-24 mt-1" />
                  : <p className={cn("font-medium", currentStatus.color)}>{currentStatus.label}</p>
                }
              </div>
            </div>
            {status === "Active" ? (
              <Badge variant="default" className="bg-green-500 text-white">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Boutique active
              </Badge>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Progression</p>
                  {isLoadingStatus
                    ? <Skeleton className="h-5 w-16 mt-1" />
                    : <p className="font-semibold">{completedCount}/{steps.length || (vendeurStatus ? vendeurStatus.completedSteps.length + vendeurStatus.missingSteps.length : 0)} étapes</p>
                  }
                </div>
                <Progress value={progress} className="w-24 h-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Checklist d'activation vendeur</CardTitle>
          <CardDescription>
            Complétez toutes les étapes pour activer votre boutique
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingChecklist ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {steps.map((item) => {
                const ItemIcon = STEP_ICONS[item.id] ?? Store;
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-lg border transition-colors",
                      item.completed ? "bg-green-500/5 border-green-500/30" : "bg-muted/50"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg shrink-0",
                      item.completed ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
                    )}>
                      <ItemIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("font-medium text-sm", item.completed && "text-green-600")}>
                        {item.label}
                      </p>
                    </div>
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        onClick={() => {
                          if (item.id === "shop_profile_completed") setShowBoutiqueDialog(true);
                        }}
                      >
                        Compléter
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Boutique — 2 étapes */}
      <Dialog open={showBoutiqueDialog} onOpenChange={(open) => { setShowBoutiqueDialog(open); if (!open) setBoutiqueStep(1); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurer ma boutique</DialogTitle>
            <DialogDescription>
              Étape {boutiqueStep} sur 2 — {boutiqueStep === 1 ? "Identité de la boutique" : "Contact & Politiques"}
            </DialogDescription>
          </DialogHeader>

          {/* Indicateur de progression */}
          <div className="flex gap-2 pt-1">
            <div className={cn("h-1.5 flex-1 rounded-full transition-colors", boutiqueStep >= 1 ? "bg-primary" : "bg-muted")} />
            <div className={cn("h-1.5 flex-1 rounded-full transition-colors", boutiqueStep >= 2 ? "bg-primary" : "bg-muted")} />
          </div>

          <div className="space-y-5 py-2">
            {/* ── ÉTAPE 1 : Identité ── */}
            {boutiqueStep === 1 && (
              <>
                {/* Logo */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-24 h-24 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => document.getElementById("logo-input")?.click()}
                  >
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-muted-foreground">
                        <Upload className="w-6 h-6" />
                        <span className="text-xs">Logo</span>
                      </div>
                    )}
                  </div>
                  <input id="logo-input" type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                  <p className="text-xs text-muted-foreground">Cliquez pour ajouter un logo (optionnel)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la boutique *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Ma Super Boutique"
                    value={boutiqueData.name}
                    onChange={(e) => setBoutiqueData({ ...boutiqueData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slogan">Slogan</Label>
                  <Input
                    id="slogan"
                    placeholder="Ex: La qualité avant tout"
                    value={boutiqueData.slogan}
                    onChange={(e) => setBoutiqueData({ ...boutiqueData, slogan: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez votre activité et vos produits/services..."
                    rows={4}
                    value={boutiqueData.description}
                    onChange={(e) => setBoutiqueData({ ...boutiqueData, description: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t">
                  <Button variant="outline" onClick={() => setShowBoutiqueDialog(false)}>Annuler</Button>
                  <Button onClick={handleNextStep}>
                    Suivant <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </>
            )}

            {/* ── ÉTAPE 2 : Contact & Politiques ── */}
            {boutiqueStep === 2 && (
              <>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3">CONTACT</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        placeholder="+225 07 12 34 56 78"
                        value={boutiqueData.phone}
                        onChange={(e) => setBoutiqueData({ ...boutiqueData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="boutique@exemple.com"
                        value={boutiqueData.email}
                        onChange={(e) => setBoutiqueData({ ...boutiqueData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="website">Site web</Label>
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://www.exemple.com"
                        value={boutiqueData.website}
                        onChange={(e) => setBoutiqueData({ ...boutiqueData, website: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3">POLITIQUES DE VENTE</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="preparationDelayHours">Délai de préparation (heures)</Label>
                      <Input
                        id="preparationDelayHours"
                        type="number"
                        min="1"
                        placeholder="24"
                        value={boutiqueData.preparationDelayHours}
                        onChange={(e) => setBoutiqueData({ ...boutiqueData, preparationDelayHours: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="returnPolicy">Politique de retours</Label>
                      <Textarea
                        id="returnPolicy"
                        placeholder="Conditions de retour, délais, remboursement..."
                        rows={3}
                        value={boutiqueData.returnPolicy}
                        onChange={(e) => setBoutiqueData({ ...boutiqueData, returnPolicy: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between gap-3 pt-2 border-t">
                  <Button variant="outline" onClick={() => setBoutiqueStep(1)} disabled={isSubmitting}>
                    <ChevronLeft className="w-4 h-4 mr-1" /> Retour
                  </Button>
                  <Button onClick={handleCreateBoutique} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Création en cours...</>
                    ) : "Créer la boutique"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Infos complémentaires */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Avantages Vendeur CPU-PME</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Award className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Label Made in CI</p>
                <p className="text-xs text-muted-foreground">Valorisez vos produits locaux</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Shield className="w-5 h-5 text-secondary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Paiement sécurisé</p>
                <p className="text-xs text-muted-foreground">Escrow pour vos transactions</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <FileText className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">RFQ B2B</p>
                <p className="text-xs text-muted-foreground">Recevez des demandes de devis</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
