import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  FileText,
  Search,
  Clock,
  CheckCircle2,
  Send,
  MessageSquare,
  Eye,
  AlertCircle,
  XCircle,
  Calendar,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { rfqApi, type RFQVendorReceived, type RFQVendorStats } from "@/lib/api";

type RFQStatus = "Received" | "Quoted" | "Negotiating" | "Won" | "Lost" | "Expired";

interface RFQ {
  apiId: string;
  id: string;
  demandeur: string;
  besoin: string;
  quantite: number;
  unite: string;
  zone: string;
  deadline: string;
  dateReception: string;
  status: RFQStatus;
  budget?: number;
  details?: string;
}

/** Mappe le statut renvoyé par l'API vers le statut d'affichage. */
function mapRFQStatus(apiStatus: string): RFQStatus {
  const s = (apiStatus || "").toLowerCase();
  if (s.includes("négoc") || s.includes("negoc")) return "Negotiating";
  if (s.includes("gagn") || s.includes("won") || s.includes("accept")) return "Won";
  if (s.includes("perd") || s.includes("lost") || s.includes("refus") || s.includes("rejet")) return "Lost";
  if (s.includes("expir")) return "Expired";
  if (s.includes("devis") || s.includes("répond") || s.includes("repond") || s.includes("quot") || s.includes("attente")) return "Quoted";
  return "Received";
}

function mapReceived(r: RFQVendorReceived): RFQ {
  return {
    apiId: r.id,
    id: r.rfqNumber || r.id,
    demandeur: r.buyer?.name || "Acheteur",
    besoin: r.productNeed,
    quantite: Number(r.quantity) || 0,
    unite: r.unit,
    zone: r.deliveryZone,
    deadline: r.deadline,
    dateReception: r.createdAt ? r.createdAt.split("T")[0] : "",
    status: mapRFQStatus(r.status),
    budget: r.estimatedBudget ?? undefined,
    details: r.specifications ?? undefined,
  };
}

const statusConfig: Record<RFQStatus, { label: string; color: string; icon: typeof Clock; bgColor: string }> = {
  Received: { label: "Reçue", color: "text-blue-500", icon: Clock, bgColor: "bg-blue-500/10" },
  Quoted: { label: "Devis envoyé", color: "text-amber-500", icon: Send, bgColor: "bg-amber-500/10" },
  Negotiating: { label: "En négociation", color: "text-purple-500", icon: MessageSquare, bgColor: "bg-purple-500/10" },
  Won: { label: "Gagnée", color: "text-green-500", icon: CheckCircle2, bgColor: "bg-green-500/10" },
  Lost: { label: "Perdue", color: "text-muted-foreground", icon: XCircle, bgColor: "bg-muted" },
  Expired: { label: "Expirée", color: "text-destructive", icon: AlertCircle, bgColor: "bg-destructive/10" },
};

