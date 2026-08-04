import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  ChevronRight,
  Eye,
  HelpCircle,
  Loader2,
  Paperclip,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  madeInCIApi,
  madeInCIRequestsApi,
  type MadeInCIDashboardData,
} from "@/lib/api";

type BadgeStatus = "Draft" | "Submitted" | "InAudit" | "Approved" | "Rejected";

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

const statusConfig: Record<BadgeStatus, { label: string; color: string; icon: typeof Clock }> = {
  Draft: { label: "Brouillon", color: "text-muted-foreground", icon: FileText },
  Submitted: { label: "Soumis", color: "text-blue-500", icon: Clock },
  InAudit: { label: "En audit", color: "text-amber-500", icon: Eye },
  Approved: { label: "Approuvé", color: "text-green-500", icon: CheckCircle2 },
  Rejected: { label: "Refusé", color: "text-destructive", icon: XCircle },
};

const STATUS_ALIASES: Record<string, BadgeStatus> = {
  draft: "Draft",
  submitted: "Submitted",
  pending: "Submitted",
  in_review: "Submitted",
  in_audit: "InAudit",
  inaudit: "InAudit",
  audit: "InAudit",
  approved: "Approved",
  validated: "Approved",
  certifie: "Approved",
  rejected: "Rejected",
  refused: "Rejected",
  refuse: "Rejected",
};

function normalizeStatus(raw: string): BadgeStatus {
  return STATUS_ALIASES[raw.toLowerCase().replace(/[\s-]/g, "_")] ?? "Submitted";
}

