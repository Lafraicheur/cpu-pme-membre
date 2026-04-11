import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Trash2,
  ExternalLink,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  boutiqueCertificationApi,
  boutiquesApi,
  madeInCIBadgeLevelsApi,
  type CertificationDocument,
} from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

// ─── Config statique des niveaux de badge ───────────────────────────────────

const badgeLevelConfig: Record<string, { color: string; minScore: number; desc: string }> = {
  or:               { color: "bg-primary text-primary-foreground",        minScore: 70, desc: ">70% valeur ajoutée locale" },
  argent:           { color: "bg-secondary text-secondary-foreground",    minScore: 50, desc: ">50% valeur ajoutée locale" },
  bronze:           { color: "bg-amber-600 text-white",                   minScore: 30, desc: ">30% valeur ajoutée locale" },
  innovation_ivoire:{ color: "bg-cyan-500 text-white",                    minScore: 0,  desc: "Innovation locale brevetée" },
};
const defaultBadgeConfig = { color: "bg-muted text-muted-foreground", minScore: 0, desc: "" };
function getBadgeCfg(id: string | null | undefined) {
  return id ? (badgeLevelConfig[id] ?? defaultBadgeConfig) : defaultBadgeConfig;
}

// ─── Mapping statut API → affichage ─────────────────────────────────────────

type DisplayStatus = "NonCertifie" | "EnCours" | "Audit" | "Certifie" | "Refuse" | "Expire";

function resolveStatus(cert: { certified: boolean; current: unknown; validUntil: string | null }): DisplayStatus {
  if (cert.certified) {
    if (cert.validUntil && new Date(cert.validUntil) < new Date()) return "Expire";
    return "Certifie";
  }
  const c = (typeof cert.current === "string" ? cert.current : "").toLowerCase();
  if (c === "submitted") return "EnCours";
  if (c === "in_audit" || c === "inaudit") return "Audit";
  if (c === "rejected" || c === "refused") return "Refuse";
  return "NonCertifie";
}

const statusConfig: Record<DisplayStatus, { label: string; color: string; icon: typeof Clock; bgColor: string }> = {
  NonCertifie: { label: "Non certifié",       color: "text-muted-foreground", icon: CircleDot,    bgColor: "bg-muted"           },
  EnCours:     { label: "Demande en cours",   color: "text-blue-500",         icon: Clock,        bgColor: "bg-blue-500/10"     },
  Audit:       { label: "Audit en cours",     color: "text-amber-500",        icon: Eye,          bgColor: "bg-amber-500/10"    },
  Certifie:    { label: "Certifié",           color: "text-green-500",        icon: CheckCircle2, bgColor: "bg-green-500/10"    },
  Refuse:      { label: "Refusé",             color: "text-destructive",      icon: XCircle,      bgColor: "bg-destructive/10"  },
  Expire:      { label: "Expiré",             color: "text-amber-600",        icon: AlertCircle,  bgColor: "bg-amber-500/10"    },
};

// ─── Checklist d'icônes pour les types de document ──────────────────────────

const docTypeIcons: Record<string, typeof FileText> = {
  rccm:                            FileText,
  attestation_fiscale:             Shield,
  photos_unite_production:         Image,
  factures_fournisseurs_locaux:    FileText,
  description_processus_fabrication: Package,
  certificat_qualite_optionnel:    Award,
  preuve_localisation:             MapPin,
};
function getDocIcon(type: string) {
  return docTypeIcons[type] ?? FileText;
}

// ─── Composant principal ─────────────────────────────────────────────────────

