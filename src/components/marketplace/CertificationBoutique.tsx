import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Shield,
  Store,
  Package,
  FileText,
  Upload,
  Eye,
  Sparkles,
  Calendar,
  MapPin,
  Image,
  BadgeCheck,
  CircleDot,
  Loader2,
  Paperclip,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  boutiquesApi,
  boutiqueCertificationApi,
  madeInCIBadgeLevelsApi,
  type CertificationDashboardData,
  type CertificationChecklistItem,
  type MadeInCIBadgeLevel,
} from "@/lib/api";

type CertifStatus = "NonCertifie" | "EnCours" | "Audit" | "Certifie" | "Refuse" | "Expire";

const BADGE_COLORS: Record<string, string> = {
  or: "bg-primary text-primary-foreground",
  argent: "bg-secondary text-secondary-foreground",
  bronze: "bg-amber-600 text-white",
  innovation: "bg-cyan-500 text-white",
};

function getBadgeColor(code: string | null | undefined): string {
  if (!code) return "bg-muted text-muted-foreground";
  return BADGE_COLORS[code.toLowerCase()] ?? "bg-primary text-primary-foreground";
}

const statusConfig: Record<CertifStatus, { label: string; color: string; icon: typeof Clock; bgColor: string }> = {
  NonCertifie: { label: "Non certifié", color: "text-muted-foreground", icon: CircleDot, bgColor: "bg-muted" },
  EnCours: { label: "Demande en cours", color: "text-blue-500", icon: Clock, bgColor: "bg-blue-500/10" },
  Audit: { label: "Audit en cours", color: "text-amber-500", icon: Eye, bgColor: "bg-amber-500/10" },
  Certifie: { label: "Certifié", color: "text-green-500", icon: CheckCircle2, bgColor: "bg-green-500/10" },
  Refuse: { label: "Refusé", color: "text-destructive", icon: XCircle, bgColor: "bg-destructive/10" },
  Expire: { label: "Expiré", color: "text-amber-600", icon: AlertCircle, bgColor: "bg-amber-500/10" },
};

function getStatusConfig(status: string) {
  return statusConfig[status as CertifStatus] ?? statusConfig.NonCertifie;
}

const CHECKLIST_ICONS: Record<string, typeof FileText> = {
  rccm: FileText,
  fiscal: Shield,
  photos: Image,
  sourcing: FileText,
  process: Package,
  qualite: Award,
  localisation: MapPin,
};

function getChecklistIcon(id: string) {
  return CHECKLIST_ICONS[id] ?? FileText;
}

const DOC_STATUS_STYLES: Record<string, { icon: typeof Clock; rowClass: string; iconClass: string }> = {
  missing:   { icon: Upload,       rowClass: "bg-muted/50",                              iconClass: "bg-muted text-muted-foreground" },
  pending:   { icon: Clock,        rowClass: "bg-amber-500/5 border-amber-500/30",        iconClass: "bg-amber-500/10 text-amber-500" },
  submitted: { icon: Clock,        rowClass: "bg-amber-500/5 border-amber-500/30",        iconClass: "bg-amber-500/10 text-amber-500" },
  validated: { icon: CheckCircle2, rowClass: "bg-green-500/5 border-green-500/30",        iconClass: "bg-green-500/10 text-green-500" },
  approved:  { icon: CheckCircle2, rowClass: "bg-green-500/5 border-green-500/30",        iconClass: "bg-green-500/10 text-green-500" },
  rejected:  { icon: XCircle,      rowClass: "bg-destructive/5 border-destructive/30",    iconClass: "bg-destructive/10 text-destructive" },
};

function getDocStatusStyle(status: string) {
  return DOC_STATUS_STYLES[status] ?? DOC_STATUS_STYLES.missing;
}

