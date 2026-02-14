import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RotateCcw,
  AlertTriangle,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Package,
  Eye,
  Upload,
  Shield,
  Scale,
  FileText,
  Send,
  User,
  Plus,
  Camera,
  Truck,
  CreditCard,
  ArrowRight,
  ChevronRight,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Star,
  History,
  Ban,
  RefreshCw,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Types
type ReclamationStatus = "brouillon" | "soumise" | "en_examen" | "approuvee" | "retour_en_cours" | "recue_vendeur" | "remboursee" | "refusee" | "escalade" | "cloturee";
type ReclamationType = "retour" | "reclamation" | "litige";
type ReclamationMotif = "produit_endommage" | "non_conforme" | "quantite_incorrecte" | "retard_livraison" | "produit_manquant" | "qualite_insuffisante" | "erreur_commande" | "autre";

interface Reclamation {
  id: string;
  commande: string;
  produit: string;
  vendeur: string;
  type: ReclamationType;
  motif: ReclamationMotif;
  statut: ReclamationStatus;
  dateCreation: string;
  dateMaj: string;
  montant: number;
  montantRembourse?: number;
  description: string;
  preuves: string[];
  timeline: TimelineEvent[];
  propositionVendeur?: PropositionResolution;
  messageCount: number;
}

interface TimelineEvent {
  date: string;
  action: string;
  auteur: string;
  role: "acheteur" | "vendeur" | "mediateur" | "systeme";
  detail?: string;
}

interface PropositionResolution {
  type: "remboursement_total" | "remboursement_partiel" | "remplacement" | "avoir" | "refus";
  montant?: number;
  pourcentage?: number;
  commentaire: string;
  dateProposition: string;
}

interface NouvelleReclamation {
  commande: string;
  produit: string;
  type: ReclamationType;
  motif: ReclamationMotif;
  description: string;
  montantDemande: number;
  preuves: File[];
}

const statutConfig: Record<ReclamationStatus, { label: string; color: string; icon: typeof Clock; step: number }> = {
  brouillon: { label: "Brouillon", color: "text-muted-foreground", icon: FileText, step: 0 },
  soumise: { label: "Soumise", color: "text-blue-500", icon: Send, step: 1 },
  en_examen: { label: "En examen", color: "text-amber-500", icon: Eye, step: 2 },
  approuvee: { label: "Approuvée", color: "text-green-500", icon: CheckCircle2, step: 3 },
  retour_en_cours: { label: "Retour en cours", color: "text-purple-500", icon: Truck, step: 4 },
  recue_vendeur: { label: "Reçue vendeur", color: "text-blue-600", icon: Package, step: 5 },
  remboursee: { label: "Remboursée", color: "text-green-600", icon: CreditCard, step: 6 },
  refusee: { label: "Refusée", color: "text-destructive", icon: XCircle, step: -1 },
  escalade: { label: "Escaladée (litige)", color: "text-red-500", icon: AlertTriangle, step: -2 },
  cloturee: { label: "Clôturée", color: "text-muted-foreground", icon: CheckCircle2, step: 7 },
};

const motifLabels: Record<ReclamationMotif, string> = {
  produit_endommage: "Produit endommagé à la réception",
  non_conforme: "Produit non conforme à la description",
  quantite_incorrecte: "Quantité incorrecte",
  retard_livraison: "Retard de livraison excessif",
  produit_manquant: "Produit manquant dans la commande",
  qualite_insuffisante: "Qualité insuffisante",
  erreur_commande: "Erreur dans la commande",
  autre: "Autre motif",
};

const typeLabels: Record<ReclamationType, { label: string; color: string }> = {
  retour: { label: "Retour produit", color: "text-blue-500" },
  reclamation: { label: "Réclamation", color: "text-amber-500" },
  litige: { label: "Litige", color: "text-red-500" },
};

// Mock commandes pour le formulaire
const mockCommandesAcheteur = [
  { id: "CMD-2024-045", vendeur: "Coopérative Aboisso Cacao", produit: "Cacao Premium Grade A", montant: 850000, date: "2024-01-18" },
  { id: "CMD-2024-042", vendeur: "Femmes de Dabou SARL", produit: "Attiéké séché - 25kg", montant: 75000, date: "2024-01-15" },
  { id: "CMD-2024-038", vendeur: "TransFroid CI", produit: "Service transport frigorifique", montant: 75000, date: "2024-01-10" },
  { id: "CMD-2024-035", vendeur: "Palmeraie du Sud", produit: "Huile de palme raffinée - 20L", montant: 125000, date: "2024-01-08" },
];

