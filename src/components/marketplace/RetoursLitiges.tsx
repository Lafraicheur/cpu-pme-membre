import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RotateCcw,
  AlertTriangle,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Package,
  Eye,
  Upload,
  Shield,
  Scale,
  FileText,
  Send,
  User,
  Calendar,
  ArrowRight,
  Truck,
  CreditCard,
  History,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  DollarSign,
  Camera,
  TrendingDown,
  Ban,
  Gavel,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { returnsApi, litigesApi, type ReturnVendor, type ReturnVendorStats, type LitigeVendor, type LitigeStatusApi } from "@/lib/api";

// Types
type RetourStatus = "ReturnRequested" | "Approved" | "Rejected" | "InTransit" | "Received" | "Inspected" | "Refunded" | "PartialRefund" | "Closed";
type LitigeStatus = "Opened" | "VendeurResponse" | "InMediation" | "ProposalSent" | "Resolved" | "Refunded" | "Rejected" | "Closed";
type LitigeType = "retard_livraison" | "non_conforme" | "endommage" | "quantite" | "qualite" | "fraude" | "autre";

interface Retour {
  id: string;
  apiId: string;
  commande: string;
  produit: string;
  client: string;
  motif: string;
  motifDetail: string;
  statut: RetourStatus;
  dateRetour: string;
  dateMaj: string;
  montant: number;
  montantPropose?: number;
  preuves: string[];
  timeline: TimelineEvent[];
  inspectionNotes?: string;
}

interface Litige {
  id: string;
  apiId: string;
  commande: string;
  produit: string;
  plaignant: string;
  type: LitigeType;
  statut: LitigeStatus;
  dateOuverture: string;
  dateMaj: string;
  montant: number;
  montantPropose?: number;
  messages: Message[];
  description: string;
  propositionMediation?: string;
  delaiReponse?: string;
}

interface TimelineEvent {
  date: string;
  action: string;
  auteur: string;
  role: "acheteur" | "vendeur" | "mediateur" | "systeme";
}

interface Message {
  id: string;
  auteur: string;
  role: "client" | "vendeur" | "mediateur";
  message: string;
  date: string;
  pieces?: string[];
}

// Config
const retourStatusConfig: Record<RetourStatus, { label: string; color: string; icon: typeof Clock; step: number }> = {
  ReturnRequested: { label: "Demandé", color: "text-blue-500", icon: Clock, step: 1 },
  Approved: { label: "Approuvé", color: "text-green-500", icon: CheckCircle2, step: 2 },
  Rejected: { label: "Refusé", color: "text-destructive", icon: XCircle, step: -1 },
  InTransit: { label: "En transit retour", color: "text-purple-500", icon: Truck, step: 3 },
  Received: { label: "Reçu", color: "text-blue-600", icon: Package, step: 4 },
  Inspected: { label: "Inspecté", color: "text-amber-500", icon: Eye, step: 5 },
  Refunded: { label: "Remboursé", color: "text-green-600", icon: CreditCard, step: 6 },
  PartialRefund: { label: "Remb. partiel", color: "text-amber-600", icon: CreditCard, step: 6 },
  Closed: { label: "Clôturé", color: "text-muted-foreground", icon: CheckCircle2, step: 7 },
};

const litigeStatusConfig: Record<LitigeStatus, { label: string; color: string; icon: typeof Clock }> = {
  Opened: { label: "Ouvert", color: "text-blue-500", icon: AlertTriangle },
  VendeurResponse: { label: "Réponse attendue", color: "text-amber-500", icon: Clock },
  InMediation: { label: "En médiation", color: "text-purple-500", icon: Scale },
  ProposalSent: { label: "Proposition envoyée", color: "text-blue-600", icon: Send },
  Resolved: { label: "Résolu", color: "text-green-500", icon: CheckCircle2 },
  Refunded: { label: "Remboursé", color: "text-green-600", icon: CreditCard },
  Rejected: { label: "Rejeté", color: "text-muted-foreground", icon: XCircle },
  Closed: { label: "Clôturé", color: "text-muted-foreground", icon: CheckCircle2 },
};

const litigeTypeLabels: Record<LitigeType, string> = {
  retard_livraison: "Retard de livraison",
  non_conforme: "Produit non conforme",
  endommage: "Produit endommagé",
  quantite: "Quantité incorrecte",
  qualite: "Qualité insuffisante",
  fraude: "Suspicion de fraude",
  autre: "Autre",
};

