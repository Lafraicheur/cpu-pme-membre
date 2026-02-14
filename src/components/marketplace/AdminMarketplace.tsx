import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart3,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Ban,
  MoreVertical,
  Search,
  FileText,
  Award,
  Truck,
  RotateCcw,
  DollarSign,
  MessageSquare,
  Settings,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
type ModerationStatus = "pending" | "approved" | "rejected" | "changes_requested";
type VendorStatus = "active" | "suspended" | "pending" | "blocked";

interface ProductModeration {
  id: string;
  nom: string;
  vendeur: string;
  categorie: string;
  prix: number;
  status: ModerationStatus;
  dateSubmission: string;
  image: string;
  motif?: string;
}

interface VendorModeration {
  id: string;
  nom: string;
  rccm: string;
  status: VendorStatus;
  dateInscription: string;
  produitsActifs: number;
  ca: number;
  tauxLitiges: number;
  scoreConformite: number;
}

interface LabelAudit {
  id: string;
  produit: string;
  vendeur: string;
  niveau: "or" | "argent" | "bronze" | "innovation";
  status: "pending" | "in_review" | "approved" | "rejected";
  dateSubmission: string;
  scoreAuto: number;
}

interface Dispute {
  id: string;
  commande: string;
  acheteur: string;
  vendeur: string;
  motif: string;
  montant: number;
  status: "open" | "mediation" | "resolved" | "escalated";
  dateOuverture: string;
}

// Mock data
const mockKPIs = {
  gmv: 125000000,
  gmvGrowth: 12.5,
  commandes: 456,
  commandesGrowth: 8.2,
  panierMoyen: 274123,
  produitsEnAttente: 12,
  vendeursActifs: 89,
  tauxLitiges: 2.3,
  rfqEnCours: 34,
  delaiMoyenLivraison: 3.2,
};

const mockProduitsModeration: ProductModeration[] = [
  {
    id: "PROD-001",
    nom: "Café torréfié artisanal",
    vendeur: "Café du Bandama",
    categorie: "Agro-industrie",
    prix: 12500,
    status: "pending",
    dateSubmission: "2024-01-20",
    image: "☕",
  },
  {
    id: "PROD-002",
    nom: "Huile essentielle de citronnelle",
    vendeur: "Naturels CI",
    categorie: "Cosmétiques",
    prix: 8500,
    status: "pending",
    dateSubmission: "2024-01-19",
    image: "🌿",
  },
  {
    id: "PROD-003",
    nom: "Beurre de karité premium",
    vendeur: "Korhogo Karité",
    categorie: "Cosmétiques",
    prix: 15000,
    status: "changes_requested",
    dateSubmission: "2024-01-18",
    image: "🧴",
    motif: "Photos de qualité insuffisante",
  },
];

const mockVendeurs: VendorModeration[] = [
  {
    id: "V-001",
    nom: "Coopérative Aboisso Cacao",
    rccm: "CI-ABJ-2020-B-12345",
    status: "active",
    dateInscription: "2023-06-15",
    produitsActifs: 12,
    ca: 27500000,
    tauxLitiges: 1.2,
    scoreConformite: 92,
  },
  {
    id: "V-002",
    nom: "TransFroid CI",
    rccm: "CI-ABJ-2019-B-54321",
    status: "active",
    dateInscription: "2023-08-20",
    produitsActifs: 3,
    ca: 18000000,
    tauxLitiges: 0.5,
    scoreConformite: 98,
  },
  {
    id: "V-003",
    nom: "Import-Export Konan",
    rccm: "CI-ABJ-2022-B-98765",
    status: "suspended",
    dateInscription: "2024-01-05",
    produitsActifs: 0,
    ca: 500000,
    tauxLitiges: 15.2,
    scoreConformite: 45,
  },
];

const mockLabelAudits: LabelAudit[] = [
  {
    id: "MIC-2024-015",
    produit: "Chocolat artisanal 70%",
    vendeur: "Choco Ivoire",
    niveau: "or",
    status: "in_review",
    dateSubmission: "2024-01-18",
    scoreAuto: 78,
  },
  {
    id: "MIC-2024-016",
    produit: "Savon noir traditionnel",
    vendeur: "Naturels CI",
    niveau: "argent",
    status: "pending",
    dateSubmission: "2024-01-20",
    scoreAuto: 65,
  },
];