const mockReclamations: Reclamation[] = [
  {
    id: "RCL-2024-001",
    commande: "CMD-2024-045",
    produit: "Cacao Premium Grade A",
    vendeur: "Coopérative Aboisso Cacao",
    type: "retour",
    motif: "non_conforme",
    statut: "en_examen",
    dateCreation: "2024-01-20",
    dateMaj: "2024-01-22",
    montant: 850000,
    description: "Le taux d'humidité du cacao est de 12% au lieu des 8% annoncés. Le lot ne correspond pas au grade A.",
    preuves: ["photo_lot.jpg", "rapport_analyse.pdf", "video_ouverture.mp4"],
    timeline: [
      { date: "2024-01-20 09:15", action: "Réclamation créée", auteur: "Vous", role: "acheteur" },
      { date: "2024-01-20 09:15", action: "Preuves jointes (3 fichiers)", auteur: "Système", role: "systeme" },
      { date: "2024-01-20 14:30", action: "Réclamation transmise au vendeur", auteur: "Système", role: "systeme" },
      { date: "2024-01-21 10:00", action: "En cours d'examen par le vendeur", auteur: "Coopérative Aboisso Cacao", role: "vendeur" },
    ],
    propositionVendeur: {
      type: "remboursement_partiel",
      pourcentage: 30,
      montant: 255000,
      commentaire: "Nous reconnaissons un écart de qualité. Nous proposons un remboursement de 30% sur le lot.",
      dateProposition: "2024-01-22",
    },
    messageCount: 4,
  },
  {
    id: "RCL-2024-002",
    commande: "CMD-2024-042",
    produit: "Attiéké séché - 25kg",
    vendeur: "Femmes de Dabou SARL",
    type: "retour",
    motif: "quantite_incorrecte",
    statut: "approuvee",
    dateCreation: "2024-01-17",
    dateMaj: "2024-01-19",
    montant: 15000,
    description: "J'ai commandé 5 sacs mais n'en ai reçu que 3. Le BL indique bien 5 sacs.",
    preuves: ["photo_livraison.jpg", "bon_livraison.pdf"],
    timeline: [
      { date: "2024-01-17 11:00", action: "Réclamation créée", auteur: "Vous", role: "acheteur" },
      { date: "2024-01-17 15:00", action: "Transmise au vendeur", auteur: "Système", role: "systeme" },
      { date: "2024-01-18 09:00", action: "Vendeur a confirmé l'erreur", auteur: "Femmes de Dabou SARL", role: "vendeur" },
      { date: "2024-01-19 08:30", action: "Retour approuvé - remplacement prévu", auteur: "Femmes de Dabou SARL", role: "vendeur" },
    ],
    propositionVendeur: {
      type: "remplacement",
      commentaire: "Nous envoyons les 2 sacs manquants sous 48h. Veuillez nous excuser.",
      dateProposition: "2024-01-19",
    },
    messageCount: 3,
  },
  {
    id: "RCL-2024-003",
    commande: "CMD-2024-038",
    produit: "Service transport frigorifique",
    vendeur: "TransFroid CI",
    type: "litige",
    motif: "retard_livraison",
    statut: "escalade",
    dateCreation: "2024-01-12",
    dateMaj: "2024-01-20",
    montant: 75000,
    description: "Livraison avec 5 jours de retard, marchandises partiellement avariées à cause de la rupture de chaîne du froid.",
    preuves: ["photo_avarie1.jpg", "photo_avarie2.jpg", "constat_temperature.pdf"],
    timeline: [
      { date: "2024-01-12 08:00", action: "Réclamation créée", auteur: "Vous", role: "acheteur" },
      { date: "2024-01-12 16:00", action: "Transmise au vendeur", auteur: "Système", role: "systeme" },
      { date: "2024-01-14 10:00", action: "Vendeur conteste les dommages", auteur: "TransFroid CI", role: "vendeur" },
      { date: "2024-01-15 09:00", action: "Réclamation rejetée par le vendeur", auteur: "TransFroid CI", role: "vendeur" },
      { date: "2024-01-16 10:00", action: "Escalade vers médiation CPU-PME", auteur: "Vous", role: "acheteur" },
      { date: "2024-01-18 14:00", action: "Médiateur assigné", auteur: "CPU-PME", role: "mediateur" },
      { date: "2024-01-20 11:00", action: "Proposition de médiation : remboursement 50%", auteur: "Médiateur CPU-PME", role: "mediateur" },
    ],
    messageCount: 12,
  },
  {
    id: "RCL-2024-004",
    commande: "CMD-2024-035",
    produit: "Huile de palme raffinée - 20L",
    vendeur: "Palmeraie du Sud",
    type: "retour",
    motif: "produit_endommage",
    statut: "remboursee",
    dateCreation: "2024-01-09",
    dateMaj: "2024-01-15",
    montant: 25000,
    montantRembourse: 25000,
    description: "Bidon percé à la livraison, fuite importante.",
    preuves: ["photo_bidon.jpg"],
    timeline: [
      { date: "2024-01-09 14:00", action: "Réclamation créée", auteur: "Vous", role: "acheteur" },
      { date: "2024-01-10 09:00", action: "Approuvée immédiatement par le vendeur", auteur: "Palmeraie du Sud", role: "vendeur" },
      { date: "2024-01-12 10:00", action: "Produit retourné", auteur: "Vous", role: "acheteur" },
      { date: "2024-01-13 15:00", action: "Réception confirmée par le vendeur", auteur: "Palmeraie du Sud", role: "vendeur" },
      { date: "2024-01-15 09:00", action: "Remboursement effectué - 25 000 FCFA via Orange Money", auteur: "Système", role: "systeme" },
    ],
    messageCount: 2,
  },
];

