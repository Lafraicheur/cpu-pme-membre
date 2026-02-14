import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
  XCircle,
  Eye,
  Star,
  MessageSquare,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

type OrderStatus = 
  | "Placed" 
  | "Confirmed" 
  | "Preparing" 
  | "Shipped" 
  | "Delivered" 
  | "Closed"
  | "Cancelled";

interface Order {
  id: string;
  vendeur: string;
  produit: string;
  quantite: number;
  total: number;
  status: OrderStatus;
  date: string;
  tracking?: string;
  preuveLivraison?: boolean;
}

const mockOrders: Order[] = [
  {
    id: "CMD-2024-001",
    vendeur: "Coopérative Aboisso Cacao",
    produit: "Cacao Premium Grade A",
    quantite: 2,
    total: 1700000,
    status: "Delivered",
    date: "2024-01-15",
    preuveLivraison: true,
  },
  {
    id: "CMD-2024-002",
    vendeur: "Femmes de Dabou SARL",
    produit: "Attiéké séché - 25kg",
    quantite: 10,
    total: 150000,
    status: "Shipped",
    date: "2024-01-18",
    tracking: "TRK-12345",
  },
  {
    id: "CMD-2024-003",
    vendeur: "TransFroid CI",
    produit: "Service de transport frigorifique",
    quantite: 1,
    total: 75000,
    status: "Confirmed",
    date: "2024-01-20",
  },
  {
    id: "CMD-2024-004",
    vendeur: "Palmeraie du Sud",
    produit: "Huile de palme raffinée - 20L",
    quantite: 5,
    total: 125000,
    status: "Placed",
    date: "2024-01-21",
  },
];

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: typeof Clock; step: number }> = {
  Placed: { label: "En attente", color: "text-blue-500", icon: Clock, step: 1 },
  Confirmed: { label: "Confirmée", color: "text-primary", icon: CheckCircle2, step: 2 },
  Preparing: { label: "En préparation", color: "text-amber-500", icon: Package, step: 3 },
  Shipped: { label: "Expédiée", color: "text-purple-500", icon: Truck, step: 4 },
  Delivered: { label: "Livrée", color: "text-green-500", icon: CheckCircle2, step: 5 },
  Closed: { label: "Clôturée", color: "text-muted-foreground", icon: CheckCircle2, step: 6 },
  Cancelled: { label: "Annulée", color: "text-destructive", icon: XCircle, step: 0 },
};

const steps = ["Commande", "Confirmée", "Préparation", "Expédiée", "Livrée"];