const mockDisputes: Dispute[] = [
  {
    id: "LIT-2024-001",
    commande: "CMD-2024-1234",
    acheteur: "Hôtel Ivoire",
    vendeur: "Café du Bandama",
    motif: "Produit non conforme à la description",
    montant: 125000,
    status: "mediation",
    dateOuverture: "2024-01-19",
  },
  {
    id: "LIT-2024-002",
    commande: "CMD-2024-1198",
    acheteur: "Restaurant Chez Paul",
    vendeur: "Palmeraie du Sud",
    motif: "Retard de livraison > 7 jours",
    montant: 85000,
    status: "open",
    dateOuverture: "2024-01-20",
  },
];

const statusColors = {
  pending: "bg-blue-500/10 text-blue-600",
  approved: "bg-green-500/10 text-green-600",
  rejected: "bg-red-500/10 text-red-600",
  changes_requested: "bg-amber-500/10 text-amber-600",
  active: "bg-green-500/10 text-green-600",
  suspended: "bg-amber-500/10 text-amber-600",
  blocked: "bg-red-500/10 text-red-600",
  in_review: "bg-purple-500/10 text-purple-600",
  open: "bg-blue-500/10 text-blue-600",
  mediation: "bg-amber-500/10 text-amber-600",
  resolved: "bg-green-500/10 text-green-600",
  escalated: "bg-red-500/10 text-red-600",
};

const niveauBadges = {
  or: { color: "bg-primary text-primary-foreground", label: "Or" },
  argent: { color: "bg-secondary text-secondary-foreground", label: "Argent" },
  bronze: { color: "bg-amber-600 text-white", label: "Bronze" },
  innovation: { color: "bg-cyan-500 text-white", label: "Innovation" },
};

