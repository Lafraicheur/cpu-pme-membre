import { useState } from "react";
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
  Upload,
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
} from "lucide-react";
import { cn } from "@/lib/utils";

type BadgeLevel = "or" | "argent" | "bronze" | "innovation";
type BadgeStatus = "Draft" | "Submitted" | "InAudit" | "Approved" | "Rejected";

interface BadgeRequest {
  id: string;
  produit: string;
  niveau: BadgeLevel;
  status: BadgeStatus;
  dateSubmission: string;
  motifRejet?: string;
  progression: number;
}

const mockBadgeRequests: BadgeRequest[] = [
  {
    id: "MIC-2024-001",
    produit: "Cacao Premium Grade A",
    niveau: "or",
    status: "Approved",
    dateSubmission: "2024-01-10",
    progression: 100,
  },
  {
    id: "MIC-2024-002",
    produit: "Huile de palme raffinée",
    niveau: "argent",
    status: "InAudit",
    dateSubmission: "2024-01-18",
    progression: 60,
  },
  {
    id: "MIC-2024-003",
    produit: "Attiéké séché premium",
    niveau: "or",
    status: "Submitted",
    dateSubmission: "2024-01-20",
    progression: 30,
  },
];

const badgeLevels = {
  or: { 
    label: "Made in CI - Or", 
    color: "bg-primary text-primary-foreground", 
    desc: ">70% de valeur ajoutée locale",
    requirements: ["Transformation majeure en CI", "Intrants locaux >70%", "Certification qualité"],
  },
  argent: { 
    label: "Made in CI - Argent", 
    color: "bg-secondary text-secondary-foreground", 
    desc: ">50% de valeur ajoutée locale",
    requirements: ["Transformation significative", "Intrants locaux >50%"],
  },
  bronze: { 
    label: "Made in CI - Bronze", 
    color: "bg-amber-600 text-white", 
    desc: ">30% de valeur ajoutée locale",
    requirements: ["Transformation de base", "Conditionnement local"],
  },
  innovation: { 
    label: "Innovation Ivoire", 
    color: "bg-cyan-500 text-white", 
    desc: "Innovation locale brevetée ou unique",
    requirements: ["Brevet ou modèle déposé", "Innovation technique", "R&D locale"],
  },
};

const statusConfig: Record<BadgeStatus, { label: string; color: string; icon: typeof Clock }> = {
  Draft: { label: "Brouillon", color: "text-muted-foreground", icon: FileText },
  Submitted: { label: "Soumis", color: "text-blue-500", icon: Clock },
  InAudit: { label: "En audit", color: "text-amber-500", icon: Eye },
  Approved: { label: "Approuvé", color: "text-green-500", icon: CheckCircle2 },
  Rejected: { label: "Refusé", color: "text-destructive", icon: XCircle },
};

export function MadeInCI() {
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<BadgeLevel | null>(null);
  const [requestData, setRequestData] = useState({
    produit: "",
    niveau: "" as BadgeLevel,
    descriptionProcess: "",
    pourcentageLocal: "",
    fournisseurs: "",
  });

  const approvedCount = mockBadgeRequests.filter(r => r.status === "Approved").length;
  const pendingCount = mockBadgeRequests.filter(r => ["Submitted", "InAudit"].includes(r.status)).length;

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

        <TabsContent value="demandes" className="space-y-4">
          {mockBadgeRequests.length === 0 ? (
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
              {mockBadgeRequests.map((request) => {
                const level = badgeLevels[request.niveau];
                const status = statusConfig[request.status];
                const StatusIcon = status.icon;

                return (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn("p-2 rounded-lg", level.color.split(" ")[0] + "/10")}>
                            <Award className={cn("w-6 h-6", level.color.includes("primary") ? "text-primary" : level.color.includes("secondary") ? "text-secondary" : level.color.includes("amber") ? "text-amber-600" : "text-cyan-500")} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm">{request.id}</span>
                              <Badge className={level.color}>{level.label}</Badge>
                            </div>
                            <p className="font-medium">{request.produit}</p>
                            <p className="text-sm text-muted-foreground">
                              Soumis le {request.dateSubmission}
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
                            {request.status === "InAudit" && (
                              <div className="flex items-center gap-2 mt-1">
                                <Progress value={request.progression} className="w-20 h-2" />
                                <span className="text-xs text-muted-foreground">{request.progression}%</span>
                              </div>
                            )}
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {request.motifRejet && (
                        <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                          <p className="text-sm text-destructive flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {request.motifRejet}
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
            {Object.entries(badgeLevels).map(([key, level]) => (
              <Card key={key} className="relative overflow-hidden">
                <div className={cn("absolute top-0 left-0 w-1 h-full", level.color.split(" ")[0])} />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge className={level.color}>{level.label}</Badge>
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
                    onClick={() => {
                      setSelectedLevel(key as BadgeLevel);
                      setRequestData({ ...requestData, niveau: key as BadgeLevel });
                      setShowRequestDialog(true);
                    }}
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

      {/* Dialog Demande badge */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-lg">
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
                  <SelectItem value="cacao">Cacao Premium Grade A</SelectItem>
                  <SelectItem value="huile">Huile de palme raffinée</SelectItem>
                  <SelectItem value="attieke">Attiéké séché premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Niveau de badge souhaité *</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(badgeLevels).map(([key, level]) => (
                  <div
                    key={key}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-all text-center",
                      requestData.niveau === key && "ring-2 ring-primary"
                    )}
                    onClick={() => setRequestData({ ...requestData, niveau: key as BadgeLevel })}
                  >
                    <Badge className={cn(level.color, "mb-1")}>{level.label.split(" - ")[1] || level.label}</Badge>
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
              <Input
                id="pourcentage"
                placeholder="Ex: 75%"
                value={requestData.pourcentageLocal}
                onChange={(e) => setRequestData({ ...requestData, pourcentageLocal: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Preuves à fournir</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="border-2 border-dashed rounded-lg p-3 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <FileText className="w-5 h-5 mx-auto text-muted-foreground" />
                  <p className="text-xs text-muted-foreground mt-1">Factures intrants</p>
                </div>
                <div className="border-2 border-dashed rounded-lg p-3 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <Image className="w-5 h-5 mx-auto text-muted-foreground" />
                  <p className="text-xs text-muted-foreground mt-1">Photos production</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
                Annuler
              </Button>
              <Button onClick={() => setShowRequestDialog(false)}>
                <Award className="w-4 h-4 mr-1" />
                Soumettre la demande
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
