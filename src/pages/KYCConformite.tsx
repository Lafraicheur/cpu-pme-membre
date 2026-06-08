import { useState, useEffect, useCallback, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Shield, FileText, Upload, CheckCircle2, AlertCircle, Clock,
  Eye, Trash2, Mail, Award, Lock, Unlock, ChevronRight,
  RefreshCw, X, Check, Loader2, ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  kycApi,
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
type DocStatus = "missing" | "pending" | "uploaded" | "validated" | "rejected" | "expired" | string;

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string; icon: typeof CheckCircle2 }> = {
  missing:   { label: "Manquant",            badgeClass: "bg-muted text-muted-foreground",     icon: Clock },
  pending:   { label: "En attente de revue", badgeClass: "bg-blue-500/10 text-blue-600",       icon: Clock },
  uploaded:  { label: "Soumis",              badgeClass: "bg-blue-500/10 text-blue-600",       icon: Upload },
  validated: { label: "Validé",              badgeClass: "bg-green-500/10 text-green-600",     icon: CheckCircle2 },
  rejected:  { label: "Rejeté",              badgeClass: "bg-destructive/10 text-destructive", icon: X },
  expired:   { label: "Expiré",              badgeClass: "bg-amber-500/10 text-amber-600",     icon: AlertCircle },
};

// ── Statut du dossier KYC ─────────────────────────────────────────────────────
const CASE_STATUS_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  not_started: { label: "Non démarré",      badgeClass: "bg-muted text-muted-foreground" },
  draft:       { label: "Brouillon",        badgeClass: "bg-muted text-muted-foreground" },
  submitted:   { label: "Soumis",           badgeClass: "bg-blue-500/10 text-blue-600" },
  in_review:   { label: "En cours d'examen",badgeClass: "bg-amber-500/10 text-amber-600" },
  approved:    { label: "Approuvé",         badgeClass: "bg-green-500/10 text-green-600" },
  rejected:    { label: "Rejeté",           badgeClass: "bg-destructive/10 text-destructive" },
  expired:     { label: "Expiré",           badgeClass: "bg-amber-500/10 text-amber-600" },
};

