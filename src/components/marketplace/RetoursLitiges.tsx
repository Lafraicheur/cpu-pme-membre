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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Calendar,
  ArrowRight,
  Truck,
  CreditCard,
  History,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  DollarSign,
  Camera,
  TrendingDown,
  Ban,
  Gavel,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Types
type RetourStatus = "ReturnRequested" | "Approved" | "Rejected" | "InTransit" | "Received" | "Inspected" | "Refunded" | "PartialRefund" | "Closed";
type LitigeStatus = "Opened" | "VendeurResponse" | "InMediation" | "ProposalSent" | "Resolved" | "Refunded" | "Rejected" | "Closed";
type LitigeType = "retard_livraison" | "non_conforme" | "endommage" | "quantite" | "qualite" | "fraude" | "autre";

interface Retour {
  id: string;
  commande: string;
  produit: string;
  client: string;
  motif: string;
  motifDetail: string;
  statut: RetourStatus;
  dateRetour: string;
  dateMaj: string;
  montant: number;
  montantPropose?: number;
  preuves: string[];
  timeline: TimelineEvent[];
  inspectionNotes?: string;
}

interface Litige {
  id: string;
  commande: string;
  produit: string;
  plaignant: string;
  type: LitigeType;
  statut: LitigeStatus;
  dateOuverture: string;
  dateMaj: string;
  montant: number;
  montantPropose?: number;
  messages: Message[];
  description: string;
  propositionMediation?: string;
  delaiReponse?: string;
}

interface TimelineEvent {
  date: string;
  action: string;
  auteur: string;
  role: "acheteur" | "vendeur" | "mediateur" | "systeme";
}

interface Message {
  id: string;
  auteur: string;
  role: "client" | "vendeur" | "mediateur";
  message: string;
  date: string;
  pieces?: string[];
}

// Config
const retourStatusConfig: Record<RetourStatus, { label: string; color: string; icon: typeof Clock; step: number }> = {
  ReturnRequested: { label: "Demandé", color: "text-blue-500", icon: Clock, step: 1 },
  Approved: { label: "Approuvé", color: "text-green-500", icon: CheckCircle2, step: 2 },
  Rejected: { label: "Refusé", color: "text-destructive", icon: XCircle, step: -1 },
  InTransit: { label: "En transit retour", color: "text-purple-500", icon: Truck, step: 3 },
  Received: { label: "Reçu", color: "text-blue-600", icon: Package, step: 4 },
  Inspected: { label: "Inspecté", color: "text-amber-500", icon: Eye, step: 5 },
  Refunded: { label: "Remboursé", color: "text-green-600", icon: CreditCard, step: 6 },
  PartialRefund: { label: "Remb. partiel", color: "text-amber-600", icon: CreditCard, step: 6 },
  Closed: { label: "Clôturé", color: "text-muted-foreground", icon: CheckCircle2, step: 7 },
};

const litigeStatusConfig: Record<LitigeStatus, { label: string; color: string; icon: typeof Clock }> = {
  Opened: { label: "Ouvert", color: "text-blue-500", icon: AlertTriangle },
  VendeurResponse: { label: "Réponse attendue", color: "text-amber-500", icon: Clock },
  InMediation: { label: "En médiation", color: "text-purple-500", icon: Scale },
  ProposalSent: { label: "Proposition envoyée", color: "text-blue-600", icon: Send },
  Resolved: { label: "Résolu", color: "text-green-500", icon: CheckCircle2 },
  Refunded: { label: "Remboursé", color: "text-green-600", icon: CreditCard },
  Rejected: { label: "Rejeté", color: "text-muted-foreground", icon: XCircle },
  Closed: { label: "Clôturé", color: "text-muted-foreground", icon: CheckCircle2 },
};

const litigeTypeLabels: Record<LitigeType, string> = {
  retard_livraison: "Retard de livraison",
  non_conforme: "Produit non conforme",
  endommage: "Produit endommagé",
  quantite: "Quantité incorrecte",
  qualite: "Qualité insuffisante",
  fraude: "Suspicion de fraude",
  autre: "Autre",
};

