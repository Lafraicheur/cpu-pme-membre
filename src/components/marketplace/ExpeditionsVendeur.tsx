import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Truck,
  Package,
  Search,
  MoreVertical,
  Eye,
  Printer,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  AlertCircle,
  AlertTriangle,
  QrCode,
  Upload,
  Send,
  PackageCheck,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ordersApi, type ShipmentVendorItem, type ShipmentVendorStats } from "@/lib/api";

type ShipmentStatus = "pending" | "prepared" | "shipped" | "delivered" | "issue";
type ModeLivraison = "standard" | "express" | "pickup";

interface Shipment {
  id: string;
  commandeId: string;
  acheteur: string;
  telephone: string;
  adresse: string;
  ville: string;
  produits: { nom: string; quantite: number }[];
  status: ShipmentStatus;
  modeLivraison: ModeLivraison;
  dateCommande: string;
  dateExpedition?: string;
  dateLivraisonEstimee: string;
  transporteur?: string;
  numeroSuivi?: string;
  notes?: string;
}

function mapShipment(item: ShipmentVendorItem): Shipment {
  return {
    id: item.id,
    commandeId: item.commandeId ?? item.orderNumber ?? item.orderId ?? item.id,
    acheteur: item.acheteur ?? item.buyerName ?? "Acheteur",
    telephone: item.telephone ?? item.phone ?? "",
    adresse: item.adresse ?? item.address ?? "",
    ville: item.ville ?? item.city ?? "",
    produits: (item.produits ?? []).map((p) => ({
      nom: p.nom ?? p.name ?? "Produit",
      quantite: p.quantite ?? p.quantity ?? 0,
    })),
    status: (item.status as ShipmentStatus) ?? "pending",
    modeLivraison: (item.modeLivraison ?? item.deliveryMode ?? "standard") as ModeLivraison,
    dateCommande: item.dateCommande ?? item.orderDate ?? "",
    dateExpedition: item.dateExpedition ?? item.shippedAt ?? undefined,
    dateLivraisonEstimee: item.dateLivraisonEstimee ?? item.estimatedDeliveryDate ?? "",
    transporteur: item.transporteur ?? item.carrier ?? undefined,
    numeroSuivi: item.numeroSuivi ?? item.trackingNumber ?? undefined,
    notes: item.notes ?? undefined,
  };
}

const statusConfig: Record<ShipmentStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "À préparer", color: "text-blue-500 bg-blue-500/10", icon: Clock },
  prepared: { label: "Préparé", color: "text-amber-500 bg-amber-500/10", icon: Package },
  shipped: { label: "Expédié", color: "text-purple-500 bg-purple-500/10", icon: Truck },
  delivered: { label: "Livré", color: "text-green-500 bg-green-500/10", icon: CheckCircle2 },
  issue: { label: "Problème", color: "text-red-500 bg-red-500/10", icon: AlertCircle },
};
const defaultStatus = statusConfig.pending;

const modeConfig: Record<ModeLivraison, { label: string; color: string }> = {
  standard: { label: "Standard", color: "bg-muted text-muted-foreground" },
  express: { label: "Express", color: "bg-primary/10 text-primary" },
  pickup: { label: "Retrait", color: "bg-secondary/10 text-secondary" },
};