export function MadeInCI() {
  const { toast } = useToast();

  const [dashboard, setDashboard] = useState<MadeInCIDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestData, setRequestData] = useState({
    produit: "",
    niveau: "",
    descriptionProcess: "",
    pourcentageLocal: "",
  });
  const [inputInvoices, setInputInvoices] = useState<File[]>([]);
  const [productionPhotos, setProductionPhotos] = useState<File[]>([]);

  const fetchDashboard = useCallback(async () => {
    try {
      const data = await madeInCIApi.getDashboard();
      setDashboard(data);
    } catch {
      setError("Impossible de charger vos données Made in CI.");
    }
  }, []);

  useEffect(() => {
    fetchDashboard().finally(() => setIsLoading(false));
  }, [fetchDashboard]);

  const badgeLevelEntries = Object.entries(dashboard?.badgeLevels ?? {});
  const approvedCount = dashboard?.stats.approvedCount ?? 0;
  const demandes = dashboard?.demandes ?? [];
  const produits = dashboard?.produits ?? [];

  const openRequestDialog = (niveau?: string) => {
    setRequestData({ produit: "", niveau: niveau ?? "", descriptionProcess: "", pourcentageLocal: "" });
    setInputInvoices([]);
    setProductionPhotos([]);
    setShowRequestDialog(true);
  };

  const handleSubmitRequest = async () => {
    if (!requestData.produit || !requestData.niveau || !requestData.descriptionProcess) return;
    setSubmitting(true);
    try {
      await madeInCIRequestsApi.submit({
        productId: requestData.produit,
        badgeType: requestData.niveau,
        transformationProcess: requestData.descriptionProcess,
        localValueAdded: parseFloat(requestData.pourcentageLocal) || undefined,
        inputInvoices,
        productionPhotos,
      });
      toast({ title: "Demande envoyée", description: "Votre demande de badge a été soumise." });
      setShowRequestDialog(false);
      await fetchDashboard();
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible de soumettre la demande.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          {error || "Impossible de charger cette section."}
        </CardContent>
      </Card>
    );
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
              <Button onClick={() => openRequestDialog()}>
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

        <TabsContent value="demandes" className="space-y-4">
          {demandes.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-semibold mb-2">Aucune demande en cours</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Demandez un badge Made in CI pour valoriser vos produits
                </p>
                <Button onClick={() => openRequestDialog()}>
                  Faire une demande
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {demandes.map((request) => {
                const level = dashboard.badgeLevels[request.badgeType];
                const status = statusConfig[normalizeStatus(request.status)];
                const StatusIcon = status.icon;

                return (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-4">
                          <div className={cn("p-2 rounded-lg", getBadgeColor(request.badgeType).split(" ")[0] + "/10")}>
                            <Award className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <Badge className={getBadgeColor(request.badgeType)}>
                              {level?.label ?? request.badgeType}
                            </Badge>
                            <p className="font-medium mt-1">{request.product?.name ?? "Produit"}</p>
                            <p className="text-sm text-muted-foreground">
                              Soumis le {request.submittedAt ? new Date(request.submittedAt).toLocaleDateString("fr-FR") : "—"}
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
                            {normalizeStatus(request.status) === "InAudit" && (
                              <div className="flex items-center gap-2 mt-1">
                                <Progress value={request.progress} className="w-20 h-2" />
                                <span className="text-xs text-muted-foreground">{request.progress}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {request.adminComment && (
                        <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                          <p className="text-sm text-destructive flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {request.adminComment}
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

        <TabsContent value="niveaux" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {badgeLevelEntries.map(([key, level]) => (
              <Card key={key} className="relative overflow-hidden">
                <div className={cn("absolute top-0 left-0 w-1 h-full", getBadgeColor(key).split(" ")[0])} />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge className={getBadgeColor(key)}>{level.label}</Badge>
                  </CardTitle>
                  <CardDescription>{level.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <h4 className="text-sm font-medium mb-2">Critères requis :</h4>
                  <ul className="space-y-1">
                    {level.requirements.map((req, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        {req}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => openRequestDialog(key)}
                  >
                    Demander ce badge
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="guide" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                {dashboard.guide.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {dashboard.guide.sections.map((section, idx) => (
                <div key={idx}>
                  <h4 className="font-semibold mb-2">{idx + 1}. {section.title}</h4>
                  {section.content && (
                    <p className="text-muted-foreground text-sm">{section.content}</p>
                  )}
                  {section.steps && (
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      {section.steps.map((step, i) => <li key={i}>{step}</li>)}
                    </ol>
                  )}
                  {section.items && (
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {section.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <FileText className="w-4 h-4 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Demande badge */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Demander un badge Made in CI</DialogTitle>
            <DialogDescription>
              Remplissez le formulaire pour soumettre votre demande
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="produit">Produit concerné *</Label>
              <Select
                value={requestData.produit}
                onValueChange={(v) => setRequestData({ ...requestData, produit: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un produit" />
                </SelectTrigger>
                <SelectContent>
                  {produits.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Niveau de badge souhaité *</Label>
              <div className="grid grid-cols-2 gap-2">
                {badgeLevelEntries.map(([key, level]) => (
                  <div
                    key={key}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-all text-center",
                      requestData.niveau === key && "ring-2 ring-primary"
                    )}
                    onClick={() => setRequestData({ ...requestData, niveau: key })}
                  >
                    <Badge className={cn(getBadgeColor(key), "mb-1")}>{level.label}</Badge>
                    <p className="text-xs text-muted-foreground">{level.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="process">Processus de transformation *</Label>
              <Textarea
                id="process"
                placeholder="Décrivez les étapes de transformation réalisées en Côte d'Ivoire..."
                rows={3}
                value={requestData.descriptionProcess}
                onChange={(e) => setRequestData({ ...requestData, descriptionProcess: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pourcentage">% estimé de valeur ajoutée locale</Label>
              <input
                id="pourcentage"
                type="number"
                min={0}
                max={100}
                placeholder="Ex: 75"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={requestData.pourcentageLocal}
                onChange={(e) => setRequestData({ ...requestData, pourcentageLocal: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col items-center gap-1 border-2 border-dashed rounded-lg p-3 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                <Paperclip className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {inputInvoices.length > 0 ? `${inputInvoices.length} fichier(s)` : "Factures intrants"}
                </span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => setInputInvoices(Array.from(e.target.files ?? []))}
                />
              </label>
              <label className="flex flex-col items-center gap-1 border-2 border-dashed rounded-lg p-3 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {productionPhotos.length > 0 ? `${productionPhotos.length} fichier(s)` : "Photos production"}
                </span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => setProductionPhotos(Array.from(e.target.files ?? []))}
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowRequestDialog(false)} disabled={submitting}>
                Annuler
              </Button>
              <Button
                onClick={handleSubmitRequest}
                disabled={submitting || !requestData.produit || !requestData.niveau || !requestData.descriptionProcess}
              >
                {submitting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Award className="w-4 h-4 mr-1" />}
                {submitting ? "Envoi…" : "Soumettre la demande"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
