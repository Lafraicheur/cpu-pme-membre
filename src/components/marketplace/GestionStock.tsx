import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Bell,
  Settings,
  RefreshCw,
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Minus,
  History,
  Truck,
  ShoppingCart,
  BarChart3,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpDown,
  Zap,
  Target,
  Calendar,
  Mail,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StockItem {
  id: string;
  nom: string;
  sku: string;
  categorie: string;
  stockActuel: number;
  seuilAlerte: number;
  seuilCritique: number;
  stockOptimal: number;
  unite: string;
  prixAchat: number;
  fournisseur: string;
  delaiReappro: number; // jours
  autoReappro: boolean;
  dernierMouvement: string;
  tendance: "up" | "down" | "stable";
  image: string;
}

interface StockMovement {
  id: string;
  produitId: string;
  produitNom: string;
  type: "entree" | "sortie" | "ajustement" | "retour";
  quantite: number;
  motif: string;
  reference: string;
  date: string;
  utilisateur: string;
}

interface ReapproOrder {
  id: string;
  produitId: string;
  produitNom: string;
  quantite: number;
  fournisseur: string;
  statut: "pending" | "confirmed" | "shipped" | "received" | "cancelled";
  dateCommande: string;
  dateEstimee: string;
  type: "auto" | "manuel";
}

// Mock data
const mockStockItems: StockItem[] = [
  {
    id: "1",
    nom: "Cacao Premium Grade A",
    sku: "CAC-PRM-001",
    categorie: "Agro-industrie",
    stockActuel: 12,
    seuilAlerte: 20,
    seuilCritique: 5,
    stockOptimal: 50,
    unite: "tonne",
    prixAchat: 750000,
    fournisseur: "Coopérative Aboisso",
    delaiReappro: 7,
    autoReappro: true,
    dernierMouvement: "2024-03-14",
    tendance: "down",
    image: "🍫",
  },
  {
    id: "2",
    nom: "Attiéké séché - 25kg",
    sku: "ATT-SEC-025",
    categorie: "Produits vivriers",
    stockActuel: 3,
    seuilAlerte: 15,
    seuilCritique: 5,
    stockOptimal: 100,
    unite: "sac",
    prixAchat: 12000,
    fournisseur: "Femmes de Dabou",
    delaiReappro: 3,
    autoReappro: true,
    dernierMouvement: "2024-03-15",
    tendance: "down",
    image: "🌾",
  },
  {
    id: "3",
    nom: "Huile de palme raffinée - 20L",
    sku: "HPR-20L-001",
    categorie: "Huiles végétales",
    stockActuel: 85,
    seuilAlerte: 30,
    seuilCritique: 10,
    stockOptimal: 150,
    unite: "bidon",
    prixAchat: 20000,
    fournisseur: "Palmeraie du Sud",
    delaiReappro: 5,
    autoReappro: false,
    dernierMouvement: "2024-03-12",
    tendance: "stable",
    image: "🫒",
  },
  {
    id: "4",
    nom: "Café torréfié premium",
    sku: "CAF-TOR-PRE",
    categorie: "Café",
    stockActuel: 45,
    seuilAlerte: 25,
    seuilCritique: 10,
    stockOptimal: 100,
    unite: "kg",
    prixAchat: 10000,
    fournisseur: "Torréfacteurs d'Abidjan",
    delaiReappro: 4,
    autoReappro: true,
    dernierMouvement: "2024-03-13",
    tendance: "up",
    image: "☕",
  },
  {
    id: "5",
    nom: "Noix de cajou brutes",
    sku: "NCJ-BRT-001",
    categorie: "Fruits secs",
    stockActuel: 0,
    seuilAlerte: 20,
    seuilCritique: 5,
    stockOptimal: 80,
    unite: "kg",
    prixAchat: 8000,
    fournisseur: "Producteurs de Bondoukou",
    delaiReappro: 10,
    autoReappro: true,
    dernierMouvement: "2024-03-10",
    tendance: "down",
    image: "🥜",
  },
];