export function ExpeditionsVendeur() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [stats, setStats] = useState<ShipmentVendorStats>({ aPreparer: 0, prepares: 0, enCours: 0, livres: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preparingId, setPreparingId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  const [showShipDialog, setShowShipDialog] = useState(false);
  const [shipData, setShipData] = useState({
    transporteur: "",
    numeroSuivi: "",
    notes: "",
  });
  const [deliverySlip, setDeliverySlip] = useState<File | null>(null);
  const [isShipping, setIsShipping] = useState(false);
  const [shipError, setShipError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [detailShipment, setDetailShipment] = useState<Shipment | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const loadShipments = useCallback(() => {
    setIsLoading(true);
    setError(null);
    ordersApi.getVendorShipmentsList({ limit: 100 })
      .then((res) => {
        setStats(res.stats);
        setShipments(res.data.map(mapShipment));
      })
      .catch(() => setError("Impossible de charger les expéditions."))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { loadShipments(); }, [loadShipments]);

  const filteredShipments = shipments.filter(s => {
    const matchesSearch = s.commandeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.acheteur.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handlePrepare = async (shipment: Shipment) => {
    setPreparingId(shipment.id);
    try {
      await ordersApi.prepareShipment(shipment.id);
      loadShipments();
    } catch {
      // silencieux, l'erreur peut être affichée plus tard
    } finally {
      setPreparingId(null);
    }
  };

  const handleMarkShipped = async () => {
    if (!selectedShipment || !shipData.transporteur) return;
    setIsShipping(true);
    setShipError(null);
    try {
      await ordersApi.shipShipment(selectedShipment.id, {
        transporteur: shipData.transporteur,
        numeroSuivi: shipData.numeroSuivi || undefined,
        notes: shipData.notes || undefined,
        deliverySlip: deliverySlip || undefined,
      });
      setShowShipDialog(false);
      setSelectedShipment(null);
      setShipData({ transporteur: "", numeroSuivi: "", notes: "" });
      setDeliverySlip(null);
      loadShipments();
    } catch (e: unknown) {
      setShipError(e instanceof Error ? e.message : "Erreur lors de l'expédition.");
    } finally {
      setIsShipping(false);
    }
  };

  const openDetail = (shipment: Shipment) => {
    setDetailShipment(shipment);
    setShowDetailDialog(true);
    setIsLoadingDetail(true);
    ordersApi.getVendorShipmentById(shipment.id)
      .then((full) => setDetailShipment(mapShipment(full)))
      .catch(() => { /* on garde les infos de la liste */ })
      .finally(() => setIsLoadingDetail(false));
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={stats.aPreparer > 0 ? "border-blue-500/50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-500">{stats.aPreparer}</p>
                <p className="text-sm text-muted-foreground">À préparer</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Package className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-500">{stats.prepares}</p>
                <p className="text-sm text-muted-foreground">Préparés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Truck className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-500">{stats.enCours}</p>
                <p className="text-sm text-muted-foreground">En cours</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">{stats.livres}</p>
                <p className="text-sm text-muted-foreground">Livrés</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par N° commande, acheteur..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">À préparer</SelectItem>
                <SelectItem value="prepared">Préparés</SelectItem>
                <SelectItem value="shipped">Expédiés</SelectItem>
                <SelectItem value="delivered">Livrés</SelectItem>
                <SelectItem value="issue">Problème</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des expéditions */}
      <Card>
        <CardHeader>
          <CardTitle>Expéditions</CardTitle>
          <CardDescription>{filteredShipments.length} expédition(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              Chargement des expéditions...
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-destructive opacity-70" />
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button variant="outline" onClick={loadShipments}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </Button>
            </div>
          ) : filteredShipments.length === 0 ? (
            <div className="py-12 text-center">
              <Truck className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                {shipments.length === 0 ? "Aucune expédition pour le moment." : "Aucune expédition ne correspond à vos filtres."}
              </p>
            </div>
          ) : (
          <div className="space-y-3">
            {filteredShipments.map((shipment) => {
              const status = statusConfig[shipment.status] ?? defaultStatus;
              const StatusIcon = status.icon;
              const mode = modeConfig[shipment.modeLivraison] ?? modeConfig.standard;
              const busy = preparingId === shipment.id;

              return (
                <div
                  key={shipment.id}
                  className={cn(
                    "flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border gap-4",
                    shipment.status === "pending" && "border-blue-500/30 bg-blue-500/5"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn("p-2 rounded-lg", status.color.split(" ")[1])}>
                      <StatusIcon className={cn("w-5 h-5", status.color.split(" ")[0])} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-medium">{shipment.commandeId}</span>
                        <Badge className={status.color}>{status.label}</Badge>
                        <Badge className={mode.color}>{mode.label}</Badge>
                      </div>
                      <p className="font-medium mt-1">{shipment.acheteur}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3" />
                        <span>{shipment.adresse}, {shipment.ville}</span>
                      </div>
                      {shipment.produits.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground">Produits:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {shipment.produits.map((p, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {p.quantite}x {p.nom}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-auto">
                    <div className="text-right text-sm">
                      <p className="text-muted-foreground">Livraison estimée</p>
                      <p className="font-medium">{shipment.dateLivraisonEstimee || "—"}</p>
                      {shipment.numeroSuivi && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Suivi: {shipment.numeroSuivi}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {shipment.status === "pending" && (
                        <Button size="sm" variant="outline" disabled={busy} onClick={() => handlePrepare(shipment)}>
                          {busy ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <PackageCheck className="w-4 h-4 mr-1" />}
                          Préparer
                        </Button>
                      )}
                      {shipment.status === "prepared" && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedShipment(shipment);
                            setShipError(null);
                            setDeliverySlip(null);
                            setShowShipDialog(true);
                          }}
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Expédier
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDetail(shipment)}>
                            <Eye className="w-4 h-4 mr-2" />Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Printer className="w-4 h-4 mr-2" />Bon de livraison
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <QrCode className="w-4 h-4 mr-2" />Générer QR
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Phone className="w-4 h-4 mr-2" />Contacter acheteur
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Expédier */}
      <Dialog open={showShipDialog} onOpenChange={setShowShipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marquer comme expédié</DialogTitle>
            <DialogDescription>
              Commande {selectedShipment?.commandeId} - {selectedShipment?.acheteur}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Transporteur *</Label>
              <Select
                value={shipData.transporteur}
                onValueChange={(v) => setShipData({ ...shipData, transporteur: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TransFroid CI">TransFroid CI</SelectItem>
                  <SelectItem value="Ivoire Express">Ivoire Express</SelectItem>
                  <SelectItem value="DHL">DHL</SelectItem>
                  <SelectItem value="Livraison propre">Livraison propre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Numéro de suivi</Label>
              <Input
                value={shipData.numeroSuivi}
                onChange={(e) => setShipData({ ...shipData, numeroSuivi: e.target.value })}
                placeholder="Ex: TF-2024-XXXX"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (optionnel)</Label>
              <Textarea
                value={shipData.notes}
                onChange={(e) => setShipData({ ...shipData, notes: e.target.value })}
                placeholder="Instructions particulières..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Bon de livraison (optionnel)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => setDeliverySlip(e.target.files?.[0] ?? null)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4" />
                {deliverySlip ? deliverySlip.name : "Joindre le bon de livraison"}
              </Button>
            </div>
            {shipError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {shipError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShipDialog(false)} disabled={isShipping}>
              Annuler
            </Button>
            <Button onClick={handleMarkShipped} disabled={isShipping || !shipData.transporteur}>
              {isShipping ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
              Confirmer l'expédition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Détail expédition */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détail expédition</DialogTitle>
            <DialogDescription>
              Commande {detailShipment?.commandeId}
            </DialogDescription>
          </DialogHeader>
          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              Chargement...
            </div>
          ) : detailShipment && (() => {
            const status = statusConfig[detailShipment.status] ?? defaultStatus;
            const mode = modeConfig[detailShipment.modeLivraison] ?? modeConfig.standard;
            return (
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-2">
                  <Badge className={status.color}>{status.label}</Badge>
                  <Badge className={mode.color}>{mode.label}</Badge>
                </div>
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Acheteur</span>
                    <span className="font-medium">{detailShipment.acheteur}</span>
                  </div>
                  {detailShipment.telephone && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Téléphone</span>
                      <span className="font-medium">{detailShipment.telephone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Adresse</span>
                    <span className="font-medium text-right">{detailShipment.adresse}, {detailShipment.ville}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Commande du</span>
                    <span className="font-medium">{detailShipment.dateCommande || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Livraison estimée</span>
                    <span className="font-medium">{detailShipment.dateLivraisonEstimee || "—"}</span>
                  </div>
                  {detailShipment.transporteur && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transporteur</span>
                      <span className="font-medium">{detailShipment.transporteur}</span>
                    </div>
                  )}
                  {detailShipment.numeroSuivi && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">N° suivi</span>
                      <span className="font-medium">{detailShipment.numeroSuivi}</span>
                    </div>
                  )}
                  {detailShipment.notes && (
                    <div className="border-t pt-3">
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p>{detailShipment.notes}</p>
                    </div>
                  )}
                  {detailShipment.produits.length > 0 && (
                    <div className="border-t pt-3">
                      <p className="text-sm text-muted-foreground mb-1">Produits</p>
                      <div className="flex flex-wrap gap-1">
                        {detailShipment.produits.map((p, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {p.quantite}x {p.nom}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
