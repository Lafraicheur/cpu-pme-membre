import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  Image,
  Package,
  ChevronRight,
  Eye,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  madeInCIBadgeLevelsApi,
  madeInCIProductsApi,
  madeInCIRequestsApi,
  MadeInCIBadgeLevel,
} from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

// Couleurs et critères statiques associés à chaque niveau de badge
const badgeLevelConfig: Record<string, { color: string; requirements: string[] }> = {
  or: {
    color: "bg-primary text-primary-foreground",
    requirements: ["Transformation majeure en CI", "Intrants locaux >70%", "Certification qualité"],
  },
  argent: {
    color: "bg-secondary text-secondary-foreground",
    requirements: ["Transformation significative", "Intrants locaux >50%"],
  },
  bronze: {
    color: "bg-amber-600 text-white",
    requirements: ["Transformation de base", "Conditionnement local"],
  },
  innovation_ivoire: {
    color: "bg-cyan-500 text-white",
    requirements: ["Brevet ou modèle déposé", "Innovation technique", "R&D locale"],
  },
};

const defaultConfig = { color: "bg-muted text-muted-foreground", requirements: [] };

function getBadgeConfig(id: string) {
  return badgeLevelConfig[id] ?? defaultConfig;
}

function getBadgeColorIcon(color: string): string {
  if (color.includes("primary")) return "text-primary";
  if (color.includes("secondary")) return "text-secondary";
  if (color.includes("amber")) return "text-amber-600";
  if (color.includes("cyan")) return "text-cyan-500";
  return "text-muted-foreground";
}

// Mapping des statuts API vers l'affichage
type StatusKey = "draft" | "submitted" | "in_audit" | "approved" | "rejected";

const statusConfig: Record<StatusKey, { label: string; color: string; icon: typeof Clock }> = {
  draft: { label: "Brouillon", color: "text-muted-foreground", icon: FileText },
  submitted: { label: "Soumis", color: "text-blue-500", icon: Clock },
  in_audit: { label: "En audit", color: "text-amber-500", icon: Eye },
  approved: { label: "Approuvé", color: "text-green-500", icon: CheckCircle2 },
  rejected: { label: "Refusé", color: "text-destructive", icon: XCircle },
};

function normalizeStatus(status: string): StatusKey {
  const s = status.toLowerCase();
  if (s === "submitted") return "submitted";
  if (s === "in_audit" || s === "inaudit") return "in_audit";
  if (s === "approved") return "approved";
  if (s === "rejected") return "rejected";
  return "draft";
}