const mockMovements: StockMovement[] = [
  { id: "1", produitId: "1", produitNom: "Cacao Premium Grade A", type: "sortie", quantite: 5, motif: "Vente", reference: "CMD-2024-156", date: "2024-03-15 14:30", utilisateur: "Jean K." },
  { id: "2", produitId: "2", produitNom: "Attiéké séché - 25kg", type: "sortie", quantite: 12, motif: "Vente", reference: "CMD-2024-157", date: "2024-03-15 11:20", utilisateur: "Marie A." },
  { id: "3", produitId: "3", produitNom: "Huile de palme raffinée", type: "entree", quantite: 50, motif: "Réception commande", reference: "REC-2024-089", date: "2024-03-14 09:00", utilisateur: "Paul M." },
  { id: "4", produitId: "1", produitNom: "Cacao Premium Grade A", type: "ajustement", quantite: -2, motif: "Inventaire", reference: "INV-2024-012", date: "2024-03-13 16:45", utilisateur: "Admin" },
  { id: "5", produitId: "4", produitNom: "Café torréfié premium", type: "retour", quantite: 3, motif: "Retour client", reference: "RET-2024-023", date: "2024-03-12 10:15", utilisateur: "Marie A." },
];

const mockReapproOrders: ReapproOrder[] = [
  { id: "1", produitId: "2", produitNom: "Attiéké séché - 25kg", quantite: 100, fournisseur: "Femmes de Dabou", statut: "confirmed", dateCommande: "2024-03-15", dateEstimee: "2024-03-18", type: "auto" },
  { id: "2", produitId: "5", produitNom: "Noix de cajou brutes", quantite: 80, fournisseur: "Producteurs de Bondoukou", statut: "shipped", dateCommande: "2024-03-12", dateEstimee: "2024-03-22", type: "auto" },
  { id: "3", produitId: "1", produitNom: "Cacao Premium Grade A", quantite: 40, fournisseur: "Coopérative Aboisso", statut: "pending", dateCommande: "2024-03-15", dateEstimee: "2024-03-22", type: "auto" },
];

const statusConfig = {
  pending: { label: "En attente", color: "text-amber-500", bgColor: "bg-amber-500/10", icon: Clock },
  confirmed: { label: "Confirmée", color: "text-blue-500", bgColor: "bg-blue-500/10", icon: CheckCircle2 },
  shipped: { label: "Expédiée", color: "text-purple-500", bgColor: "bg-purple-500/10", icon: Truck },
  received: { label: "Reçue", color: "text-green-500", bgColor: "bg-green-500/10", icon: CheckCircle2 },
  cancelled: { label: "Annulée", color: "text-red-500", bgColor: "bg-red-500/10", icon: XCircle },
};

const movementTypeConfig = {
  entree: { label: "Entrée", color: "text-green-500", bgColor: "bg-green-500/10", icon: Plus },
  sortie: { label: "Sortie", color: "text-red-500", bgColor: "bg-red-500/10", icon: Minus },
  ajustement: { label: "Ajustement", color: "text-amber-500", bgColor: "bg-amber-500/10", icon: ArrowUpDown },
  retour: { label: "Retour", color: "text-blue-500", bgColor: "bg-blue-500/10", icon: RefreshCw },
};