export function AcheteurCommandes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEvaluationDialog, setShowEvaluationDialog] = useState(false);
  const [showLitigeDialog, setShowLitigeDialog] = useState(false);
  const [evaluation, setEvaluation] = useState({
    note: 0,
    conformite: true,
    delai: true,
    qualite: true,
    commentaire: "",
  });

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.vendeur.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.produit.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par N° commande, vendeur, produit..."
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
          <CardTitle>Mes commandes</CardTitle>
          <CardDescription>{filteredOrders.length} commande(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const status = statusConfig[order.status];
              const StatusIcon = status.icon;
              
              return (
                <Card key={order.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={cn("p-2 rounded-lg bg-muted")}>
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
                            {order.vendeur} • Qté: {order.quantite} • {order.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary text-lg">
                          {order.total.toLocaleString()} FCFA
                        </p>
                        {order.tracking && (
                          <p className="text-xs text-muted-foreground">
                            Tracking: {order.tracking}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Timeline de suivi */}
                    {order.status !== "Cancelled" && (
                      <div className="mb-4">
                        <div className="flex justify-between mb-2">
                          {steps.map((step, i) => (
                            <div 
                              key={step}
                              className={cn(
                                "text-xs text-center flex-1",
                                i + 1 <= status.step ? "text-primary font-medium" : "text-muted-foreground"
                              )}
                            >
                              {step}
                            </div>
                          ))}
                        </div>
                        <Progress value={(status.step / 5) * 100} className="h-2" />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                      {order.status === "Delivered" && (
                        <>
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowEvaluationDialog(true);
                            }}
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Évaluer
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowLitigeDialog(true);
                            }}
                          >
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Signaler
                          </Button>
                        </>
                      )}
                      {order.status === "Shipped" && (
                        <Button size="sm" variant="default">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Confirmer réception
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDetailDialog(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Détails
                      </Button>
                      <Button size="sm" variant="ghost">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dialog Évaluation */}
      <Dialog open={showEvaluationDialog} onOpenChange={(open) => {
        setShowEvaluationDialog(open);
        if (!open) setSelectedOrder(null);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Évaluer le fournisseur</DialogTitle>
            <DialogDescription>
              {selectedOrder?.vendeur} - Commande {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Note globale</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant={evaluation.note >= star ? "default" : "outline"}
                    size="icon"
                    className="w-10 h-10"
                    onClick={() => setEvaluation({ ...evaluation, note: star })}
                  >
                    <Star className={cn(
                      "w-5 h-5",
                      evaluation.note >= star && "fill-current"
                    )} />
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <span className="text-sm">Produit conforme à la description</span>
                <div className="flex gap-2">
                  <Button
                    variant={evaluation.conformite ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEvaluation({ ...evaluation, conformite: true })}
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={!evaluation.conformite ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setEvaluation({ ...evaluation, conformite: false })}
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <span className="text-sm">Respect des délais</span>
                <div className="flex gap-2">
                  <Button
                    variant={evaluation.delai ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEvaluation({ ...evaluation, delai: true })}
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={!evaluation.delai ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setEvaluation({ ...evaluation, delai: false })}
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <span className="text-sm">Qualité générale</span>
                <div className="flex gap-2">
                  <Button
                    variant={evaluation.qualite ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEvaluation({ ...evaluation, qualite: true })}
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={!evaluation.qualite ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setEvaluation({ ...evaluation, qualite: false })}
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Commentaire (optionnel)</label>
              <Textarea
                placeholder="Partagez votre expérience..."
                rows={3}
                value={evaluation.commentaire}
                onChange={(e) => setEvaluation({ ...evaluation, commentaire: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => { setShowEvaluationDialog(false); setSelectedOrder(null); }}>
                Annuler
              </Button>
              <Button onClick={() => { setShowEvaluationDialog(false); setSelectedOrder(null); }}>
                <Star className="w-4 h-4 mr-1" />
                Envoyer l'évaluation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Litige */}
      <Dialog open={showLitigeDialog} onOpenChange={(open) => {
        setShowLitigeDialog(open);
        if (!open) setSelectedOrder(null);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Signaler un problème</DialogTitle>
            <DialogDescription>
              Commande {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type de problème *</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="non-conforme">Produit non conforme</SelectItem>
                  <SelectItem value="endommage">Produit endommagé</SelectItem>
                  <SelectItem value="quantite">Quantité incorrecte</SelectItem>
                  <SelectItem value="retard">Retard excessif</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description du problème *</label>
              <Textarea
                placeholder="Décrivez précisément le problème rencontré..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Photos / Preuves</label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                <Package className="w-6 h-6 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-1">Ajouter des photos</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => { setShowLitigeDialog(false); setSelectedOrder(null); }}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={() => { setShowLitigeDialog(false); setSelectedOrder(null); }}>
                <AlertTriangle className="w-4 h-4 mr-1" />
                Ouvrir un litige
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Détail commande */}
      {selectedOrder && showDetailDialog && (
        <Dialog open={showDetailDialog} onOpenChange={(open) => {
          setShowDetailDialog(open);
          if (!open) setSelectedOrder(null);
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Détail commande {selectedOrder.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <Badge className={cn("bg-muted", statusConfig[selectedOrder.status].color)}>
                  {statusConfig[selectedOrder.status].label}
                </Badge>
                <span className="text-sm text-muted-foreground">{selectedOrder.date}</span>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vendeur</span>
                  <span className="font-medium">{selectedOrder.vendeur}</span>
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
                {selectedOrder.tracking && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">N° suivi</span>
                    <span className="font-mono">{selectedOrder.tracking}</span>
                  </div>
                )}
                {selectedOrder.preuveLivraison && (
                  <div className="border-t pt-3">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-1" />
                      Voir preuve de livraison
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