export function MadeInCI() {
  const queryClient = useQueryClient();
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    badgeType: "",
    transformationProcess: "",
    localValueAdded: "",
  });

  // Chargement des niveaux de badge
  const { data: badgeLevels = [], isLoading: isLoadingLevels } = useQuery<MadeInCIBadgeLevel[]>({
    queryKey: ["madeInCI", "badgeLevels"],
    queryFn: madeInCIBadgeLevelsApi.getAll,
  });

  // Chargement de mes demandes
  const { data: myRequests = [], isLoading: isLoadingRequests } = useQuery({
    queryKey: ["madeInCI", "myRequests"],
    queryFn: madeInCIRequestsApi.getMyRequests,
  });

  // Chargement de mes produits (pour le formulaire)
  const { data: myProducts = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["madeInCI", "myProducts"],
    queryFn: madeInCIProductsApi.getMyProducts,
  });

  // Soumission d'une demande
  const submitMutation = useMutation({
    mutationFn: madeInCIRequestsApi.submit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["madeInCI", "myRequests"] });
      setShowRequestDialog(false);
      setFormData({ productId: "", badgeType: "", transformationProcess: "", localValueAdded: "" });
      toast({ title: "Demande soumise", description: "Votre demande de badge Made in CI a été envoyée." });
    },
    onError: (err: Error) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });

  const approvedCount = myRequests.filter((r) => normalizeStatus(r.status) === "approved").length;

  function handleSubmit() {
    if (!formData.productId || !formData.badgeType || !formData.transformationProcess || !formData.localValueAdded) {
      toast({ title: "Champs requis", description: "Veuillez remplir tous les champs obligatoires.", variant: "destructive" });
      return;
    }
    submitMutation.mutate({
      productId: formData.productId,
      badgeType: formData.badgeType,
      transformationProcess: formData.transformationProcess,
      localValueAdded: parseFloat(formData.localValueAdded),
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-amber-500/5">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Award className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Made in Côte d'Ivoire</h2>
                <p className="text-muted-foreground">Valorisez votre production locale</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Badges obtenus</p>
                <p className="text-2xl font-bold text-primary">{approvedCount}</p>
              </div>
              <Button onClick={() => setShowRequestDialog(true)}>
                <Award className="w-4 h-4 mr-1" />
                Demander un badge
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="demandes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="demandes">Mes demandes</TabsTrigger>
          <TabsTrigger value="niveaux">Niveaux de badge</TabsTrigger>
          <TabsTrigger value="guide">Guide</TabsTrigger>
        </TabsList>

        {/* Onglet : Mes demandes */}
        <TabsContent value="demandes" className="space-y-4">
          {isLoadingRequests ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : myRequests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-semibold mb-2">Aucune demande en cours</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Demandez un badge Made in CI pour valoriser vos produits
                </p>
                <Button onClick={() => setShowRequestDialog(true)}>
                  Faire une demande
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {myRequests.map((req) => {
                const statusKey = normalizeStatus(req.status);
                const status = statusConfig[statusKey];
                const StatusIcon = status.icon;
                const config = getBadgeConfig(req.badgeType);
                const badgeLevel = badgeLevels.find((l) => l.id === req.badgeType);

                return (
                  <Card key={req.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Award className={cn("w-6 h-6", getBadgeColorIcon(config.color))} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-muted-foreground">{req.id.slice(0, 8)}…</span>
                              <Badge className={config.color}>
                                {badgeLevel ? badgeLevel.label : req.badgeType}
                              </Badge>
                            </div>
                            <p className="font-medium">{req.product?.name ?? req.productId}</p>
                            <p className="text-sm text-muted-foreground">
                              Soumis le {new Date(req.submittedAt).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <StatusIcon className={cn("w-4 h-4", status.color)} />
                              <span className={cn("text-sm font-medium", status.color)}>
                                {status.label}
                              </span>
                            </div>
                            {statusKey === "in_audit" && req.progress > 0 && (
                              <div className="flex items-center gap-2 mt-1">
                                <Progress value={req.progress} className="w-20 h-2" />
                                <span className="text-xs text-muted-foreground">{req.progress}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {req.adminComment && (
                        <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                          <p className="text-sm text-destructive flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {req.adminComment}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Onglet : Niveaux de badge */}
        <TabsContent value="niveaux" className="space-y-4">
          {isLoadingLevels ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {badgeLevels.map((level) => {
                const config = getBadgeConfig(level.id);
                return (
                  <Card key={level.id} className="relative overflow-hidden">
                    <div className={cn("absolute top-0 left-0 w-1 h-full", config.color.split(" ")[0])} />
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Badge className={config.color}>{level.label}</Badge>
                      </CardTitle>
                      <CardDescription>{level.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {config.requirements.length > 0 && (
                        <>
                          <h4 className="text-sm font-medium mb-2">Critères requis :</h4>
                          <ul className="space-y-1">
                            {config.requirements.map((req, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                      <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => {
                          setFormData({ ...formData, badgeType: level.id });
                          setShowRequestDialog(true);
                        }}
                      >
                        Demander ce badge
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Onglet : Guide */}
        <TabsContent value="guide" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                Guide du Label Made in CI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">1. Qu'est-ce que le label Made in CI ?</h4>
                <p className="text-muted-foreground text-sm">
                  Le label Made in Côte d'Ivoire certifie que votre produit a été transformé localement
                  avec une part significative de valeur ajoutée ivoirienne. Il valorise la production
                  nationale et renforce la confiance des acheteurs.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2. Comment obtenir le label ?</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Choisissez le niveau de badge adapté à votre produit</li>
                  <li>Remplissez le questionnaire de demande</li>
                  <li>Fournissez les preuves requises (factures intrants, photos, etc.)</li>
                  <li>Un audit sera réalisé par CPU-PME</li>
                  <li>En cas d'approbation, le badge est attribué à votre produit</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3. Documents requis</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Factures d'achat des intrants locaux
                  </li>
                  <li className="flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Photos de l'unité de production
                  </li>
                  <li className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Descriptif du processus de transformation
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">4. Validité et renouvellement</h4>
                <p className="text-muted-foreground text-sm">
                  Le label est valide 2 ans et doit être renouvelé avec mise à jour des preuves.
                  Un contrôle peut être effectué à tout moment.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog : Demande de badge */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Demander un badge Made in CI</DialogTitle>
            <DialogDescription>
              Remplissez le formulaire pour soumettre votre demande
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Sélection du produit */}
            <div className="space-y-2">
              <Label htmlFor="produit">Produit concerné *</Label>
              <Select
                value={formData.productId}
                onValueChange={(v) => setFormData({ ...formData, productId: v })}
                disabled={isLoadingProducts}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingProducts ? "Chargement…" : "Sélectionner un produit"} />
                </SelectTrigger>
                <SelectContent>
                  {myProducts.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sélection du niveau de badge */}
            <div className="space-y-2">
              <Label>Niveau de badge souhaité *</Label>
              {isLoadingLevels ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {badgeLevels.map((level) => {
                    const config = getBadgeConfig(level.id);
                    return (
                      <div
                        key={level.id}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-all text-center",
                          formData.badgeType === level.id && "ring-2 ring-primary"
                        )}
                        onClick={() => setFormData({ ...formData, badgeType: level.id })}
                      >
                        <Badge className={cn(config.color, "mb-1")}>{level.label}</Badge>
                        <p className="text-xs text-muted-foreground">{level.description}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Processus de transformation */}
            <div className="space-y-2">
              <Label htmlFor="process">Processus de transformation *</Label>
              <Textarea
                id="process"
                placeholder="Décrivez les étapes de transformation réalisées en Côte d'Ivoire..."
                rows={3}
                value={formData.transformationProcess}
                onChange={(e) => setFormData({ ...formData, transformationProcess: e.target.value })}
              />
            </div>

            {/* Valeur ajoutée locale */}
            <div className="space-y-2">
              <Label htmlFor="valeur">% de valeur ajoutée locale *</Label>
              <Input
                id="valeur"
                type="number"
                min={0}
                max={100}
                placeholder="Ex: 75"
                value={formData.localValueAdded}
                onChange={(e) => setFormData({ ...formData, localValueAdded: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowRequestDialog(false)} disabled={submitMutation.isPending}>
                Annuler
              </Button>
              <Button onClick={handleSubmit} disabled={submitMutation.isPending}>
                {submitMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Award className="w-4 h-4 mr-1" />
                )}
                Soumettre la demande
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