export function GestionStock() {
  const [stockItems, setStockItems] = useState<StockItem[]>(mockStockItems);
  const [movements] = useState<StockMovement[]>(mockMovements);
  const [reapproOrders, setReapproOrders] = useState<ReapproOrder[]>(mockReapproOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [showMovementDialog, setShowMovementDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showReapproDialog, setShowReapproDialog] = useState(false);
  const [movementType, setMovementType] = useState<"entree" | "sortie">("entree");
  const [movementQuantity, setMovementQuantity] = useState("");

  // Stats
  const stats = {
    totalProduits: stockItems.length,
    enRupture: stockItems.filter(i => i.stockActuel === 0).length,
    alerteBasse: stockItems.filter(i => i.stockActuel > 0 && i.stockActuel <= i.seuilAlerte).length,
    alerteCritique: stockItems.filter(i => i.stockActuel > 0 && i.stockActuel <= i.seuilCritique).length,
    autoReapproActif: stockItems.filter(i => i.autoReappro).length,
    commandesEnCours: reapproOrders.filter(o => !["received", "cancelled"].includes(o.statut)).length,
    valeurStock: stockItems.reduce((acc, i) => acc + (i.stockActuel * i.prixAchat), 0),
  };

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (stockFilter === "all") return matchesSearch;
    if (stockFilter === "rupture") return matchesSearch && item.stockActuel === 0;
    if (stockFilter === "critique") return matchesSearch && item.stockActuel > 0 && item.stockActuel <= item.seuilCritique;
    if (stockFilter === "alerte") return matchesSearch && item.stockActuel > item.seuilCritique && item.stockActuel <= item.seuilAlerte;
    if (stockFilter === "ok") return matchesSearch && item.stockActuel > item.seuilAlerte;
    return matchesSearch;
  });

  const getStockStatus = (item: StockItem) => {
    if (item.stockActuel === 0) return { label: "Rupture", color: "text-red-600", bgColor: "bg-red-500/10" };
    if (item.stockActuel <= item.seuilCritique) return { label: "Critique", color: "text-orange-600", bgColor: "bg-orange-500/10" };
    if (item.stockActuel <= item.seuilAlerte) return { label: "Alerte", color: "text-amber-600", bgColor: "bg-amber-500/10" };
    return { label: "OK", color: "text-green-600", bgColor: "bg-green-500/10" };
  };

  const handleMovement = () => {
    if (!selectedItem || !movementQuantity) return;
    
    const qty = parseInt(movementQuantity);
    const newStock = movementType === "entree" 
      ? selectedItem.stockActuel + qty 
      : Math.max(0, selectedItem.stockActuel - qty);
    
    setStockItems(stockItems.map(i => 
      i.id === selectedItem.id ? { ...i, stockActuel: newStock, dernierMouvement: new Date().toISOString().split('T')[0] } : i
    ));
    
    setShowMovementDialog(false);
    setMovementQuantity("");
    setSelectedItem(null);
  };

  const handleToggleAutoReappro = (itemId: string) => {
    setStockItems(stockItems.map(i => 
      i.id === itemId ? { ...i, autoReappro: !i.autoReappro } : i
    ));
  };

  const handleManualReappro = () => {
    if (!selectedItem) return;
    
    const newOrder: ReapproOrder = {
      id: `${Date.now()}`,
      produitId: selectedItem.id,
      produitNom: selectedItem.nom,
      quantite: selectedItem.stockOptimal - selectedItem.stockActuel,
      fournisseur: selectedItem.fournisseur,
      statut: "pending",
      dateCommande: new Date().toISOString().split('T')[0],
      dateEstimee: new Date(Date.now() + selectedItem.delaiReappro * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      type: "manuel",
    };
    
    setReapproOrders([newOrder, ...reapproOrders]);
    setShowReapproDialog(false);
    setSelectedItem(null);
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalProduits}</p>
                <p className="text-sm text-muted-foreground">Références</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Valeur: {(stats.valeurStock / 1000000).toFixed(1)}M FCFA
            </p>
          </CardContent>
        </Card>

        <Card className={cn(stats.enRupture > 0 && "border-red-500/50")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.enRupture}</p>
                <p className="text-sm text-muted-foreground">En rupture</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(stats.alerteBasse > 0 && "border-amber-500/50")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{stats.alerteBasse}</p>
                <p className="text-sm text-muted-foreground">Stock bas</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              dont {stats.alerteCritique} critique(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Zap className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.autoReapproActif}</p>
                <p className="text-sm text-muted-foreground">Auto-réappro</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.commandesEnCours} commande(s) en cours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertes urgentes */}
      {(stats.enRupture > 0 || stats.alerteCritique > 0) && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-700">Alertes stock urgentes</p>
                <div className="mt-2 space-y-1">
                  {stockItems.filter(i => i.stockActuel === 0).map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span>{item.image}</span>
                        <span className="font-medium">{item.nom}</span>
                        <Badge variant="destructive" className="text-xs">RUPTURE</Badge>
                      </span>
                      <Button size="sm" variant="outline" onClick={() => { setSelectedItem(item); setShowReapproDialog(true); }}>
                        Commander
                      </Button>
                    </div>
                  ))}
                  {stockItems.filter(i => i.stockActuel > 0 && i.stockActuel <= i.seuilCritique).map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span>{item.image}</span>
                        <span className="font-medium">{item.nom}</span>
                        <Badge className="bg-orange-500/10 text-orange-600 text-xs">Critique: {item.stockActuel} {item.unite}(s)</Badge>
                      </span>
                      <Button size="sm" variant="outline" onClick={() => { setSelectedItem(item); setShowReapproDialog(true); }}>
                        Commander
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="stock" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stock" className="gap-2">
            <Package className="w-4 h-4" />
            Stock
          </TabsTrigger>
          <TabsTrigger value="mouvements" className="gap-2">
            <History className="w-4 h-4" />
            Mouvements
          </TabsTrigger>
          <TabsTrigger value="reappro" className="gap-2">
            <Truck className="w-4 h-4" />
            Réapprovisionnements
            {stats.commandesEnCours > 0 && (
              <Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                {stats.commandesEnCours}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="parametres" className="gap-2">
            <Settings className="w-4 h-4" />
            Paramètres
          </TabsTrigger>
        </TabsList>

        {/* Onglet Stock */}
        <TabsContent value="stock" className="space-y-4">
          {/* Toolbar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom ou SKU..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="w-full lg:w-[180px]">
                    <SelectValue placeholder="Niveau stock" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les niveaux</SelectItem>
                    <SelectItem value="rupture">En rupture</SelectItem>
                    <SelectItem value="critique">Critique</SelectItem>
                    <SelectItem value="alerte">Alerte</SelectItem>
                    <SelectItem value="ok">Stock OK</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des produits */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead className="text-center">Seuils</TableHead>
                  <TableHead className="text-center">Statut</TableHead>
                  <TableHead className="text-center">Auto-réappro</TableHead>
                  <TableHead className="text-center">Tendance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const status = getStockStatus(item);
                  const stockPercentage = Math.min(100, (item.stockActuel / item.stockOptimal) * 100);
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.image}</span>
                          <div>
                            <p className="font-medium">{item.nom}</p>
                            <p className="text-xs text-muted-foreground">{item.categorie}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                      <TableCell className="text-center">
                        <div className="space-y-1">
                          <p className="font-bold">{item.stockActuel} <span className="text-muted-foreground font-normal text-xs">{item.unite}</span></p>
                          <Progress value={stockPercentage} className="h-1.5 w-20 mx-auto" />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="text-xs space-y-0.5">
                          <p><span className="text-amber-500">⚠</span> {item.seuilAlerte}</p>
                          <p><span className="text-red-500">🔴</span> {item.seuilCritique}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn(status.bgColor, status.color, "border-0")}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={item.autoReappro}
                          onCheckedChange={() => handleToggleAutoReappro(item.id)}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        {item.tendance === "up" && <TrendingUp className="w-4 h-4 text-green-500 mx-auto" />}
                        {item.tendance === "down" && <TrendingDown className="w-4 h-4 text-red-500 mx-auto" />}
                        {item.tendance === "stable" && <Minus className="w-4 h-4 text-muted-foreground mx-auto" />}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => { setSelectedItem(item); setMovementType("entree"); setShowMovementDialog(true); }}
                            title="Entrée stock"
                          >
                            <Plus className="w-4 h-4 text-green-500" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => { setSelectedItem(item); setMovementType("sortie"); setShowMovementDialog(true); }}
                            title="Sortie stock"
                          >
                            <Minus className="w-4 h-4 text-red-500" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => { setSelectedItem(item); setShowSettingsDialog(true); }}
                            title="Paramètres"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => { setSelectedItem(item); setShowReapproDialog(true); }}
                            title="Commander"
                          >
                            <Truck className="w-4 h-4 text-primary" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Onglet Mouvements */}
        <TabsContent value="mouvements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historique des mouvements</CardTitle>
              <CardDescription>Suivi des entrées, sorties et ajustements de stock</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-center">Quantité</TableHead>
                    <TableHead>Motif</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead>Par</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((mvt) => {
                    const typeConfig = movementTypeConfig[mvt.type];
                    const TypeIcon = typeConfig.icon;
                    
                    return (
                      <TableRow key={mvt.id}>
                        <TableCell className="text-sm">{mvt.date}</TableCell>
                        <TableCell className="font-medium">{mvt.produitNom}</TableCell>
                        <TableCell>
                          <Badge className={cn(typeConfig.bgColor, typeConfig.color, "border-0 gap-1")}>
                            <TypeIcon className="w-3 h-3" />
                            {typeConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-mono">
                          <span className={cn(
                            mvt.type === "entree" || mvt.type === "retour" ? "text-green-600" : "text-red-600"
                          )}>
                            {mvt.type === "entree" || mvt.type === "retour" ? "+" : ""}{mvt.quantite}
                          </span>
                        </TableCell>
                        <TableCell>{mvt.motif}</TableCell>
                        <TableCell className="font-mono text-xs">{mvt.reference}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{mvt.utilisateur}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Réapprovisionnements */}
        <TabsContent value="reappro" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Commandes de réapprovisionnement</CardTitle>
                  <CardDescription>Suivi des commandes automatiques et manuelles</CardDescription>
                </div>
                <Button onClick={() => setShowReapproDialog(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Nouvelle commande
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead className="text-center">Quantité</TableHead>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date commande</TableHead>
                    <TableHead>Livraison estimée</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reapproOrders.map((order) => {
                    const status = statusConfig[order.statut];
                    const StatusIcon = status.icon;
                    
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.produitNom}</TableCell>
                        <TableCell className="text-center font-mono">{order.quantite}</TableCell>
                        <TableCell>{order.fournisseur}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={order.type === "auto" ? "border-green-500 text-green-600" : ""}>
                            {order.type === "auto" ? <Zap className="w-3 h-3 mr-1" /> : null}
                            {order.type === "auto" ? "Auto" : "Manuel"}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.dateCommande}</TableCell>
                        <TableCell>{order.dateEstimee}</TableCell>
                        <TableCell>
                          <Badge className={cn(status.bgColor, status.color, "border-0 gap-1")}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {order.statut === "shipped" && (
                              <Button variant="outline" size="sm" onClick={() => {
                                setReapproOrders(reapproOrders.map(o => 
                                  o.id === order.id ? { ...o, statut: "received" } : o
                                ));
                              }}>
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Réceptionner
                              </Button>
                            )}
                            {order.statut === "pending" && (
                              <Button variant="ghost" size="icon" className="text-red-500" onClick={() => {
                                setReapproOrders(reapproOrders.map(o => 
                                  o.id === order.id ? { ...o, statut: "cancelled" } : o
                                ));
                              }}>
                                <XCircle className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Paramètres */}
        <TabsContent value="parametres" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Réapprovisionnement automatique
                </CardTitle>
                <CardDescription>Configuration globale de l'auto-réappro</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Activer l'auto-réapprovisionnement</p>
                    <p className="text-sm text-muted-foreground">Déclenche les commandes automatiquement</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Seuil de déclenchement</p>
                    <p className="text-sm text-muted-foreground">Commander quand stock ≤ seuil alerte</p>
                  </div>
                  <Select defaultValue="alerte">
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alerte">Seuil alerte</SelectItem>
                      <SelectItem value="critique">Seuil critique</SelectItem>
                      <SelectItem value="custom">Personnalisé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Quantité à commander</p>
                    <p className="text-sm text-muted-foreground">Atteindre le stock optimal</p>
                  </div>
                  <Select defaultValue="optimal">
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="optimal">Stock optimal</SelectItem>
                      <SelectItem value="double">2x seuil</SelectItem>
                      <SelectItem value="fixed">Quantité fixe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Notifications
                </CardTitle>
                <CardDescription>Alertes stock et réapprovisionnement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>Email alerte stock bas</span>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>Email rupture de stock</span>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <span>SMS urgences</span>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    <span>Notification app</span>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Mouvement Stock */}
      <Dialog open={showMovementDialog} onOpenChange={setShowMovementDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {movementType === "entree" ? "Entrée de stock" : "Sortie de stock"}
            </DialogTitle>
            <DialogDescription>
              {selectedItem?.nom} - Stock actuel: {selectedItem?.stockActuel} {selectedItem?.unite}(s)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Quantité</Label>
              <Input
                type="number"
                min="1"
                value={movementQuantity}
                onChange={(e) => setMovementQuantity(e.target.value)}
                placeholder="Quantité..."
              />
            </div>
            {movementType === "entree" && (
              <div className="p-3 bg-green-500/10 rounded-lg text-sm">
                <p className="font-medium text-green-700">Nouveau stock: {selectedItem ? selectedItem.stockActuel + (parseInt(movementQuantity) || 0) : 0} {selectedItem?.unite}(s)</p>
              </div>
            )}
            {movementType === "sortie" && (
              <div className="p-3 bg-red-500/10 rounded-lg text-sm">
                <p className="font-medium text-red-700">Nouveau stock: {selectedItem ? Math.max(0, selectedItem.stockActuel - (parseInt(movementQuantity) || 0)) : 0} {selectedItem?.unite}(s)</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMovementDialog(false)}>Annuler</Button>
            <Button onClick={handleMovement} disabled={!movementQuantity}>
              {movementType === "entree" ? <Plus className="w-4 h-4 mr-1" /> : <Minus className="w-4 h-4 mr-1" />}
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Paramètres Produit */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Paramètres stock - {selectedItem?.nom}</DialogTitle>
            <DialogDescription>Configurez les seuils et le réapprovisionnement</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Seuil d'alerte</Label>
                <Input type="number" defaultValue={selectedItem?.seuilAlerte} />
              </div>
              <div className="space-y-2">
                <Label>Seuil critique</Label>
                <Input type="number" defaultValue={selectedItem?.seuilCritique} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Stock optimal</Label>
              <Input type="number" defaultValue={selectedItem?.stockOptimal} />
            </div>
            <div className="space-y-2">
              <Label>Fournisseur principal</Label>
              <Input defaultValue={selectedItem?.fournisseur} />
            </div>
            <div className="space-y-2">
              <Label>Délai de réapprovisionnement (jours)</Label>
              <Input type="number" defaultValue={selectedItem?.delaiReappro} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Réapprovisionnement automatique</p>
                <p className="text-sm text-muted-foreground">Commander automatiquement sous le seuil</p>
              </div>
              <Switch defaultChecked={selectedItem?.autoReappro} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>Annuler</Button>
            <Button onClick={() => setShowSettingsDialog(false)}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Réapprovisionnement */}
      <Dialog open={showReapproDialog} onOpenChange={setShowReapproDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Commander du stock</DialogTitle>
            <DialogDescription>
              {selectedItem ? `${selectedItem.nom} - Stock actuel: ${selectedItem.stockActuel}` : "Sélectionnez un produit"}
            </DialogDescription>
          </DialogHeader>
          {selectedItem ? (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-muted-foreground">Fournisseur:</p>
                  <p className="font-medium">{selectedItem.fournisseur}</p>
                  <p className="text-muted-foreground">Délai estimé:</p>
                  <p className="font-medium">{selectedItem.delaiReappro} jours</p>
                  <p className="text-muted-foreground">Stock optimal:</p>
                  <p className="font-medium">{selectedItem.stockOptimal} {selectedItem.unite}(s)</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Quantité à commander</Label>
                <Input 
                  type="number" 
                  defaultValue={selectedItem.stockOptimal - selectedItem.stockActuel}
                />
                <p className="text-xs text-muted-foreground">
                  Suggestion: {selectedItem.stockOptimal - selectedItem.stockActuel} {selectedItem.unite}(s) pour atteindre le stock optimal
                </p>
              </div>
              <div className="p-3 bg-primary/5 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Coût estimé:</span>{" "}
                  {((selectedItem.stockOptimal - selectedItem.stockActuel) * selectedItem.prixAchat).toLocaleString()} FCFA
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Sélectionner un produit</Label>
              <Select onValueChange={(val) => setSelectedItem(stockItems.find(i => i.id === val) || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un produit..." />
                </SelectTrigger>
                <SelectContent>
                  {stockItems.map(item => (
                    <SelectItem key={item.id} value={item.id}>{item.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowReapproDialog(false); setSelectedItem(null); }}>Annuler</Button>
            <Button onClick={handleManualReappro} disabled={!selectedItem}>
              <Truck className="w-4 h-4 mr-1" />
              Commander
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