// Mock data
const mockRetours: Retour[] = [
  {
    id: "RET-001",
    commande: "CMD-2024-005",
    produit: "Huile de palme raffinée - 20L",
    client: "Restaurant Le Gourmet",
    motif: "Produit endommagé",
    motifDetail: "3 bidons sur 5 présentent des fuites. Photos jointes montrant les dommages au niveau des bouchons.",
    statut: "ReturnRequested",
    dateRetour: "2024-01-22",
    dateMaj: "2024-01-22",
    montant: 125000,
    preuves: ["photo_dommage1.jpg", "photo_dommage2.jpg", "video_constat.mp4"],
    timeline: [
      { date: "2024-01-22 10:00", action: "Demande de retour créée par le client", auteur: "Restaurant Le Gourmet", role: "acheteur" },
      { date: "2024-01-22 10:01", action: "3 preuves jointes", auteur: "Système", role: "systeme" },
    ],
  },
  {
    id: "RET-002",
    commande: "CMD-2024-003",
    produit: "Cacao Premium Grade A",
    client: "Chocolaterie du Centre",
    motif: "Non conforme",
    motifDetail: "Taux d'humidité mesuré à 12% au lieu de 8% maximum annoncé. Rapport d'analyse du laboratoire indépendant fourni.",
    statut: "Inspected",
    dateRetour: "2024-01-15",
    dateMaj: "2024-01-20",
    montant: 850000,
    montantPropose: 600000,
    preuves: ["rapport_labo.pdf", "photos_lot.jpg"],
    inspectionNotes: "Après vérification, le lot présente effectivement un taux d'humidité supérieur. Proposition de remboursement partiel à 70%.",
    timeline: [
      { date: "2024-01-15 08:00", action: "Demande de retour créée", auteur: "Chocolaterie du Centre", role: "acheteur" },
      { date: "2024-01-16 09:00", action: "Retour approuvé", auteur: "Vous", role: "vendeur" },
      { date: "2024-01-17 14:00", action: "Colis en transit retour", auteur: "Système", role: "systeme" },
      { date: "2024-01-18 16:00", action: "Colis reçu en entrepôt", auteur: "Vous", role: "vendeur" },
      { date: "2024-01-20 10:00", action: "Inspection terminée - remboursement partiel proposé", auteur: "Vous", role: "vendeur" },
    ],
  },
  {
    id: "RET-003",
    commande: "CMD-2024-001",
    produit: "Attiéké séché - 25kg",
    client: "Supermarché Bonprix",
    motif: "Quantité incorrecte",
    motifDetail: "Commande de 10 sacs, seulement 7 reçus. Bon de livraison confirme 10 sacs.",
    statut: "Refunded",
    dateRetour: "2024-01-10",
    dateMaj: "2024-01-14",
    montant: 45000,
    preuves: ["bon_livraison.pdf", "photo_reception.jpg"],
    timeline: [
      { date: "2024-01-10 09:00", action: "Demande de retour créée", auteur: "Supermarché Bonprix", role: "acheteur" },
      { date: "2024-01-10 14:00", action: "Erreur confirmée par le vendeur", auteur: "Vous", role: "vendeur" },
      { date: "2024-01-12 10:00", action: "3 sacs manquants expédiés", auteur: "Vous", role: "vendeur" },
      { date: "2024-01-14 09:00", action: "Remboursement des frais supplémentaires effectué", auteur: "Système", role: "systeme" },
    ],
  },
  {
    id: "RET-004",
    commande: "CMD-2024-008",
    produit: "Beurre de karité bio - 5kg",
    client: "Cosmétiques Abidjan",
    motif: "Qualité insuffisante",
    motifDetail: "Le beurre de karité ne correspond pas au grade cosmétique annoncé. Couleur et texture non conformes.",
    statut: "Approved",
    dateRetour: "2024-01-21",
    dateMaj: "2024-01-22",
    montant: 45000,
    preuves: ["comparaison_qualite.jpg"],
    timeline: [
      { date: "2024-01-21 11:00", action: "Demande de retour créée", auteur: "Cosmétiques Abidjan", role: "acheteur" },
      { date: "2024-01-22 08:00", action: "Retour approuvé - en attente du colis", auteur: "Vous", role: "vendeur" },
    ],
  },
];