export function RFQVendeur() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(null);
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [quoteData, setQuoteData] = useState({
    prix: "",
    delai: "",
    validite: "15",
    conditions: "",
  });

  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [stats, setStats] = useState<RFQVendorStats>({ aRepondre: 0, enNegociation: 0, gagnees: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadReceived = useCallback(() => {
    setIsLoading(true);
    setError(null);
    rfqApi.getVendorReceived()
      .then((res) => {
        setStats(res.stats ?? { aRepondre: 0, enNegociation: 0, gagnees: 0 });
        setRfqs((res.data ?? []).map(mapReceived));
      })
      .catch(() => setError("Impossible de charger les demandes de devis."))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { loadReceived(); }, [loadReceived]);

  const handleSendQuote = async () => {
    if (!selectedRFQ) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await rfqApi.respondToReceived(selectedRFQ.apiId, {
        price: Number(quoteData.prix) || 0,
        deliveryDays: parseInt(quoteData.delai, 10) || 0,
        validityDays: parseInt(quoteData.validite, 10) || 15,
        conditions: quoteData.conditions,
      });
      setShowQuoteDialog(false);
      setSelectedRFQ(null);
      setQuoteData({ prix: "", delai: "", validite: "15", conditions: "" });
      loadReceived();
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : "Erreur lors de l'envoi du devis.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRFQs = rfqs.filter(rfq => {
    const matchesSearch = rfq.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfq.demandeur.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfq.besoin.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || rfq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const rfqsByStatus = {
    aRepondre: stats.aRepondre,
    enNegociation: stats.enNegociation,
    gagnees: stats.gagnees,
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">À répondre</p>
                <p className="text-2xl font-bold text-blue-500">{rfqsByStatus.aRepondre}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <MessageSquare className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En négociation</p>
                <p className="text-2xl font-bold text-purple-500">{rfqsByStatus.enNegociation}</p>
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
                <p className="text-sm text-muted-foreground">Gagnées</p>
                <p className="text-2xl font-bold text-green-500">{rfqsByStatus.gagnees}</p>
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
                placeholder="Rechercher par N° RFQ, demandeur, besoin..."
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

      {/* Liste RFQ */}
      <Card>
        <CardHeader>
          <CardTitle>Demandes de devis reçues</CardTitle>
          <CardDescription>{filteredRFQs.length} demande(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
              Chargement des demandes...
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 text-destructive opacity-70" />
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button variant="outline" onClick={loadReceived}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </Button>
            </div>
          ) : filteredRFQs.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                {rfqs.length === 0 ? "Aucune demande de devis reçue pour le moment." : "Aucune demande ne correspond à vos filtres."}
              </p>
            </div>
          ) : (
          <div className="space-y-3">
            {filteredRFQs.map((rfq) => {
              const status = statusConfig[rfq.status];
              const StatusIcon = status.icon;
              const isUrgent = new Date(rfq.deadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
              
              return (
                <div
                  key={rfq.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors",
                    rfq.status === "Received" && "border-blue-500/30 bg-blue-500/5"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("p-2 rounded-lg", status.bgColor)}>
                      <StatusIcon className={cn("w-5 h-5", status.color)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium">{rfq.id}</span>
                        <Badge variant="outline" className={status.color}>
                          {status.label}
                        </Badge>
                        {isUrgent && rfq.status === "Received" && (
                          <Badge variant="destructive" className="text-xs">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium">{rfq.besoin}</p>
                      <p className="text-sm text-muted-foreground">
                        {rfq.demandeur} • {rfq.quantite} {rfq.unite}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {rfq.zone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Deadline: {rfq.deadline}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {rfq.budget && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Budget estimé</p>
                        <p className="font-bold text-primary">{rfq.budget.toLocaleString()} FCFA</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      {rfq.status === "Received" && (
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => {
                            setSelectedRFQ(rfq);
                            setShowQuoteDialog(true);
                          }}
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Répondre
                        </Button>
                      )}
                      {rfq.status === "Negotiating" && (
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Négocier
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedRFQ(rfq)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Envoyer devis */}
      <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Envoyer un devis</DialogTitle>
            <DialogDescription>
              RFQ {selectedRFQ?.id} - {selectedRFQ?.demandeur}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-muted/50 space-y-1">
              <p className="font-medium">{selectedRFQ?.besoin}</p>
              <p className="text-sm text-muted-foreground">
                Quantité: {selectedRFQ?.quantite} {selectedRFQ?.unite} • Zone: {selectedRFQ?.zone}
              </p>
              {selectedRFQ?.details && (
                <p className="text-sm">{selectedRFQ.details}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prix">Prix proposé (FCFA) *</Label>
                <Input
                  id="prix"
                  type="number"
                  placeholder="1500000"
                  value={quoteData.prix}
                  onChange={(e) => setQuoteData({ ...quoteData, prix: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delai">Délai de livraison *</Label>
                <Input
                  id="delai"
                  placeholder="Ex: 7 jours"
                  value={quoteData.delai}
                  onChange={(e) => setQuoteData({ ...quoteData, delai: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="validite">Validité du devis (jours)</Label>
              <Select 
                value={quoteData.validite} 
                onValueChange={(v) => setQuoteData({ ...quoteData, validite: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 jours</SelectItem>
                  <SelectItem value="15">15 jours</SelectItem>
                  <SelectItem value="30">30 jours</SelectItem>
                  <SelectItem value="60">60 jours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="conditions">Conditions / Commentaires</Label>
              <Textarea
                id="conditions"
                placeholder="Conditions de paiement, livraison, garanties..."
                rows={3}
                value={quoteData.conditions}
                onChange={(e) => setQuoteData({ ...quoteData, conditions: e.target.value })}
              />
            </div>

            {submitError && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {submitError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" disabled={isSubmitting} onClick={() => setShowQuoteDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleSendQuote} disabled={isSubmitting || !quoteData.prix || !quoteData.delai}>
                {isSubmitting
                  ? <><RefreshCw className="w-4 h-4 mr-1 animate-spin" />Envoi...</>
                  : <><Send className="w-4 h-4 mr-1" />Envoyer le devis</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Détail RFQ */}
      {selectedRFQ && !showQuoteDialog && (
        <Dialog open={!!selectedRFQ} onOpenChange={() => setSelectedRFQ(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Détail RFQ {selectedRFQ.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <Badge className={cn(statusConfig[selectedRFQ.status].bgColor, statusConfig[selectedRFQ.status].color)}>
                  {statusConfig[selectedRFQ.status].label}
                </Badge>
                <span className="text-sm text-muted-foreground">Reçue le {selectedRFQ.dateReception}</span>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Demandeur</span>
                  <span className="font-medium">{selectedRFQ.demandeur}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Besoin</span>
                  <span className="font-medium">{selectedRFQ.besoin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantité</span>
                  <span className="font-medium">{selectedRFQ.quantite} {selectedRFQ.unite}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Zone</span>
                  <span className="font-medium">{selectedRFQ.zone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deadline</span>
                  <span className="font-medium">{selectedRFQ.deadline}</span>
                </div>
                {selectedRFQ.budget && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Budget estimé</span>
                    <span className="font-bold text-primary">{selectedRFQ.budget.toLocaleString()} FCFA</span>
                  </div>
                )}
                {selectedRFQ.details && (
                  <div className="border-t pt-3">
                    <p className="text-sm text-muted-foreground">Détails</p>
                    <p>{selectedRFQ.details}</p>
                  </div>
                )}
              </div>

              {selectedRFQ.status === "Received" && (
                <Button 
                  className="w-full"
                  onClick={() => {
                    setShowQuoteDialog(true);
                  }}
                >
                  <Send className="w-4 h-4 mr-1" />
                  Envoyer un devis
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
