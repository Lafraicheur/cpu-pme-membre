import { useState } from "react";
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
  QrCode,
  FileText,
  Send,
  PackageCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ShipmentStatus = "pending" | "prepared" | "shipped" | "in_transit" | "delivered" | "issue";

interface Shipment {
  id: string;
  commandeId: string;
  acheteur: string;
  telephone: string;
  adresse: string;
  ville: string;
  produits: { nom: string; quantite: number }[];
  status: ShipmentStatus;
  modeLivraison: "standard" | "express" | "pickup";
  dateCommande: string;
  dateExpedition?: string;
  dateLivraisonEstimee: string;
  transporteur?: string;
  numeroSuivi?: string;
}

const mockShipments: Shipment[] = [
  {
    id: "EXP-001",
    commandeId: "CMD-2024-1234",
    acheteur: "Hôtel Ivoire",
    telephone: "+225 07 XX XX XX XX",
    adresse: "Boulevard de la République",
    ville: "Abidjan",
    produits: [
      { nom: "Cacao Premium Grade A", quantite: 2 },
      { nom: "Café torréfié premium", quantite: 5 },
    ],
    status: "pending",
    modeLivraison: "express",
    dateCommande: "2024-01-20",
    dateLivraisonEstimee: "2024-01-23",
  },
  {
    id: "EXP-002",
    commandeId: "CMD-2024-1233",
    acheteur: "Restaurant Chez Paul",
    telephone: "+225 05 XX XX XX XX",
    adresse: "Cocody Riviera 2",
    ville: "Abidjan",
    produits: [
      { nom: "Attiéké séché - 25kg", quantite: 10 },
    ],
    status: "prepared",
    modeLivraison: "standard",
    dateCommande: "2024-01-19",
    dateLivraisonEstimee: "2024-01-26",
  },
  {
    id: "EXP-003",
    commandeId: "CMD-2024-1230",
    acheteur: "Supermarché Carrefour",
    telephone: "+225 01 XX XX XX XX",
    adresse: "Zone Industrielle",
    ville: "Yopougon",
    produits: [
      { nom: "Huile de palme raffinée - 20L", quantite: 50 },
    ],
    status: "shipped",
    modeLivraison: "standard",
    dateCommande: "2024-01-18",
    dateExpedition: "2024-01-20",
    dateLivraisonEstimee: "2024-01-25",
    transporteur: "TransFroid CI",
    numeroSuivi: "TF-2024-8756",
  },
  {
    id: "EXP-004",
    commandeId: "CMD-2024-1225",
    acheteur: "Café du Commerce",
    telephone: "+225 07 XX XX XX XX",
    adresse: "Centre-ville",
    ville: "Bouaké",
    produits: [
      { nom: "Café torréfié premium", quantite: 20 },
    ],
    status: "delivered",
    modeLivraison: "standard",
    dateCommande: "2024-01-15",
    dateExpedition: "2024-01-17",
    dateLivraisonEstimee: "2024-01-22",
    transporteur: "Ivoire Express",
    numeroSuivi: "IE-2024-4532",
  },
];

const statusConfig: Record<ShipmentStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "À préparer", color: "text-blue-500 bg-blue-500/10", icon: Clock },
  prepared: { label: "Préparé", color: "text-amber-500 bg-amber-500/10", icon: Package },
  shipped: { label: "Expédié", color: "text-purple-500 bg-purple-500/10", icon: Truck },
  in_transit: { label: "En transit", color: "text-indigo-500 bg-indigo-500/10", icon: Truck },
  delivered: { label: "Livré", color: "text-green-500 bg-green-500/10", icon: CheckCircle2 },
  issue: { label: "Problème", color: "text-red-500 bg-red-500/10", icon: AlertCircle },
};

const modeConfig = {
  standard: { label: "Standard", color: "bg-muted text-muted-foreground" },
  express: { label: "Express", color: "bg-primary/10 text-primary" },
  pickup: { label: "Retrait", color: "bg-secondary/10 text-secondary" },
};

export function ExpeditionsVendeur() {
  const [shipments] = useState<Shipment[]>(mockShipments);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [showShipDialog, setShowShipDialog] = useState(false);
  const [shipData, setShipData] = useState({
    transporteur: "",
    numeroSuivi: "",
    notes: "",
  });

  const filteredShipments = shipments.filter(s => {
    const matchesSearch = s.commandeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.acheteur.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    aPreparer: shipments.filter(s => s.status === "pending").length,
    prepares: shipments.filter(s => s.status === "prepared").length,
    enCours: shipments.filter(s => ["shipped", "in_transit"].includes(s.status)).length,
    livres: shipments.filter(s => s.status === "delivered").length,
  };

  const handleMarkShipped = () => {
    // Logic to mark as shipped
    setShowShipDialog(false);
    setSelectedShipment(null);
    setShipData({ transporteur: "", numeroSuivi: "", notes: "" });
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
                <p className="text-sm text-muted-foreground">Livrés (30j)</p>
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
          <div className="space-y-3">
            {filteredShipments.map((shipment) => {
              const status = statusConfig[shipment.status];
              const StatusIcon = status.icon;
              const mode = modeConfig[shipment.modeLivraison];

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
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-auto">
                    <div className="text-right text-sm">
                      <p className="text-muted-foreground">Livraison estimée</p>
                      <p className="font-medium">{shipment.dateLivraisonEstimee}</p>
                      {shipment.numeroSuivi && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Suivi: {shipment.numeroSuivi}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {shipment.status === "pending" && (
                        <Button size="sm" variant="outline">
                          <PackageCheck className="w-4 h-4 mr-1" />
                          Préparer
                        </Button>
                      )}
                      {shipment.status === "prepared" && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedShipment(shipment);
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
                          <DropdownMenuItem>
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
                  <SelectItem value="transfroid">TransFroid CI</SelectItem>
                  <SelectItem value="ivoire-express">Ivoire Express</SelectItem>
                  <SelectItem value="dhl">DHL</SelectItem>
                  <SelectItem value="propre">Livraison propre</SelectItem>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShipDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleMarkShipped}>
              <Send className="w-4 h-4 mr-1" />
              Confirmer l'expédition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