export function ReclamationsAcheteur() {
  const [activeTab, setActiveTab] = useState("mes-reclamations");
  const [searchQuery, setSearchQuery] = useState("");
  const [statutFilter, setStatutFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedReclamation, setSelectedReclamation] = useState<Reclamation | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showPropositionDialog, setShowPropositionDialog] = useState(false);
  const { toast } = useToast();

  // Formulaire nouvelle réclamation
  const [newRecl, setNewRecl] = useState({
    commande: "",
    type: "retour" as ReclamationType,
    motif: "" as ReclamationMotif | "",
    description: "",
    montantDemande: 0,
  });

  const kpis = {
    enCours: mockReclamations.filter(r => ["soumise", "en_examen", "retour_en_cours"].includes(r.statut)).length,
    propositionsAttente: mockReclamations.filter(r => r.propositionVendeur && r.statut === "en_examen").length,
    litiges: mockReclamations.filter(r => r.statut === "escalade").length,
    resolues: mockReclamations.filter(r => ["remboursee", "cloturee"].includes(r.statut)).length,
    montantRecupere: mockReclamations.filter(r => r.montantRembourse).reduce((s, r) => s + (r.montantRembourse || 0), 0),
  };

  const filteredReclamations = mockReclamations.filter(r => {
    const matchSearch = r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.produit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vendeur.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatut = statutFilter === "all" || r.statut === statutFilter;
    const matchType = typeFilter === "all" || r.type === typeFilter;
    return matchSearch && matchStatut && matchType;
  });

  const handleCreateReclamation = () => {
    toast({
      title: "Réclamation créée",
      description: "Votre réclamation a été soumise et transmise au vendeur.",
    });
    setShowCreateDialog(false);
    setNewRecl({ commande: "", type: "retour", motif: "", description: "", montantDemande: 0 });
  };

  const handleAcceptProposition = () => {
    toast({
      title: "Proposition acceptée",
      description: "Vous avez accepté la proposition du vendeur. Le processus de résolution est en cours.",
    });
    setShowPropositionDialog(false);
  };

  const handleRejectProposition = () => {
    toast({
      title: "Proposition refusée",
      description: "Vous pouvez escalader vers la médiation CPU-PME.",
    });
    setShowPropositionDialog(false);
  };

  const handleEscalate = (recl: Reclamation) => {
    toast({
      title: "Réclamation escaladée",
      description: `La réclamation ${recl.id} a été transmise au médiateur CPU-PME.`,
    });
  };

  const renderProgressSteps = (statut: ReclamationStatus) => {
    const steps = ["Soumise", "En examen", "Approuvée", "Retour", "Reçue", "Remboursée"];
    const currentStep = statutConfig[statut].step;
    const isRejected = statut === "refusee";
    const isEscalated = statut === "escalade";

    return (
      <div className="flex items-center gap-1 w-full">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center flex-1">
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2",
              idx + 1 <= currentStep
                ? "bg-green-500 border-green-500 text-white"
                : idx + 1 === currentStep + 1 && !isRejected && !isEscalated
                ? "border-primary text-primary bg-primary/10"
                : "border-muted-foreground/30 text-muted-foreground"
            )}>
              {idx + 1 <= currentStep ? "✓" : idx + 1}
            </div>
            {idx < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-1",
                idx + 1 < currentStep ? "bg-green-500" : "bg-muted-foreground/20"
              )} />
            )}
          </div>
        ))}
        {isRejected && (
          <Badge variant="destructive" className="ml-2 text-xs">Refusée</Badge>
        )}
        {isEscalated && (
          <Badge className="ml-2 text-xs bg-red-500 text-white">Litige</Badge>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* KPIs Acheteur */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">En cours</p>
                <p className="text-2xl font-bold text-blue-500">{kpis.enCours}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <MessageSquare className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Propositions reçues</p>
                <p className="text-2xl font-bold text-amber-500">{kpis.propositionsAttente}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Litiges ouverts</p>
                <p className="text-2xl font-bold text-red-500">{kpis.litiges}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Résolues</p>
                <p className="text-2xl font-bold text-green-500">{kpis.resolues}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Récupéré</p>
                <p className="text-lg font-bold text-primary">{kpis.montantRecupere.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">FCFA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions + Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4" />
              Nouvelle réclamation
            </Button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par N°, produit ou vendeur..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="retour">Retours</SelectItem>
                <SelectItem value="reclamation">Réclamations</SelectItem>
                <SelectItem value="litige">Litiges</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statutFilter} onValueChange={setStatutFilter}>
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="soumise">Soumise</SelectItem>
                <SelectItem value="en_examen">En examen</SelectItem>
                <SelectItem value="approuvee">Approuvée</SelectItem>
                <SelectItem value="retour_en_cours">Retour en cours</SelectItem>
                <SelectItem value="remboursee">Remboursée</SelectItem>
                <SelectItem value="refusee">Refusée</SelectItem>
                <SelectItem value="escalade">Escaladée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des réclamations */}
      <div className="space-y-4">
        {filteredReclamations.map((recl) => {
          const statut = statutConfig[recl.statut];
          const StatutIcon = statut.icon;
          const typeInfo = typeLabels[recl.type];
          const hasProposition = recl.propositionVendeur && recl.statut === "en_examen";

          return (
            <Card key={recl.id} className={cn(
              "hover:shadow-md transition-shadow",
              hasProposition && "border-amber-500/50 ring-1 ring-amber-500/20",
              recl.statut === "escalade" && "border-red-500/50",
            )}>
              <CardContent className="p-5">
                {/* En-tête */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", 
                      recl.statut === "escalade" ? "bg-red-500/10" : "bg-muted"
                    )}>
                      <StatutIcon className={cn("w-5 h-5", statut.color)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold">{recl.id}</span>
                        <Badge variant="outline" className={statut.color}>{statut.label}</Badge>
                        <Badge variant="outline" className={cn("text-xs", typeInfo.color)}>{typeInfo.label}</Badge>
                      </div>
                      <p className="font-medium mt-1">{recl.produit}</p>
                      <p className="text-sm text-muted-foreground">
                        Vendeur: {recl.vendeur} • {recl.commande} • Créée le {recl.dateCreation}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{recl.montant.toLocaleString()} FCFA</p>
                    {recl.montantRembourse && (
                      <p className="text-sm text-green-600 font-medium">
                        Remboursé: {recl.montantRembourse.toLocaleString()} FCFA
                      </p>
                    )}
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="mb-4">
                  {renderProgressSteps(recl.statut)}
                </div>

                {/* Motif */}
                <div className="p-3 rounded-lg bg-muted/50 mb-4">
                  <p className="text-sm">
                    <span className="font-medium text-amber-600">Motif: </span>
                    {motifLabels[recl.motif]}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{recl.description}</p>
                </div>

                {/* Proposition vendeur si présente */}
                {hasProposition && recl.propositionVendeur && (
                  <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold text-amber-600">Proposition du vendeur</span>
                      <Badge variant="outline" className="text-xs text-amber-600">
                        Action requise
                      </Badge>
                    </div>
                    <p className="text-sm mb-2">{recl.propositionVendeur.commentaire}</p>
                    {recl.propositionVendeur.montant && (
                      <p className="font-bold text-amber-600 mb-3">
                        {recl.propositionVendeur.type === "remboursement_partiel" 
                          ? `Remboursement ${recl.propositionVendeur.pourcentage}% : ${recl.propositionVendeur.montant.toLocaleString()} FCFA`
                          : recl.propositionVendeur.type === "remplacement"
                          ? "Remplacement du produit"
                          : `${recl.propositionVendeur.montant.toLocaleString()} FCFA`
                        }
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" className="gap-1" onClick={handleAcceptProposition}>
                        <ThumbsUp className="w-3 h-3" />
                        Accepter
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1" onClick={handleRejectProposition}>
                        <ThumbsDown className="w-3 h-3" />
                        Refuser
                      </Button>
                      <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleEscalate(recl)}>
                        <Scale className="w-3 h-3" />
                        Escalader
                      </Button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Camera className="w-3 h-3" />
                    {recl.preuves.length} preuve(s)
                    <span className="mx-1">•</span>
                    <MessageSquare className="w-3 h-3" />
                    {recl.messageCount} message(s)
                    <span className="mx-1">•</span>
                    <History className="w-3 h-3" />
                    {recl.timeline.length} étapes
                  </div>
                  <div className="flex gap-2">
                    {recl.statut === "refusee" && (
                      <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleEscalate(recl)}>
                        <AlertTriangle className="w-3 h-3" />
                        Ouvrir un litige
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="gap-1"
                      onClick={() => {
                        setSelectedReclamation(recl);
                        setShowDetailDialog(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                      Détails
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog Créer une réclamation */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Nouvelle réclamation
            </DialogTitle>
            <DialogDescription>Déposez une réclamation ou demande de retour</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Commande */}
            <div className="space-y-2">
              <Label>Commande concernée *</Label>
              <Select value={newRecl.commande} onValueChange={(v) => {
                const cmd = mockCommandesAcheteur.find(c => c.id === v);
                setNewRecl({ ...newRecl, commande: v, montantDemande: cmd?.montant || 0 });
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une commande" />
                </SelectTrigger>
                <SelectContent>
                  {mockCommandesAcheteur.map((cmd) => (
                    <SelectItem key={cmd.id} value={cmd.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{cmd.id}</span>
                        <span className="text-muted-foreground">- {cmd.produit}</span>
                        <span className="font-semibold">{cmd.montant.toLocaleString()} FCFA</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newRecl.commande && (
                <div className="p-3 rounded-lg bg-muted/50 text-sm">
                  {(() => {
                    const cmd = mockCommandesAcheteur.find(c => c.id === newRecl.commande);
                    return cmd ? (
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{cmd.produit}</p>
                          <p className="text-muted-foreground">Vendeur: {cmd.vendeur}</p>
                        </div>
                        <p className="font-bold">{cmd.montant.toLocaleString()} FCFA</p>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>Type de demande *</Label>
              <div className="grid grid-cols-3 gap-3">
                {(Object.entries(typeLabels) as [ReclamationType, { label: string; color: string }][]).map(([key, val]) => (
                  <Button
                    key={key}
                    type="button"
                    variant={newRecl.type === key ? "default" : "outline"}
                    className="h-auto py-3 flex-col gap-1"
                    onClick={() => setNewRecl({ ...newRecl, type: key })}
                  >
                    {key === "retour" && <RotateCcw className="w-5 h-5" />}
                    {key === "reclamation" && <AlertCircle className="w-5 h-5" />}
                    {key === "litige" && <Scale className="w-5 h-5" />}
                    <span className="text-xs">{val.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Motif */}
            <div className="space-y-2">
              <Label>Motif *</Label>
              <Select value={newRecl.motif} onValueChange={(v) => setNewRecl({ ...newRecl, motif: v as ReclamationMotif })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le motif" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(motifLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description détaillée *</Label>
              <Textarea
                placeholder="Décrivez le problème en détail : ce que vous avez reçu, ce qui était attendu, l'impact..."
                rows={4}
                value={newRecl.description}
                onChange={(e) => setNewRecl({ ...newRecl, description: e.target.value })}
              />
            </div>

            {/* Montant demandé */}
            <div className="space-y-2">
              <Label>Montant demandé (FCFA)</Label>
              <Input
                type="number"
                value={newRecl.montantDemande}
                onChange={(e) => setNewRecl({ ...newRecl, montantDemande: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">Montant du remboursement ou de la compensation souhaité</p>
            </div>

            {/* Preuves */}
            <div className="space-y-2">
              <Label>Preuves (photos, vidéos, documents)</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 cursor-pointer transition-colors">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Glissez vos fichiers ici</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Photos du produit, vidéo de déballage, bon de livraison, rapport d'analyse...
                </p>
                <Button variant="outline" size="sm" className="mt-3">
                  <Camera className="w-4 h-4 mr-1" />
                  Parcourir
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                💡 Conseil : Les réclamations avec preuves sont traitées 3x plus vite
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Annuler</Button>
            <Button 
              onClick={handleCreateReclamation}
              disabled={!newRecl.commande || !newRecl.motif || !newRecl.description}
            >
              <Send className="w-4 h-4 mr-1" />
              Soumettre la réclamation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Détail réclamation */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedReclamation && (() => {
            const statut = statutConfig[selectedReclamation.statut];
            const StatutIcon = statut.icon;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <StatutIcon className={cn("w-5 h-5", statut.color)} />
                    Réclamation {selectedReclamation.id}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedReclamation.produit} • {selectedReclamation.vendeur}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Progression */}
                  <div>
                    <p className="text-sm font-medium mb-3">Progression</p>
                    {renderProgressSteps(selectedReclamation.statut)}
                  </div>

                  {/* Infos clés */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Commande</p>
                      <p className="font-mono font-medium">{selectedReclamation.commande}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Montant</p>
                      <p className="font-bold text-primary">{selectedReclamation.montant.toLocaleString()} FCFA</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Motif</p>
                      <p className="font-medium text-amber-600">{motifLabels[selectedReclamation.motif]}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Preuves fournies</p>
                      <p className="font-medium">{selectedReclamation.preuves.length} fichier(s)</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm font-medium mb-2">Description</p>
                    <p className="text-sm text-muted-foreground">{selectedReclamation.description}</p>
                  </div>

                  {/* Preuves */}
                  <div>
                    <p className="text-sm font-medium mb-2">Preuves jointes</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedReclamation.preuves.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted text-sm">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Proposition vendeur */}
                  {selectedReclamation.propositionVendeur && (
                    <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                      <p className="font-semibold text-amber-600 mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Proposition du vendeur ({selectedReclamation.propositionVendeur.dateProposition})
                      </p>
                      <p className="text-sm mb-2">{selectedReclamation.propositionVendeur.commentaire}</p>
                      {selectedReclamation.propositionVendeur.montant && (
                        <p className="font-bold">
                          Montant proposé: {selectedReclamation.propositionVendeur.montant.toLocaleString()} FCFA
                        </p>
                      )}
                    </div>
                  )}

                  {/* Timeline */}
                  <div>
                    <p className="text-sm font-medium mb-3 flex items-center gap-2">
                      <History className="w-4 h-4" />
                      Historique
                    </p>
                    <div className="space-y-0">
                      {selectedReclamation.timeline.map((event, idx) => (
                        <div key={idx} className="flex gap-3 pb-4 relative">
                          {idx < selectedReclamation.timeline.length - 1 && (
                            <div className="absolute left-[11px] top-6 w-0.5 h-full bg-muted-foreground/20" />
                          )}
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10",
                            event.role === "acheteur" && "bg-primary/20",
                            event.role === "vendeur" && "bg-amber-500/20",
                            event.role === "mediateur" && "bg-red-500/20",
                            event.role === "systeme" && "bg-muted",
                          )}>
                            {event.role === "mediateur" ? (
                              <Shield className="w-3 h-3 text-red-500" />
                            ) : event.role === "systeme" ? (
                              <RefreshCw className="w-3 h-3 text-muted-foreground" />
                            ) : (
                              <User className="w-3 h-3 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{event.action}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {event.auteur} • {event.date}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 justify-end border-t pt-4">
                    {selectedReclamation.statut === "en_examen" && selectedReclamation.propositionVendeur && (
                      <>
                        <Button className="gap-1" onClick={handleAcceptProposition}>
                          <ThumbsUp className="w-4 h-4" />
                          Accepter la proposition
                        </Button>
                        <Button variant="outline" className="gap-1" onClick={handleRejectProposition}>
                          <ThumbsDown className="w-4 h-4" />
                          Refuser
                        </Button>
                      </>
                    )}
                    {(selectedReclamation.statut === "refusee" || selectedReclamation.statut === "en_examen") && (
                      <Button variant="destructive" className="gap-1" onClick={() => handleEscalate(selectedReclamation)}>
                        <Scale className="w-4 h-4" />
                        Escalader vers médiation
                      </Button>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
