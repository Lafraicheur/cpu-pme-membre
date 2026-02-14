import { useState } from "react";
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
  Shield,
  Store,
  Package,
  FileText,
  Upload,
  Eye,
  ChevronRight,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Calendar,
  MapPin,
  Image,
  BadgeCheck,
  CircleDot,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CertifStatus = "NonCertifie" | "EnCours" | "Audit" | "Certifie" | "Refuse" | "Expire";
type BadgeLevel = "or" | "argent" | "bronze" | "innovation";

interface BoutiqueCertification {
  status: CertifStatus;
  niveau: BadgeLevel | null;
  dateDebut: string | null;
  dateExpiration: string | null;
  scoreLocal: number;
  progression: number;
  motifRejet?: string;
  auditeur?: string;
  documents: CertifDocument[];
}

interface CertifDocument {
  id: string;
  nom: string;
  type: string;
  status: "pending" | "validated" | "rejected";
  dateUpload: string;
}

interface ProduitCertifie {
  id: string;
  nom: string;
  image: string;
  badgeBoutique: boolean;
  badgeProduit: BadgeLevel | null;
  badgeEffectif: BadgeLevel | null;
  scoreLocal: number;
}

const mockCertification: BoutiqueCertification = {
  status: "Certifie",
  niveau: "argent",
  dateDebut: "2024-01-15",
  dateExpiration: "2026-01-15",
  scoreLocal: 62,
  progression: 100,
  auditeur: "CPU-PME Audit Team",
  documents: [
    { id: "d1", nom: "Registre commerce RCCM", type: "legal", status: "validated", dateUpload: "2024-01-10" },
    { id: "d2", nom: "Attestation fiscale", type: "fiscal", status: "validated", dateUpload: "2024-01-10" },
    { id: "d3", nom: "Photos unité de production", type: "photos", status: "validated", dateUpload: "2024-01-12" },
    { id: "d4", nom: "Factures fournisseurs locaux", type: "sourcing", status: "validated", dateUpload: "2024-01-12" },
    { id: "d5", nom: "Certificat qualité ISO", type: "qualite", status: "pending", dateUpload: "2024-03-01" },
  ],
};

const mockProduits: ProduitCertifie[] = [
  { id: "1", nom: "Cacao Premium Grade A", image: "🍫", badgeBoutique: true, badgeProduit: "or", badgeEffectif: "or", scoreLocal: 78 },
  { id: "2", nom: "Attiéké séché - 25kg", image: "🌾", badgeBoutique: true, badgeProduit: null, badgeEffectif: "argent", scoreLocal: 55 },
  { id: "3", nom: "Huile de palme raffinée", image: "🫒", badgeBoutique: true, badgeProduit: "bronze", badgeEffectif: "bronze", scoreLocal: 42 },
  { id: "4", nom: "Café torréfié premium", image: "☕", badgeBoutique: false, badgeProduit: null, badgeEffectif: null, scoreLocal: 25 },
  { id: "5", nom: "Beurre de karité bio", image: "🧴", badgeBoutique: true, badgeProduit: null, badgeEffectif: "argent", scoreLocal: 60 },
];

const badgeLevels: Record<BadgeLevel, { label: string; color: string; minScore: number; desc: string }> = {
  or: { label: "Or", color: "bg-primary text-primary-foreground", minScore: 70, desc: ">70% valeur ajoutée locale" },
  argent: { label: "Argent", color: "bg-secondary text-secondary-foreground", minScore: 50, desc: ">50% valeur ajoutée locale" },
  bronze: { label: "Bronze", color: "bg-amber-600 text-white", minScore: 30, desc: ">30% valeur ajoutée locale" },
  innovation: { label: "Innovation Ivoire", color: "bg-cyan-500 text-white", minScore: 0, desc: "Innovation locale brevetée" },
};

const statusConfig: Record<CertifStatus, { label: string; color: string; icon: typeof Clock; bgColor: string }> = {
  NonCertifie: { label: "Non certifié", color: "text-muted-foreground", icon: CircleDot, bgColor: "bg-muted" },
  EnCours: { label: "Demande en cours", color: "text-blue-500", icon: Clock, bgColor: "bg-blue-500/10" },
  Audit: { label: "Audit en cours", color: "text-amber-500", icon: Eye, bgColor: "bg-amber-500/10" },
  Certifie: { label: "Certifié", color: "text-green-500", icon: CheckCircle2, bgColor: "bg-green-500/10" },
  Refuse: { label: "Refusé", color: "text-destructive", icon: XCircle, bgColor: "bg-destructive/10" },
  Expire: { label: "Expiré", color: "text-amber-600", icon: AlertCircle, bgColor: "bg-amber-500/10" },
};