export function AdminMarketplace() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductModeration | null>(null);
  const [showModerationDialog, setShowModerationDialog] = useState(false);
  const [moderationAction, setModerationAction] = useState<"approve" | "reject" | "changes">("approve");
  const [moderationMotif, setModerationMotif] = useState("");

  const handleModeration = (action: "approve" | "reject" | "changes") => {
    // Mock moderation action
    setShowModerationDialog(false);
    setSelectedProduct(null);
    setModerationMotif("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            Administration Marketplace
          </h2>
          <p className="text-muted-foreground">Modération, labels, litiges et paramètres</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-1" />
            Actualiser
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-6 w-full max-w-3xl">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="produits">Produits</TabsTrigger>
          <TabsTrigger value="vendeurs">Vendeurs</TabsTrigger>
          <TabsTrigger value="labels">Labels</TabsTrigger>
          <TabsTrigger value="litiges">Litiges</TabsTrigger>
          <TabsTrigger value="rfq">RFQ</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* KPIs Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">GMV (mois)</p>
                    <p className="text-xl font-bold">{(mockKPIs.gmv / 1000000).toFixed(0)}M FCFA</p>
                    <p className="text-xs text-green-600">+{mockKPIs.gmvGrowth}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <ShoppingCart className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Commandes</p>
                    <p className="text-xl font-bold">{mockKPIs.commandes}</p>
                    <p className="text-xs text-green-600">+{mockKPIs.commandesGrowth}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={mockKPIs.produitsEnAttente > 10 ? "border-amber-500/50" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Clock className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">En attente</p>
                    <p className="text-xl font-bold text-amber-600">{mockKPIs.produitsEnAttente}</p>
                    <p className="text-xs text-muted-foreground">produits à modérer</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={mockKPIs.tauxLitiges > 5 ? "border-red-500/50" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Taux litiges</p>
                    <p className="text-xl font-bold">{mockKPIs.tauxLitiges}%</p>
                    <p className="text-xs text-muted-foreground">objectif &lt;3%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alertes */}
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Alertes opérationnelles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background border">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-500" />
                    <span className="text-sm">Produits en attente &gt;48h</span>
                  </div>
                  <Badge variant="destructive">5</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-background border">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-500" />
                    <span className="text-sm">Vendeurs à risque</span>
                  </div>
                  <Badge variant="destructive">2</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-background border">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-500" />
                    <span className="text-sm">Livraisons en retard</span>
                  </div>
                  <Badge variant="outline">8</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vendeurs actifs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{mockKPIs.vendeursActifs}</div>
                <Progress value={89} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">89% taux d'activité</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">RFQ en cours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary">{mockKPIs.rfqEnCours}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Délai moyen réponse: 2.4 jours
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Modération Produits Tab */}
        <TabsContent value="produits" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Modération catalogue</CardTitle>
                  <CardDescription>{mockProduitsModeration.length} produits en attente</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Rechercher..." className="pl-10 w-64" />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="changes_requested">À corriger</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockProduitsModeration.map((produit) => (
                  <div
                    key={produit.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-2xl">
                        {produit.image}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{produit.nom}</span>
                          <Badge className={statusColors[produit.status]}>
                            {produit.status === "pending" ? "En attente" : 
                             produit.status === "changes_requested" ? "À corriger" : produit.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {produit.vendeur} • {produit.categorie}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Soumis le {produit.dateSubmission}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-semibold">{produit.prix.toLocaleString()} FCFA</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => {
                            setSelectedProduct(produit);
                            setModerationAction("approve");
                            setShowModerationDialog(true);
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          onClick={() => {
                            setSelectedProduct(produit);
                            setModerationAction("changes");
                            setShowModerationDialog(true);
                          }}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setSelectedProduct(produit);
                            setModerationAction("reject");
                            setShowModerationDialog(true);
                          }}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vendeurs Tab */}
        <TabsContent value="vendeurs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des vendeurs</CardTitle>
              <CardDescription>Activation, suspension et suivi conformité</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockVendeurs.map((vendeur) => (
                  <div
                    key={vendeur.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border",
                      vendeur.tauxLitiges > 10 && "border-red-500/50 bg-red-500/5"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{vendeur.nom}</span>
                          <Badge className={statusColors[vendeur.status]}>
                            {vendeur.status === "active" ? "Actif" : 
                             vendeur.status === "suspended" ? "Suspendu" : vendeur.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          RCCM: {vendeur.rccm} • Inscrit le {vendeur.dateInscription}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm font-semibold">{vendeur.produitsActifs}</p>
                        <p className="text-xs text-muted-foreground">Produits</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold">{(vendeur.ca / 1000000).toFixed(1)}M</p>
                        <p className="text-xs text-muted-foreground">CA</p>
                      </div>
                      <div className="text-center">
                        <p className={cn("text-sm font-semibold", vendeur.tauxLitiges > 5 && "text-red-600")}>
                          {vendeur.tauxLitiges}%
                        </p>
                        <p className="text-xs text-muted-foreground">Litiges</p>
                      </div>
                      <div className="text-center">
                        <Progress value={vendeur.scoreConformite} className="w-16 h-2" />
                        <p className="text-xs text-muted-foreground">{vendeur.scoreConformite}%</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye className="w-4 h-4 mr-2" />Voir profil</DropdownMenuItem>
                          <DropdownMenuItem><Package className="w-4 h-4 mr-2" />Voir produits</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {vendeur.status === "active" ? (
                            <DropdownMenuItem className="text-amber-600">
                              <Ban className="w-4 h-4 mr-2" />Suspendre
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-green-600">
                              <CheckCircle2 className="w-4 h-4 mr-2" />Réactiver
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Labels Tab */}
        <TabsContent value="labels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Audit Label Made in CI
              </CardTitle>
              <CardDescription>Validation des demandes de certification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockLabelAudits.map((audit) => (
                  <div
                    key={audit.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Award className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{audit.id}</span>
                          <Badge className={niveauBadges[audit.niveau].color}>
                            {niveauBadges[audit.niveau].label}
                          </Badge>
                          <Badge className={statusColors[audit.status]}>
                            {audit.status === "pending" ? "En attente" : 
                             audit.status === "in_review" ? "En audit" : audit.status}
                          </Badge>
                        </div>
                        <p className="font-medium">{audit.produit}</p>
                        <p className="text-sm text-muted-foreground">{audit.vendeur}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-primary">{audit.scoreAuto}%</p>
                        <p className="text-xs text-muted-foreground">Score auto</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          Auditer
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Litiges Tab */}
        <TabsContent value="litiges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Gestion des litiges
              </CardTitle>
              <CardDescription>Médiation et arbitrage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockDisputes.map((dispute) => (
                  <div
                    key={dispute.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border",
                      dispute.status === "escalated" && "border-red-500/50 bg-red-500/5"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2 rounded-lg",
                        dispute.status === "open" ? "bg-blue-500/10" :
                        dispute.status === "mediation" ? "bg-amber-500/10" : "bg-green-500/10"
                      )}>
                        <MessageSquare className={cn(
                          "w-6 h-6",
                          dispute.status === "open" ? "text-blue-500" :
                          dispute.status === "mediation" ? "text-amber-500" : "text-green-500"
                        )} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{dispute.id}</span>
                          <Badge className={statusColors[dispute.status]}>
                            {dispute.status === "open" ? "Ouvert" : 
                             dispute.status === "mediation" ? "En médiation" : 
                             dispute.status === "resolved" ? "Résolu" : "Escaladé"}
                          </Badge>
                        </div>
                        <p className="font-medium">{dispute.motif}</p>
                        <p className="text-sm text-muted-foreground">
                          {dispute.acheteur} vs {dispute.vendeur} • Cmd {dispute.commande}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-primary">{dispute.montant.toLocaleString()} FCFA</p>
                        <p className="text-xs text-muted-foreground">Ouvert le {dispute.dateOuverture}</p>
                      </div>
                      <Button size="sm">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Arbitrer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RFQ Tab */}
        <TabsContent value="rfq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Surveillance RFQ
              </CardTitle>
              <CardDescription>Paramètres et monitoring des demandes de devis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">RFQ actives</p>
                  <p className="text-2xl font-bold">34</p>
                </div>
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Délai moyen réponse</p>
                  <p className="text-2xl font-bold">2.4 jours</p>
                </div>
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Taux conversion</p>
                  <p className="text-2xl font-bold">42%</p>
                </div>
              </div>
              <div className="mt-6 p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-3">Paramètres RFQ</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Vendeurs max par RFQ</Label>
                    <Select defaultValue="5">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 vendeurs</SelectItem>
                        <SelectItem value="5">5 vendeurs</SelectItem>
                        <SelectItem value="10">10 vendeurs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>SLA réponse (jours)</Label>
                    <Select defaultValue="3">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 jours</SelectItem>
                        <SelectItem value="3">3 jours</SelectItem>
                        <SelectItem value="5">5 jours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Moderation Dialog */}
      <Dialog open={showModerationDialog} onOpenChange={setShowModerationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {moderationAction === "approve" ? "Approuver le produit" :
               moderationAction === "reject" ? "Refuser le produit" : "Demander des modifications"}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct?.nom} - {selectedProduct?.vendeur}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {moderationAction !== "approve" && (
              <div className="space-y-2">
                <Label>Motif {moderationAction === "reject" ? "du refus" : "des modifications"} *</Label>
                <Input
                  placeholder="Expliquez la raison..."
                  value={moderationMotif}
                  onChange={(e) => setModerationMotif(e.target.value)}
                />
              </div>
            )}
            {moderationAction === "approve" && (
              <p className="text-sm text-muted-foreground">
                Le produit sera publié et visible sur le catalogue.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModerationDialog(false)}>
              Annuler
            </Button>
            <Button
              variant={moderationAction === "reject" ? "destructive" : "default"}
              onClick={() => handleModeration(moderationAction)}
            >
              {moderationAction === "approve" ? "Approuver" :
               moderationAction === "reject" ? "Refuser" : "Demander corrections"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