/** Statut API (libellés FR) → statut d'affichage. */
function mapReturnStatus(s: string): RetourStatus {
  const v = (s || "").toLowerCase();
  if (v.includes("approuv")) return "Approved";
  if (v.includes("rejet") || v.includes("refus")) return "Rejected";
  if (v.includes("transit")) return "InTransit";
  if (v.includes("inspect")) return "Inspected";
  if (v.includes("reçu") || v.includes("recu") || v.includes("retourn")) return "Received";
  if (v.includes("partiel")) return "PartialRefund";
  if (v.includes("rembours")) return "Refunded";
  if (v.includes("clôtur") || v.includes("clotur") || v.includes("clos") || v.includes("fermé")) return "Closed";
  return "ReturnRequested";
}

function mapReturn(r: ReturnVendor): Retour {
  const fmt = (d: string | null) => (d ? d.replace("T", " ").slice(0, 16) : "");
  const timeline: TimelineEvent[] = [];
  if (r.createdAt) timeline.push({ date: fmt(r.createdAt), action: "Demande de retour créée", auteur: r.buyer?.name || "Acheteur", role: "acheteur" });
  if (r.approvedAt) timeline.push({ date: fmt(r.approvedAt), action: "Retour approuvé", auteur: "Vous", role: "vendeur" });
  if (r.rejectedAt) timeline.push({ date: fmt(r.rejectedAt), action: `Retour refusé${r.decisionReason ? ` — ${r.decisionReason}` : ""}`, auteur: "Vous", role: "vendeur" });
  if (r.returnedAt) timeline.push({ date: fmt(r.returnedAt), action: "Produit retourné", auteur: "Système", role: "systeme" });
  if (r.refundedAt) timeline.push({ date: fmt(r.refundedAt), action: "Remboursement effectué", auteur: "Système", role: "systeme" });
  if (r.closedAt) timeline.push({ date: fmt(r.closedAt), action: "Dossier clôturé", auteur: "Vous", role: "vendeur" });
  return {
    id: r.returnNumber || r.id,
    apiId: r.id,
    commande: r.order?.orderNumber || r.orderId || "",
    produit: r.product?.name || (r.productId ? `Produit ${r.productId.slice(0, 8)}` : "—"),
    client: r.buyer?.name || "Acheteur",
    motif: r.reason || "—",
    motifDetail: r.description || "",
    statut: mapReturnStatus(r.status),
    dateRetour: r.createdAt ? r.createdAt.split("T")[0] : "",
    dateMaj: r.updatedAt ? r.updatedAt.split("T")[0] : "",
    montant: r.amount || 0,
    preuves: [],
    timeline,
    inspectionNotes: r.decisionReason || undefined,
  };
}

/** Statut litige API → statut d'affichage. */
function mapLitigeStatus(s: string): LitigeStatus {
  const v = (s || "").toLowerCase();
  if (v.includes("médiation") || v.includes("mediation")) return "InMediation";
  if (v.includes("résolu") || v.includes("resolu")) return "Resolved";
  if (v.includes("rembours")) return "Refunded";
  if (v.includes("rejet") || v.includes("refus")) return "Rejected";
  if (v.includes("clôtur") || v.includes("clotur") || v.includes("clos") || v.includes("fermé")) return "Closed";
  return "Opened";
}

function mapLitigeType(reason: string): LitigeType {
  const v = (reason || "").toLowerCase();
  if (v.includes("retard")) return "retard_livraison";
  if (v.includes("conform")) return "non_conforme";
  if (v.includes("endommag") || v.includes("avari") || v.includes("dommage")) return "endommage";
  if (v.includes("quantit")) return "quantite";
  if (v.includes("qualit")) return "qualite";
  if (v.includes("fraud")) return "fraude";
  return "autre";
}

function mapMessageRole(t: string): "client" | "vendeur" | "mediateur" {
  const v = (t || "").toLowerCase();
  if (v.includes("vendor") || v.includes("vendeur")) return "vendeur";
  if (v.includes("mediat") || v.includes("médiat")) return "mediateur";
  return "client";
}

function mapLitige(l: LitigeVendor): Litige {
  return {
    id: l.litigeNumber || l.id,
    apiId: l.id,
    commande: l.order?.orderNumber || l.orderId || "",
    produit: l.title || "—",
    plaignant: l.buyer?.name || "Acheteur",
    type: mapLitigeType(l.reason),
    statut: mapLitigeStatus(l.status),
    dateOuverture: l.createdAt ? l.createdAt.split("T")[0] : "",
    dateMaj: l.updatedAt ? l.updatedAt.split("T")[0] : "",
    montant: l.amount || 0,
    messages: (l.messages ?? []).map((m) => ({
      id: m.id,
      auteur: m.senderName || "—",
      role: mapMessageRole(m.senderType),
      message: m.content,
      date: m.createdAt ? m.createdAt.replace("T", " ").slice(0, 16) : "",
      pieces: m.proofUrls,
    })),
    description: l.description || "",
  };
}



