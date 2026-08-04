import { useState, useEffect, useCallback } from "react";
import { stockApi, type StockVendorKpis, type StockAlerteUrgente, type StockVendorItem as StockVendorItemAPI, type StockVendorMovementApi, type ReplenishmentOrderApi } from "@/lib/api";

const THRESHOLD_TO_API: Record<string, string> = { alerte: "alert", critique: "critical", custom: "custom" };
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
  productId: string;
  variantId: string | null;
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

function mapStockItem(it: StockVendorItemAPI): StockItem {
  return {
    id: it.id,
    productId: it.productId,
    variantId: it.variantId,
    nom: it.nom,
    sku: it.sku,
    categorie: it.categorie,
    stockActuel: it.stockActuel,
    seuilAlerte: it.seuilAlerte,
    seuilCritique: it.seuilCritique,
    stockOptimal: it.stockOptimal,
    unite: it.unite,
    prixAchat: it.prixAchat,
    fournisseur: it.fournisseur,
    delaiReappro: it.delaiReappro,
    autoReappro: it.autoReappro,
    dernierMouvement: it.dernierMouvement ?? "",
    tendance: (it.tendance === "up" || it.tendance === "down") ? it.tendance : "stable",
    image: it.image || "",
  };
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

const MOVEMENT_TYPES = ["entree", "sortie", "ajustement", "retour"] as const;

function mapMovement(m: StockVendorMovementApi): StockMovement {
  return {
    id: m.id,
    produitId: m.produitId,
    produitNom: m.produitNom,
    type: (MOVEMENT_TYPES as readonly string[]).includes(m.type) ? (m.type as StockMovement["type"]) : "ajustement",
    quantite: m.quantite,
    motif: m.motif,
    reference: m.reference,
    date: m.date,
    utilisateur: m.utilisateur,
  };
}

const REAPPRO_STATUSES = ["pending", "confirmed", "shipped", "received", "cancelled"] as const;
const REAPPRO_TYPES = ["auto", "manuel"] as const;

function mapReplenishment(o: ReplenishmentOrderApi): ReapproOrder {
  return {
    id: o.id,
    produitId: o.produitId,
    produitNom: o.produitNom,
    quantite: o.quantite,
    fournisseur: o.fournisseur,
    statut: (REAPPRO_STATUSES as readonly string[]).includes(o.statut) ? (o.statut as ReapproOrder["statut"]) : "pending",
    dateCommande: o.dateCommande,
    dateEstimee: o.dateEstimee,
    type: (REAPPRO_TYPES as readonly string[]).includes(o.type) ? (o.type as ReapproOrder["type"]) : "manuel",
  };
}

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
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoadingMovements, setIsLoadingMovements] = useState(true);
  const [movementsError, setMovementsError] = useState<string | null>(null);
  const [reapproOrders, setReapproOrders] = useState<ReapproOrder[]>([]);
  const [isLoadingReappro, setIsLoadingReappro] = useState(true);
  const [reapproListError, setReapproListError] = useState<string | null>(null);
  const [reapproActionId, setReapproActionId] = useState<string | null>(null);

  // Paramètres globaux stock
  const [globalSettings, setGlobalSettings] = useState({
    autoReapproGlobal: true,
    seuilDeclenchement: "alerte",
    quantiteCommande: "optimal",
    quantiteFixe: "",
    emailStockBas: true,
    emailRupture: true,
    smsUrgences: false,
    notificationApp: true,
  });
  const [isLoadingGlobalSettings, setIsLoadingGlobalSettings] = useState(true);
  const [isSavingGlobalSettings, setIsSavingGlobalSettings] = useState(false);
  const [globalSettingsError, setGlobalSettingsError] = useState<string | null>(null);
  const [globalSettingsSaved, setGlobalSettingsSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [showMovementDialog, setShowMovementDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showReapproDialog, setShowReapproDialog] = useState(false);
  const [movementType, setMovementType] = useState<"entree" | "sortie">("entree");
  const [movementQuantity, setMovementQuantity] = useState("");
  const [isSubmittingMovement, setIsSubmittingMovement] = useState(false);
  const [movementError, setMovementError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [settingsForm, setSettingsForm] = useState({
    seuilAlerte: "",
    seuilCritique: "",
    stockOptimal: "",
    fournisseur: "",
    delaiReappro: "",
    prixAchat: "",
    autoReappro: false,
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const [reapproQuantity, setReapproQuantity] = useState("");
  const [isSubmittingReappro, setIsSubmittingReappro] = useState(false);
  const [reapproError, setReapproError] = useState<string | null>(null);

  // KPIs et alertes urgentes (API réelle)
  const [apiKpis, setApiKpis] = useState<StockVendorKpis | null>(null);
  const [alertesUrgentes, setAlertesUrgentes] = useState<StockAlerteUrgente[]>([]);
  const [isLoadingKpis, setIsLoadingKpis] = useState(true);

  const fetchDashboard = useCallback(() => {
    setIsLoadingKpis(true);
    stockApi.getVendorDashboard({ search: searchQuery || undefined, level: stockFilter })
      .then((res) => {
        setApiKpis(res.kpis);
        setAlertesUrgentes(res.alertesUrgentes ?? []);
      })
      .catch(() => {})
      .finally(() => setIsLoadingKpis(false));
  }, [searchQuery, stockFilter]);

  const fetchItems = useCallback(() => {
    setIsLoadingItems(true);
    setItemsError(null);
    stockApi.getVendorItems({ search: searchQuery || undefined, level: stockFilter })
      .then((res) => setStockItems(res.items.map(mapStockItem)))
      .catch(() => setItemsError("Impossible de charger le stock."))
      .finally(() => setIsLoadingItems(false));
  }, [searchQuery, stockFilter]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchDashboard();
      fetchItems();
    }, 350);
    return () => clearTimeout(t);
  }, [fetchDashboard, fetchItems]);

  const fetchMovements = useCallback(() => {
    setIsLoadingMovements(true);
    setMovementsError(null);
    stockApi.getVendorMovements({ limit: 50 })
      .then((res) => setMovements(res.movements.map(mapMovement)))
      .catch(() => setMovementsError("Impossible de charger l'historique des mouvements."))
      .finally(() => setIsLoadingMovements(false));
  }, []);

  useEffect(() => { fetchMovements(); }, [fetchMovements]);

  const fetchReappro = useCallback(() => {
    setIsLoadingReappro(true);
    setReapproListError(null);
    stockApi.getVendorReplenishments()
      .then((res) => setReapproOrders(res.orders.map(mapReplenishment)))
      .catch(() => setReapproListError("Impossible de charger les commandes de réapprovisionnement."))
      .finally(() => setIsLoadingReappro(false));
  }, []);

  useEffect(() => { fetchReappro(); }, [fetchReappro]);

  const handleConfirmReappro = async (order: ReapproOrder) => {
    setReapproActionId(order.id);
    try {
      await stockApi.confirmReplenishment(order.id);
      fetchReappro();
    } catch {
      // silencieux
    } finally {
      setReapproActionId(null);
    }
  };

  const handleShipReappro = async (order: ReapproOrder) => {
    setReapproActionId(order.id);
    try {
      await stockApi.shipReplenishment(order.id);
      fetchReappro();
    } catch {
      // silencieux
    } finally {
      setReapproActionId(null);
    }
  };

  const handleReceiveReappro = async (order: ReapproOrder) => {
    setReapproActionId(order.id);
    try {
      await stockApi.receiveReplenishment(order.id);
      fetchReappro();
      fetchItems();
      fetchDashboard();
      fetchMovements();
    } catch {
      // silencieux
    } finally {
      setReapproActionId(null);
    }
  };

  const handleCancelReappro = async (order: ReapproOrder) => {
    setReapproActionId(order.id);
    try {
      await stockApi.cancelReplenishment(order.id);
      fetchReappro();
    } catch {
      // silencieux
    } finally {
      setReapproActionId(null);
    }
  };

  const fetchGlobalSettings = useCallback(() => {
    setIsLoadingGlobalSettings(true);
    stockApi.getVendorSettings()
      .then((res) => {
        const s = res.settings;
        setGlobalSettings({
          autoReapproGlobal: s.autoReapproGlobal,
          seuilDeclenchement: s.seuilDeclenchement || "alerte",
          quantiteCommande: s.quantiteCommande || "optimal",
          quantiteFixe: s.quantiteFixe != null ? String(s.quantiteFixe) : "",
          emailStockBas: s.notifications?.emailStockBas ?? true,
          emailRupture: s.notifications?.emailRupture ?? true,
          smsUrgences: s.notifications?.smsUrgences ?? false,
          notificationApp: s.notifications?.notificationApp ?? true,
        });
      })
      .catch(() => {})
      .finally(() => setIsLoadingGlobalSettings(false));
  }, []);

  useEffect(() => { fetchGlobalSettings(); }, [fetchGlobalSettings]);

  const handleSaveGlobalSettings = async () => {
    setIsSavingGlobalSettings(true);
    setGlobalSettingsError(null);
    setGlobalSettingsSaved(false);
    try {
      await stockApi.updateVendorSettings({
        autoReplenishmentEnabled: globalSettings.autoReapproGlobal,
        triggerThreshold: THRESHOLD_TO_API[globalSettings.seuilDeclenchement] ?? globalSettings.seuilDeclenchement,
        orderQuantityMode: globalSettings.quantiteCommande,
        fixedOrderQuantity: globalSettings.quantiteCommande === "fixed"
          ? (parseInt(globalSettings.quantiteFixe, 10) || undefined)
          : undefined,
        emailLowStock: globalSettings.emailStockBas,
        emailOutOfStock: globalSettings.emailRupture,
        smsUrgency: globalSettings.smsUrgences,
        appNotification: globalSettings.notificationApp,
      });
      setGlobalSettingsSaved(true);
    } catch (e) {
      setGlobalSettingsError(e instanceof Error ? e.message : "Erreur lors de l'enregistrement des paramètres.");
    } finally {
      setIsSavingGlobalSettings(false);
    }
  };

  const stats = apiKpis ?? {
    totalProduits: 0,
    enRupture: 0,
    alerteBasse: 0,
    alerteCritique: 0,
    autoReapproActif: 0,
    commandesEnCours: 0,
    valeurStock: 0,
  };

  const filteredItems = stockItems;

  const getStockStatus = (item: StockItem) => {
    if (item.stockActuel === 0) return { label: "Rupture", color: "text-red-600", bgColor: "bg-red-500/10" };
    if (item.stockActuel <= item.seuilCritique) return { label: "Critique", color: "text-orange-600", bgColor: "bg-orange-500/10" };
    if (item.stockActuel <= item.seuilAlerte) return { label: "Alerte", color: "text-amber-600", bgColor: "bg-amber-500/10" };
    return { label: "OK", color: "text-green-600", bgColor: "bg-green-500/10" };
  };

  const handleMovement = async () => {
    if (!selectedItem || !movementQuantity) return;
    const qty = parseInt(movementQuantity, 10);
    if (isNaN(qty) || qty <= 0) return;
    setIsSubmittingMovement(true);
    setMovementError(null);
    try {
      await stockApi.recordMovement({
        productId: selectedItem.productId,
        variantId: selectedItem.variantId ?? undefined,
        type: movementType,
        quantity: qty,
        reason: movementType === "entree" ? "Entrée manuelle" : "Sortie manuelle",
      });
      setShowMovementDialog(false);
      setMovementQuantity("");
      setSelectedItem(null);
      fetchItems();
      fetchDashboard();
      fetchMovements();
    } catch (e) {
      setMovementError(e instanceof Error ? e.message : "Erreur lors de l'enregistrement du mouvement.");
    } finally {
      setIsSubmittingMovement(false);
    }
  };

  const handleToggleAutoReappro = async (item: StockItem) => {
    const next = !item.autoReappro;
    setTogglingId(item.id);
    setStockItems(prev => prev.map(i => i.id === item.id ? { ...i, autoReappro: next } : i));
    try {
      await stockApi.toggleAutoReappro(item.productId, next, item.variantId ?? undefined);
      fetchDashboard();
    } catch {
      setStockItems(prev => prev.map(i => i.id === item.id ? { ...i, autoReappro: !next } : i));
    } finally {
      setTogglingId(null);
    }
  };

  const openSettingsDialog = (item: StockItem) => {
    setSelectedItem(item);
    setSettingsForm({
      seuilAlerte: String(item.seuilAlerte),
      seuilCritique: String(item.seuilCritique),
      stockOptimal: String(item.stockOptimal),
      fournisseur: item.fournisseur,
      delaiReappro: String(item.delaiReappro),
      prixAchat: String(item.prixAchat),
      autoReappro: item.autoReappro,
    });
    setSettingsError(null);
    setShowSettingsDialog(true);
  };

  const handleSaveSettings = async () => {
    if (!selectedItem) return;
    setIsSavingSettings(true);
    setSettingsError(null);
    try {
      await stockApi.updateSettings(selectedItem.productId, {
        alertThreshold: parseInt(settingsForm.seuilAlerte, 10) || 0,
        criticalThreshold: parseInt(settingsForm.seuilCritique, 10) || 0,
        optimalStock: parseInt(settingsForm.stockOptimal, 10) || 0,
        supplierName: settingsForm.fournisseur || undefined,
        replenishmentDelayDays: parseInt(settingsForm.delaiReappro, 10) || undefined,
        purchasePrice: parseFloat(settingsForm.prixAchat) || undefined,
        autoReplenishment: settingsForm.autoReappro,
      }, selectedItem.variantId ?? undefined);
      setShowSettingsDialog(false);
      setSelectedItem(null);
      fetchItems();
      fetchDashboard();
    } catch (e) {
      setSettingsError(e instanceof Error ? e.message : "Erreur lors de l'enregistrement.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const openReapproDialog = (item: StockItem | null) => {
    setSelectedItem(item);
    setReapproQuantity(item ? String(Math.max(0, item.stockOptimal - item.stockActuel)) : "");
    setReapproError(null);
    setShowReapproDialog(true);
  };

  const handleManualReappro = async () => {
    if (!selectedItem || !reapproQuantity) return;
    const qty = parseInt(reapproQuantity, 10);
    if (isNaN(qty) || qty <= 0) return;
    setIsSubmittingReappro(true);
    setReapproError(null);
    try {
      await stockApi.createReplenishment({
        productId: selectedItem.productId,
        variantId: selectedItem.variantId ?? undefined,
        quantity: qty,
      });
      setShowReapproDialog(false);
      setSelectedItem(null);
      setReapproQuantity("");
      fetchReappro();
      fetchDashboard();
    } catch (e) {
      setReapproError(e instanceof Error ? e.message : "Erreur lors de la commande.");
    } finally {
      setIsSubmittingReappro(false);
    }
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
                <p className="text-2xl font-bold">{isLoadingKpis ? "…" : stats.totalProduits}</p>
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
                <p className="text-2xl font-bold text-red-600">{isLoadingKpis ? "…" : stats.enRupture}</p>
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
                <p className="text-2xl font-bold text-amber-600">{isLoadingKpis ? "…" : stats.alerteBasse}</p>
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
                <p className="text-2xl font-bold">{isLoadingKpis ? "…" : stats.autoReapproActif}</p>
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
                {alertesUrgentes.length > 0 ? (
                  <div className="mt-2 space-y-1">
                    {alertesUrgentes.map((alerte, idx) => {
                      const isRupture = alerte.niveau ? alerte.niveau === "rupture" : (alerte.stockActuel ?? 0) === 0;
                      const matched = stockItems.find(i => i.nom === alerte.nom || i.id === alerte.productId);
                      return (
                        <div key={alerte.id ?? idx} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <span>{alerte.image ?? "📦"}</span>
                            <span className="font-medium">{alerte.nom ?? "Produit"}</span>
                            {isRupture ? (
                              <Badge variant="destructive" className="text-xs">RUPTURE</Badge>
                            ) : (
                              <Badge className="bg-orange-500/10 text-orange-600 text-xs">
                                Critique: {alerte.stockActuel} {alerte.unite ?? ""}(s)
                              </Badge>
                            )}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openReapproDialog(matched ?? null)}
                          >
                            Commander
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    {stats.enRupture} rupture(s) et {stats.alerteCritique} produit(s) en stock critique
                  </p>
                )}
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
          {isLoadingItems ? (
            <div className="flex items-center justify-center h-40">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="ml-3 text-muted-foreground">Chargement du stock...</span>
            </div>
          ) : itemsError ? (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive opacity-70" />
                <h3 className="font-semibold mb-2">Erreur de chargement</h3>
                <p className="text-sm text-muted-foreground mb-4">{itemsError}</p>
                <Button variant="outline" onClick={fetchItems}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Réessayer
                </Button>
              </CardContent>
            </Card>
          ) : filteredItems.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-semibold mb-2">Aucun article en stock</h3>
                <p className="text-sm text-muted-foreground">
                  Aucun article ne correspond à vos critères.
                </p>
              </CardContent>
            </Card>
          ) : (
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
                  const stockPercentage = item.stockOptimal > 0 ? Math.min(100, (item.stockActuel / item.stockOptimal) * 100) : 0;
                  const hasPhoto = /^https?:\/\//.test(item.image);

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {hasPhoto ? (
                            <img src={item.image} alt={item.nom} className="w-9 h-9 rounded object-cover shrink-0" />
                          ) : (
                            <span className="text-2xl">📦</span>
                          )}
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
                          disabled={togglingId === item.id}
                          onCheckedChange={() => handleToggleAutoReappro(item)}
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
                            onClick={() => { setSelectedItem(item); setMovementType("entree"); setMovementQuantity(""); setMovementError(null); setShowMovementDialog(true); }}
                            title="Entrée stock"
                          >
                            <Plus className="w-4 h-4 text-green-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setSelectedItem(item); setMovementType("sortie"); setMovementQuantity(""); setMovementError(null); setShowMovementDialog(true); }}
                            title="Sortie stock"
                          >
                            <Minus className="w-4 h-4 text-red-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openSettingsDialog(item)}
                            title="Paramètres"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openReapproDialog(item)}
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
          )}
        </TabsContent>

        {/* Onglet Mouvements */}
        <TabsContent value="mouvements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historique des mouvements</CardTitle>
              <CardDescription>Suivi des entrées, sorties et ajustements de stock</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingMovements ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Chargement des mouvements...
                </div>
              ) : movementsError ? (
                <div className="py-12 text-center">
                  <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-destructive opacity-70" />
                  <p className="text-sm text-muted-foreground mb-4">{movementsError}</p>
                  <Button variant="outline" onClick={fetchMovements}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Réessayer
                  </Button>
                </div>
              ) : movements.length === 0 ? (
                <div className="py-12 text-center">
                  <History className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">Aucun mouvement de stock enregistré.</p>
                </div>
              ) : (
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
                        <TableCell className="font-mono text-xs">{mvt.reference || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{mvt.utilisateur}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              )}
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
                <Button onClick={() => openReapproDialog(null)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Nouvelle commande
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingReappro ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Chargement des commandes...
                </div>
              ) : reapproListError ? (
                <div className="py-12 text-center">
                  <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-destructive opacity-70" />
                  <p className="text-sm text-muted-foreground mb-4">{reapproListError}</p>
                  <Button variant="outline" onClick={fetchReappro}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Réessayer
                  </Button>
                </div>
              ) : reapproOrders.length === 0 ? (
                <div className="py-12 text-center">
                  <Truck className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">Aucune commande de réapprovisionnement.</p>
                </div>
              ) : (
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
                    const busy = reapproActionId === order.id;

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
                            {order.statut === "pending" && (
                              <Button variant="outline" size="sm" disabled={busy} onClick={() => handleConfirmReappro(order)}>
                                {busy ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                                Confirmer
                              </Button>
                            )}
                            {order.statut === "confirmed" && (
                              <Button variant="outline" size="sm" disabled={busy} onClick={() => handleShipReappro(order)}>
                                {busy ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Truck className="w-4 h-4 mr-1" />}
                                Marquer expédiée
                              </Button>
                            )}
                            {order.statut === "shipped" && (
                              <Button variant="outline" size="sm" disabled={busy} onClick={() => handleReceiveReappro(order)}>
                                {busy ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                                Réceptionner
                              </Button>
                            )}
                            {order.statut === "pending" && (
                              <Button variant="ghost" size="icon" className="text-red-500" disabled={busy} onClick={() => handleCancelReappro(order)}>
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Paramètres */}
        <TabsContent value="parametres" className="space-y-4">
          {isLoadingGlobalSettings ? (
            <div className="flex items-center justify-center h-40">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="ml-3 text-muted-foreground">Chargement des paramètres...</span>
            </div>
          ) : (
          <>
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
                  <Switch
                    checked={globalSettings.autoReapproGlobal}
                    onCheckedChange={(checked) => setGlobalSettings({ ...globalSettings, autoReapproGlobal: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Seuil de déclenchement</p>
                    <p className="text-sm text-muted-foreground">Commander quand stock ≤ seuil alerte</p>
                  </div>
                  <Select
                    value={globalSettings.seuilDeclenchement}
                    onValueChange={(v) => setGlobalSettings({ ...globalSettings, seuilDeclenchement: v })}
                  >
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
                  <Select
                    value={globalSettings.quantiteCommande}
                    onValueChange={(v) => setGlobalSettings({ ...globalSettings, quantiteCommande: v })}
                  >
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
                {globalSettings.quantiteCommande === "fixed" && (
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Quantité fixe</p>
                    <Input
                      type="number"
                      className="w-[140px]"
                      value={globalSettings.quantiteFixe}
                      onChange={(e) => setGlobalSettings({ ...globalSettings, quantiteFixe: e.target.value })}
                    />
                  </div>
                )}
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
                  <Switch
                    checked={globalSettings.emailStockBas}
                    onCheckedChange={(checked) => setGlobalSettings({ ...globalSettings, emailStockBas: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>Email rupture de stock</span>
                  </div>
                  <Switch
                    checked={globalSettings.emailRupture}
                    onCheckedChange={(checked) => setGlobalSettings({ ...globalSettings, emailRupture: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <span>SMS urgences</span>
                  </div>
                  <Switch
                    checked={globalSettings.smsUrgences}
                    onCheckedChange={(checked) => setGlobalSettings({ ...globalSettings, smsUrgences: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    <span>Notification app</span>
                  </div>
                  <Switch
                    checked={globalSettings.notificationApp}
                    onCheckedChange={(checked) => setGlobalSettings({ ...globalSettings, notificationApp: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {globalSettingsError && (
            <div className="p-3 rounded-lg bg-destructive/10 text-sm text-destructive">
              {globalSettingsError}
            </div>
          )}
          {globalSettingsSaved && !globalSettingsError && (
            <div className="p-3 rounded-lg bg-green-500/10 text-sm text-green-700">
              Paramètres enregistrés avec succès.
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSaveGlobalSettings} disabled={isSavingGlobalSettings}>
              {isSavingGlobalSettings ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
              Enregistrer les paramètres
            </Button>
          </div>
          </>
          )}
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
            {movementError && (
              <div className="p-3 rounded-lg bg-destructive/10 text-sm text-destructive">
                {movementError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMovementDialog(false)} disabled={isSubmittingMovement}>Annuler</Button>
            <Button onClick={handleMovement} disabled={!movementQuantity || isSubmittingMovement}>
              {isSubmittingMovement ? (
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
              ) : movementType === "entree" ? (
                <Plus className="w-4 h-4 mr-1" />
              ) : (
                <Minus className="w-4 h-4 mr-1" />
              )}
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
                <Input
                  type="number"
                  value={settingsForm.seuilAlerte}
                  onChange={(e) => setSettingsForm({ ...settingsForm, seuilAlerte: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Seuil critique</Label>
                <Input
                  type="number"
                  value={settingsForm.seuilCritique}
                  onChange={(e) => setSettingsForm({ ...settingsForm, seuilCritique: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Stock optimal</Label>
              <Input
                type="number"
                value={settingsForm.stockOptimal}
                onChange={(e) => setSettingsForm({ ...settingsForm, stockOptimal: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Prix d'achat (FCFA)</Label>
              <Input
                type="number"
                value={settingsForm.prixAchat}
                onChange={(e) => setSettingsForm({ ...settingsForm, prixAchat: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Fournisseur principal</Label>
              <Input
                value={settingsForm.fournisseur}
                onChange={(e) => setSettingsForm({ ...settingsForm, fournisseur: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Délai de réapprovisionnement (jours)</Label>
              <Input
                type="number"
                value={settingsForm.delaiReappro}
                onChange={(e) => setSettingsForm({ ...settingsForm, delaiReappro: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Réapprovisionnement automatique</p>
                <p className="text-sm text-muted-foreground">Commander automatiquement sous le seuil</p>
              </div>
              <Switch
                checked={settingsForm.autoReappro}
                onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, autoReappro: checked })}
              />
            </div>
            {settingsError && (
              <div className="p-3 rounded-lg bg-destructive/10 text-sm text-destructive">
                {settingsError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)} disabled={isSavingSettings}>Annuler</Button>
            <Button onClick={handleSaveSettings} disabled={isSavingSettings}>
              {isSavingSettings ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : null}
              Enregistrer
            </Button>
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
                  value={reapproQuantity}
                  onChange={(e) => setReapproQuantity(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Suggestion: {Math.max(0, selectedItem.stockOptimal - selectedItem.stockActuel)} {selectedItem.unite}(s) pour atteindre le stock optimal
                </p>
              </div>
              <div className="p-3 bg-primary/5 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Coût estimé:</span>{" "}
                  {((parseInt(reapproQuantity, 10) || 0) * selectedItem.prixAchat).toLocaleString()} FCFA
                </p>
              </div>
              {reapproError && (
                <div className="p-3 rounded-lg bg-destructive/10 text-sm text-destructive">
                  {reapproError}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Sélectionner un produit</Label>
              <Select onValueChange={(val) => openReapproDialog(stockItems.find(i => i.id === val) || null)}>
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
            <Button variant="outline" onClick={() => { setShowReapproDialog(false); setSelectedItem(null); }} disabled={isSubmittingReappro}>Annuler</Button>
            <Button onClick={handleManualReappro} disabled={!selectedItem || !reapproQuantity || isSubmittingReappro}>
              {isSubmittingReappro ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Truck className="w-4 h-4 mr-1" />}
              Commander
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
