import { useState, useEffect, useCallback } from "react";
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
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ordersApi, type OrderReportType, type BuyerOrder } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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
  apiId: string;
  vendeur: string;
  produit: string;
  quantite: number;
  total: number;
  status: OrderStatus;
  date: string;
  tracking?: string;
}

/** Statut API (lowercase) → statut d'affichage. */
function mapOrderStatus(s: string): OrderStatus {
  const v = (s || "").toLowerCase();
  if (v.includes("confirm")) return "Confirmed";
  if (v.includes("prepar")) return "Preparing";
  if (v.includes("ship") || v.includes("expédi") || v.includes("expedi")) return "Shipped";
  if (v.includes("deliver") || v.includes("livr")) return "Delivered";
  if (v.includes("clos") || v.includes("clôtur") || v.includes("clotur")) return "Closed";
  if (v.includes("cancel") || v.includes("annul") || v.includes("reject") || v.includes("refus")) return "Cancelled";
  return "Placed";
}

function mapOrder(o: BuyerOrder): Order {
  return {
    id: o.orderNumber || o.id,
    apiId: o.id,
    vendeur: o.boutique?.name || o.boutique?.nom || (o.boutiqueId ? `Boutique ${o.boutiqueId.slice(0, 8)}` : "—"),
    produit: o.productVariant?.product?.name || o.product?.name || o.productVariant?.name || (o.productVariantId ? `Article ${o.productVariantId.slice(0, 8)}` : "—"),
    quantite: o.quantity || 0,
    total: o.totalPrice || 0,
    status: mapOrderStatus(o.status),
    date: o.created_at ? o.created_at.split("T")[0] : "",
    tracking: o.trackingNumber || undefined,
  };
}

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
  const [isSubmittingEvaluation, setIsSubmittingEvaluation] = useState(false);
  const [evaluation, setEvaluation] = useState({
    rating: 0,
    productQualityRating: 0,
    deliveryRating: 0,
    customerServiceRating: 0,
    comment: "",
  });
  const { toast } = useToast();

  const resetEvaluation = () => {
    setEvaluation({
      rating: 0,
      productQualityRating: 0,
      deliveryRating: 0,
      customerServiceRating: 0,
      comment: "",
    });
  };

  const handleSubmitEvaluation = async () => {
    if (!selectedOrder || evaluation.rating < 1) return;
    setIsSubmittingEvaluation(true);
    try {
      await ordersApi.evaluate(selectedOrder.apiId, {
        rating: evaluation.rating,
        productQualityRating: evaluation.productQualityRating || undefined,
        deliveryRating: evaluation.deliveryRating || undefined,
        customerServiceRating: evaluation.customerServiceRating || undefined,
        comment: evaluation.comment || undefined,
      });
      toast({ title: "Évaluation envoyée", description: "Merci pour votre retour." });
      setShowEvaluationDialog(false);
      setSelectedOrder(null);
      resetEvaluation();
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "L'envoi de l'évaluation a échoué.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingEvaluation(false);
    }
  };

  const [isSubmittingLitige, setIsSubmittingLitige] = useState(false);
  const [litige, setLitige] = useState<{ reportType: OrderReportType | ""; title: string; description: string }>({
    reportType: "",
    title: "",
    description: "",
  });

  const resetLitige = () => {
    setLitige({ reportType: "", title: "", description: "" });
  };

  const handleSubmitLitige = async () => {
    if (!selectedOrder || !litige.reportType || !litige.title.trim() || !litige.description.trim()) return;
    setIsSubmittingLitige(true);
    try {
      await ordersApi.report(selectedOrder.apiId, {
        reportType: litige.reportType,
        title: litige.title.trim(),
        description: litige.description.trim(),
      });
      toast({ title: "Signalement envoyé", description: "Votre signalement a bien été transmis." });
      setShowLitigeDialog(false);
      setSelectedOrder(null);
      resetLitige();
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "L'envoi du signalement a échoué.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingLitige(false);
    }
  };

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingReceptionId, setConfirmingReceptionId] = useState<string | null>(null);

  const loadOrders = useCallback(() => {
    setIsLoading(true);
    setError(null);
    ordersApi.getBuyerList({ limit: 50 })
      .then((res) => setOrders((res.data ?? []).map(mapOrder)))
      .catch(() => setError("Impossible de charger les commandes."))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const handleConfirmReception = async (order: Order) => {
    setConfirmingReceptionId(order.apiId);
    try {
      await ordersApi.confirmReception(order.apiId);
      toast({ title: "Réception confirmée", description: "Merci d'avoir confirmé la réception de votre commande." });
      loadOrders();
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "La confirmation de réception a échoué.",
        variant: "destructive",
      });
    } finally {
      setConfirmingReceptionId(null);
    }
  };

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    setIsCancelling(true);
    try {
      await ordersApi.cancel(selectedOrder.apiId);
      toast({ title: "Commande annulée", description: `La commande ${selectedOrder.id} a été annulée.` });
      setShowCancelDialog(false);
      setSelectedOrder(null);
      loadOrders();
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "L'annulation de la commande a échoué.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const [orderDetail, setOrderDetail] = useState<BuyerOrder | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailDialog(true);
    setOrderDetail(null);
    setIsLoadingDetail(true);
    ordersApi.getBuyerById(order.apiId)
      .then(setOrderDetail)
      .catch(() => setOrderDetail(null))
      .finally(() => setIsLoadingDetail(false));
  };

  const filteredOrders = orders.filter(order => {
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
          {isLoading ? (
            <div className="py-12 flex items-center justify-center text-muted-foreground">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Chargement des commandes...
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 text-destructive opacity-70" />
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button variant="outline" onClick={loadOrders}><RefreshCw className="w-4 h-4 mr-2" />Réessayer</Button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-12 text-center">
              <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                {orders.length === 0 ? "Aucune commande pour le moment." : "Aucune commande ne correspond à vos filtres."}
              </p>
            </div>
          ) : (
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
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleConfirmReception(order)}
                          disabled={confirmingReceptionId === order.apiId}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          {confirmingReceptionId === order.apiId ? "Confirmation..." : "Confirmer réception"}
                        </Button>
                      )}
                      {(order.status === "Placed" || order.status === "Confirmed" || order.status === "Preparing") && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowCancelDialog(true);
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Annuler
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDetail(order)}
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
          )}
        </CardContent>
      </Card>

      {/* Dialog Évaluation */}
      <Dialog open={showEvaluationDialog} onOpenChange={(open) => {
        setShowEvaluationDialog(open);
        if (!open) { setSelectedOrder(null); resetEvaluation(); }
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
              <label className="text-sm font-medium">Note globale *</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant={evaluation.rating >= star ? "default" : "outline"}
                    size="icon"
                    className="w-10 h-10"
                    onClick={() => setEvaluation({ ...evaluation, rating: star })}
                  >
                    <Star className={cn(
                      "w-5 h-5",
                      evaluation.rating >= star && "fill-current"
                    )} />
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {([
                { key: "productQualityRating", label: "Qualité du produit" },
                { key: "deliveryRating", label: "Livraison" },
                { key: "customerServiceRating", label: "Service client" },
              ] as const).map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="text-sm">{label}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button
                        key={star}
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8"
                        onClick={() => setEvaluation({ ...evaluation, [key]: star })}
                      >
                        <Star className={cn(
                          "w-4 h-4",
                          evaluation[key] >= star ? "fill-current text-primary" : "text-muted-foreground"
                        )} />
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Commentaire (optionnel)</label>
              <Textarea
                placeholder="Partagez votre expérience..."
                rows={3}
                value={evaluation.comment}
                onChange={(e) => setEvaluation({ ...evaluation, comment: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => { setShowEvaluationDialog(false); setSelectedOrder(null); resetEvaluation(); }}
                disabled={isSubmittingEvaluation}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmitEvaluation}
                disabled={evaluation.rating < 1 || isSubmittingEvaluation}
              >
                <Star className="w-4 h-4 mr-1" />
                {isSubmittingEvaluation ? "Envoi..." : "Envoyer l'évaluation"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Litige */}
      <Dialog open={showLitigeDialog} onOpenChange={(open) => {
        setShowLitigeDialog(open);
        if (!open) { setSelectedOrder(null); resetLitige(); }
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
              <Select
                value={litige.reportType}
                onValueChange={(value) => setLitige({ ...litige, reportType: value as OrderReportType })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product_issue">Problème avec le produit</SelectItem>
                  <SelectItem value="delivery_issue">Problème de livraison</SelectItem>
                  <SelectItem value="service_issue">Problème de service client</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Titre *</label>
              <Input
                placeholder="Ex : Produit endommagé à la réception"
                maxLength={255}
                value={litige.title}
                onChange={(e) => setLitige({ ...litige, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description du problème *</label>
              <Textarea
                placeholder="Décrivez précisément le problème rencontré..."
                rows={4}
                value={litige.description}
                onChange={(e) => setLitige({ ...litige, description: e.target.value })}
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
              <Button
                variant="outline"
                onClick={() => { setShowLitigeDialog(false); setSelectedOrder(null); resetLitige(); }}
                disabled={isSubmittingLitige}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleSubmitLitige}
                disabled={!litige.reportType || !litige.title.trim() || !litige.description.trim() || isSubmittingLitige}
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                {isSubmittingLitige ? "Envoi..." : "Ouvrir un litige"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Annulation */}
      <Dialog open={showCancelDialog} onOpenChange={(open) => {
        setShowCancelDialog(open);
        if (!open) setSelectedOrder(null);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Annuler la commande</DialogTitle>
            <DialogDescription>
              Commande {selectedOrder?.id} — {selectedOrder?.vendeur}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Êtes-vous sûr de vouloir annuler cette commande ? Cette action est irréversible.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => { setShowCancelDialog(false); setSelectedOrder(null); }}
              disabled={isCancelling}
            >
              Retour
            </Button>
            <Button variant="destructive" onClick={handleCancelOrder} disabled={isCancelling}>
              <XCircle className="w-4 h-4 mr-1" />
              {isCancelling ? "Annulation..." : "Confirmer l'annulation"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Détail commande */}
      {selectedOrder && showDetailDialog && (
        <Dialog open={showDetailDialog} onOpenChange={(open) => {
          setShowDetailDialog(open);
          if (!open) { setSelectedOrder(null); setOrderDetail(null); }
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
              </div>

              {isLoadingDetail ? (
                <div className="py-6 flex items-center justify-center text-muted-foreground text-sm">
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Chargement des détails...
                </div>
              ) : orderDetail ? (
                <div className="border rounded-lg p-4 space-y-3">
                  {orderDetail.deliveryMode && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mode de livraison</span>
                      <span className="font-medium capitalize">{orderDetail.deliveryMode}</span>
                    </div>
                  )}
                  {orderDetail.deliveryAddress && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Adresse de livraison</span>
                      <span className="font-medium text-right">{orderDetail.deliveryAddress}</span>
                    </div>
                  )}
                  {!!orderDetail.shippingCost && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frais de livraison</span>
                      <span className="font-medium">{orderDetail.shippingCost.toLocaleString()} FCFA</span>
                    </div>
                  )}
                  {orderDetail.rejectionReason && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Motif de rejet</span>
                      <span className="font-medium text-right">{orderDetail.rejectionReason}</span>
                    </div>
                  )}
                  {orderDetail.cancelledReason && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Motif d'annulation</span>
                      <span className="font-medium text-right">{orderDetail.cancelledReason}</span>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
