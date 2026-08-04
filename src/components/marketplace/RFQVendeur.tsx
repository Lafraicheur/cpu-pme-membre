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
  Upload,
  X,
  User,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { rfqApi, type RFQVendorReceived, type RFQVendorStats, type RFQNegotiationMessage } from "@/lib/api";

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
  quoteId?: string;
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
    quoteId: r.myQuote?.id,
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

  // Dialog Négociation
  const [showNegotiationDialog, setShowNegotiationDialog] = useState(false);
  const [negotiationRFQ, setNegotiationRFQ] = useState<RFQ | null>(null);
  const [negotiationMessages, setNegotiationMessages] = useState<RFQNegotiationMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [messageFiles, setMessageFiles] = useState<File[]>([]);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const [showProformaForm, setShowProformaForm] = useState(false);
  const [proformaData, setProformaData] = useState({
    proformaNumber: "",
    totalAmount: "",
    depositRate: "30",
    depositAmount: "",
    validUntil: "",
    note: "",
  });
  const [isSendingProforma, setIsSendingProforma] = useState(false);
  const [proformaError, setProformaError] = useState<string | null>(null);

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

  const openNegotiation = (rfq: RFQ) => {
    if (!rfq.quoteId) return;
    setNegotiationRFQ(rfq);
    setNegotiationMessages([]);
    setMessagesError(null);
    setNewMessage("");
    setMessageFiles([]);
    setShowProformaForm(false);
    setProformaError(null);
    setShowNegotiationDialog(true);
    setIsLoadingMessages(true);
    rfqApi.getVendorNegotiationMessages(rfq.quoteId)
      .then(setNegotiationMessages)
      .catch(() => setMessagesError("Impossible de charger les messages."))
      .finally(() => setIsLoadingMessages(false));
  };

  const handleSendMessage = async () => {
    if (!negotiationRFQ?.quoteId || !newMessage.trim()) return;
    const quoteId = negotiationRFQ.quoteId;
    setIsSendingMessage(true);
    setMessagesError(null);
    try {
      if (negotiationMessages.length > 0) {
        const updated = await rfqApi.sendVendorNegotiationMessage(quoteId, newMessage.trim(), messageFiles);
        setNegotiationMessages(updated);
      } else {
        await rfqApi.openVendorNegotiation(quoteId, newMessage.trim(), messageFiles);
        const updated = await rfqApi.getVendorNegotiationMessages(quoteId);
        setNegotiationMessages(updated);
      }
      setNewMessage("");
      setMessageFiles([]);
      loadReceived();
    } catch (e: unknown) {
      setMessagesError(e instanceof Error ? e.message : "Erreur lors de l'envoi du message.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleSendProforma = async () => {
    if (!negotiationRFQ?.quoteId) return;
    const totalAmount = parseFloat(proformaData.totalAmount);
    if (!proformaData.proformaNumber.trim() || isNaN(totalAmount) || totalAmount <= 0) {
      setProformaError("Le numéro de proforma et le montant total sont requis.");
      return;
    }
    const quoteId = negotiationRFQ.quoteId;
    setIsSendingProforma(true);
    setProformaError(null);
    try {
      await rfqApi.sendVendorProforma(quoteId, {
        proformaNumber: proformaData.proformaNumber.trim(),
        totalAmount,
        depositRate: parseFloat(proformaData.depositRate) || 0,
        depositAmount: parseFloat(proformaData.depositAmount) || 0,
        validUntil: proformaData.validUntil,
        note: proformaData.note || undefined,
      });
      setShowProformaForm(false);
      setProformaData({ proformaNumber: "", totalAmount: "", depositRate: "30", depositAmount: "", validUntil: "", note: "" });
      const updated = await rfqApi.getVendorNegotiationMessages(quoteId);
      setNegotiationMessages(updated);
      loadReceived();
    } catch (e: unknown) {
      setProformaError(e instanceof Error ? e.message : "Erreur lors de l'envoi de la proforma.");
    } finally {
      setIsSendingProforma(false);
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
                      {(rfq.status === "Negotiating" || rfq.status === "Quoted") && rfq.quoteId && (
                        <Button size="sm" variant="outline" onClick={() => openNegotiation(rfq)}>
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
              {(selectedRFQ.status === "Negotiating" || selectedRFQ.status === "Quoted") && selectedRFQ.quoteId && (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => openNegotiation(selectedRFQ)}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Négocier
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog Négociation */}
      <Dialog open={showNegotiationDialog} onOpenChange={setShowNegotiationDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Négociation — {negotiationRFQ?.id}
            </DialogTitle>
            <DialogDescription>
              {negotiationRFQ?.besoin} • {negotiationRFQ?.demandeur}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col py-2">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[200px]">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Chargement des messages...
                </div>
              ) : negotiationMessages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucun message pour le moment. Envoyez le premier message pour ouvrir la négociation.</p>
                </div>
              ) : (
                negotiationMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "p-3 rounded-lg max-w-[85%]",
                      msg.senderRole === "vendor" ? "bg-primary/10 ml-auto" : "bg-muted"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs font-medium">
                        {msg.senderRole === "vendor" ? "Vous" : "Acheteur"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleString("fr-FR") : ""}
                      </span>
                    </div>
                    <p className="text-sm">{msg.content}</p>
                    {msg.proformaNumber && (
                      <div className="mt-2 p-2 rounded-lg bg-background/60 text-xs space-y-0.5">
                        <p className="font-medium">Proforma {msg.proformaNumber}</p>
                        <p>Total : {msg.proformaTotal.toLocaleString()} FCFA</p>
                        <p>Acompte : {msg.proformaDepositRate}% ({msg.proformaDepositAmount.toLocaleString()} FCFA)</p>
                        {msg.proformaValidUntil && (
                          <p>Valide jusqu'au {new Date(msg.proformaValidUntil).toLocaleDateString("fr-FR")}</p>
                        )}
                      </div>
                    )}
                    {msg.attachmentsUrls?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {msg.attachmentsUrls.map((url, idx) => (
                          <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                            <Badge variant="outline" className="text-xs gap-1">
                              <FileText className="w-3 h-3" />
                              Pièce jointe {idx + 1}
                            </Badge>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {messagesError && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {messagesError}
              </div>
            )}

            {/* Formulaire proforma */}
            {showProformaForm && (
              <div className="border rounded-lg p-3 space-y-3 mb-3 bg-muted/30">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    Envoyer une proforma
                  </p>
                  <button onClick={() => setShowProformaForm(false)}>
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Numéro de proforma *</Label>
                    <Input
                      placeholder="PRO-2024-001"
                      value={proformaData.proformaNumber}
                      onChange={(e) => setProformaData({ ...proformaData, proformaNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Montant total (FCFA) *</Label>
                    <Input
                      type="number"
                      placeholder="1400000"
                      value={proformaData.totalAmount}
                      onChange={(e) => setProformaData({ ...proformaData, totalAmount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Taux d'acompte (%)</Label>
                    <Input
                      type="number"
                      value={proformaData.depositRate}
                      onChange={(e) => setProformaData({ ...proformaData, depositRate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Montant de l'acompte (FCFA)</Label>
                    <Input
                      type="number"
                      placeholder="420000"
                      value={proformaData.depositAmount}
                      onChange={(e) => setProformaData({ ...proformaData, depositAmount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs">Valide jusqu'au</Label>
                    <Input
                      type="date"
                      value={proformaData.validUntil}
                      onChange={(e) => setProformaData({ ...proformaData, validUntil: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs">Note</Label>
                    <Textarea
                      rows={2}
                      placeholder="Voici notre facture proforma."
                      value={proformaData.note}
                      onChange={(e) => setProformaData({ ...proformaData, note: e.target.value })}
                    />
                  </div>
                </div>
                {proformaError && (
                  <div className="p-2 rounded-lg bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {proformaError}
                  </div>
                )}
                <Button
                  size="sm"
                  className="w-full"
                  disabled={isSendingProforma || !proformaData.proformaNumber || !proformaData.totalAmount}
                  onClick={handleSendProforma}
                >
                  {isSendingProforma
                    ? <><RefreshCw className="w-4 h-4 mr-1 animate-spin" />Envoi...</>
                    : <><Send className="w-4 h-4 mr-1" />Envoyer la proforma</>}
                </Button>
              </div>
            )}

            {/* Zone de saisie */}
            <div className="space-y-2 border-t pt-3">
              <Textarea
                placeholder="Rédigez votre message..."
                rows={3}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              {messageFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {messageFiles.map((f, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1 pr-1">
                      {f.name}
                      <button
                        type="button"
                        onClick={() => setMessageFiles((prev) => prev.filter((_, i) => i !== idx))}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="inline-flex">
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const selected = Array.from(e.target.files ?? []);
                        setMessageFiles((prev) => [...prev, ...selected]);
                        e.target.value = "";
                      }}
                    />
                    <Button variant="outline" size="sm" className="gap-1" asChild>
                      <span>
                        <Upload className="w-4 h-4" />
                        Joindre
                      </span>
                    </Button>
                  </label>
                  {!showProformaForm && (
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowProformaForm(true)}>
                      <DollarSign className="w-4 h-4" />
                      Proforma
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowNegotiationDialog(false)}>
                    Fermer
                  </Button>
                  <Button
                    disabled={isSendingMessage || !newMessage.trim()}
                    onClick={handleSendMessage}
                  >
                    {isSendingMessage
                      ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                      : <Send className="w-4 h-4 mr-1" />}
                    Envoyer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