const mockLitiges: Litige[] = [
  {
    id: "LIT-001",
    commande: "CMD-2024-006",
    produit: "Transport frigorifique",
    plaignant: "Export CI SARL",
    type: "retard_livraison",
    statut: "InMediation",
    dateOuverture: "2024-01-16",
    dateMaj: "2024-01-22",
    montant: 75000,
    montantPropose: 37500,
    description: "Livraison avec 5 jours de retard, marchandises partiellement avariées à cause de la rupture de chaîne du froid.",
    delaiReponse: "2024-01-25",
    propositionMediation: "Le médiateur recommande un remboursement de 50% (37 500 FCFA) compte tenu du retard documenté et des dommages partiels.",
    messages: [
      { id: "M1", auteur: "Export CI SARL", role: "client", message: "La livraison a eu 5 jours de retard et une partie de la marchandise est avariée. Je demande un remboursement total.", date: "2024-01-16 10:30", pieces: ["constat_avarie.pdf"] },
      { id: "M2", auteur: "Vous", role: "vendeur", message: "Le retard est dû à une panne mécanique imprévue. Nous proposons un avoir de 20% sur la prochaine commande.", date: "2024-01-17 14:15" },
      { id: "M3", auteur: "Export CI SARL", role: "client", message: "20% n'est pas suffisant vu les pertes subies. Je refuse cette proposition.", date: "2024-01-18 09:00" },
      { id: "M4", auteur: "Vous", role: "vendeur", message: "Nous comprenons votre frustration. Nous pouvons monter à 30% de remboursement direct.", date: "2024-01-18 16:00" },
      { id: "M5", auteur: "Médiateur CPU-PME", role: "mediateur", message: "Après examen des preuves (photos, BL, GPS tracking), je recommande un remboursement de 50% soit 37 500 FCFA. Les deux parties ont 72h pour répondre.", date: "2024-01-22 09:00", pieces: ["rapport_mediation.pdf"] },
    ],
  },
  {
    id: "LIT-002",
    commande: "CMD-2024-004",
    produit: "Anacarde brut - 50kg",
    plaignant: "Hôtel Ivoire",
    type: "non_conforme",
    statut: "VendeurResponse",
    dateOuverture: "2024-01-22",
    dateMaj: "2024-01-22",
    montant: 180000,
    description: "Taux d'humidité non conforme aux spécifications. Le client réclame le grade Premium mais le produit reçu est de grade Standard.",
    delaiReponse: "2024-01-25",
    messages: [
      { id: "M1", auteur: "Hôtel Ivoire", role: "client", message: "Le taux d'humidité mesuré est de 15% au lieu des 8% maximum du grade Premium commandé.", date: "2024-01-22 08:30", pieces: ["analyse_humidite.pdf", "photo_lot.jpg"] },
    ],
  },
  {
    id: "LIT-003",
    commande: "CMD-2024-002",
    produit: "Cacao en poudre",
    plaignant: "Pâtisserie Moderne",
    type: "autre",
    statut: "Resolved",
    dateOuverture: "2024-01-10",
    dateMaj: "2024-01-18",
    montant: 50000,
    montantPropose: 25000,
    description: "Différend résolu par compensation partielle après médiation.",
    messages: [
      { id: "M1", auteur: "Pâtisserie Moderne", role: "client", message: "Le cacao en poudre a un goût altéré, non utilisable pour nos pâtisseries.", date: "2024-01-10 11:00" },
      { id: "M2", auteur: "Vous", role: "vendeur", message: "Nous avons vérifié le lot et proposons un remplacement + avoir 10%.", date: "2024-01-12 10:00" },
      { id: "M3", auteur: "Pâtisserie Moderne", role: "client", message: "D'accord pour le remplacement mais je demande 25% de compensation.", date: "2024-01-13 09:00" },
      { id: "M4", auteur: "Médiateur CPU-PME", role: "mediateur", message: "Accord trouvé : remplacement du lot + 50% de compensation (25 000 FCFA). Dossier clos.", date: "2024-01-18 14:00" },
    ],
  },
];