export function RetoursLitiges() {
  const [activeTab, setActiveTab] = useState("retours");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRetour, setSelectedRetour] = useState<Retour | null>(null);
  const [selectedLitige, setSelectedLitige] = useState<Litige | null>(null);
  const [showRetourDetail, setShowRetourDetail] = useState(false);
  const [showMediationDialog, setShowMediationDialog] = useState(false);
  const [showReponseDialog, setShowReponseDialog] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [litigeProof, setLitigeProof] = useState<File[]>([]);
  const [reponseType, setReponseType] = useState<string>("");
  const [montantPropose, setMontantPropose] = useState<number>(0);
  const [motifRefus, setMotifRefus] = useState("");
  const { toast } = useToast();

  const [retours, setRetours] = useState<Retour[]>([]);
  const [retoursStats, setRetoursStats] = useState<ReturnVendorStats>({ total: 0, byStatus: {}, refundExposure: 0 });
  const [retoursLoading, setRetoursLoading] = useState(true);
  const [retoursError, setRetoursError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadRetours = useCallback(() => {
    setRetoursLoading(true);
    setRetoursError(null);
    Promise.all([returnsApi.getVendorList(), returnsApi.getVendorStats()])
      .then(([list, stats]) => {
        setRetours(list.map(mapReturn));
        setRetoursStats(stats);
      })
      .catch(() => setRetoursError("Impossible de charger les retours."))
      .finally(() => setRetoursLoading(false));
  }, []);

  useEffect(() => { loadRetours(); }, [loadRetours]);

  const [litiges, setLitiges] = useState<Litige[]>([]);
  const [litigesLoading, setLitigesLoading] = useState(true);
  const [litigesError, setLitigesError] = useState<string | null>(null);
  const [litigeActionLoading, setLitigeActionLoading] = useState(false);

  const loadLitiges = useCallback(() => {
    setLitigesLoading(true);
    setLitigesError(null);
    litigesApi.getVendorList()
      .then((list) => setLitiges(list.map(mapLitige)))
      .catch(() => setLitigesError("Impossible de charger les litiges."))
      .finally(() => setLitigesLoading(false));
  }, []);

  useEffect(() => { loadLitiges(); }, [loadLitiges]);

  // KPIs vendeur (données API réelles)
  const kpis = {
    retoursATraiter: retours.filter(r => r.statut === "ReturnRequested").length,
    retoursEnCours: retours.filter(r => ["Approved", "InTransit", "Received", "Inspected"].includes(r.statut)).length,
    litigesAttente: litiges.filter(l => ["Opened", "VendeurResponse"].includes(l.statut)).length,
    litigesMediation: litiges.filter(l => l.statut === "InMediation").length,
    tauxResolution: 85,
    montantTotalLitiges: litiges.reduce((s, l) => s + l.montant, 0),
    montantRisque: retoursStats.refundExposure || 0,
    scoreReputation: 4.7,
  };

  const filteredRetours = retours.filter(r => {
    const matchSearch = r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.produit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || r.statut === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredLitiges = litiges.filter(l => {
    const matchSearch = l.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.produit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.plaignant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || l.statut === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleApproveRetour = async (retour: Retour) => {
    setActionLoadingId(retour.apiId);
    try {
      await returnsApi.approve(retour.apiId);
      toast({ title: "Retour approuvé", description: `Le retour ${retour.id} a été approuvé. Le client sera notifié pour l'expédition.` });
      loadRetours();
    } catch (e: unknown) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Échec de l'approbation.", variant: "destructive" });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectRetour = async (retour: Retour) => {
    if (!motifRefus) {
      toast({ title: "Motif requis", description: "Veuillez indiquer le motif du refus.", variant: "destructive" });
      return;
    }
    setActionLoadingId(retour.apiId);
    try {
      await returnsApi.reject(retour.apiId, motifRefus);
      toast({ title: "Retour refusé", description: `Le retour ${retour.id} a été refusé. Le client peut escalader vers un litige.` });
      setMotifRefus("");
      setShowReponseDialog(false);
      loadRetours();
    } catch (e: unknown) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Échec du refus.", variant: "destructive" });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmReception = (retour: Retour) => {
    toast({ title: "Réception confirmée", description: `Le colis retour ${retour.id} a été marqué comme reçu. Procédez à l'inspection.` });
  };

  const handleSubmitInspection = (retour: Retour) => {
    toast({ title: "Inspection terminée", description: `L'inspection du retour ${retour.id} est enregistrée.` });
  };

  const handleProcessRefund = async (retour: Retour, montant: number) => {
    setActionLoadingId(retour.apiId);
    try {
      await returnsApi.refund(retour.apiId, montant);
      toast({ title: "Remboursement initié", description: `Remboursement de ${montant.toLocaleString()} FCFA effectué pour ${retour.id}.` });
      loadRetours();
    } catch (e: unknown) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Échec du remboursement.", variant: "destructive" });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCloseRetour = async (retour: Retour) => {
    setActionLoadingId(retour.apiId);
    try {
      await returnsApi.close(retour.apiId);
      toast({ title: "Retour clôturé", description: `Le dossier ${retour.id} a été clôturé.` });
      loadRetours();
    } catch (e: unknown) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Échec de la clôture.", variant: "destructive" });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Ouvre le dialog d'un litige et récupère son détail (messages) depuis l'API.
  const openLitige = (litige: Litige) => {
    setSelectedLitige(litige);
    setShowMediationDialog(true);
    litigesApi.getVendorById(litige.apiId)
      .then((full) => setSelectedLitige(mapLitige(full)))
      .catch(() => { /* on garde les infos de la liste */ });
  };

  const refreshSelectedLitige = (apiId: string) => {
    litigesApi.getVendorById(apiId)
      .then((full) => setSelectedLitige(mapLitige(full)))
      .catch(() => {});
  };

  const handleSendResponse = async () => {
    if (!newMessage.trim() || !selectedLitige) return;
    setLitigeActionLoading(true);
    try {
      await litigesApi.reply(selectedLitige.apiId, newMessage, litigeProof);
      toast({ title: "Réponse envoyée", description: "Votre message a été transmis." });
      setNewMessage("");
      setLitigeProof([]);
      refreshSelectedLitige(selectedLitige.apiId);
      loadLitiges();
    } catch (e: unknown) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Échec de l'envoi.", variant: "destructive" });
    } finally {
      setLitigeActionLoading(false);
    }
  };

  const updateLitigeStatus = async (status: LitigeStatusApi, comment: string, successMsg: string) => {
    if (!selectedLitige) return;
    setLitigeActionLoading(true);
    try {
      await litigesApi.updateStatus(selectedLitige.apiId, status, comment);
      toast({ title: successMsg });
      setShowMediationDialog(false);
      loadLitiges();
    } catch (e: unknown) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Échec de la mise à jour.", variant: "destructive" });
    } finally {
      setLitigeActionLoading(false);
    }
  };

  const handleAcceptMediation = () => updateLitigeStatus("Résolu", "Proposition de médiation acceptée.", "Proposition acceptée");
  const handleContestMediation = () => updateLitigeStatus("En médiation", "Le vendeur conteste la proposition.", "Contestation enregistrée");

  const renderRetourProgress = (statut: RetourStatus) => {
    const steps = ["Demandé", "Approuvé", "En transit", "Reçu", "Inspecté", "Remboursé"];
    const config = retourStatusConfig[statut];
    const currentStep = config.step;
    const isRejected = statut === "Rejected";

    return (
      <div className="flex items-center gap-1 w-full">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center flex-1">
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2",
              idx + 1 <= currentStep
                ? "bg-green-500 border-green-500 text-white"
                : idx + 1 === currentStep + 1 && !isRejected
                ? "border-primary text-primary bg-primary/10"
                : "border-muted-foreground/30 text-muted-foreground"
            )}>
              {idx + 1 <= currentStep ? "✓" : idx + 1}
            </div>
            {idx < steps.length - 1 && (
              <div className={cn("flex-1 h-0.5 mx-0.5", idx + 1 < currentStep ? "bg-green-500" : "bg-muted-foreground/20")} />
            )}
          </div>
        ))}
        {isRejected && <Badge variant="destructive" className="ml-2 text-xs">Refusé</Badge>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* KPIs Vendeur */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={cn("border-red-500/30", kpis.retoursATraiter > 0 && "ring-1 ring-red-500/20")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">À traiter en urgence</p>
                <p className="text-2xl font-bold text-red-500">{kpis.retoursATraiter + kpis.litigesAttente}</p>
                <p className="text-xs text-muted-foreground">
                  {kpis.retoursATraiter} retours + {kpis.litigesAttente} litiges
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Scale className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">En médiation</p>
                <p className="text-2xl font-bold text-amber-500">{kpis.litigesMediation}</p>
                <p className="text-xs text-muted-foreground">
                  Risque: {kpis.montantRisque.toLocaleString()} FCFA
                </p>
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
                <p className="text-xs text-muted-foreground">Taux résolution</p>
                <p className="text-2xl font-bold text-green-500">{kpis.tauxResolution}%</p>
                <Progress value={kpis.tauxResolution} className="h-1.5 mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <TrendingDown className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Impact réputation</p>
                <p className="text-2xl font-bold">{kpis.scoreReputation}/5</p>
                <p className="text-xs text-muted-foreground">
                  {kpis.scoreReputation >= 4.5 ? "✅ Excellent" : kpis.scoreReputation >= 4 ? "⚠️ Bon" : "🔴 À améliorer"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setStatusFilter("all"); setSearchQuery(""); }} className="space-y-4">
        <TabsList>
          <TabsTrigger value="retours" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Retours ({retours.length})
            {kpis.retoursATraiter > 0 && (
              <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-red-500 text-white text-xs">
                {kpis.retoursATraiter}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="litiges" className="gap-2">
            <Scale className="w-4 h-4" />
            Litiges ({litiges.length})
            {kpis.litigesAttente > 0 && (
              <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-amber-500 text-white text-xs">
                {kpis.litigesAttente}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ===== TAB RETOURS ===== */}
        <TabsContent value="retours" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Rechercher un retour..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    {Object.entries(retourStatusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {retoursLoading ? (
            <Card><CardContent className="py-12 flex items-center justify-center text-muted-foreground">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Chargement des retours...
            </CardContent></Card>
          ) : retoursError ? (
            <Card><CardContent className="py-12 text-center">
              <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-destructive opacity-70" />
              <p className="text-sm text-muted-foreground mb-4">{retoursError}</p>
              <Button variant="outline" onClick={loadRetours}><RefreshCw className="w-4 h-4 mr-2" />Réessayer</Button>
            </CardContent></Card>
          ) : filteredRetours.length === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <RotateCcw className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                {retours.length === 0 ? "Aucun retour pour le moment." : "Aucun retour ne correspond à vos filtres."}
              </p>
            </CardContent></Card>
          ) : (
          <div className="space-y-4">
            {filteredRetours.map((retour) => {
              const status = retourStatusConfig[retour.statut];
              const StatusIcon = status.icon;

              return (
                <Card key={retour.id} className={cn(
                  "hover:shadow-md transition-shadow",
                  retour.statut === "ReturnRequested" && "border-red-500/50 ring-1 ring-red-500/20",
                )}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", retour.statut === "ReturnRequested" ? "bg-red-500/10" : "bg-muted")}>
                          <StatusIcon className={cn("w-5 h-5", status.color)} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold">{retour.id}</span>
                            <Badge variant="outline" className={status.color}>{status.label}</Badge>
                            {retour.statut === "ReturnRequested" && (
                              <Badge variant="destructive" className="text-xs animate-pulse">Action requise</Badge>
                            )}
                          </div>
                          <p className="font-medium mt-1">{retour.produit}</p>
                          <p className="text-sm text-muted-foreground">
                            Client: {retour.client} • {retour.commande} • {retour.dateRetour}
                          </p>
                        </div>
                      </div>
                      <p className="text-lg font-bold">{retour.montant.toLocaleString()} FCFA</p>
                    </div>

                    {/* Progression */}
                    <div className="mb-3">{renderRetourProgress(retour.statut)}</div>

                    {/* Motif */}
                    <div className="p-3 rounded-lg bg-muted/50 mb-3">
                      <p className="text-sm"><span className="font-medium text-amber-600">Motif: </span>{retour.motif}</p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{retour.motifDetail}</p>
                    </div>

                    {/* Preuves */}
                    <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Camera className="w-3 h-3" /> {retour.preuves.length} preuve(s)</span>
                      <span className="flex items-center gap-1"><History className="w-3 h-3" /> {retour.timeline.length} étapes</span>
                    </div>

                    {/* Actions selon statut */}
                    <div className="flex items-center justify-end gap-2 border-t pt-3">
                      {(() => { const busy = actionLoadingId === retour.apiId; return (
                        <>
                      {retour.statut === "ReturnRequested" && (
                        <>
                          <Button size="sm" className="gap-1" disabled={busy} onClick={() => handleApproveRetour(retour)}>
                            {busy ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                            Approuver
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1" disabled={busy} onClick={() => {
                            setSelectedRetour(retour);
                            setShowReponseDialog(true);
                          }}>
                            <XCircle className="w-3 h-3" />
                            Refuser
                          </Button>
                        </>
                      )}
                      {retour.statut === "InTransit" && (
                        <Button size="sm" className="gap-1" onClick={() => handleConfirmReception(retour)}>
                          <Package className="w-3 h-3" />
                          Confirmer réception
                        </Button>
                      )}
                      {["Approved", "Received", "Inspected"].includes(retour.statut) && (
                        <Button size="sm" className="gap-1" disabled={busy} onClick={() => handleProcessRefund(retour, retour.montantPropose || retour.montant)}>
                          {busy ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CreditCard className="w-3 h-3" />}
                          Rembourser ({(retour.montantPropose || retour.montant).toLocaleString()} FCFA)
                        </Button>
                      )}
                      {["Refunded", "PartialRefund"].includes(retour.statut) && (
                        <Button size="sm" variant="outline" className="gap-1" disabled={busy} onClick={() => handleCloseRetour(retour)}>
                          {busy ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                          Clôturer
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => { setSelectedRetour(retour); setShowRetourDetail(true); }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                        </>
                      ); })()}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          )}
        </TabsContent>

        {/* ===== TAB LITIGES ===== */}
        <TabsContent value="litiges" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Rechercher un litige..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    {Object.entries(litigeStatusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {litigesLoading ? (
            <Card><CardContent className="py-12 flex items-center justify-center text-muted-foreground">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Chargement des litiges...
            </CardContent></Card>
          ) : litigesError ? (
            <Card><CardContent className="py-12 text-center">
              <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-destructive opacity-70" />
              <p className="text-sm text-muted-foreground mb-4">{litigesError}</p>
              <Button variant="outline" onClick={loadLitiges}><RefreshCw className="w-4 h-4 mr-2" />Réessayer</Button>
            </CardContent></Card>
          ) : filteredLitiges.length === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <Scale className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                {litiges.length === 0 ? "Aucun litige pour le moment." : "Aucun litige ne correspond à vos filtres."}
              </p>
            </CardContent></Card>
          ) : (
          <div className="space-y-4">
            {filteredLitiges.map((litige) => {
              const status = litigeStatusConfig[litige.statut];
              const StatusIcon = status.icon;
              const needsResponse = ["VendeurResponse", "Opened"].includes(litige.statut);
              const inMediation = litige.statut === "InMediation";

              return (
                <Card key={litige.id} className={cn(
                  "hover:shadow-md transition-shadow",
                  needsResponse && "border-red-500/50 ring-1 ring-red-500/20",
                  inMediation && "border-amber-500/50",
                )}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg",
                          needsResponse ? "bg-red-500/10" : inMediation ? "bg-amber-500/10" : "bg-muted"
                        )}>
                          <StatusIcon className={cn("w-5 h-5", status.color)} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold">{litige.id}</span>
                            <Badge variant="outline" className={status.color}>{status.label}</Badge>
                            <Badge variant="secondary" className="text-xs">{litigeTypeLabels[litige.type]}</Badge>
                            {needsResponse && (
                              <Badge variant="destructive" className="text-xs animate-pulse">Réponse requise</Badge>
                            )}
                          </div>
                          <p className="font-medium mt-1">{litige.produit}</p>
                          <p className="text-sm text-muted-foreground">
                            Plaignant: {litige.plaignant} • {litige.commande}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-amber-600">{litige.montant.toLocaleString()} FCFA</p>
                        {litige.delaiReponse && needsResponse && (
                          <p className="text-xs text-red-500 font-medium">
                            ⏰ Délai: {litige.delaiReponse}
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{litige.description}</p>

                    {/* Proposition médiation */}
                    {inMediation && litige.propositionMediation && (
                      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/30 mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Gavel className="w-4 h-4 text-amber-600" />
                          <span className="text-sm font-semibold text-amber-600">Proposition du médiateur</span>
                        </div>
                        <p className="text-sm">{litige.propositionMediation}</p>
                        {litige.montantPropose && (
                          <p className="font-bold text-amber-600 mt-1">{litige.montantPropose.toLocaleString()} FCFA</p>
                        )}
                      </div>
                    )}

                    {/* Infos */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {litige.messages.length} messages</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Ouvert le {litige.dateOuverture}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 border-t pt-3">
                      {needsResponse && (
                        <Button size="sm" className="gap-1" onClick={() => openLitige(litige)}>
                          <Send className="w-3 h-3" />
                          Répondre
                        </Button>
                      )}
                      {inMediation && (
                        <Button size="sm" className="gap-1" onClick={() => openLitige(litige)}>
                          <Scale className="w-3 h-3" />
                          Médiation
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => openLitige(litige)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ===== DIALOG DÉTAIL RETOUR ===== */}
      <Dialog open={showRetourDetail} onOpenChange={setShowRetourDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedRetour && (() => {
            const status = retourStatusConfig[selectedRetour.statut];
            return (
              <>
                <DialogHeader>
                  <DialogTitle>Détail retour {selectedRetour.id}</DialogTitle>
                  <DialogDescription>{selectedRetour.produit} • {selectedRetour.client}</DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4">
                  {/* Progression */}
                  <div>
                    <p className="text-sm font-medium mb-2">Progression</p>
                    {renderRetourProgress(selectedRetour.statut)}
                  </div>

                  {/* Infos */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Commande</p>
                      <p className="font-mono font-medium">{selectedRetour.commande}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Montant</p>
                      <p className="font-bold text-primary">{selectedRetour.montant.toLocaleString()} FCFA</p>
                    </div>
                  </div>

                  {/* Motif détaillé */}
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm font-medium text-amber-600 mb-1">Motif: {selectedRetour.motif}</p>
                    <p className="text-sm">{selectedRetour.motifDetail}</p>
                  </div>

                  {/* Preuves */}
                  <div>
                    <p className="text-sm font-medium mb-2">Preuves fournies par le client</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedRetour.preuves.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted text-sm">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Inspection (si reçu) */}
                  {(selectedRetour.statut === "Received" || selectedRetour.statut === "Inspected") && (
                    <div className="space-y-3 p-4 rounded-lg border border-primary/30 bg-primary/5">
                      <p className="font-semibold flex items-center gap-2"><Eye className="w-4 h-4 text-primary" /> Inspection du retour</p>
                      <div className="space-y-2">
                        <Label>Notes d'inspection</Label>
                        <Textarea
                          placeholder="Décrivez l'état du produit reçu, confirmer ou infirmer les dommages..."
                          rows={3}
                          defaultValue={selectedRetour.inspectionNotes || ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Décision de remboursement</Label>
                        <Select defaultValue={selectedRetour.montantPropose ? "partiel" : ""}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir la décision" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="total">Remboursement total ({selectedRetour.montant.toLocaleString()} FCFA)</SelectItem>
                            <SelectItem value="partiel">Remboursement partiel</SelectItem>
                            <SelectItem value="remplacement">Remplacement du produit</SelectItem>
                            <SelectItem value="avoir">Avoir sur prochaine commande</SelectItem>
                            <SelectItem value="refus">Refus (justification obligatoire)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {selectedRetour.statut === "Received" && (
                        <Button className="w-full gap-2" onClick={() => handleSubmitInspection(selectedRetour)}>
                          <CheckCircle2 className="w-4 h-4" />
                          Valider l'inspection
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Timeline */}
                  <div>
                    <p className="text-sm font-medium mb-3 flex items-center gap-2">
                      <History className="w-4 h-4" /> Historique
                    </p>
                    <div className="space-y-0">
                      {selectedRetour.timeline.map((event, idx) => (
                        <div key={idx} className="flex gap-3 pb-3 relative">
                          {idx < selectedRetour.timeline.length - 1 && (
                            <div className="absolute left-[11px] top-6 w-0.5 h-full bg-muted-foreground/20" />
                          )}
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10",
                            event.role === "vendeur" ? "bg-primary/20" : event.role === "acheteur" ? "bg-blue-500/20" : "bg-muted",
                          )}>
                            {event.role === "systeme" ? <RefreshCw className="w-3 h-3 text-muted-foreground" /> : <User className="w-3 h-3 text-muted-foreground" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{event.action}</p>
                            <p className="text-xs text-muted-foreground">{event.auteur} • {event.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ===== DIALOG MÉDIATION LITIGE ===== */}
      <Dialog open={showMediationDialog} onOpenChange={setShowMediationDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          {selectedLitige && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-500" />
                  {selectedLitige.statut === "InMediation" ? "Médiation" : "Litige"} - {selectedLitige.id}
                </DialogTitle>
                <DialogDescription>
                  {selectedLitige.produit} • Plaignant: {selectedLitige.plaignant}
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-hidden flex flex-col py-4">
                {/* Résumé */}
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium">Montant en jeu</p>
                      <p className="font-bold text-amber-600">{selectedLitige.montant.toLocaleString()} FCFA</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{litigeTypeLabels[selectedLitige.type]}</Badge>
                      <Badge className={cn("text-white", selectedLitige.statut === "InMediation" ? "bg-amber-500" : "bg-blue-500")}>
                        {litigeStatusConfig[selectedLitige.statut].label}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedLitige.description}</p>
                  {selectedLitige.delaiReponse && selectedLitige.statut === "VendeurResponse" && (
                    <p className="text-xs text-red-500 font-medium mt-2">⏰ Répondez avant le {selectedLitige.delaiReponse} pour éviter une décision par défaut</p>
                  )}
                </div>

                {/* Proposition médiation */}
                {selectedLitige.propositionMediation && selectedLitige.statut === "InMediation" && (
                  <div className="p-4 rounded-lg border-2 border-amber-500/50 bg-amber-500/5 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Gavel className="w-5 h-5 text-amber-600" />
                      <span className="font-bold text-amber-600">Décision du médiateur</span>
                    </div>
                    <p className="text-sm mb-2">{selectedLitige.propositionMediation}</p>
                    {selectedLitige.montantPropose && (
                      <p className="font-bold text-lg text-amber-600 mb-3">{selectedLitige.montantPropose.toLocaleString()} FCFA</p>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" className="gap-1" onClick={handleAcceptMediation}>
                        <ThumbsUp className="w-4 h-4" />
                        Accepter cette proposition
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1" onClick={handleContestMediation}>
                        <ThumbsDown className="w-4 h-4" />
                        Contester
                      </Button>
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                  {selectedLitige.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "p-3 rounded-lg",
                        msg.role === "vendeur" && "bg-primary/10 ml-8",
                        msg.role === "client" && "bg-muted mr-8",
                        msg.role === "mediateur" && "bg-amber-500/10 border border-amber-500/30"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={cn("p-1 rounded-full", msg.role === "mediateur" && "bg-amber-500/20")}>
                          {msg.role === "mediateur" ? <Shield className="w-3 h-3 text-amber-600" /> : <User className="w-3 h-3 text-muted-foreground" />}
                        </div>
                        <span className={cn("text-sm font-medium", msg.role === "mediateur" && "text-amber-600")}>
                          {msg.auteur}
                        </span>
                        <span className="text-xs text-muted-foreground">{msg.date}</span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                      {msg.pieces && msg.pieces.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {msg.pieces.map((p, i) => (
                            <Badge key={i} variant="outline" className="text-xs gap-1">
                              <FileText className="w-3 h-3" />
                              {p}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Zone réponse */}
                {(selectedLitige.statut === "VendeurResponse" || selectedLitige.statut === "InMediation" || selectedLitige.statut === "Opened") && (
                  <div className="space-y-3 border-t pt-4">
                    {selectedLitige.statut === "VendeurResponse" && (
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Type de proposition</Label>
                          <Select value={reponseType} onValueChange={setReponseType}>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Choisir..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="remboursement_total">Remboursement total</SelectItem>
                              <SelectItem value="remboursement_partiel">Remboursement partiel</SelectItem>
                              <SelectItem value="remplacement">Remplacement</SelectItem>
                              <SelectItem value="avoir">Avoir</SelectItem>
                              <SelectItem value="refus">Contestation</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {(reponseType === "remboursement_partiel" || reponseType === "avoir") && (
                          <div className="space-y-1">
                            <Label className="text-xs">Montant proposé (FCFA)</Label>
                            <Input type="number" className="h-9" value={montantPropose} onChange={(e) => setMontantPropose(parseInt(e.target.value) || 0)} />
                          </div>
                        )}
                      </div>
                    )}
                    <Textarea
                      placeholder="Rédigez votre réponse..."
                      rows={3}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <div className="flex items-center justify-between">
                      <label className="inline-flex">
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files ?? []);
                            e.target.value = "";
                            if (files.length) setLitigeProof((prev) => [...prev, ...files]);
                          }}
                        />
                        <Button variant="outline" size="sm" className="gap-1" asChild>
                          <span>
                            <Upload className="w-4 h-4" />
                            Joindre preuve{litigeProof.length > 0 ? ` (${litigeProof.length})` : ""}
                          </span>
                        </Button>
                      </label>
                      <div className="flex gap-2">
                        <Button variant="outline" disabled={litigeActionLoading} onClick={() => setShowMediationDialog(false)}>Fermer</Button>
                        <Button className="gap-1" disabled={litigeActionLoading || !newMessage.trim()} onClick={handleSendResponse}>
                          {litigeActionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          Envoyer
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== DIALOG REFUS RETOUR ===== */}
      <Dialog open={showReponseDialog} onOpenChange={setShowReponseDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-destructive" />
              Refuser le retour {selectedRetour?.id}
            </DialogTitle>
            <DialogDescription>
              Le client pourra escalader vers un litige si le refus n'est pas justifié.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-sm">
              <p className="font-medium text-red-600 mb-1">⚠️ Attention</p>
              <p className="text-muted-foreground">Un refus non justifié peut impacter votre score vendeur et déclencher une médiation automatique.</p>
            </div>
            <div className="space-y-2">
              <Label>Motif du refus (obligatoire)</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un motif" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delai">Délai de retour dépassé ({">"} 14 jours)</SelectItem>
                  <SelectItem value="usage">Produit utilisé/ouvert</SelectItem>
                  <SelectItem value="preuves">Preuves insuffisantes</SelectItem>
                  <SelectItem value="conforme">Produit conforme à la description</SelectItem>
                  <SelectItem value="autre">Autre motif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Explication détaillée</Label>
              <Textarea
                placeholder="Expliquez pourquoi vous refusez ce retour..."
                rows={3}
                value={motifRefus}
                onChange={(e) => setMotifRefus(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Preuves à l'appui (optionnel)</Label>
              <Button variant="outline" size="sm" className="gap-1">
                <Upload className="w-4 h-4" />
                Joindre des preuves
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReponseDialog(false)}>Annuler</Button>
            <Button variant="destructive" onClick={() => {
              if (selectedRetour) handleRejectRetour(selectedRetour);
              setShowReponseDialog(false);
            }}>
              <Ban className="w-4 h-4 mr-1" />
              Confirmer le refus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
