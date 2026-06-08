import { useState, useEffect, useCallback, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield, FileText, Upload, CheckCircle2, AlertCircle, Clock,
  Eye, Award, Lock, Unlock, ChevronRight,
  RefreshCw, X, Check, Loader2, ExternalLink, Send,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  kycApi,
  type KycCase, type KycMyRequiredDocumentsResponse,
  type KycLevelData, type KycLevelEntry,
  type KycLevelDocumentsResponse, type KycRequiredDocument, type KycUploadedDocument,
} from "@/lib/api";

// ── Mapping visuel par code KYC ───────────────────────────────────────────────
const LEVEL_VISUALS: Record<string, {
  color: string;
  icon: typeof Shield;
  unlocks: string[];
}> = {
  BASIC: {
    color: "bg-blue-500",
    icon: Unlock,
    unlocks: ["Profil entreprise", "Accès formations", "Consultation marketplace"],
  },
  PROFESSIONAL: {
    color: "bg-amber-500",
    icon: Shield,
    unlocks: ["Soumission appels d'offres", "Vente sur marketplace", "Programmes partenaires"],
  },
  ORGANIZATION: {
    color: "bg-emerald-500",
    icon: Award,
    unlocks: ["Accès financement", "Badge entreprise vérifiée", "Accès prioritaire"],
  },
};

function getVisual(code: string) {
  return LEVEL_VISUALS[code] ?? { color: "bg-muted", icon: Shield, unlocks: [] };
}

// ── Statut document ───────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; badgeClass: string; icon: typeof CheckCircle2 }> = {
  missing:   { label: "Manquant",            badgeClass: "bg-muted text-muted-foreground",     icon: Clock },
  pending:   { label: "En attente de revue", badgeClass: "bg-blue-500/10 text-blue-600",       icon: Clock },
  uploaded:  { label: "Soumis",              badgeClass: "bg-blue-500/10 text-blue-600",       icon: Upload },
  approved:  { label: "Validé",              badgeClass: "bg-green-500/10 text-green-600",     icon: CheckCircle2 },
  validated: { label: "Validé",              badgeClass: "bg-green-500/10 text-green-600",     icon: CheckCircle2 },
  rejected:  { label: "Rejeté",              badgeClass: "bg-destructive/10 text-destructive", icon: X },
  expired:   { label: "Expiré",              badgeClass: "bg-amber-500/10 text-amber-600",     icon: AlertCircle },
};

// ── Statut du dossier KYC ─────────────────────────────────────────────────────
const CASE_STATUS_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  not_started: { label: "Non démarré",        badgeClass: "bg-muted text-muted-foreground" },
  draft:       { label: "Brouillon",          badgeClass: "bg-muted text-muted-foreground" },
  submitted:   { label: "Soumis",             badgeClass: "bg-blue-500/10 text-blue-600" },
  in_review:   { label: "En cours d'examen",  badgeClass: "bg-amber-500/10 text-amber-600" },
  approved:    { label: "Approuvé",           badgeClass: "bg-green-500/10 text-green-600" },
  rejected:    { label: "Rejeté",             badgeClass: "bg-destructive/10 text-destructive" },
  expired:     { label: "Expiré",             badgeClass: "bg-amber-500/10 text-amber-600" },
};

function statusConfig(status: string) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.missing;
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(0)} Mo`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${bytes} o`;
}