const certifChecklist = [
  { id: "rccm", label: "Registre de commerce (RCCM)", description: "Document officiel d'immatriculation", icon: FileText, required: true },
  { id: "fiscal", label: "Attestation fiscale en cours", description: "Preuve de conformité fiscale", icon: Shield, required: true },
  { id: "photos", label: "Photos de l'unité de production", description: "Min. 5 photos de vos installations", icon: Image, required: true },
  { id: "sourcing", label: "Factures fournisseurs locaux", description: "Preuves d'approvisionnement local", icon: FileText, required: true },
  { id: "process", label: "Description du processus de fabrication", description: "Étapes de transformation détaillées", icon: Package, required: true },
  { id: "qualite", label: "Certificat qualité (optionnel)", description: "ISO, HACCP, Bio, Commerce équitable...", icon: Award, required: false },
  { id: "localisation", label: "Preuve de localisation", description: "Géolocalisation ou adresse vérifiable", icon: MapPin, required: false },
];

export function CertificationBoutique() {
  const [certification, setCertification] = useState<BoutiqueCertification>(mockCertification);
  const [produits, setProduits] = useState<ProduitCertifie[]>(mockProduits);
  const [showDemandeDialog, setShowDemandeDialog] = useState(false);
  const [showPropagationDialog, setShowPropagationDialog] = useState(false);
  const [propagateAll, setPropagateAll] = useState(true);
  const [demandeData, setDemandeData] = useState({
    niveauSouhaite: "" as BadgeLevel | "",
    descriptionActivite: "",
    pourcentageLocal: "",
    processTransformation: "",
    nombreEmployes: "",
    origineIntrants: "",
  });

  const StatusIcon = statusConfig[certification.status].icon;
  const isCertifie = certification.status === "Certifie";
  const produitsAvecBadge = produits.filter(p => p.badgeEffectif !== null).length;

  const handleSubmitDemande = () => {
    setCertification({
      ...certification,
      status: "EnCours",
      progression: 15,
    });
    setShowDemandeDialog(false);
  };

  const handleToggleProduitBadge = (produitId: string, value: boolean) => {
    setProduits(produits.map(p => {
      if (p.id !== produitId) return p;
      return {
        ...p,
        badgeBoutique: value,
        badgeEffectif: value ? (p.badgeProduit || certification.niveau) : p.badgeProduit,
      };
    }));
  };

  const handlePropagateAll = () => {
    setProduits(produits.map(p => ({
      ...p,
      badgeBoutique: propagateAll,
      badgeEffectif: propagateAll ? (p.badgeProduit || certification.niveau) : p.badgeProduit,
    })));
    setShowPropagationDialog(false);
  };

  return (
    <div className="space-y-6">
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
                  <StatusIcon className={cn("w-5 h-5", statusConfig[certification.status].color)} />
                  <span className={cn("font-medium", statusConfig[certification.status].color)}>
                    {statusConfig[certification.status].label}
                  </span>
                  {isCertifie && certification.niveau && (
                    <Badge className={badgeLevels[certification.niveau].color}>
                      <Award className="w-3 h-3 mr-1" />
                      Made in CI - {badgeLevels[certification.niveau].label}
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
              ) : certification.status === "NonCertifie" ? (
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

          {certification.motifRejet && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
              <p className="text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Motif de refus : {certification.motifRejet}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue={isCertifie ? "produits" : "processus"} className="space-y-6">
        <TabsList>
          <TabsTrigger value="processus">Processus de certification</TabsTrigger>
          <TabsTrigger value="documents">Documents ({certification.documents.length})</TabsTrigger>
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
                {[
                  { step: 1, label: "Demande de certification", desc: "Soumission du formulaire et documents requis", done: ["EnCours", "Audit", "Certifie"].includes(certification.status) },
                  { step: 2, label: "Vérification documentaire", desc: "Examen des preuves et documents fournis", done: ["Audit", "Certifie"].includes(certification.status) },
                  { step: 3, label: "Audit sur site", desc: "Visite de vos installations par un auditeur CPU-PME", done: certification.status === "Certifie" },
                  { step: 4, label: "Calcul du score de valeur ajoutée", desc: "Évaluation du % de transformation locale", done: certification.status === "Certifie" },
                  { step: 5, label: "Attribution du badge", desc: "Niveau déterminé selon le score obtenu", done: certification.status === "Certifie" },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                        item.done ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                      )}>
                        {item.done ? <CheckCircle2 className="w-5 h-5" /> : item.step}
                      </div>
                      {idx < 4 && (
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
                {Object.entries(badgeLevels).map(([key, level]) => (
                  <div key={key} className={cn(
                    "p-4 rounded-xl border-2 transition-all",
                    certification.niveau === key ? "border-green-500 bg-green-500/5" : "border-muted"
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={level.color}>
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
                        value={Math.min(100, (certification.scoreLocal / level.minScore) * 100)}
                        className="h-1.5"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Score minimum : {level.minScore}% {key !== "innovation" && `• Votre score : ${certification.scoreLocal}%`}
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Documents de certification</CardTitle>
                  <CardDescription>Documents requis et soumis pour votre certification</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-1" />
                  Ajouter un document
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {certifChecklist.map((item) => {
                const doc = certification.documents.find(d => d.type === item.id);
                const ItemIcon = item.icon;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border transition-colors",
                      doc?.status === "validated" && "bg-green-500/5 border-green-500/30",
                      doc?.status === "rejected" && "bg-destructive/5 border-destructive/30",
                      doc?.status === "pending" && "bg-amber-500/5 border-amber-500/30",
                      !doc && "bg-muted/50"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      doc?.status === "validated" ? "bg-green-500/10 text-green-500" :
                      doc?.status === "rejected" ? "bg-destructive/10 text-destructive" :
                      doc?.status === "pending" ? "bg-amber-500/10 text-amber-500" :
                      "bg-muted text-muted-foreground"
                    )}>
                      <ItemIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{item.label}</p>
                        {item.required && <Badge variant="outline" className="text-xs">Requis</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      {doc && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {doc.nom} • Envoyé le {doc.dateUpload}
                        </p>
                      )}
                    </div>
                    {doc ? (
                      <div className="flex items-center gap-2">
                        {doc.status === "validated" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                        {doc.status === "rejected" && <XCircle className="w-5 h-5 text-destructive" />}
                        {doc.status === "pending" && <Clock className="w-5 h-5 text-amber-500" />}
                        <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-1" />
                        Envoyer
                      </Button>
                    )}
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
                          Vos produits héritent automatiquement du badge boutique ({badgeLevels[certification.niveau!].label}).
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
                              <Badge className={badgeLevels[produit.badgeEffectif].color}>
                                <Award className="w-3 h-3 mr-1" />
                                Made in CI - {badgeLevels[produit.badgeEffectif].label}
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
              <div className="space-y-4">
                {[
                  { date: "2024-01-15", action: "Certification approuvée", detail: "Niveau Argent attribué (score 62%)", type: "success" as const },
                  { date: "2024-01-14", action: "Audit terrain terminé", detail: "Visite de l'unité de production à Aboisso", type: "info" as const },
                  { date: "2024-01-12", action: "Documents validés", detail: "5/5 documents conformes", type: "success" as const },
                  { date: "2024-01-10", action: "Demande soumise", detail: "Dossier complet envoyé pour examen", type: "info" as const },
                  { date: "2024-03-01", action: "Certificat ISO ajouté", detail: "Document optionnel en attente de validation", type: "info" as const },
                ].map((event, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2",
                      event.type === "success" ? "bg-green-500" : "bg-blue-500"
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
              Remplissez ce formulaire pour lancer le processus de certification de votre boutique
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Niveau souhaité *</Label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(badgeLevels).map(([key, level]) => (
                  <div
                    key={key}
                    className={cn(
                      "p-3 rounded-xl border-2 cursor-pointer transition-all text-center",
                      demandeData.niveauSouhaite === key ? "ring-2 ring-primary border-primary" : "border-muted hover:border-primary/50"
                    )}
                    onClick={() => setDemandeData({ ...demandeData, niveauSouhaite: key as BadgeLevel })}
                  >
                    <Badge className={cn(level.color, "mb-2")}>
                      <Award className="w-3 h-3 mr-1" />
                      {level.label}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{level.desc}</p>
                    <p className="text-xs font-medium mt-1">Score min : {level.minScore}%</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activite">Description de votre activité *</Label>
              <Textarea
                id="activite"
                placeholder="Décrivez votre activité de production/transformation..."
                rows={3}
                value={demandeData.descriptionActivite}
                onChange={(e) => setDemandeData({ ...demandeData, descriptionActivite: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pctLocal">% estimé de valeur ajoutée locale *</Label>
                <Input
                  id="pctLocal"
                  placeholder="Ex: 65%"
                  value={demandeData.pourcentageLocal}
                  onChange={(e) => setDemandeData({ ...demandeData, pourcentageLocal: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employes">Nombre d'employés</Label>
                <Input
                  id="employes"
                  placeholder="Ex: 25"
                  value={demandeData.nombreEmployes}
                  onChange={(e) => setDemandeData({ ...demandeData, nombreEmployes: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="process">Processus de transformation *</Label>
              <Textarea
                id="process"
                placeholder="Détaillez les étapes de transformation réalisées en Côte d'Ivoire..."
                rows={3}
                value={demandeData.processTransformation}
                onChange={(e) => setDemandeData({ ...demandeData, processTransformation: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="intrants">Origine des intrants *</Label>
              <Textarea
                id="intrants"
                placeholder="Listez vos fournisseurs et l'origine de vos matières premières..."
                rows={2}
                value={demandeData.origineIntrants}
                onChange={(e) => setDemandeData({ ...demandeData, origineIntrants: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Documents à fournir</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {certifChecklist.filter(c => c.required).map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <div key={item.id} className="border-2 border-dashed rounded-lg p-3 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                      <ItemIcon className="w-5 h-5 mx-auto text-muted-foreground" />
                      <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                    </div>
                  );
                })}
              </div>
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
              <Button variant="outline" onClick={() => setShowDemandeDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleSubmitDemande}>
                <Award className="w-4 h-4 mr-1" />
                Soumettre la demande
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
                  <Badge className={badgeLevels[certification.niveau].color}>
                    Made in CI - {badgeLevels[certification.niveau].label}
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
                        <Badge className={cn(badgeLevels[p.badgeEffectif].color, "text-xs mt-0.5")}>
                          {badgeLevels[p.badgeEffectif].label}
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
