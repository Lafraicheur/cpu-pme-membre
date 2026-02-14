import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type VendeurStatus = "NotEligible" | "Eligible" | "PendingReview" | "Active" | "Rejected" | "Suspended";

interface VendeurOnboardingProps {
  onActivated?: () => void;
}

export function VendeurOnboarding({ onActivated }: VendeurOnboardingProps) {
  const [status, setStatus] = useState<VendeurStatus>("Eligible");
  const [showBoutiqueDialog, setShowBoutiqueDialog] = useState(false);
  const [boutiqueData, setBoutiqueData] = useState({
    nom: "",
    description: "",
    logo: "",
    banniere: "",
    filieres: [] as string[],
    zones: [] as string[],
    horaires: "",
    politiqueLivraison: "",
    politiqueRetours: "",
    delaisSLA: "",
  });

  // Checklist vendeur
  const checklist = [
    {
      id: "plan",
      label: "Plan Argent minimum",
      description: "Votre abonnement doit être au niveau Argent ou supérieur",
      completed: true,
      icon: Award,
    },
    {
      id: "kyc",
      label: "KYC entreprise validé",
      description: "Votre KYC Standard doit être approuvé",
      completed: true,
      icon: Shield,
    },
    {
      id: "paiement",
      label: "Moyen de paiement configuré",
      description: "RIB ou Mobile Money pour recevoir les reversements",
      completed: false,
      icon: CreditCard,
    },
    {
      id: "boutique",
      label: "Profil boutique complété",
      description: "Nom, description, politiques de vente",
      completed: false,
      icon: Store,
    },
  ];

  const completedCount = checklist.filter(item => item.completed).length;
  const progress = (completedCount / checklist.length) * 100;

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
                <p className={cn("font-medium", currentStatus.color)}>{currentStatus.label}</p>
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
                  <p className="font-semibold">{completedCount}/{checklist.length} étapes</p>
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
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {checklist.map((item) => {
              const ItemIcon = item.icon;
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
                    <p className={cn(
                      "font-medium text-sm",
                      item.completed && "text-green-600"
                    )}>
                      {item.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  {item.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => {
                        if (item.id === "boutique") setShowBoutiqueDialog(true);
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
        </CardContent>
      </Card>

      {/* Dialog Boutique */}
      <Dialog open={showBoutiqueDialog} onOpenChange={setShowBoutiqueDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurer ma boutique</DialogTitle>
            <DialogDescription>
              Renseignez les informations de votre boutique marketplace
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom-boutique">Nom de la boutique *</Label>
                <Input
                  id="nom-boutique"
                  placeholder="Ex: Ma Super Boutique"
                  value={boutiqueData.nom}
                  onChange={(e) => setBoutiqueData({ ...boutiqueData, nom: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Logo (optionnel)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="w-6 h-6 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-1">Cliquer pour uploader</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Décrivez votre activité et vos produits/services..."
                rows={3}
                value={boutiqueData.description}
                onChange={(e) => setBoutiqueData({ ...boutiqueData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Bannière (optionnel)</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2">Image bannière (1200x300 recommandé)</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="horaires">Horaires d'ouverture</Label>
              <Input
                id="horaires"
                placeholder="Ex: Lun-Ven 8h-18h, Sam 8h-13h"
                value={boutiqueData.horaires}
                onChange={(e) => setBoutiqueData({ ...boutiqueData, horaires: e.target.value })}
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Politiques de vente</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="livraison">Politique de livraison *</Label>
                  <Textarea
                    id="livraison"
                    placeholder="Délais, zones couvertes, frais..."
                    rows={2}
                    value={boutiqueData.politiqueLivraison}
                    onChange={(e) => setBoutiqueData({ ...boutiqueData, politiqueLivraison: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retours">Politique de retours *</Label>
                  <Textarea
                    id="retours"
                    placeholder="Conditions de retour, remboursement..."
                    rows={2}
                    value={boutiqueData.politiqueRetours}
                    onChange={(e) => setBoutiqueData({ ...boutiqueData, politiqueRetours: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sla">Délais de traitement (SLA)</Label>
                  <Input
                    id="sla"
                    placeholder="Ex: Expédition sous 48h"
                    value={boutiqueData.delaisSLA}
                    onChange={(e) => setBoutiqueData({ ...boutiqueData, delaisSLA: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowBoutiqueDialog(false)}>
                Annuler
              </Button>
              <Button onClick={() => {
                setShowBoutiqueDialog(false);
                // Simuler activation
              }}>
                Enregistrer la boutique
              </Button>
            </div>
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
