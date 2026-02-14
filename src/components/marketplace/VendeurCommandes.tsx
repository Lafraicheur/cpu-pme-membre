import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  ShoppingCart,
  Search,
  Clock,
  CheckCircle2,
  Package,
  Truck,
  AlertCircle,
  XCircle,
  Eye,
  ChevronRight,
  Upload,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

type OrderStatus = 
  | "Placed" 
  | "Accepted" 
  | "Preparing" 
  | "Shipped" 
  | "ReadyForPickup" 
  | "Delivered" 
  | "Closed"
  | "Cancelled";

interface Order {
  id: string;
  client: string;
  produit: string;
  quantite: number;
  total: number;
  status: OrderStatus;
  date: string;
  adresse: string;
  modeLivraison: "domicile" | "retrait" | "relais";
}

const mockOrders: Order[] = [
  {
    id: "CMD-2024-001",
    client: "Entreprise Alpha SARL",
    produit: "Cacao Premium Grade A",
    quantite: 2,
    total: 1700000,
    status: "Placed",
    date: "2024-01-20",
    adresse: "Abidjan, Cocody",
    modeLivraison: "domicile",
  },
  {
    id: "CMD-2024-002",
    client: "Restaurant Le Gourmet",
    produit: "Attiéké séché - 25kg",
    quantite: 10,
    total: 150000,
    status: "Preparing",
    date: "2024-01-19",
    adresse: "Abidjan, Plateau",
    modeLivraison: "domicile",
  },
  {
    id: "CMD-2024-003",
    client: "Supermarché Bonprix",
    produit: "Huile de palme raffinée - 20L",
    quantite: 20,
    total: 500000,
    status: "Shipped",
    date: "2024-01-18",
    adresse: "San-Pédro",
    modeLivraison: "relais",
  },
  {
    id: "CMD-2024-004",
    client: "Hôtel Ivoire",
    produit: "Anacarde brut - 50kg",
    quantite: 5,
    total: 900000,
    status: "Delivered",
    date: "2024-01-15",
    adresse: "Abidjan, Plateau",
    modeLivraison: "retrait",
  },
];

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: typeof Clock; bgColor: string }> = {
  Placed: { label: "Nouvelle", color: "text-blue-500", icon: Clock, bgColor: "bg-blue-500/10" },
  Accepted: { label: "Acceptée", color: "text-primary", icon: CheckCircle2, bgColor: "bg-primary/10" },
  Preparing: { label: "En préparation", color: "text-amber-500", icon: Package, bgColor: "bg-amber-500/10" },
  Shipped: { label: "Expédiée", color: "text-purple-500", icon: Truck, bgColor: "bg-purple-500/10" },
  ReadyForPickup: { label: "Prêt à retirer", color: "text-cyan-500", icon: Package, bgColor: "bg-cyan-500/10" },
  Delivered: { label: "Livrée", color: "text-green-500", icon: CheckCircle2, bgColor: "bg-green-500/10" },
  Closed: { label: "Clôturée", color: "text-muted-foreground", icon: CheckCircle2, bgColor: "bg-muted" },
  Cancelled: { label: "Annulée", color: "text-destructive", icon: XCircle, bgColor: "bg-destructive/10" },
};

export function VendeurCommandes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showExpeditionDialog, setShowExpeditionDialog] = useState(false);

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.produit.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const ordersByStatus = {
    nouvelles: mockOrders.filter(o => o.status === "Placed").length,
    enCours: mockOrders.filter(o => ["Accepted", "Preparing", "Shipped", "ReadyForPickup"].includes(o.status)).length,
    livrees: mockOrders.filter(o => ["Delivered", "Closed"].includes(o.status)).length,
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nouvelles commandes</p>
                <p className="text-2xl font-bold text-blue-500">{ordersByStatus.nouvelles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Package className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En cours</p>
                <p className="text-2xl font-bold text-amber-500">{ordersByStatus.enCours}</p>
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
                <p className="text-sm text-muted-foreground">Livrées</p>
                <p className="text-2xl font-bold text-green-500">{ordersByStatus.livrees}</p>
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
                placeholder="Rechercher par N° commande, client, produit..."
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
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des commandes */}
      <Card>
        <CardHeader>
          <CardTitle>Commandes à traiter</CardTitle>
          <CardDescription>{filteredOrders.length} commande(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const status = statusConfig[order.status];
              const StatusIcon = status.icon;
              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("p-2 rounded-lg", status.bgColor)}>
                      <StatusIcon className={cn("w-5 h-5", status.color)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium">{order.id}</span>
                        <Badge variant="outline" className={status.color}>
                          {status.label}
                        </Badge>
                      </div>
                      <p className="font-medium">{order.produit}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.client} • Qté: {order.quantite} • {order.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-primary">{order.total.toLocaleString()} FCFA</p>
                      <p className="text-xs text-muted-foreground capitalize">{order.modeLivraison}</p>
                    </div>
                    <div className="flex gap-2">
                      {order.status === "Placed" && (
                        <Button size="sm" variant="default">
                          Accepter
                        </Button>
                      )}
                      {order.status === "Preparing" && (
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowExpeditionDialog(true);
                          }}
                        >
                          <Truck className="w-4 h-4 mr-1" />
                          Expédier
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dialog Expédition */}
      <Dialog open={showExpeditionDialog} onOpenChange={setShowExpeditionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Marquer comme expédié</DialogTitle>
            <DialogDescription>
              Commande {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mode de livraison</label>
              <Select defaultValue="domicile">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="domicile">Livraison domicile</SelectItem>
                  <SelectItem value="relais">Point relais</SelectItem>
                  <SelectItem value="retrait">Retrait sur place</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Numéro de suivi (optionnel)</label>
              <Input placeholder="Ex: TRK-12345678" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bordereau / Bon de livraison</label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="w-6 h-6 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-1">Uploader le BL</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowExpeditionDialog(false)}>
                Annuler
              </Button>
              <Button onClick={() => setShowExpeditionDialog(false)}>
                <Truck className="w-4 h-4 mr-1" />
                Confirmer l'expédition
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Détail commande */}
      {selectedOrder && !showExpeditionDialog && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Détail commande {selectedOrder.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <Badge className={cn(statusConfig[selectedOrder.status].bgColor, statusConfig[selectedOrder.status].color)}>
                  {statusConfig[selectedOrder.status].label}
                </Badge>
                <span className="text-sm text-muted-foreground">{selectedOrder.date}</span>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client</span>
                  <span className="font-medium">{selectedOrder.client}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Produit</span>
                  <span className="font-medium">{selectedOrder.produit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantité</span>
                  <span className="font-medium">{selectedOrder.quantite}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold text-primary">{selectedOrder.total.toLocaleString()} FCFA</span>
                </div>
                <div className="border-t pt-3">
                  <p className="text-sm text-muted-foreground">Adresse livraison</p>
                  <p className="font-medium">{selectedOrder.adresse}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Contacter client
                </Button>
                <Button variant="outline" className="flex-1 gap-2">
                  <Calendar className="w-4 h-4" />
                  Planifier RDV
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