export function CertificationBoutique() {
  const queryClient = useQueryClient();
  const [showDemandeDialog, setShowDemandeDialog] = useState(false);
  const [showPropagationDialog, setShowPropagationDialog] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<CertificationDocument | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [propagateAll, setPropagateAll] = useState(true);
  const [productOverrides, setProductOverrides] = useState<Record<string, boolean>>({});
  const [demandeData, setDemandeData] = useState({
    badgeType: "",
    processDescription: "",
    scoreLocal: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Récupération de la boutique (pour avoir le boutiqueId)
  const { data: boutique, isLoading: isLoadingBoutique } = useQuery({
    queryKey: ["boutique", "myShop"],
    queryFn: boutiquesApi.getMyShop,
  });
  const boutiqueId = boutique?.id ?? "";

  // 2. Certification de la boutique
  const { data: certData, isLoading: isLoadingCert } = useQuery({
    queryKey: ["boutiqueCertification", boutiqueId],
    queryFn: () => boutiqueCertificationApi.getCertification(boutiqueId),
    enabled: !!boutiqueId,
  });

  // 3. Documents de certification
  const { data: docsData, isLoading: isLoadingDocs } = useQuery({
    queryKey: ["boutiqueCertDocs", boutiqueId],
    queryFn: () => boutiqueCertificationApi.getDocuments(boutiqueId),
    enabled: !!boutiqueId,
  });

  // 4. Produits avec badges
  const { data: productsBadges = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["boutiqueCertProducts", boutiqueId],
    queryFn: () => boutiqueCertificationApi.getProductsBadges(boutiqueId),
    enabled: !!boutiqueId,
  });

  // 5. Niveaux de badge (pour le formulaire de demande)
  const { data: badgeLevels = [] } = useQuery({
    queryKey: ["madeInCI", "badgeLevels"],
    queryFn: madeInCIBadgeLevelsApi.getAll,
  });

  // Mutations
  const submitRequestMutation = useMutation({
    mutationFn: (body: { badgeType: string; processDescription: string; scoreLocal: number }) =>
      boutiqueCertificationApi.submitRequest(boutiqueId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boutiqueCertification", boutiqueId] });
      setShowDemandeDialog(false);
      setDemandeData({ badgeType: "", processDescription: "", scoreLocal: "" });
      toast({ title: "Demande soumise", description: "Votre demande de certification a été envoyée." });
    },
    onError: (err: Error) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });

  const updateDocMutation = useMutation({
    mutationFn: (body: { type: string; fileUrls: string[] }) =>
      boutiqueCertificationApi.updateDocument(boutiqueId, { ...body, status: "pending" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boutiqueCertDocs", boutiqueId] });
      setUploadingDoc(null);
      setPendingFiles([]);
      toast({ title: "Document envoyé", description: "Votre document a été soumis pour vérification." });
    },
    onError: (err: Error) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });

  const propagationMutation = useMutation({
    mutationFn: (body: { applyToAll?: boolean; inheritFromBoutiqueForAll?: boolean; overrides?: { productId: string; inheritFromBoutique: boolean }[] }) =>
      boutiqueCertificationApi.updateBadgePropagation(boutiqueId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boutiqueCertProducts", boutiqueId] });
      setShowPropagationDialog(false);
      toast({ title: "Propagation mise à jour" });
    },
    onError: (err: Error) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });

  // ─── Handlers upload ──────────────────────────────────────────────────────

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setPendingFiles((prev) => [...prev, ...files]);
    // reset l'input pour pouvoir resélectionner le même fichier
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleRemovePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitDocument = async () => {
    if (!uploadingDoc || pendingFiles.length === 0) return;
    setIsUploading(true);
    try {
      await boutiqueCertificationApi.uploadDocumentFiles(
        boutiqueId,
        uploadingDoc.type,
        pendingFiles,
        uploadingDoc.fileUrls ?? []
      );
      queryClient.invalidateQueries({ queryKey: ["boutiqueCertDocs", boutiqueId] });
      setUploadingDoc(null);
      setPendingFiles([]);
      toast({ title: "Document envoyé", description: "Votre document a été soumis pour vérification." });
    } catch (err) {
      toast({
        title: "Erreur d'upload",
        description: err instanceof Error ? err.message : "Impossible d'envoyer le fichier.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveExistingUrl = (doc: CertificationDocument, urlToRemove: string) => {
    const newUrls = doc.fileUrls.filter((u) => u !== urlToRemove);
    updateDocMutation.mutate({ type: doc.type, fileUrls: newUrls });
  };

  // ─── Données dérivées ──────────────────────────────────────────────────────

  const displayStatus: DisplayStatus = certData ? resolveStatus(certData) : "NonCertifie";
  const isCertifie = displayStatus === "Certifie";
  const statusCfg = statusConfig[displayStatus];
  const StatusIcon = statusCfg.icon;
  const badgeTypeCfg = getBadgeCfg(certData?.badgeType);
  const produitsAvecBadge = productsBadges.filter((p) => p.effectiveBadgeType !== null).length;

  // ─── Handlers ─────────────────────────────────────────────────────────────

  function handleSubmitDemande() {
    if (!demandeData.badgeType || !demandeData.processDescription || !demandeData.scoreLocal) {
      toast({ title: "Champs requis", description: "Veuillez remplir tous les champs obligatoires.", variant: "destructive" });
      return;
    }
    submitRequestMutation.mutate({
      badgeType: demandeData.badgeType,
      processDescription: demandeData.processDescription,
      scoreLocal: parseFloat(demandeData.scoreLocal),
    });
  }

  function handleApplyPropagation() {
    const overrides = Object.entries(productOverrides).map(([productId, inherit]) => ({
      productId,
      inheritFromBoutique: inherit,
    }));
    propagationMutation.mutate({
      applyToAll: propagateAll,
      inheritFromBoutiqueForAll: propagateAll,
      overrides: propagateAll ? [] : overrides,
    });
  }

  // ─── Chargement global ────────────────────────────────────────────────────

  if (isLoadingBoutique || isLoadingCert) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ─── Rendu ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header Certification */}
      <Card className={cn(
        "border-2",
        isCertifie && "border-green-500/50 bg-gradient-to-r from-green-500/5 to-primary/5",
        displayStatus === "EnCours" && "border-blue-500/50 bg-blue-500/5",
        displayStatus === "Audit" && "border-amber-500/50 bg-amber-500/5",
        displayStatus === "Refuse" && "border-destructive/50 bg-destructive/5",
        displayStatus === "NonCertifie" && "border-muted",
      )}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={cn("p-4 rounded-2xl", isCertifie ? "bg-green-500/10" : "bg-muted")}>
                {isCertifie
                  ? <BadgeCheck className="w-10 h-10 text-green-500" />
                  : <Store className="w-10 h-10 text-muted-foreground" />}
              </div>
              <div>
                <h2 className="text-2xl font-bold">Certification Boutique</h2>
                <div className="flex items-center gap-2 mt-1">
                  <StatusIcon className={cn("w-5 h-5", statusCfg.color)} />
                  <span className={cn("font-medium", statusCfg.color)}>{statusCfg.label}</span>
                  {isCertifie && certData?.badgeType && (
                    <Badge className={badgeTypeCfg.color}>
                      <Award className="w-3 h-3 mr-1" />
                      Made in CI - {badgeLevels.find(l => l.id === certData.badgeType)?.label ?? certData.badgeType}
                    </Badge>
                  )}
                </div>
                {isCertifie && certData?.validUntil && (
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Valide jusqu'au {new Date(certData.validUntil).toLocaleDateString("fr-FR")}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isCertifie ? (
                <>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Score local</p>
                    <p className="text-2xl font-bold text-primary">{certData?.scoreLocal ?? "—"}%</p>
                  </div>
                  <Button variant="outline" onClick={() => setShowPropagationDialog(true)}>
                    <Sparkles className="w-4 h-4 mr-1" />
                    Badges produits
                  </Button>
                </>
              ) : displayStatus === "NonCertifie" || displayStatus === "Refuse" ? (
                <Button onClick={() => setShowDemandeDialog(true)}>
                  <Award className="w-4 h-4 mr-1" />
                  Demander la certification
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Dossier en cours de traitement
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={isCertifie ? "produits" : "processus"} className="space-y-6">
        <TabsList>
          <TabsTrigger value="processus">Processus de certification</TabsTrigger>
          <TabsTrigger value="documents">
            Documents {docsData ? `(${docsData.required.completed}/${docsData.required.total})` : ""}
          </TabsTrigger>
          <TabsTrigger value="produits">
            Produits badgés ({produitsAvecBadge}/{productsBadges.length})
          </TabsTrigger>
        </TabsList>

        {/* ── Onglet : Processus ── */}
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
                {[
                  { step: 1, label: "Demande de certification",          desc: "Soumission du formulaire et documents requis",          done: ["EnCours","Audit","Certifie"].includes(displayStatus) },
                  { step: 2, label: "Vérification documentaire",         desc: "Examen des preuves et documents fournis",               done: ["Audit","Certifie"].includes(displayStatus) },
                  { step: 3, label: "Audit sur site",                    desc: "Visite de vos installations par un auditeur CPU-PME",   done: isCertifie },
                  { step: 4, label: "Calcul du score de valeur ajoutée", desc: "Évaluation du % de transformation locale",              done: isCertifie },
                  { step: 5, label: "Attribution du badge",              desc: "Niveau déterminé selon le score obtenu",                done: isCertifie },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                        item.done ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                      )}>
                        {item.done ? <CheckCircle2 className="w-5 h-5" /> : item.step}
                      </div>
                      {idx < 4 && <div className={cn("w-0.5 h-8 mt-1", item.done ? "bg-green-500" : "bg-muted")} />}
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
                {badgeLevels.map((level) => {
                  const cfg = getBadgeCfg(level.id);
                  const isCurrentLevel = certData?.badgeType === level.id;
                  const score = certData?.scoreLocal ?? 0;
                  return (
                    <div key={level.id} className={cn(
                      "p-4 rounded-xl border-2 transition-all",
                      isCurrentLevel ? "border-green-500 bg-green-500/5" : "border-muted"
                    )}>
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={cfg.color}>
                          <Award className="w-3 h-3 mr-1" />
                          Made in CI - {level.label}
                        </Badge>
                        {isCurrentLevel && (
                          <Badge variant="outline" className="border-green-500 text-green-600">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Votre niveau
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{level.description}</p>
                      {cfg.minScore > 0 && (
                        <div className="mt-2">
                          <Progress value={Math.min(100, (score / cfg.minScore) * 100)} className="h-1.5" />
                          <p className="text-xs text-muted-foreground mt-1">
                            Score minimum : {cfg.minScore}% • Votre score : {score}%
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Onglet : Documents ── */}
        <TabsContent value="documents" className="space-y-4">
          {/* Barre de progression globale */}
          {docsData && (
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Documents requis complétés</span>
                  <span className="text-sm font-bold text-primary">
                    {docsData.required.completed} / {docsData.required.total}
                  </span>
                </div>
                <Progress
                  value={(docsData.required.completed / Math.max(docsData.required.total, 1)) * 100}
                  className="h-2"
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Documents de certification</CardTitle>
              <CardDescription>
                Uploadez les documents requis pour votre dossier de certification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoadingDocs ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (docsData?.documents ?? []).map((doc) => {
                const DocIcon = getDocIcon(doc.type);
                const hasFiles = doc.fileUrls.length > 0;
                return (
                  <div
                    key={doc.type}
                    className={cn(
                      "rounded-lg border transition-colors overflow-hidden",
                      doc.status === "validated" && "border-green-500/30 bg-green-500/5",
                      doc.status === "rejected"  && "border-destructive/30 bg-destructive/5",
                      doc.status === "pending" && hasFiles && "border-amber-500/30 bg-amber-500/5",
                      doc.status === "pending" && !hasFiles && "border-muted bg-muted/30",
                    )}
                  >
                    {/* Ligne principale */}
                    <div className="flex items-center gap-4 p-4">
                      <div className={cn(
                        "p-2 rounded-lg shrink-0",
                        doc.status === "validated" ? "bg-green-500/10 text-green-500"    :
                        doc.status === "rejected"  ? "bg-destructive/10 text-destructive" :
                        hasFiles                   ? "bg-amber-500/10 text-amber-500"    :
                        "bg-muted text-muted-foreground"
                      )}>
                        <DocIcon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{doc.label}</p>
                          {doc.isRequired
                            ? <Badge variant="outline" className="text-xs">Requis</Badge>
                            : <Badge variant="outline" className="text-xs text-muted-foreground">Optionnel</Badge>
                          }
                        </div>
                        <p className="text-sm text-muted-foreground">{doc.description}</p>
                        {doc.submittedAt && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Mis à jour le {new Date(doc.submittedAt).toLocaleDateString("fr-FR")}
                          </p>
                        )}
                        {doc.adminComment && (
                          <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {doc.adminComment}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {doc.status === "validated" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                        {doc.status === "rejected"  && <XCircle className="w-5 h-5 text-destructive" />}
                        {doc.status === "pending" && hasFiles && <Clock className="w-5 h-5 text-amber-500" />}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setUploadingDoc(doc); setPendingFiles([]); }}
                        >
                          {hasFiles ? (
                            <><PlusCircle className="w-4 h-4 mr-1" />Mettre à jour</>
                          ) : (
                            <><Upload className="w-4 h-4 mr-1" />Envoyer</>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Fichiers déjà uploadés */}
                    {hasFiles && (
                      <div className="border-t px-4 py-2 space-y-1">
                        <p className="text-xs text-muted-foreground font-medium mb-1">
                          {doc.fileUrls.length} fichier(s) envoyé(s) :
                        </p>
                        {doc.fileUrls.map((url, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-2 text-sm">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-3 h-3 text-muted-foreground shrink-0" />
                              <span className="truncate text-xs text-muted-foreground">
                                {url.split("/").pop() ?? `Fichier ${idx + 1}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <a href={url} target="_blank" rel="noreferrer">
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              </a>
                              {doc.status !== "validated" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-destructive hover:text-destructive"
                                  onClick={() => handleRemoveExistingUrl(doc, url)}
                                  disabled={updateDocMutation.isPending}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Onglet : Produits badgés ── */}
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
                          Vos produits peuvent hériter du badge boutique. Un produit avec son propre badge garde le badge le plus élevé.
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowPropagationDialog(true)}>
                      Gérer
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {isLoadingProducts ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid gap-3">
                  {productsBadges.map((produit) => {
                    const effectiveCfg = getBadgeCfg(produit.effectiveBadgeType);
                    const effectiveLabel = badgeLevels.find(l => l.id === produit.effectiveBadgeType)?.label ?? produit.effectiveBadgeType;
                    return (
                      <Card key={produit.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                              <Package className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">{produit.name}</p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {produit.effectiveBadgeType ? (
                                  <Badge className={effectiveCfg.color}>
                                    <Award className="w-3 h-3 mr-1" />
                                    Made in CI - {effectiveLabel}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-muted-foreground">Pas de badge</Badge>
                                )}
                                {produit.inheritFromBoutique && !produit.productBadgeType && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Store className="w-3 h-3" /> Hérité de la boutique
                                  </span>
                                )}
                                {produit.productBadgeType && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Package className="w-3 h-3" /> Badge propre au produit
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground mb-1">Badge boutique</p>
                              <Switch
                                checked={produit.inheritFromBoutique}
                                onCheckedChange={(v) => {
                                  setProductOverrides((prev) => ({ ...prev, [produit.id]: v }));
                                }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Dialog : Demande de certification ── */}
      <Dialog open={showDemandeDialog} onOpenChange={setShowDemandeDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Demande de certification Made in CI
            </DialogTitle>
            <DialogDescription>
              Remplissez ce formulaire pour lancer le processus de certification de votre boutique
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Niveau souhaité */}
            <div className="space-y-2">
              <Label>Niveau souhaité *</Label>
              <div className="grid grid-cols-2 gap-3">
                {badgeLevels.map((level) => {
                  const cfg = getBadgeCfg(level.id);
                  return (
                    <div
                      key={level.id}
                      className={cn(
                        "p-3 rounded-xl border-2 cursor-pointer transition-all text-center",
                        demandeData.badgeType === level.id
                          ? "ring-2 ring-primary border-primary"
                          : "border-muted hover:border-primary/50"
                      )}
                      onClick={() => setDemandeData({ ...demandeData, badgeType: level.id })}
                    >
                      <Badge className={cn(cfg.color, "mb-2")}>
                        <Award className="w-3 h-3 mr-1" />
                        {level.label}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{level.description}</p>
                      {cfg.minScore > 0 && (
                        <p className="text-xs font-medium mt-1">Score min : {cfg.minScore}%</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description du processus */}
            <div className="space-y-2">
              <Label htmlFor="process">Processus de transformation *</Label>
              <Textarea
                id="process"
                placeholder="Détaillez les étapes de transformation réalisées en Côte d'Ivoire..."
                rows={4}
                value={demandeData.processDescription}
                onChange={(e) => setDemandeData({ ...demandeData, processDescription: e.target.value })}
              />
            </div>

            {/* Score local estimé */}
            <div className="space-y-2">
              <Label htmlFor="score">% estimé de valeur ajoutée locale *</Label>
              <Input
                id="score"
                type="number"
                min={0}
                max={100}
                placeholder="Ex: 65"
                value={demandeData.scoreLocal}
                onChange={(e) => setDemandeData({ ...demandeData, scoreLocal: e.target.value })}
              />
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm font-medium mb-1">Ce qui se passe ensuite</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Vérification de votre dossier par l'équipe CPU-PME (3-5 jours)</li>
                <li>Audit sur site si le dossier est conforme (planifié sous 10 jours)</li>
                <li>Attribution du badge selon le score obtenu</li>
                <li>Propagation automatique du badge à vos produits</li>
              </ol>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowDemandeDialog(false)} disabled={submitRequestMutation.isPending}>
                Annuler
              </Button>
              <Button onClick={handleSubmitDemande} disabled={submitRequestMutation.isPending}>
                {submitRequestMutation.isPending
                  ? <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  : <Award className="w-4 h-4 mr-1" />}
                Soumettre la demande
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Dialog : Propagation badges ── */}
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
            {certData?.badgeType && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Store className="w-4 h-4 text-primary" />
                  <span className="font-medium">Badge boutique :</span>
                  <Badge className={getBadgeCfg(certData.badgeType).color}>
                    Made in CI - {badgeLevels.find(l => l.id === certData.badgeType)?.label ?? certData.badgeType}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Les produits activés recevront ce badge. Si un produit a déjà son propre badge Made in CI, le badge le plus élevé sera affiché.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium">Appliquer à tous les produits</p>
                <p className="text-sm text-muted-foreground">{productsBadges.length} produit(s) concerné(s)</p>
              </div>
              <Switch checked={propagateAll} onCheckedChange={setPropagateAll} />
            </div>

            {!propagateAll && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {productsBadges.map((p) => {
                  const isChecked = productOverrides[p.id] ?? p.inheritFromBoutique;
                  const effectiveLabel = badgeLevels.find(l => l.id === p.effectiveBadgeType)?.label ?? p.effectiveBadgeType;
                  return (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{p.name}</p>
                          {p.effectiveBadgeType && (
                            <Badge className={cn(getBadgeCfg(p.effectiveBadgeType).color, "text-xs mt-0.5")}>
                              {effectiveLabel}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Switch
                        checked={isChecked}
                        onCheckedChange={(v) => setProductOverrides((prev) => ({ ...prev, [p.id]: v }))}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowPropagationDialog(false)} disabled={propagationMutation.isPending}>
                Fermer
              </Button>
              <Button onClick={handleApplyPropagation} disabled={propagationMutation.isPending}>
                {propagationMutation.isPending
                  ? <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  : <CheckCircle2 className="w-4 h-4 mr-1" />}
                Appliquer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Dialog : Upload / Mise à jour document ── */}
      <Dialog
        open={!!uploadingDoc}
        onOpenChange={(open) => { if (!open) { setUploadingDoc(null); setPendingFiles([]); } }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              {uploadingDoc?.fileUrls.length ? "Mettre à jour le document" : "Envoyer un document"}
            </DialogTitle>
            <DialogDescription>
              {uploadingDoc?.label} — {uploadingDoc?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Zone de drop / sélection */}
            <div
              className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Cliquez pour sélectionner des fichiers</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG — max 10 Mo par fichier</p>
            </div>

            {/* Input caché */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileSelect}
            />

            {/* Fichiers en attente d'upload */}
            {pendingFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Fichiers sélectionnés :</p>
                {pendingFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50 border text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        ({(file.size / 1024).toFixed(0)} Ko)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive shrink-0"
                      onClick={() => handleRemovePendingFile(idx)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Fichiers déjà présents (en mode mise à jour) */}
            {uploadingDoc && uploadingDoc.fileUrls.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Déjà envoyés :</p>
                {uploadingDoc.fileUrls.map((url, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-lg border text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="truncate text-xs text-muted-foreground">
                        {url.split("/").pop() ?? `Fichier ${idx + 1}`}
                      </span>
                    </div>
                    <a href={url} target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* Progress upload */}
            {isUploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-lg bg-muted/50">
                <Loader2 className="w-4 h-4 animate-spin" />
                Upload en cours…
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button
              variant="outline"
              onClick={() => { setUploadingDoc(null); setPendingFiles([]); }}
              disabled={isUploading || updateDocMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmitDocument}
              disabled={pendingFiles.length === 0 || isUploading || updateDocMutation.isPending}
            >
              {isUploading || updateDocMutation.isPending
                ? <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                : <Upload className="w-4 h-4 mr-1" />}
              {uploadingDoc?.fileUrls.length ? "Mettre à jour" : "Envoyer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