export function RetoursLitiges() {
  const [activeTab, setActiveTab] = useState("retours");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRetour, setSelectedRetour] = useState<Retour | null>(null);
  const [selectedLitige, setSelectedLitige] = useState<Litige | null>(null);
  const [showRetourDetail, setShowRetourDetail] = useState(false);
  const [showMediationDialog, setShowMediationDialog] = useState(false);
  const [showReponseDialog, setShowReponseDialog] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [reponseType, setReponseType] = useState<string>("");
  const [montantPropose, setMontantPropose] = useState<number>(0);
  const [motifRefus, setMotifRefus] = useState("");
  const { toast } = useToast();

  // KPIs vendeur
  const kpis = {
    retoursATraiter: mockRetours.filter(r => r.statut === "ReturnRequested").length,
    retoursEnCours: mockRetours.filter(r => ["Approved", "InTransit", "Received", "Inspected"].includes(r.statut)).length,
    litigesAttente: mockLitiges.filter(l => l.statut === "VendeurResponse").length,
    litigesMediation: mockLitiges.filter(l => l.statut === "InMediation").length,
    tauxResolution: 85,
    montantTotalLitiges: mockLitiges.reduce((s, l) => s + l.montant, 0),
    montantRisque: mockLitiges.filter(l => ["Opened", "VendeurResponse", "InMediation"].includes(l.statut)).reduce((s, l) => s + l.montant, 0),
    scoreReputation: 4.7,
  };

  const filteredRetours = mockRetours.filter(r => {
    const matchSearch = r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.produit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || r.statut === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredLitiges = mockLitiges.filter(l => {
    const matchSearch = l.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.produit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.plaignant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || l.statut === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleApproveRetour = (retour: Retour) => {
    toast({ title: "Retour approuvé", description: `Le retour ${retour.id} a été approuvé. Le client sera notifié pour l'expédition.` });
  };

  const handleRejectRetour = (retour: Retour) => {
    if (!motifRefus) {
      toast({ title: "Motif requis", description: "Veuillez indiquer le motif du refus.", variant: "destructive" });
      return;
    }
    toast({ title: "Retour refusé", description: `Le retour ${retour.id} a été refusé. Le client peut escalader vers un litige.` });
    setMotifRefus("");
  };

  const handleConfirmReception = (retour: Retour) => {
    toast({ title: "Réception confirmée", description: `Le colis retour ${retour.id} a été marqué comme reçu. Procédez à l'inspection.` });
  };

  const handleSubmitInspection = (retour: Retour) => {
    toast({ title: "Inspection terminée", description: `L'inspection du retour ${retour.id} est enregistrée.` });
  };

  const handleProcessRefund = (retour: Retour, montant: number) => {
    toast({ title: "Remboursement initié", description: `Remboursement de ${montant.toLocaleString()} FCFA en cours pour ${retour.id}.` });
  };

  const handleSendResponse = () => {
    if (!newMessage.trim()) return;
    toast({ title: "Réponse envoyée", description: "Votre message a été transmis." });
    setNewMessage("");
  };

  const handleAcceptMediation = () => {
    toast({ title: "Proposition acceptée", description: "Vous avez accepté la proposition de médiation." });
    setShowMediationDialog(false);
  };

  const handleContestMediation = () => {
    toast({ title: "Contestation enregistrée", description: "Votre contestation a été transmise au médiateur." });
  };

  const renderRetourProgress = (statut: RetourStatus) => {
    const steps = ["Demandé", "Approuvé", "En transit", "Reçu", "Inspecté", "Remboursé"];
    const config = retourStatusConfig[statut];
    const currentStep = config.step;
    const isRejected = statut === "Rejected";

    return (
      <div className="flex items-center gap-1 w-full">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center flex-1">
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2",
              idx + 1 <= currentStep
                ? "bg-green-500 border-green-500 text-white"
                : idx + 1 === currentStep + 1 && !isRejected
                ? "border-primary text-primary bg-primary/10"
                : "border-muted-foreground/30 text-muted-foreground"
            )}>
              {idx + 1 <= currentStep ? "✓" : idx + 1}
            </div>
            {idx < steps.length - 1 && (
              <div className={cn("flex-1 h-0.5 mx-0.5", idx + 1 < currentStep ? "bg-green-500" : "bg-muted-foreground/20")} />
            )}
          </div>
        ))}
        {isRejected && <Badge variant="destructive" className="ml-2 text-xs">Refusé</Badge>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* KPIs Vendeur */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={cn("border-red-500/30", kpis.retoursATraiter > 0 && "ring-1 ring-red-500/20")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">À traiter en urgence</p>
                <p className="text-2xl font-bold text-red-500">{kpis.retoursATraiter + kpis.litigesAttente}</p>
                <p className="text-xs text-muted-foreground">
                  {kpis.retoursATraiter} retours + {kpis.litigesAttente} litiges
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Scale className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">En médiation</p>
                <p className="text-2xl font-bold text-amber-500">{kpis.litigesMediation}</p>
                <p className="text-xs text-muted-foreground">
                  Risque: {kpis.montantRisque.toLocaleString()} FCFA
                </p>
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
                <p className="text-xs text-muted-foreground">Taux résolution</p>
                <p className="text-2xl font-bold text-green-500">{kpis.tauxResolution}%</p>
                <Progress value={kpis.tauxResolution} className="h-1.5 mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <TrendingDown className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Impact réputation</p>
                <p className="text-2xl font-bold">{kpis.scoreReputation}/5</p>
                <p className="text-xs text-muted-foreground">
                  {kpis.scoreReputation >= 4.5 ? "✅ Excellent" : kpis.scoreReputation >= 4 ? "⚠️ Bon" : "🔴 À améliorer"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setStatusFilter("all"); setSearchQuery(""); }} className="space-y-4">
        <TabsList>
          <TabsTrigger value="retours" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Retours ({mockRetours.length})
            {kpis.retoursATraiter > 0 && (
              <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-red-500 text-white text-xs">
                {kpis.retoursATraiter}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="litiges" className="gap-2">
            <Scale className="w-4 h-4" />
            Litiges ({mockLitiges.length})
            {kpis.litigesAttente > 0 && (
              <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-amber-500 text-white text-xs">
                {kpis.litigesAttente}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ===== TAB RETOURS ===== */}
        <TabsContent value="retours" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Rechercher un retour..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    {Object.entries(retourStatusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {filteredRetours.map((retour) => {
              const status = retourStatusConfig[retour.statut];
              const StatusIcon = status.icon;

              return (
                <Card key={retour.id} className={cn(
                  "hover:shadow-md transition-shadow",
                  retour.statut === "ReturnRequested" && "border-red-500/50 ring-1 ring-red-500/20",
                )}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", retour.statut === "ReturnRequested" ? "bg-red-500/10" : "bg-muted")}>
                          <StatusIcon className={cn("w-5 h-5", status.color)} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold">{retour.id}</span>
                            <Badge variant="outline" className={status.color}>{status.label}</Badge>
                            {retour.statut === "ReturnRequested" && (
                              <Badge variant="destructive" className="text-xs animate-pulse">Action requise</Badge>
                            )}
                          </div>
                          <p className="font-medium mt-1">{retour.produit}</p>
                          <p className="text-sm text-muted-foreground">
                            Client: {retour.client} • {retour.commande} • {retour.dateRetour}
                          </p>
                        </div>
                      </div>
                      <p className="text-lg font-bold">{retour.montant.toLocaleString()} FCFA</p>
                    </div>

                    {/* Progression */}
                    <div className="mb-3">{renderRetourProgress(retour.statut)}</div>

                    {/* Motif */}
                    <div className="p-3 rounded-lg bg-muted/50 mb-3">
                      <p className="text-sm"><span className="font-medium text-amber-600">Motif: </span>{retour.motif}</p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{retour.motifDetail}</p>
                    </div>

                    {/* Preuves */}
                    <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Camera className="w-3 h-3" /> {retour.preuves.length} preuve(s)</span>
                      <span className="flex items-center gap-1"><History className="w-3 h-3" /> {retour.timeline.length} étapes</span>
                    </div>

                    {/* Actions selon statut */}
                    <div className="flex items-center justify-end gap-2 border-t pt-3">
                      {retour.statut === "ReturnRequested" && (
                        <>
                          <Button size="sm" className="gap-1" onClick={() => handleApproveRetour(retour)}>
                            <CheckCircle2 className="w-3 h-3" />
                            Approuver
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1" onClick={() => {
                            setSelectedRetour(retour);
                            setShowReponseDialog(true);
                          }}>
                            <XCircle className="w-3 h-3" />
                            Refuser
                          </Button>
                        </>
                      )}
                      {retour.statut === "Approved" && (
                        <Badge variant="secondary" className="text-xs">En attente du colis retour</Badge>
                      )}
                      {retour.statut === "InTransit" && (
                        <Button size="sm" className="gap-1" onClick={() => handleConfirmReception(retour)}>
                          <Package className="w-3 h-3" />
                          Confirmer réception
                        </Button>
                      )}
                      {retour.statut === "Received" && (
                        <Button size="sm" className="gap-1" onClick={() => {
                          setSelectedRetour(retour);
                          setShowRetourDetail(true);
                        }}>
                          <Eye className="w-3 h-3" />
                          Inspecter & décider
                        </Button>
                      )}
                      {retour.statut === "Inspected" && (
                        <Button size="sm" className="gap-1" onClick={() => handleProcessRefund(retour, retour.montantPropose || retour.montant)}>
                          <CreditCard className="w-3 h-3" />
                          Procéder au remboursement ({(retour.montantPropose || retour.montant).toLocaleString()} FCFA)
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => { setSelectedRetour(retour); setShowRetourDetail(true); }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ===== TAB LITIGES ===== */}
        <TabsContent value="litiges" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Rechercher un litige..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    {Object.entries(litigeStatusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {filteredLitiges.map((litige) => {
              const status = litigeStatusConfig[litige.statut];
              const StatusIcon = status.icon;
              const needsResponse = litige.statut === "VendeurResponse";
              const inMediation = litige.statut === "InMediation";

              return (
                <Card key={litige.id} className={cn(
                  "hover:shadow-md transition-shadow",
                  needsResponse && "border-red-500/50 ring-1 ring-red-500/20",
                  inMediation && "border-amber-500/50",
                )}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg",
                          needsResponse ? "bg-red-500/10" : inMediation ? "bg-amber-500/10" : "bg-muted"
                        )}>
                          <StatusIcon className={cn("w-5 h-5", status.color)} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold">{litige.id}</span>
                            <Badge variant="outline" className={status.color}>{status.label}</Badge>
                            <Badge variant="secondary" className="text-xs">{litigeTypeLabels[litige.type]}</Badge>
                            {needsResponse && (
                              <Badge variant="destructive" className="text-xs animate-pulse">Réponse requise</Badge>
                            )}
                          </div>
                          <p className="font-medium mt-1">{litige.produit}</p>
                          <p className="text-sm text-muted-foreground">
                            Plaignant: {litige.plaignant} • {litige.commande}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-amber-600">{litige.montant.toLocaleString()} FCFA</p>
                        {litige.delaiReponse && needsResponse && (
                          <p className="text-xs text-red-500 font-medium">
                            ⏰ Délai: {litige.delaiReponse}
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{litige.description}</p>

                    {/* Proposition médiation */}
                    {inMediation && litige.propositionMediation && (
                      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/30 mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Gavel className="w-4 h-4 text-amber-600" />
                          <span className="text-sm font-semibold text-amber-600">Proposition du médiateur</span>
                        </div>
                        <p className="text-sm">{litige.propositionMediation}</p>
                        {litige.montantPropose && (
                          <p className="font-bold text-amber-600 mt-1">{litige.montantPropose.toLocaleString()} FCFA</p>
                        )}
                      </div>
                    )}

                    {/* Infos */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {litige.messages.length} messages</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Ouvert le {litige.dateOuverture}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 border-t pt-3">
                      {needsResponse && (
                        <Button size="sm" className="gap-1" onClick={() => {
                          setSelectedLitige(litige);
                          setShowMediationDialog(true);
                        }}>
                          <Send className="w-3 h-3" />
                          Répondre
                        </Button>
                      )}
                      {inMediation && (
                        <>
                          <Button size="sm" className="gap-1" onClick={handleAcceptMediation}>
                            <ThumbsUp className="w-3 h-3" />
                            Accepter
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1" onClick={handleContestMediation}>
                            <ThumbsDown className="w-3 h-3" />
                            Contester
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => {
                        setSelectedLitige(litige);
                        setShowMediationDialog(true);
                      }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* ===== DIALOG DÉTAIL RETOUR ===== */}
      <Dialog open={showRetourDetail} onOpenChange={setShowRetourDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedRetour && (() => {
            const status = retourStatusConfig[selectedRetour.statut];
            return (
              <>
                <DialogHeader>
                  <DialogTitle>Détail retour {selectedRetour.id}</DialogTitle>
                  <DialogDescription>{selectedRetour.produit} • {selectedRetour.client}</DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4">
                  {/* Progression */}
                  <div>
                    <p className="text-sm font-medium mb-2">Progression</p>
                    {renderRetourProgress(selectedRetour.statut)}
                  </div>

                  {/* Infos */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Commande</p>
                      <p className="font-mono font-medium">{selectedRetour.commande}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Montant</p>
                      <p className="font-bold text-primary">{selectedRetour.montant.toLocaleString()} FCFA</p>
                    </div>
                  </div>

                  {/* Motif détaillé */}
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm font-medium text-amber-600 mb-1">Motif: {selectedRetour.motif}</p>
                    <p className="text-sm">{selectedRetour.motifDetail}</p>
                  </div>

                  {/* Preuves */}
                  <div>
                    <p className="text-sm font-medium mb-2">Preuves fournies par le client</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedRetour.preuves.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted text-sm">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Inspection (si reçu) */}
                  {(selectedRetour.statut === "Received" || selectedRetour.statut === "Inspected") && (
                    <div className="space-y-3 p-4 rounded-lg border border-primary/30 bg-primary/5">
                      <p className="font-semibold flex items-center gap-2"><Eye className="w-4 h-4 text-primary" /> Inspection du retour</p>
                      <div className="space-y-2">
                        <Label>Notes d'inspection</Label>
                        <Textarea
                          placeholder="Décrivez l'état du produit reçu, confirmer ou infirmer les dommages..."
                          rows={3}
                          defaultValue={selectedRetour.inspectionNotes || ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Décision de remboursement</Label>
                        <Select defaultValue={selectedRetour.montantPropose ? "partiel" : ""}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir la décision" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="total">Remboursement total ({selectedRetour.montant.toLocaleString()} FCFA)</SelectItem>
                            <SelectItem value="partiel">Remboursement partiel</SelectItem>
                            <SelectItem value="remplacement">Remplacement du produit</SelectItem>
                            <SelectItem value="avoir">Avoir sur prochaine commande</SelectItem>
                            <SelectItem value="refus">Refus (justification obligatoire)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {selectedRetour.statut === "Received" && (
                        <Button className="w-full gap-2" onClick={() => handleSubmitInspection(selectedRetour)}>
                          <CheckCircle2 className="w-4 h-4" />
                          Valider l'inspection
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Timeline */}
                  <div>
                    <p className="text-sm font-medium mb-3 flex items-center gap-2">
                      <History className="w-4 h-4" /> Historique
                    </p>
                    <div className="space-y-0">
                      {selectedRetour.timeline.map((event, idx) => (
                        <div key={idx} className="flex gap-3 pb-3 relative">
                          {idx < selectedRetour.timeline.length - 1 && (
                            <div className="absolute left-[11px] top-6 w-0.5 h-full bg-muted-foreground/20" />
                          )}
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10",
                            event.role === "vendeur" ? "bg-primary/20" : event.role === "acheteur" ? "bg-blue-500/20" : "bg-muted",
                          )}>
                            {event.role === "systeme" ? <RefreshCw className="w-3 h-3 text-muted-foreground" /> : <User className="w-3 h-3 text-muted-foreground" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{event.action}</p>
                            <p className="text-xs text-muted-foreground">{event.auteur} • {event.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ===== DIALOG MÉDIATION LITIGE ===== */}
      <Dialog open={showMediationDialog} onOpenChange={setShowMediationDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          {selectedLitige && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-500" />
                  {selectedLitige.statut === "InMediation" ? "Médiation" : "Litige"} - {selectedLitige.id}
                </DialogTitle>
                <DialogDescription>
                  {selectedLitige.produit} • Plaignant: {selectedLitige.plaignant}
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-hidden flex flex-col py-4">
                {/* Résumé */}
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium">Montant en jeu</p>
                      <p className="font-bold text-amber-600">{selectedLitige.montant.toLocaleString()} FCFA</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{litigeTypeLabels[selectedLitige.type]}</Badge>
                      <Badge className={cn("text-white", selectedLitige.statut === "InMediation" ? "bg-amber-500" : "bg-blue-500")}>
                        {litigeStatusConfig[selectedLitige.statut].label}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedLitige.description}</p>
                  {selectedLitige.delaiReponse && selectedLitige.statut === "VendeurResponse" && (
                    <p className="text-xs text-red-500 font-medium mt-2">⏰ Répondez avant le {selectedLitige.delaiReponse} pour éviter une décision par défaut</p>
                  )}
                </div>

                {/* Proposition médiation */}
                {selectedLitige.propositionMediation && selectedLitige.statut === "InMediation" && (
                  <div className="p-4 rounded-lg border-2 border-amber-500/50 bg-amber-500/5 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Gavel className="w-5 h-5 text-amber-600" />
                      <span className="font-bold text-amber-600">Décision du médiateur</span>
                    </div>
                    <p className="text-sm mb-2">{selectedLitige.propositionMediation}</p>
                    {selectedLitige.montantPropose && (
                      <p className="font-bold text-lg text-amber-600 mb-3">{selectedLitige.montantPropose.toLocaleString()} FCFA</p>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" className="gap-1" onClick={handleAcceptMediation}>
                        <ThumbsUp className="w-4 h-4" />
                        Accepter cette proposition
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1" onClick={handleContestMediation}>
                        <ThumbsDown className="w-4 h-4" />
                        Contester
                      </Button>
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                  {selectedLitige.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "p-3 rounded-lg",
                        msg.role === "vendeur" && "bg-primary/10 ml-8",
                        msg.role === "client" && "bg-muted mr-8",
                        msg.role === "mediateur" && "bg-amber-500/10 border border-amber-500/30"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={cn("p-1 rounded-full", msg.role === "mediateur" && "bg-amber-500/20")}>
                          {msg.role === "mediateur" ? <Shield className="w-3 h-3 text-amber-600" /> : <User className="w-3 h-3 text-muted-foreground" />}
                        </div>
                        <span className={cn("text-sm font-medium", msg.role === "mediateur" && "text-amber-600")}>
                          {msg.auteur}
                        </span>
                        <span className="text-xs text-muted-foreground">{msg.date}</span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                      {msg.pieces && msg.pieces.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {msg.pieces.map((p, i) => (
                            <Badge key={i} variant="outline" className="text-xs gap-1">
                              <FileText className="w-3 h-3" />
                              {p}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Zone réponse */}
                {(selectedLitige.statut === "VendeurResponse" || selectedLitige.statut === "InMediation" || selectedLitige.statut === "Opened") && (
                  <div className="space-y-3 border-t pt-4">
                    {selectedLitige.statut === "VendeurResponse" && (
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Type de proposition</Label>
                          <Select value={reponseType} onValueChange={setReponseType}>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Choisir..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="remboursement_total">Remboursement total</SelectItem>
                              <SelectItem value="remboursement_partiel">Remboursement partiel</SelectItem>
                              <SelectItem value="remplacement">Remplacement</SelectItem>
                              <SelectItem value="avoir">Avoir</SelectItem>
                              <SelectItem value="refus">Contestation</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {(reponseType === "remboursement_partiel" || reponseType === "avoir") && (
                          <div className="space-y-1">
                            <Label className="text-xs">Montant proposé (FCFA)</Label>
                            <Input type="number" className="h-9" value={montantPropose} onChange={(e) => setMontantPropose(parseInt(e.target.value) || 0)} />
                          </div>
                        )}
                      </div>
                    )}
                    <Textarea
                      placeholder="Rédigez votre réponse..."
                      rows={3}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <div className="flex items-center justify-between">
                      <Button variant="outline" size="sm" className="gap-1">
                        <Upload className="w-4 h-4" />
                        Joindre preuve
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setShowMediationDialog(false)}>Fermer</Button>
                        <Button className="gap-1" onClick={handleSendResponse}>
                          <Send className="w-4 h-4" />
                          Envoyer
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== DIALOG REFUS RETOUR ===== */}
      <Dialog open={showReponseDialog} onOpenChange={setShowReponseDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-destructive" />
              Refuser le retour {selectedRetour?.id}
            </DialogTitle>
            <DialogDescription>
              Le client pourra escalader vers un litige si le refus n'est pas justifié.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-sm">
              <p className="font-medium text-red-600 mb-1">⚠️ Attention</p>
              <p className="text-muted-foreground">Un refus non justifié peut impacter votre score vendeur et déclencher une médiation automatique.</p>
            </div>
            <div className="space-y-2">
              <Label>Motif du refus (obligatoire)</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un motif" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delai">Délai de retour dépassé ({">"} 14 jours)</SelectItem>
                  <SelectItem value="usage">Produit utilisé/ouvert</SelectItem>
                  <SelectItem value="preuves">Preuves insuffisantes</SelectItem>
                  <SelectItem value="conforme">Produit conforme à la description</SelectItem>
                  <SelectItem value="autre">Autre motif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Explication détaillée</Label>
              <Textarea
                placeholder="Expliquez pourquoi vous refusez ce retour..."
                rows={3}
                value={motifRefus}
                onChange={(e) => setMotifRefus(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Preuves à l'appui (optionnel)</Label>
              <Button variant="outline" size="sm" className="gap-1">
                <Upload className="w-4 h-4" />
                Joindre des preuves
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReponseDialog(false)}>Annuler</Button>
            <Button variant="destructive" onClick={() => {
              if (selectedRetour) handleRejectRetour(selectedRetour);
              setShowReponseDialog(false);
            }}>
              <Ban className="w-4 h-4 mr-1" />
              Confirmer le refus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