// ── Carte document ────────────────────────────────────────────────────────────
function DocumentCard({
  doc,
  onUpload,
  onView,
  isUploading,
  isReadOnly,
}: {
  doc: KycRequiredDocument;
  onUpload?: (doc: KycRequiredDocument) => void;
  onView: (doc: KycRequiredDocument) => void;
  isUploading?: boolean;
  isReadOnly?: boolean;
}) {
  const cfg = statusConfig(doc.status);
  const StatusIcon = cfg.icon;
  const isValidated = doc.status === "validated" || doc.status === "approved";
  const isMissing   = doc.status === "missing";
  const isPending   = doc.status === "pending" || doc.status === "uploaded";
  const isRejected  = doc.status === "rejected" || doc.status === "expired";
  const canUpload   = !isReadOnly && !!onUpload;

  return (
    <div className={`p-4 rounded-lg border transition-all ${
      isValidated ? "border-green-500/40 bg-green-500/5"
      : isRejected ? "border-destructive/40 bg-destructive/5"
      : isPending  ? "border-blue-500/40 bg-blue-500/5"
      : doc.isRequired ? "border-amber-500/30 bg-amber-500/5"
      : "border-border"
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`p-2 rounded-lg shrink-0 ${cfg.badgeClass}`}>
            <StatusIcon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-sm">{doc.documentType.name}</p>
              {doc.isRequired && (
                <Badge variant="outline" className="text-[10px] px-1.5">Obligatoire</Badge>
              )}
              <Badge className={`text-[10px] px-1.5 ${cfg.badgeClass}`}>{cfg.label}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Formats : {doc.documentType.acceptedFormats.join(", ").toUpperCase()}
              {" · "}Max : {formatSize(doc.documentType.maxSize)}
            </p>
            {doc.uploaded && (
              <p className="text-xs text-muted-foreground mt-1.5">📎 Fichier soumis</p>
            )}
            {isRejected && (doc.uploaded as unknown as KycUploadedDocument | null)?.rejectionReason && (
              <p className="text-xs text-destructive mt-1.5">
                Motif : {(doc.uploaded as unknown as KycUploadedDocument).rejectionReason}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {canUpload && isMissing && (
            <Button size="sm" onClick={() => onUpload!(doc)} className="gap-1.5" disabled={isUploading}>
              {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {isUploading ? "Envoi…" : "Télécharger"}
            </Button>
          )}
          {(isPending || isValidated) && (
            <Button variant="ghost" size="icon" title="Voir le document" onClick={() => onView(doc)}>
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {canUpload && isRejected && (
            <Button size="sm" variant="outline" onClick={() => onUpload!(doc)} className="gap-1.5" disabled={isUploading}>
              {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              {isUploading ? "Envoi…" : "Renvoyer"}
            </Button>
          )}
          {isRejected && !canUpload && (
            <Button variant="ghost" size="icon" title="Voir le document" onClick={() => onView(doc)}>
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function KYCConformite() {
  const { toast } = useToast();

  const [kycCase, setKycCase]             = useState<KycCase | null>(null);
  const [kycTopLevels, setKycTopLevels]   = useState<KycLevelData[]>([]);
  const [kycLevelsList, setKycLevelsList] = useState<KycLevelEntry[]>([]);
  const [activeLevelId, setActiveLevelId] = useState<string>("");
  const [myRequiredDocs, setMyRequiredDocs] = useState<KycMyRequiredDocumentsResponse | null>(null);

  // Cache documents des niveaux non-cibles (lecture seule)
  const [levelDocsCache, setLevelDocsCache]     = useState<Record<string, KycLevelDocumentsResponse>>({});
  const [loadingLevelIds, setLoadingLevelIds]   = useState<Set<string>>(new Set());

  const [pageLoading, setPageLoading]     = useState(true);
  const [submitting, setSubmitting]       = useState(false);
  const [startingLevelId, setStartingLevelId] = useState<string | null>(null);

  const fileInputRef  = useRef<HTMLInputElement>(null);
  const pendingDocRef = useRef<KycRequiredDocument | null>(null);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [viewDoc, setViewDoc] = useState<{ url: string; name: string; mimeType?: string } | null>(null);

  // ── Dérivés ────────────────────────────────────────────────────────────────
  const targetLevelId = kycCase?.targetKycLevelId ?? "";
  const caseStatus    = kycCase?.status ?? "not_started";
  const isLocked      = caseStatus === "submitted" || caseStatus === "in_review" || caseStatus === "approved";
  const isRejected    = caseStatus === "rejected";

  const canSubmit =
    (caseStatus === "draft" || caseStatus === "rejected" || caseStatus === "expired") &&
    myRequiredDocs !== null &&
    myRequiredDocs.requiredDocuments.filter((d) => d.isRequired).every((d) => d.status !== "missing");

  const isLevelComplete = (levelId: string) =>
    kycTopLevels.find((l) => l.level.id === levelId)?.validationPercentage === 100;

  // ── Refresh global ─────────────────────────────────────────────────────────
  const refreshAll = async () => {
    const [caseRes, allLevelsRes, myDocsRes, levelsRes] = await Promise.allSettled([
      kycApi.getKycCase(),
      kycApi.getRequiredDocuments(),
      kycApi.getMyRequiredDocuments(),
      kycApi.getLevels(),
    ]);
    if (caseRes.status === "fulfilled")      setKycCase(caseRes.value);
    if (allLevelsRes.status === "fulfilled") {
      setKycTopLevels([...allLevelsRes.value.levels].sort((a, b) => a.level.sortOrder - b.level.sortOrder));
    }
    if (myDocsRes.status === "fulfilled")    setMyRequiredDocs(myDocsRes.value);
    if (levelsRes.status === "fulfilled") {
      setKycLevelsList([...levelsRes.value.levels].sort((a, b) => a.sortOrder - b.sortOrder));
    }
  };

  // ── Initialisation ─────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [kycCaseData, levelsData, allLevelsData, myDocsData] = await Promise.all([
          kycApi.getKycCase(),
          kycApi.getLevels(),
          kycApi.getRequiredDocuments(),
          kycApi.getMyRequiredDocuments(),
        ]);
        setKycCase(kycCaseData);
        setMyRequiredDocs(myDocsData);
        const sortedTop = [...allLevelsData.levels].sort((a, b) => a.level.sortOrder - b.level.sortOrder);
        setKycTopLevels(sortedTop);
        const sortedLevels = [...levelsData.levels].sort((a, b) => a.sortOrder - b.sortOrder);
        setKycLevelsList(sortedLevels);
        const initId = kycCaseData.targetKycLevelId ?? sortedLevels[0]?.id ?? "";
        setActiveLevelId(initId);
      } catch {
        toast({ title: "Erreur", description: "Impossible de charger votre dossier KYC.", variant: "destructive" });
      } finally {
        setPageLoading(false);
      }
    })();
  }, []);

  // ── Fetch documents d'un niveau non-cible (lazy, cache) ────────────────────
  const fetchLevelDocs = useCallback(async (levelId: string) => {
    if (!levelId || levelId === targetLevelId || levelDocsCache[levelId] || loadingLevelIds.has(levelId)) return;
    setLoadingLevelIds((prev) => new Set(prev).add(levelId));
    try {
      const data = await kycApi.getLevelDocuments(levelId);
      setLevelDocsCache((prev) => ({ ...prev, [levelId]: data }));
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les documents.", variant: "destructive" });
    } finally {
      setLoadingLevelIds((prev) => { const s = new Set(prev); s.delete(levelId); return s; });
    }
  }, [levelDocsCache, loadingLevelIds, targetLevelId]);

  useEffect(() => {
    if (activeLevelId && activeLevelId !== targetLevelId) {
      fetchLevelDocs(activeLevelId);
    }
  }, [activeLevelId, targetLevelId]);

  // ── Démarrer / changer de niveau cible ────────────────────────────────────
  const handleStart = async (levelId: string) => {
    setStartingLevelId(levelId);
    try {
      await kycApi.startKyc(levelId);
      toast({ title: "Niveau mis à jour", description: "Votre niveau KYC cible a été défini." });
      setActiveLevelId(levelId);
      setLevelDocsCache({});
      await refreshAll();
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible de démarrer le KYC.",
        variant: "destructive",
      });
    } finally {
      setStartingLevelId(null);
    }
  };

  // ── Soumettre le dossier ───────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const updated = await kycApi.submitKyc();
      setKycCase(updated);
      toast({ title: "Dossier soumis", description: "Votre dossier est en cours d'examen par notre équipe." });
    } catch (err) {
      toast({
        title: "Erreur lors de la soumission",
        description: err instanceof Error ? err.message : "Impossible de soumettre le dossier.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Upload ─────────────────────────────────────────────────────────────────
  const handleUpload = (doc: KycRequiredDocument) => {
    pendingDocRef.current = doc;
    if (fileInputRef.current) {
      fileInputRef.current.accept = doc.documentType.acceptedFormats.map((f) => `.${f.toLowerCase()}`).join(",");
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    const doc = pendingDocRef.current;
    if (!file || !doc) return;

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!doc.documentType.acceptedFormats.map((f) => f.toLowerCase()).includes(ext)) {
      toast({
        title: "Format non accepté",
        description: `Formats acceptés : ${doc.documentType.acceptedFormats.join(", ").toUpperCase()}`,
        variant: "destructive",
      });
      return;
    }
    if (file.size > doc.documentType.maxSize) {
      toast({
        title: "Fichier trop volumineux",
        description: `Taille max : ${formatSize(doc.documentType.maxSize)}`,
        variant: "destructive",
      });
      return;
    }

    setUploadingDocId(doc.documentTypeId);
    try {
      await kycApi.uploadDocument(doc.documentTypeId, file);
      toast({ title: "Document envoyé", description: `"${doc.documentType.name}" a bien été soumis.` });
      await refreshAll();
    } catch (err) {
      toast({
        title: "Erreur lors de l'envoi",
        description: err instanceof Error ? err.message : "Une erreur est survenue.",
        variant: "destructive",
      });
    } finally {
      setUploadingDocId(null);
      pendingDocRef.current = null;
    }
  };

  const handleView = (doc: KycRequiredDocument) => {
    const uploaded = doc.uploaded as unknown as KycUploadedDocument | null;
    if (!uploaded?.fileUrl) return;
    setViewDoc({ url: uploaded.fileUrl, name: uploaded.fileName ?? doc.documentType.name, mimeType: uploaded.mimeType });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />

      {/* ── Modal aperçu document ── */}
      <Dialog open={!!viewDoc} onOpenChange={(open) => { if (!open) setViewDoc(null); }}>
        <DialogContent className="max-w-3xl w-full p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2 flex-row items-center justify-between gap-2">
            <DialogTitle className="text-sm font-medium truncate flex-1">{viewDoc?.name}</DialogTitle>
            <a href={viewDoc?.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
              <Button variant="ghost" size="icon" title="Ouvrir dans un nouvel onglet">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </DialogHeader>
          <div className="w-full" style={{ height: "75vh" }}>
            {viewDoc && (() => {
              const isPdf  = viewDoc.mimeType === "application/pdf" || viewDoc.url.toLowerCase().endsWith(".pdf");
              const isImg  = viewDoc.mimeType?.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp)$/i.test(viewDoc.url);
              if (isPdf) return <iframe src={viewDoc.url} className="w-full h-full border-0" title={viewDoc.name} />;
              if (isImg) return (
                <div className="w-full h-full flex items-center justify-center bg-muted/30 p-4">
                  <img src={viewDoc.url} alt={viewDoc.name} className="max-w-full max-h-full object-contain rounded" />
                </div>
              );
              return (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-muted-foreground">
                  <FileText className="h-12 w-12" />
                  <p className="text-sm">Aperçu non disponible pour ce format.</p>
                  <a href={viewDoc.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="gap-2">
                      <ExternalLink className="h-4 w-4" />Télécharger le fichier
                    </Button>
                  </a>
                </div>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">KYC & Conformité</h1>
            <p className="text-muted-foreground">Complétez votre dossier pour débloquer toutes les fonctionnalités</p>
          </div>
          {kycCase && (() => {
            const cs = CASE_STATUS_CONFIG[caseStatus] ?? { label: caseStatus, badgeClass: "bg-muted text-muted-foreground" };
            return <Badge className={`text-sm px-3 py-1 ${cs.badgeClass}`}>Dossier : {cs.label}</Badge>;
          })()}
        </div>

        {/* ── Alerte rejet ── */}
        {isRejected && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Dossier rejeté.</strong>
              {kycCase?.rejectionReason && <> Motif : {kycCase.rejectionReason}.</>}
              {" "}Corrigez les documents concernés puis soumettez à nouveau.
            </AlertDescription>
          </Alert>
        )}

        {/* ── Alerte soumis / en examen ── */}
        {(caseStatus === "submitted" || caseStatus === "in_review") && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              {caseStatus === "submitted"
                ? "Votre dossier a été soumis et est en attente de vérification."
                : "Votre dossier est en cours d'examen par notre équipe."
              }{" "}Les dépôts de documents sont désactivés jusqu'à la décision.
            </AlertDescription>
          </Alert>
        )}

        {/* ── Alerte approuvé ── */}
        {caseStatus === "approved" && (
          <Alert className="border-green-500/40 bg-green-500/5">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Votre dossier KYC a été approuvé.
              {kycCase?.currentKycLevel && ` Niveau actuel : ${kycCase.currentKycLevel.name}.`}
              {kycCase?.expiresAt && ` Valide jusqu'au : ${new Date(kycCase.expiresAt).toLocaleDateString("fr-FR")}.`}
            </AlertDescription>
          </Alert>
        )}

        {/* ── Alerte expiré ── */}
        {caseStatus === "expired" && (
          <Alert className="border-amber-500/40 bg-amber-500/5">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              Votre KYC a expiré. Déposez à nouveau vos documents pour relancer la procédure de vérification.
            </AlertDescription>
          </Alert>
        )}

        {/* ── Cards du haut (progression par niveau) ── */}
        <div className="grid gap-4 md:grid-cols-3">
          {kycTopLevels.map((levelData) => {
            const visual = getVisual(levelData.level.code);
            const LevelIcon = visual.icon;
            const isComplete = levelData.validationPercentage === 100;
            const isActive   = activeLevelId === levelData.level.id;

            return (
              <Card
                key={levelData.level.id}
                className={`relative overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                  isActive ? "ring-2 ring-primary" : ""
                } ${isComplete ? "border-green-500/40" : ""}`}
                onClick={() => setActiveLevelId(levelData.level.id)}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 ${visual.color}`} />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${isComplete ? "bg-green-500/10" : "bg-muted"}`}>
                        {isComplete
                          ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                          : <LevelIcon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                        }
                      </div>
                      <div>
                        <CardTitle className="text-base">{levelData.level.name}</CardTitle>
                        <CardDescription className="text-xs">{levelData.level.description}</CardDescription>
                      </div>
                    </div>
                    {isComplete && (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/30">Validé</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progression</span>
                      <span className="font-medium">
                        {levelData.validatedDocuments}/{levelData.totalDocuments} documents
                      </span>
                    </div>
                    <Progress value={levelData.validationPercentage} className="h-2" />
                    <div className="pt-2 border-t">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Débloque :</p>
                      <div className="space-y-1">
                        {visual.unlocks.slice(0, 2).map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            {isComplete
                              ? <Check className="h-3 w-3 text-green-600" />
                              : <Lock className="h-3 w-3 text-muted-foreground" />
                            }
                            <span className={isComplete ? "" : "text-muted-foreground"}>{item}</span>
                          </div>
                        ))}
                        {visual.unlocks.length > 2 && (
                          <p className="text-xs text-muted-foreground">+{visual.unlocks.length - 2} autres</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ── Barre de statut global ── */}
        {kycLevelsList.length > 0 && (
          <Card className="border-border/50">
            <CardContent className="py-4">
              <div className="flex flex-wrap items-center gap-2">
                {kycLevelsList.map((level, idx) => {
                  const complete = isLevelComplete(level.id);
                  return (
                    <div key={level.id} className="flex items-center gap-2">
                      {idx > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                      <div className="flex items-center gap-1.5">
                        {complete
                          ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                          : <Clock className="h-4 w-4 text-muted-foreground" />
                        }
                        <span className={`text-sm ${complete ? "text-green-600 font-medium" : "text-muted-foreground"}`}>
                          {level.name}
                        </span>
                        {level.isCurrent && (
                          <Badge className="text-[10px] px-1.5 bg-green-500/10 text-green-600 border-green-500/30">Validé</Badge>
                        )}
                        {level.isTarget && !level.isCurrent && (
                          <Badge className="text-[10px] px-1.5 bg-amber-500/10 text-amber-600 border-amber-400/30">Cible</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Tabs documents ── */}
        {kycLevelsList.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              Aucun niveau KYC disponible pour votre abonnement.
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeLevelId} onValueChange={setActiveLevelId}>
            <TabsList className={`grid w-full grid-cols-${Math.min(kycLevelsList.length, 4)}`}>
              {kycLevelsList.map((level) => {
                const visual = getVisual(level.code);
                const LevelIcon = visual.icon;
                const complete = isLevelComplete(level.id);
                return (
                  <TabsTrigger key={level.id} value={level.id} className="gap-1.5 text-xs sm:text-sm">
                    <LevelIcon className="h-4 w-4 shrink-0" />
                    <span className="hidden sm:inline">{level.name}</span>
                    <span className="sm:hidden">Niv.{level.sortOrder}</span>
                    {complete && <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {kycLevelsList.map((level) => {
              const visual = getVisual(level.code);
              const LevelIcon = visual.icon;
              const complete  = isLevelComplete(level.id);
              const isTarget  = level.id === targetLevelId;

              // Données selon onglet cible ou autre
              const docsData: {
                caseStatus?: string;
                totalDocuments: number;
                validatedDocuments: number;
                validationPercentage: number;
                requiredDocuments: KycRequiredDocument[];
              } | null = isTarget
                ? myRequiredDocs
                : levelDocsCache[level.id] ?? null;

              const isLoadingDocs = isTarget ? false : loadingLevelIds.has(level.id);

              // Bouton "Sélectionner ce niveau" : visible si non cible + canSelect + dossier non verrouillé
              const showStartButton = !isTarget && level.canSelect && !isLocked;

              return (
                <TabsContent key={level.id} value={level.id} className="space-y-6">

                  {/* Entête du niveau */}
                  <Card className="border-border/50">
                    <CardHeader>
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-xl ${visual.color}/20`}>
                            <LevelIcon className={`h-6 w-6 ${visual.color.replace("bg-", "text-")}`} />
                          </div>
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {level.name}
                              {isTarget && (
                                <Badge className="text-[10px] px-1.5 bg-amber-500/10 text-amber-600 border-amber-400/30">
                                  Niveau cible
                                </Badge>
                              )}
                              {level.isCurrent && (
                                <Badge className="text-[10px] px-1.5 bg-green-500/10 text-green-600 border-green-500/30">
                                  Niveau actuel
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription>{level.description}</CardDescription>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                          {docsData && (
                            <div className="text-right space-y-1">
                              <p className="text-2xl font-bold">{docsData.validationPercentage}%</p>
                              <p className="text-sm text-muted-foreground">
                                {docsData.validatedDocuments}/{docsData.totalDocuments} validés
                              </p>
                            </div>
                          )}
                          {showStartButton && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5"
                              disabled={startingLevelId === level.id}
                              onClick={() => handleStart(level.id)}
                            >
                              {startingLevelId === level.id
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : <ChevronRight className="h-3.5 w-3.5" />
                              }
                              Sélectionner ce niveau
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {visual.unlocks.map((item, i) => (
                          <Badge key={i} variant="outline" className="gap-1 text-xs">
                            {complete
                              ? <Unlock className="h-3 w-3 text-green-600" />
                              : <Lock className="h-3 w-3" />
                            }
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Documents */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm">Documents requis</h3>
                      {!isTarget && (
                        <p className="text-xs text-muted-foreground">Aperçu — déposez des documents depuis le niveau cible</p>
                      )}
                    </div>

                    {isLoadingDocs ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    ) : docsData ? (
                      docsData.requiredDocuments.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">
                          Aucun document requis pour ce niveau.
                        </p>
                      ) : (
                        <>
                          {docsData.validationPercentage > 0 && (
                            <Progress value={docsData.validationPercentage} className="h-1.5 mb-4" />
                          )}
                          {docsData.requiredDocuments.map((doc) => (
                            <DocumentCard
                              key={doc.documentTypeId}
                              doc={doc}
                              onUpload={isTarget && !isLocked ? handleUpload : undefined}
                              onView={handleView}
                              isUploading={uploadingDocId === doc.documentTypeId}
                              isReadOnly={!isTarget || isLocked}
                            />
                          ))}

                          {/* Bouton soumettre — uniquement sur le niveau cible */}
                          {isTarget && (
                            <div className="pt-4">
                              {caseStatus === "approved" ? (
                                <div className="flex items-center gap-2 text-sm text-green-700 p-3 rounded-lg bg-green-500/5 border border-green-500/30">
                                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                                  <span>KYC approuvé — aucune action requise.</span>
                                </div>
                              ) : caseStatus === "submitted" || caseStatus === "in_review" ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-lg bg-muted/40">
                                  <Clock className="h-4 w-4 shrink-0" />
                                  <span>
                                    {caseStatus === "submitted"
                                      ? "Dossier soumis — en attente de vérification."
                                      : "Dossier en cours d'examen par notre équipe."}
                                  </span>
                                </div>
                              ) : canSubmit ? (
                                <Button
                                  className="w-full gap-2"
                                  onClick={handleSubmit}
                                  disabled={submitting}
                                >
                                  {submitting
                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                    : <Send className="h-4 w-4" />
                                  }
                                  {submitting ? "Soumission en cours…" : "Soumettre le dossier pour vérification"}
                                </Button>
                              ) : caseStatus === "not_started" ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-lg border border-dashed">
                                  <Upload className="h-4 w-4 shrink-0" />
                                  <span>Déposez votre premier document pour démarrer le dossier.</span>
                                </div>
                              ) : caseStatus === "rejected" ? (
                                <div className="flex items-center gap-2 text-sm text-destructive/80 p-3 rounded-lg border border-dashed border-destructive/30">
                                  <AlertCircle className="h-4 w-4 shrink-0" />
                                  <span>Remplacez les documents rejetés pour pouvoir soumettre à nouveau.</span>
                                </div>
                              ) : caseStatus === "expired" ? (
                                <div className="flex items-center gap-2 text-sm text-amber-700 p-3 rounded-lg border border-dashed border-amber-400/30">
                                  <AlertCircle className="h-4 w-4 shrink-0" />
                                  <span>Déposez à nouveau vos documents pour relancer la procédure.</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-lg border border-dashed">
                                  <AlertCircle className="h-4 w-4 shrink-0" />
                                  <span>Déposez tous les documents obligatoires pour pouvoir soumettre.</span>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )
                    ) : (
                      <div className="flex justify-center py-10">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        )}

      </div>
    </DashboardLayout>
  );
}
