import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ClipboardCheck, Search, FileText, Upload, CheckCircle,
  AlertCircle, Building2, GraduationCap, ChevronRight, Clock,
  CalendarDays, Briefcase, XCircle, Eye, ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { racApi, type RacMetier, type RacRequiredDocument, type RacDossier, type RacTimelineEvent } from "@/lib/api";

function MetierCardSkeleton() {
  return (
    <Card className="rounded-sm">
      <CardContent className="p-5 space-y-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-9 w-full mt-2" />
      </CardContent>
    </Card>
  );
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(0)} Mo`;
  return `${(bytes / 1024).toFixed(0)} Ko`;
}

interface DocUploadRowProps {
  doc: RacRequiredDocument;
  file: File | null;
  inputRef: (el: HTMLInputElement | null) => void;
  onChange: (file: File | null) => void;
}

function DocUploadRow({ doc, file, inputRef, onChange }: DocUploadRowProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">
          {doc.label}
          {doc.obligatoire && <span className="text-destructive ml-1">*</span>}
        </Label>
        <span className="text-xs text-muted-foreground">
          ({doc.formats.join(", ").toUpperCase()} · max {formatBytes(doc.tailleMax)})
        </span>
      </div>
      <div
        className="border-2 border-dashed rounded-sm p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/40 transition-colors"
        onClick={() => document.getElementById(`doc-input-${doc.id}`)?.click()}
      >
        {file ? (
          <>
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-sm truncate">{file.name}</span>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm text-muted-foreground">Cliquer pour choisir un fichier</span>
          </>
        )}
      </div>
      <input
        id={`doc-input-${doc.id}`}
        ref={inputRef}
        type="file"
        accept={doc.formats.map((f) => `.${f}`).join(",")}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          if (f && f.size > doc.tailleMax) {
            alert(`Fichier trop volumineux. Maximum : ${formatBytes(doc.tailleMax)}`);
            e.target.value = "";
            return;
          }
          onChange(f);
        }}
      />
    </div>
  );
}

const FORM_INIT = {
  candidat: "",
  email: "",
  telephone: "",
  dateDepot: new Date().toISOString().split("T")[0],
  anneesExperience: "",
};

export function EvaluationRAC() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("dashboard");

  // Mes demandes
  const [dossiers, setDossiers] = useState<RacDossier[]>([]);
  const [dossiersLoading, setDossiersLoading] = useState(false);
  const [dossiersError, setDossiersError] = useState<string | null>(null);

  // Timeline
  const [timelineDossier, setTimelineDossier] = useState<RacDossier | null>(null);
  const [timeline, setTimeline] = useState<RacTimelineEvent[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineError, setTimelineError] = useState<string | null>(null);

  const [metiers, setMetiers] = useState<RacMetier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSecteur, setSelectedSecteur] = useState("all");

  // Formulaire candidature
  const [selectedMetier, setSelectedMetier] = useState<RacMetier | null>(null);
  const [form, setForm] = useState({ ...FORM_INIT });
  const [docFiles, setDocFiles] = useState<Record<string, File | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    racApi.getMetiers()
      .then((data) => setMetiers(data))
      .catch(() => setError("Impossible de charger les métiers RAC."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab !== "demandes" || !user?.email) return;
    setDossiersLoading(true);
    setDossiersError(null);
    racApi.getDossiers(user.email)
      .then(setDossiers)
      .catch(() => setDossiersError("Impossible de charger vos demandes."))
      .finally(() => setDossiersLoading(false));
  }, [activeTab, user?.email]);

  const secteurs = [...new Set(metiers.map((m) => m.secteur))].filter(Boolean).sort();

  const filtered = metiers.filter((m) => {
    if (!m.publication) return false;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || m.nom.toLowerCase().includes(q) || m.secteur.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
    const matchSecteur = selectedSecteur === "all" || m.secteur === selectedSecteur;
    return matchSearch && matchSecteur;
  });

  const openForm = (metier: RacMetier) => {
    setSelectedMetier(metier);
    setForm({
      candidat: user?.name ?? "",
      email: user?.email ?? "",
      telephone: user?.phone ?? "",
      dateDepot: new Date().toISOString().split("T")[0],
      anneesExperience: "",
    });
    setDocFiles({});
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleSubmit = async () => {
    if (!selectedMetier) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const documentsJoints: Array<{ url: string; name: string; type: string }> = [];

      for (const doc of selectedMetier.requiredDocuments) {
        const file = docFiles[doc.id] ?? null;
        if (!file) {
          if (doc.obligatoire) throw new Error(`Document obligatoire manquant : "${doc.label}"`);
          continue;
        }
        const url = await racApi.fileToBase64(file);
        const ext = file.name.split(".").pop()?.toLowerCase() ?? doc.formats[0] ?? "pdf";
        documentsJoints.push({ url, name: doc.label, type: ext });
      }

      await racApi.postuler({
        racMetierId: selectedMetier.id,
        candidat: form.candidat,
        email: form.email,
        telephone: form.telephone,
        dateDepot: form.dateDepot,
        anneesExperience: Number(form.anneesExperience),
        documentsJoints,
      });

      setSubmitSuccess(true);
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : "Erreur lors de l'envoi du dossier.");
    } finally {
      setSubmitting(false);
    }
  };

  const setF = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const openTimeline = (dossier: RacDossier) => {
    setTimelineDossier(dossier);
    setTimeline([]);
    setTimelineError(null);
    setTimelineLoading(true);
    racApi.getTimeline(dossier.id)
      .then(setTimeline)
      .catch(() => setTimelineError("Impossible de charger la timeline."))
      .finally(() => setTimelineLoading(false));
  };

  const canSubmit =
    form.candidat.trim() &&
    form.email.trim() &&
    form.telephone.trim() &&
    form.dateDepot &&
    form.anneesExperience &&
    selectedMetier?.requiredDocuments
      .filter((d) => d.obligatoire)
      .every((d) => !!docFiles[d.id]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-primary" />
          Reconnaissance des Acquis et Compétences
        </h2>
        <p className="text-muted-foreground mt-1">
          Faites valider votre expérience professionnelle et obtenez une certification officielle.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard" className="gap-2">
            <ClipboardCheck className="w-4 h-4" />
            Tableau de bord
          </TabsTrigger>
          <TabsTrigger value="demandes" className="gap-2">
            <FileText className="w-4 h-4" />
            Mes demandes
          </TabsTrigger>
        </TabsList>

        {/* ── Tableau de bord ── */}
        <TabsContent value="dashboard" className="space-y-4">
          {/* Filtres */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9 rounded-sm"
                placeholder="Rechercher un métier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedSecteur} onValueChange={setSelectedSecteur}>
              <SelectTrigger className="rounded-sm w-full sm:w-56">
                <SelectValue placeholder="Tous les secteurs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les secteurs</SelectItem>
                {secteurs.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contenu */}
          {error ? (
            <Card className="rounded-sm border-destructive/50">
              <CardContent className="p-6 flex items-center gap-3 text-destructive">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
                <Button variant="outline" size="sm" className="ml-auto rounded-sm"
                  onClick={() => { setError(null); setLoading(true); racApi.getMetiers().then(setMetiers).catch(() => setError("Impossible de charger les métiers RAC.")).finally(() => setLoading(false)); }}>
                  Réessayer
                </Button>
              </CardContent>
            </Card>
          ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <MetierCardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <Card className="rounded-sm">
              <CardContent className="py-16 text-center text-muted-foreground">
                <ClipboardCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>{searchQuery || selectedSecteur !== "all" ? "Aucun métier ne correspond à votre recherche." : "Aucun métier RAC disponible pour le moment."}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((metier) => (
                <Card key={metier.id} className="rounded-sm flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base leading-snug">{metier.nom}</CardTitle>
                      <Badge variant="secondary" className="shrink-0 text-xs rounded-sm">
                        Niv. {metier.niveau}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1.5 text-xs">
                      <Building2 className="w-3 h-3" />
                      {metier.secteur}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 flex flex-col flex-1 gap-3">
                    {metier.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{metier.description}</p>
                    )}

                    {metier.requiredDocuments.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium flex items-center gap-1 text-muted-foreground">
                          <FileText className="w-3 h-3" />
                          Documents requis ({metier.requiredDocuments.length})
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {metier.requiredDocuments.slice(0, 3).map((d) => (
                            <Badge key={d.id} variant={d.obligatoire ? "default" : "outline"} className="text-xs rounded-sm">
                              {d.label}{!d.obligatoire && " (opt.)"}
                            </Badge>
                          ))}
                          {metier.requiredDocuments.length > 3 && (
                            <Badge variant="outline" className="text-xs rounded-sm">
                              +{metier.requiredDocuments.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-1 mt-auto">
                      <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Certification reconnue</span>
                    </div>

                    <Button className="w-full rounded-sm gap-2" onClick={() => openForm(metier)}>
                      Postuler
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Mes demandes ── */}
        <TabsContent value="demandes" className="space-y-4">
          {dossiersError ? (
            <Card className="rounded-sm border-destructive/50">
              <CardContent className="p-6 flex items-center gap-3 text-destructive">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{dossiersError}</span>
                <Button variant="outline" size="sm" className="ml-auto rounded-sm"
                  onClick={() => {
                    if (!user?.email) return;
                    setDossiersLoading(true);
                    setDossiersError(null);
                    racApi.getDossiers(user.email).then(setDossiers).catch(() => setDossiersError("Impossible de charger vos demandes.")).finally(() => setDossiersLoading(false));
                  }}>
                  Réessayer
                </Button>
              </CardContent>
            </Card>
          ) : dossiersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="rounded-sm"><CardContent className="p-4 space-y-2"><Skeleton className="h-5 w-1/2" /><Skeleton className="h-4 w-1/3" /><Skeleton className="h-4 w-2/3" /></CardContent></Card>
              ))}
            </div>
          ) : !user?.email ? (
            <Card className="rounded-sm">
              <CardContent className="py-12 text-center text-muted-foreground">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>Connectez-vous pour voir vos demandes.</p>
              </CardContent>
            </Card>
          ) : dossiers.length === 0 ? (
            <Card className="rounded-sm">
              <CardContent className="py-16 text-center text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Aucune demande RAC</p>
                <p className="text-sm mt-1">Vos candidatures soumises apparaîtront ici.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {dossiers
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((d) => (
                  <Card key={d.id} className="rounded-sm">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold">{d.racMetier.nom}</span>
                            <Badge
                              variant={d.statut === "Validé" ? "default" : d.statut === "Refusé" ? "destructive" : "secondary"}
                              className="rounded-sm text-xs"
                            >
                              {d.statut === "En attente" && <Clock className="w-3 h-3 mr-1" />}
                              {d.statut === "Validé" && <CheckCircle className="w-3 h-3 mr-1" />}
                              {d.statut}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5" />
                              {d.racMetier.secteur}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3.5 h-3.5" />
                              {d.anneesExperience} an{d.anneesExperience > 1 ? "s" : ""} d'expérience
                            </span>
                            <span className="flex items-center gap-1">
                              <CalendarDays className="w-3.5 h-3.5" />
                              Déposé le {new Date(d.created_at).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                          {d.documentsJoints.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {d.documentsJoints.map((doc, i) => (
                                <Badge key={i} variant="outline" className="text-xs rounded-sm">
                                  <FileText className="w-3 h-3 mr-1" />{doc.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {d.commentaire && (
                            <p className="text-xs text-muted-foreground italic border-l-2 pl-2 mt-1">{d.commentaire}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          {d.pourcentageValidation !== null && (
                            <div className="text-center">
                              <p className="text-2xl font-bold text-primary">{d.pourcentageValidation}%</p>
                              <p className="text-xs text-muted-foreground">Validation</p>
                            </div>
                          )}
                          <Button variant="outline" size="sm" className="rounded-sm gap-1.5" onClick={() => openTimeline(d)}>
                            <Eye className="w-3.5 h-3.5" />
                            Timeline
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog Timeline */}
      <Dialog open={!!timelineDossier} onOpenChange={(open) => { if (!open) setTimelineDossier(null); }}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Timeline — {timelineDossier?.racMetier.nom}
            </DialogTitle>
          </DialogHeader>

          {timelineError ? (
            <div className="p-3 bg-destructive/10 text-destructive rounded-sm text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {timelineError}
            </div>
          ) : timelineLoading ? (
            <div className="space-y-4 py-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1 pt-1">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : timeline.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Aucun événement dans la timeline.</p>
            </div>
          ) : (
            <div className="relative py-2">
              {/* Ligne verticale */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

              <div className="space-y-5">
                {[...timeline]
                  .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                  .map((event, idx) => {
                    const isLast = idx === timeline.length - 1;
                    const iconMap: Record<string, React.ReactNode> = {
                      depot: <ClipboardCheck className="w-4 h-4" />,
                      decision: event.details?.decision === "accepted"
                        ? <CheckCircle className="w-4 h-4" />
                        : <XCircle className="w-4 h-4" />,
                      revue_document: <ShieldCheck className="w-4 h-4" />,
                      evaluation: <FileText className="w-4 h-4" />,
                    };
                    const colorMap: Record<string, string> = {
                      depot: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
                      decision: event.details?.decision === "accepted"
                        ? "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400"
                        : "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
                      revue_document: event.details?.status === "accepted"
                        ? "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400"
                        : "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
                      evaluation: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",
                    };
                    const icon = iconMap[event.eventType] ?? <Clock className="w-4 h-4" />;
                    const color = colorMap[event.eventType] ?? "bg-muted text-muted-foreground";

                    return (
                      <div key={event.id} className={`relative flex gap-4 ${isLast ? "" : ""}`}>
                        {/* Dot */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${color}`}>
                          {icon}
                        </div>
                        {/* Content */}
                        <div className="flex-1 pb-1">
                          <p className="font-medium text-sm leading-tight">{event.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(event.created_at).toLocaleDateString("fr-FR", {
                              day: "2-digit", month: "long", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                          {event.details?.reason && (
                            <p className="text-xs text-muted-foreground mt-1 italic border-l-2 pl-2">
                              {String(event.details.reason)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog candidature */}
      <Dialog open={!!selectedMetier} onOpenChange={(open) => { if (!open) setSelectedMetier(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-primary" />
              Candidature RAC — {selectedMetier?.nom}
            </DialogTitle>
          </DialogHeader>

          {submitSuccess ? (
            <div className="py-10 text-center space-y-3">
              <CheckCircle className="w-14 h-14 mx-auto text-green-500" />
              <p className="font-semibold text-lg">Dossier envoyé avec succès !</p>
              <p className="text-sm text-muted-foreground">
                Votre candidature RAC pour <strong>{selectedMetier?.nom}</strong> a bien été reçue. Vous serez contacté(e) prochainement.
              </p>
              <Button className="rounded-sm" onClick={() => setSelectedMetier(null)}>
                Fermer
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Infos personnelles */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Informations personnelles</p>

                <div className="space-y-1.5">
                  <Label>Nom complet <span className="text-destructive">*</span></Label>
                  <Input className="rounded-sm" value={form.candidat} onChange={(e) => setF("candidat", e.target.value)} placeholder="Jean Dupont" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-2">
                      Email <span className="text-destructive">*</span>
                      <Badge variant="secondary" className="text-xs rounded-sm font-normal">Non modifiable</Badge>
                    </Label>
                    <Input className="rounded-sm bg-muted cursor-not-allowed" type="email" value={form.email} readOnly tabIndex={-1} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Téléphone <span className="text-destructive">*</span></Label>
                    <Input className="rounded-sm" value={form.telephone} onChange={(e) => setF("telephone", e.target.value)} placeholder="+225 07 12 34 56 78" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Date de dépôt <span className="text-destructive">*</span></Label>
                    <Input className="rounded-sm" type="date" value={form.dateDepot} onChange={(e) => setF("dateDepot", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Années d'expérience <span className="text-destructive">*</span></Label>
                    <Input className="rounded-sm" type="number" min="0" max="60" value={form.anneesExperience} onChange={(e) => setF("anneesExperience", e.target.value)} placeholder="5" />
                  </div>
                </div>
              </div>

              {/* Documents */}
              {selectedMetier && selectedMetier.requiredDocuments.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Documents à fournir
                  </p>
                  {[...selectedMetier.requiredDocuments]
                    .sort((a, b) => (a.obligatoire === b.obligatoire ? a.ordre - b.ordre : a.obligatoire ? -1 : 1))
                    .map((doc) => (
                      <DocUploadRow
                        key={doc.id}
                        doc={doc}
                        file={docFiles[doc.id] ?? null}
                        inputRef={(el) => { fileInputRefs.current[doc.id] = el; }}
                        onChange={(f) => setDocFiles((p) => ({ ...p, [doc.id]: f }))}
                      />
                    ))}
                </div>
              )}

              {submitError && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-sm text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {submitError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" className="rounded-sm" onClick={() => setSelectedMetier(null)} disabled={submitting}>
                  Annuler
                </Button>
                <Button className="rounded-sm gap-2" onClick={handleSubmit} disabled={submitting || !canSubmit}>
                  {submitting ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Envoi en cours…
                    </>
                  ) : (
                    <>
                      <ClipboardCheck className="w-4 h-4" />
                      Envoyer mon dossier
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