function statusConfig(status: DocStatus) {
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
  onDelete,
  onView,
  isUploading,
}: {
  doc: KycRequiredDocument;
  onUpload: (doc: KycRequiredDocument) => void;
  onDelete: (doc: KycRequiredDocument) => void;
  onView: (doc: KycRequiredDocument) => void;
  isUploading?: boolean;
}) {
  const cfg = statusConfig(doc.status);
  const StatusIcon = cfg.icon;
  const isValidated = doc.status === "validated";
  const isMissing   = doc.status === "missing";
  const isPending   = doc.status === "pending" || doc.status === "uploaded";
  const isRejected  = doc.status === "rejected" || doc.status === "expired";

  return (
    <div className={`p-4 rounded-lg border transition-all ${
      isValidated ? "border-green-500/40 bg-green-500/5"
      : isRejected ? "border-destructive/40 bg-destructive/5"
      : isPending ? "border-blue-500/40 bg-blue-500/5"
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
              <p className="text-xs text-muted-foreground mt-1.5">
                📎 Fichier soumis
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isMissing && (
            <Button size="sm" onClick={() => onUpload(doc)} className="gap-1.5" disabled={isUploading}>
              {isUploading
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Upload className="h-3.5 w-3.5" />}
              {isUploading ? "Envoi…" : "Télécharger"}
            </Button>
          )}
          {isPending && (
            <Button variant="ghost" size="icon" title="Voir le document" onClick={() => onView(doc)}>
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {isValidated && (
            <Button variant="ghost" size="icon" title="Voir le document" onClick={() => onView(doc)}>
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {isRejected && (
            <Button size="sm" variant="outline" onClick={() => onUpload(doc)} className="gap-1.5" disabled={isUploading}>
              {isUploading
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <RefreshCw className="h-3.5 w-3.5" />}
              {isUploading ? "Envoi…" : "Renvoyer"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function KYCConformite() {
  // Top cards
  const [kycTopLevels, setKycTopLevels] = useState<KycLevelData[]>([]);
  const [topLoading, setTopLoading] = useState(true);

  // Tabs
  const [kycLevelsList, setKycLevelsList] = useState<KycLevelEntry[]>([]);
  const [levelsLoading, setLevelsLoading] = useState(true);
  const [activeLevelId, setActiveLevelId] = useState<string>("");

  // Documents par niveau (cache)
  const [levelDocsCache, setLevelDocsCache] = useState<Record<string, KycLevelDocumentsResponse>>({});
  const [loadingLevelIds, setLoadingLevelIds] = useState<Set<string>>(new Set());

  const { toast } = useToast();

  // ── Fetch top cards ─────────────────────────────────────────────────────────
  useEffect(() => {
    kycApi.getRequiredDocuments()
      .then((data) => {
        const sorted = [...data.levels].sort((a, b) => a.level.sortOrder - b.level.sortOrder);
        setKycTopLevels(sorted);
      })
      .catch(() => {})
      .finally(() => setTopLoading(false));
  }, []);

  // ── Fetch liste des niveaux (tabs) ──────────────────────────────────────────
  useEffect(() => {
    kycApi.getLevels()
      .then((data) => {
        const sorted = [...data.levels].sort((a, b) => a.sortOrder - b.sortOrder);
        setKycLevelsList(sorted);
        if (sorted.length > 0) setActiveLevelId(sorted[0].id);
      })
      .catch(() => {})
      .finally(() => setLevelsLoading(false));
  }, []);

  // ── Fetch documents d'un niveau (lazy, avec cache) ──────────────────────────
  const fetchLevelDocs = useCallback(async (levelId: string) => {
    if (!levelId || levelDocsCache[levelId] || loadingLevelIds.has(levelId)) return;
    setLoadingLevelIds((prev) => new Set(prev).add(levelId));
    try {
      const data = await kycApi.getLevelDocuments(levelId);
      setLevelDocsCache((prev) => ({ ...prev, [levelId]: data }));
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les documents.", variant: "destructive" });
    } finally {
      setLoadingLevelIds((prev) => { const s = new Set(prev); s.delete(levelId); return s; });
    }
  }, [levelDocsCache, loadingLevelIds]);

  useEffect(() => {
    if (activeLevelId) fetchLevelDocs(activeLevelId);
  }, [activeLevelId]);

  // ── Statut global (depuis top cards) ────────────────────────────────────────
  const isLevelComplete = (levelId: string) =>
    kycTopLevels.find((l) => l.level.id === levelId)?.validationPercentage === 100;

  // ── Upload ───────────────────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingDocRef = useRef<KycRequiredDocument | null>(null);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);

  const handleUpload = (doc: KycRequiredDocument) => {
    pendingDocRef.current = doc;
    if (fileInputRef.current) {
      fileInputRef.current.accept = doc.documentType.acceptedFormats
        .map((f) => `.${f.toLowerCase()}`)
        .join(",");
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    const doc = pendingDocRef.current;
    if (!file || !doc) return;

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const formats = doc.documentType.acceptedFormats.map((f) => f.toLowerCase());
    if (!formats.includes(ext)) {
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

      // Refetch direct des documents du niveau actif
      const [levelData, topData] = await Promise.allSettled([
        kycApi.getLevelDocuments(activeLevelId),
        kycApi.getRequiredDocuments(),
      ]);
      if (levelData.status === "fulfilled") {
        setLevelDocsCache((prev) => ({ ...prev, [activeLevelId]: levelData.value }));
      }
      if (topData.status === "fulfilled") {
        const sorted = [...topData.value.levels].sort((a, b) => a.level.sortOrder - b.level.sortOrder);
        setKycTopLevels(sorted);
      }
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

  const handleDelete = (_doc: KycRequiredDocument) => {
    toast({ title: "Non disponible", description: "La suppression de documents n'est pas encore prise en charge." });
  };

  const [viewDoc, setViewDoc] = useState<{ url: string; name: string; mimeType?: string } | null>(null);

  const handleView = (doc: KycRequiredDocument) => {
    const uploaded = doc.uploaded as unknown as KycUploadedDocument | null;
    const url = uploaded?.fileUrl;
    if (!url) return;
    setViewDoc({
      url,
      name: uploaded?.fileName ?? doc.documentType.name,
      mimeType: uploaded?.mimeType,
    });
  };

  return (
    <DashboardLayout>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* ── Modal aperçu document ── */}
      <Dialog open={!!viewDoc} onOpenChange={(open) => { if (!open) setViewDoc(null); }}>
        <DialogContent className="max-w-3xl w-full p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2 flex-row items-center justify-between gap-2">
            <DialogTitle className="text-sm font-medium truncate flex-1">
              {viewDoc?.name}
            </DialogTitle>
            <a
              href={viewDoc?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <Button variant="ghost" size="icon" title="Ouvrir dans un nouvel onglet">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </DialogHeader>
          <div className="w-full" style={{ height: "75vh" }}>
            {viewDoc && (() => {
              const isPdf = viewDoc.mimeType === "application/pdf" || viewDoc.url.toLowerCase().endsWith(".pdf");
              const isImage = viewDoc.mimeType?.startsWith("image/") ||
                /\.(png|jpe?g|gif|webp|bmp)$/i.test(viewDoc.url);
              if (isPdf) {
                return (
                  <iframe
                    src={viewDoc.url}
                    className="w-full h-full border-0"
                    title={viewDoc.name}
                  />
                );
              }
              if (isImage) {
                return (
                  <div className="w-full h-full flex items-center justify-center bg-muted/30 p-4">
                    <img
                      src={viewDoc.url}
                      alt={viewDoc.name}
                      className="max-w-full max-h-full object-contain rounded"
                    />
                  </div>
                );
              }
              return (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-muted-foreground">
                  <FileText className="h-12 w-12" />
                  <p className="text-sm">Aperçu non disponible pour ce format.</p>
                  <a href={viewDoc.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Télécharger le fichier
                    </Button>
                  </a>
                </div>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">KYC & Conformité</h1>
          <p className="text-muted-foreground">
            Complétez votre dossier pour débloquer toutes les fonctionnalités
          </p>
        </div>

        {/* ── Cards du haut (données API getRequiredDocuments) ── */}
        {topLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2 mt-1" />
                </CardHeader>
                <CardContent><div className="h-2 bg-muted rounded mt-2" /></CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {kycTopLevels.map((levelData) => {
              const visual = getVisual(levelData.level.code);
              const LevelIcon = visual.icon;
              const isComplete = levelData.validationPercentage === 100;
              const isActive = activeLevelId === levelData.level.id;

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
        )}

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
                          <Badge className="text-[10px] px-1.5 bg-primary/10 text-primary border-primary/30">Actuel</Badge>
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

        {/* ── Tabs documents (données API getLevels + getLevelDocuments) ── */}
        {levelsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : kycLevelsList.length === 0 ? (
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
              const isLoading = loadingLevelIds.has(level.id);
              const docsData = levelDocsCache[level.id];
              const complete = isLevelComplete(level.id);

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
                            <CardTitle>{level.name}</CardTitle>
                            <CardDescription>{level.description}</CardDescription>
                          </div>
                        </div>
                        {docsData && (
                          <div className="text-right space-y-1">
                            <p className="text-2xl font-bold">{docsData.validationPercentage}%</p>
                            <p className="text-sm text-muted-foreground">
                              {docsData.validatedDocuments}/{docsData.totalDocuments} validés
                            </p>
                            {docsData.caseStatus && (() => {
                              const cs = CASE_STATUS_CONFIG[docsData.caseStatus] ?? { label: docsData.caseStatus, badgeClass: "bg-muted text-muted-foreground" };
                              return (
                                <Badge className={`text-[10px] px-1.5 ${cs.badgeClass}`}>
                                  Dossier : {cs.label}
                                </Badge>
                              );
                            })()}
                          </div>
                        )}
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
                    <h3 className="font-semibold text-sm">Documents requis</h3>

                    {isLoading ? (
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
                              onUpload={handleUpload}
                              onDelete={handleDelete}
                              onView={handleView}
                              isUploading={uploadingDocId === doc.documentTypeId}
                            />
                          ))}
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

        {/* Aide */}
        {/* <Card className="border-border/50">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold">Besoin d'aide pour compléter votre KYC ?</h3>
                <p className="text-sm text-muted-foreground">
                  Notre équipe est disponible pour vous accompagner dans la constitution de votre dossier.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Guide KYC
                </Button>
                <Button>
                  <Mail className="h-4 w-4 mr-2" />
                  Contacter le support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card> */}

      </div>
    </DashboardLayout>
  );
}