export function CertificationBoutique() {
  const { toast } = useToast();

  const [boutiqueId, setBoutiqueId] = useState<string>("");
  const [dashboard, setDashboard] = useState<CertificationDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showDemandeDialog, setShowDemandeDialog] = useState(false);
  const [showPropagationDialog, setShowPropagationDialog] = useState(false);
  const [propagateAll, setPropagateAll] = useState(true);
  const [submittingDemande, setSubmittingDemande] = useState(false);

  const [demandeNiveau, setDemandeNiveau] = useState("");
  const [demandeNote, setDemandeNote] = useState("");
  const [demandeFiles, setDemandeFiles] = useState<File[]>([]);
  const [madeInCIBadgeLevels, setMadeInCIBadgeLevels] = useState<MadeInCIBadgeLevel[]>([]);

  const docFileInputRef = useRef<HTMLInputElement>(null);
  const pendingDocTypeRef = useRef<string | null>(null);
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  const fetchDashboard = useCallback(async (bid: string) => {
    try {
      const data = await boutiqueCertificationApi.getDashboard(bid);
      setDashboard(data);
    } catch {
      setError("Impossible de charger la certification de votre boutique.");
    }
  }, []);

  useEffect(() => {
    madeInCIBadgeLevelsApi.getAll().then(setMadeInCIBadgeLevels).catch(() => {});
    boutiquesApi.getMyShop()
      .then(async (b) => {
        if (!b) {
          setIsLoading(false);
          return;
        }
        setBoutiqueId(b.id);
        await fetchDashboard(b.id);
        setIsLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger votre boutique.");
        setIsLoading(false);
      });
  }, [fetchDashboard]);

  const certification = dashboard?.certification ?? null;
  const StatusIcon = certification ? getStatusConfig(certification.status).icon : CircleDot;
  const isCertifie = certification?.status === "Certifie";
  const produits = dashboard?.produits ?? [];
  const produitsAvecBadge = dashboard?.produitsAvecBadge ?? 0;
  const badgeLevelEntries = Object.entries(dashboard?.badgeLevels ?? {});

  const handleSubmitDemande = async () => {
    if (!boutiqueId || !demandeNiveau) return;
    setSubmittingDemande(true);
    try {
      await boutiqueCertificationApi.submitRequest(boutiqueId, {
        requestedBadgeType: demandeNiveau,
        note: demandeNote || undefined,
        files: demandeFiles,
      });
      toast({ title: "Demande envoyée", description: "Votre demande de certification a été soumise." });
      setShowDemandeDialog(false);
      setDemandeNiveau("");
      setDemandeNote("");
      setDemandeFiles([]);
      await fetchDashboard(boutiqueId);
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible de soumettre la demande.",
        variant: "destructive",
      });
    } finally {
      setSubmittingDemande(false);
    }
  };

  const handleUploadClick = (item: CertificationChecklistItem) => {
    pendingDocTypeRef.current = item.id;
    docFileInputRef.current?.click();
  };

  const handleDocFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    const type = pendingDocTypeRef.current;
    if (!files.length || !type || !boutiqueId) return;
    setUploadingType(type);
    try {
      await boutiqueCertificationApi.uploadDocumentFiles(boutiqueId, type, files);
      toast({ title: "Document envoyé" });
      await fetchDashboard(boutiqueId);
    } catch (err) {
      toast({
        title: "Erreur lors de l'envoi",
        description: err instanceof Error ? err.message : "Impossible d'envoyer le document.",
        variant: "destructive",
      });
    } finally {
      setUploadingType(null);
      pendingDocTypeRef.current = null;
    }
  };

  const handleToggleProduitBadge = async (produitId: string, value: boolean) => {
    if (!boutiqueId) return;
    try {
      await boutiqueCertificationApi.updateBadgePropagation(boutiqueId, {
        overrides: [{ productId: produitId, inheritFromBoutique: value }],
      });
      await fetchDashboard(boutiqueId);
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible de mettre à jour le badge.",
        variant: "destructive",
      });
    }
  };

  const handlePropagateAll = async () => {
    if (!boutiqueId) return;
    try {
      await boutiqueCertificationApi.updateBadgePropagation(boutiqueId, {
        applyToAll: true,
        inheritFromBoutiqueForAll: propagateAll,
      });
      setShowPropagationDialog(false);
      await fetchDashboard(boutiqueId);
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible de mettre à jour les badges.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !dashboard || !certification) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          {error || "Aucune boutique associée à votre compte."}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <input ref={docFileInputRef} type="file" multiple className="hidden" onChange={handleDocFileChange} />

      {/* Header Certification */}
      <Card className={cn(
        "border-2",
        isCertifie && "border-green-500/50 bg-gradient-to-r from-green-500/5 to-primary/5",
        certification.status === "EnCours" && "border-blue-500/50 bg-blue-500/5",
        certification.status === "Audit" && "border-amber-500/50 bg-amber-500/5",
        certification.status === "Refuse" && "border-destructive/50 bg-destructive/5",
        certification.status === "NonCertifie" && "border-muted"
      )}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-4 rounded-2xl",
                isCertifie ? "bg-green-500/10" : "bg-muted"
              )}>
                {isCertifie ? (
                  <BadgeCheck className="w-10 h-10 text-green-500" />
                ) : (
                  <Store className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">Certification Boutique</h2>
                <div className="flex items-center gap-2 mt-1">
                  <StatusIcon className={cn("w-5 h-5", getStatusConfig(certification.status).color)} />
                  <span className={cn("font-medium", getStatusConfig(certification.status).color)}>
                    {getStatusConfig(certification.status).label}
                  </span>
                  {isCertifie && certification.niveau && (
                    <Badge className={getBadgeColor(certification.niveau)}>
                      <Award className="w-3 h-3 mr-1" />
                      Made in CI - {dashboard.badgeLevels[certification.niveau]?.label ?? certification.niveau}
                    </Badge>
                  )}
                </div>
                {isCertifie && certification.dateExpiration && (
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Valide jusqu'au {certification.dateExpiration}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isCertifie ? (
                <>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Score local</p>
                    <p className="text-2xl font-bold text-primary">{certification.scoreLocal}%</p>
                  </div>
                  <Button variant="outline" onClick={() => setShowPropagationDialog(true)}>
                    <Sparkles className="w-4 h-4 mr-1" />
                    Badges produits
                  </Button>
                </>
              ) : certification.status === "NonCertifie" || certification.status === "Refuse" || certification.status === "Expire" ? (
                <Button onClick={() => setShowDemandeDialog(true)}>
                  <Award className="w-4 h-4 mr-1" />
                  Demander la certification
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Progression</p>
                    <p className="font-semibold">{certification.progression}%</p>
                  </div>
                  <Progress value={certification.progression} className="w-24 h-2" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={isCertifie ? "produits" : "processus"} className="space-y-6">
        <TabsList>
          <TabsTrigger value="processus">Processus de certification</TabsTrigger>
          <TabsTrigger value="documents">Documents ({dashboard.checklist.length})</TabsTrigger>
          <TabsTrigger value="produits">
            Produits badgés ({produitsAvecBadge}/{produits.length})
          </TabsTrigger>
          <TabsTrigger value="historique">Historique</TabsTrigger>
        </TabsList>

        {/* Processus */}
        <TabsContent value="processus" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Étapes de certification
              </CardTitle>
              <CardDescription>
                Suivez les étapes pour obtenir votre certification Made in Côte d'Ivoire
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {dashboard.steps.map((item, idx) => (
                  <div key={item.step} className="flex gap-4 p-4">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                        item.done ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                      )}>
                        {item.done ? <CheckCircle2 className="w-5 h-5" /> : item.step}
                      </div>
                      {idx < dashboard.steps.length - 1 && (
                        <div className={cn("w-0.5 h-8 mt-1", item.done ? "bg-green-500" : "bg-muted")} />
                      )}
                    </div>
                    <div className="pt-1">
                      <p className={cn("font-medium", item.done && "text-green-600")}>{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Niveaux expliqués */}
          <Card>
            <CardHeader>
              <CardTitle>Niveaux de certification</CardTitle>
              <CardDescription>Le niveau est déterminé par votre score de valeur ajoutée locale</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {badgeLevelEntries.map(([key, level]) => (
                  <div key={key} className={cn(
                    "p-4 rounded-xl border-2 transition-all",
                    certification.niveau === key ? "border-green-500 bg-green-500/5" : "border-muted"
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getBadgeColor(key)}>
                        <Award className="w-3 h-3 mr-1" />
                        Made in CI - {level.label}
                      </Badge>
                      {certification.niveau === key && (
                        <Badge variant="outline" className="border-green-500 text-green-600">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Votre niveau
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{level.desc}</p>
                    <div className="mt-2">
                      <Progress
                        value={level.minScore > 0 ? Math.min(100, (certification.scoreLocal / level.minScore) * 100) : 100}
                        className="h-1.5"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Score minimum : {level.minScore}% • Votre score : {certification.scoreLocal}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents de certification</CardTitle>
              <CardDescription>Documents requis et soumis pour votre certification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboard.checklist.map((item) => {
                const ItemIcon = getChecklistIcon(item.id);
                const docStyle = getDocStatusStyle(item.status);
                const StatusIconDoc = docStyle.icon;
                const hasDoc = !!item.document;
                const isUploading = uploadingType === item.id;
                const firstUrl = item.fileUrls[0];

                return (
                  <div
                    key={item.id}
                    className={cn("flex items-center gap-4 p-4 rounded-lg border transition-colors", docStyle.rowClass)}
                  >
                    <div className={cn("p-2 rounded-lg", docStyle.iconClass)}>
                      <ItemIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{item.label}</p>
                        {item.required && <Badge variant="outline" className="text-xs">Requis</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      {hasDoc && item.submittedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.document?.nom} • Envoyé le {item.submittedAt}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {hasDoc && <StatusIconDoc className={cn("w-5 h-5", docStyle.iconClass.split(" ")[1])} />}
                      {hasDoc && firstUrl && (
                        <Button variant="ghost" size="sm" onClick={() => window.open(firstUrl, "_blank", "noopener,noreferrer")}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant={hasDoc ? "outline" : "outline"}
                        size="sm"
                        disabled={isUploading}
                        onClick={() => handleUploadClick(item)}
                      >
                        {isUploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
                        {hasDoc ? "Renvoyer" : "Envoyer"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Produits badgés */}
        <TabsContent value="produits" className="space-y-4">
          {!isCertifie ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-semibold mb-2">Certification requise</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Obtenez d'abord la certification boutique pour propager les badges à vos produits
                </p>
                <Button onClick={() => setShowDemandeDialog(true)}>
                  Demander la certification
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Propagation des badges</p>
                        <p className="text-sm text-muted-foreground">
                          Vos produits héritent automatiquement du badge boutique
                          {certification.niveau && ` (${dashboard.badgeLevels[certification.niveau]?.label ?? certification.niveau})`}.
                          Un produit avec son propre badge Made in CI garde le badge le plus élevé.
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowPropagationDialog(true)}>
                      Gérer
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-3">
                {produits.map((produit) => (
                  <Card key={produit.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-3xl">
                          {produit.image}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{produit.nom}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {produit.badgeEffectif ? (
                              <Badge className={getBadgeColor(produit.badgeEffectif)}>
                                <Award className="w-3 h-3 mr-1" />
                                Made in CI - {dashboard.badgeLevels[produit.badgeEffectif]?.label ?? produit.badgeEffectif}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">
                                Pas de badge
                              </Badge>
                            )}
                            {produit.badgeBoutique && !produit.badgeProduit && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Store className="w-3 h-3" /> Hérité de la boutique
                              </span>
                            )}
                            {produit.badgeProduit && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Package className="w-3 h-3" /> Badge propre au produit
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Score valeur locale : {produit.scoreLocal}%
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Badge boutique</p>
                            <Switch
                              checked={produit.badgeBoutique}
                              onCheckedChange={(v) => handleToggleProduitBadge(produit.id, v)}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Historique */}
        <TabsContent value="historique" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Journal d'audit</CardTitle>
              <CardDescription>Historique des actions liées à votre certification</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard.historique.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Aucun évènement pour le moment.</p>
              ) : (
                <div className="space-y-4">
                  {dashboard.historique.map((event, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2",
                        event.type === "success" ? "bg-green-500" : event.type === "error" ? "bg-destructive" : "bg-blue-500"
                      )} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{event.action}</p>
                          <span className="text-xs text-muted-foreground">{event.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{event.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Demande de certification */}
      <Dialog open={showDemandeDialog} onOpenChange={setShowDemandeDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Demande de certification Made in CI
            </DialogTitle>
            <DialogDescription>
              Choisissez le niveau visé et joignez, si besoin, des documents complémentaires
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Niveau souhaité *</Label>
              <div className="grid grid-cols-2 gap-3">
                {madeInCIBadgeLevels.map((level) => (
                  <div
                    key={level.id}
                    className={cn(
                      "p-3 rounded-xl border-2 cursor-pointer transition-all text-center",
                      demandeNiveau === level.id ? "ring-2 ring-primary border-primary" : "border-muted hover:border-primary/50"
                    )}
                    onClick={() => setDemandeNiveau(level.id)}
                  >
                    <Badge className={cn(getBadgeColor(level.id), "mb-2")}>
                      <Award className="w-3 h-3 mr-1" />
                      {level.label}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{level.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note pour l'équipe CPU-PME</Label>
              <Textarea
                id="note"
                placeholder="Précisez tout élément utile à l'examen de votre dossier..."
                rows={3}
                value={demandeNote}
                onChange={(e) => setDemandeNote(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Documents complémentaires (optionnel)</Label>
              <label className="flex items-center gap-2 border-2 border-dashed rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                <Paperclip className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {demandeFiles.length > 0
                    ? `${demandeFiles.length} fichier${demandeFiles.length > 1 ? "s" : ""} sélectionné${demandeFiles.length > 1 ? "s" : ""}`
                    : "Cliquez pour joindre des fichiers"}
                </span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => setDemandeFiles(Array.from(e.target.files ?? []))}
                />
              </label>
              <p className="text-xs text-muted-foreground">
                Les documents de la checklist se gèrent individuellement dans l'onglet "Documents".
              </p>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm font-medium mb-1">🔍 Ce qui se passe ensuite</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Vérification de votre dossier par l'équipe CPU-PME (3-5 jours)</li>
                <li>Audit sur site si le dossier est conforme (planifié sous 10 jours)</li>
                <li>Attribution du badge selon le score obtenu</li>
                <li>Propagation automatique du badge à vos produits</li>
              </ol>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowDemandeDialog(false)} disabled={submittingDemande}>
                Annuler
              </Button>
              <Button onClick={handleSubmitDemande} disabled={!demandeNiveau || submittingDemande}>
                {submittingDemande ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Award className="w-4 h-4 mr-1" />}
                {submittingDemande ? "Envoi…" : "Soumettre la demande"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Propagation badges */}
      <Dialog open={showPropagationDialog} onOpenChange={setShowPropagationDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Propagation des badges produits
            </DialogTitle>
            <DialogDescription>
              Gérez quels produits héritent du badge boutique Made in CI
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Store className="w-4 h-4 text-primary" />
                <span className="font-medium">Badge boutique :</span>
                {certification.niveau && (
                  <Badge className={getBadgeColor(certification.niveau)}>
                    Made in CI - {dashboard.badgeLevels[certification.niveau]?.label ?? certification.niveau}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Les produits activés recevront ce badge. Si un produit a déjà son propre badge Made in CI (obtenu individuellement), le badge le plus élevé sera affiché.
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium">Appliquer à tous les produits</p>
                <p className="text-sm text-muted-foreground">{produits.length} produits concernés</p>
              </div>
              <Switch checked={propagateAll} onCheckedChange={setPropagateAll} />
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {produits.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{p.image}</span>
                    <div>
                      <p className="text-sm font-medium">{p.nom}</p>
                      {p.badgeEffectif && (
                        <Badge className={cn(getBadgeColor(p.badgeEffectif), "text-xs mt-0.5")}>
                          {dashboard.badgeLevels[p.badgeEffectif]?.label ?? p.badgeEffectif}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Switch
                    checked={p.badgeBoutique}
                    onCheckedChange={(v) => handleToggleProduitBadge(p.id, v)}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowPropagationDialog(false)}>
                Fermer
              </Button>
              <Button onClick={handlePropagateAll}>
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Appliquer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
