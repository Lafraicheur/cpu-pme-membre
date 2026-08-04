import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { returnsApi, ordersApi, type BuyerOrder, type ReturnBuyerItem } from "@/lib/api";
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
  Plus,
  Camera,
  Truck,
  CreditCard,
  ArrowRight,
  ChevronRight,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Star,
  History,
  Ban,
  RefreshCw,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Types
type ReclamationStatus = "brouillon" | "soumise" | "en_examen" | "approuvee" | "retour_en_cours" | "recue_vendeur" | "remboursee" | "refusee" | "escalade" | "cloturee";
type ReclamationType = "retour" | "reclamation" | "litige";
type ReclamationMotif = "produit_endommage" | "non_conforme" | "quantite_incorrecte" | "retard_livraison" | "produit_manquant" | "qualite_insuffisante" | "erreur_commande" | "autre";

interface Reclamation {
  id: string;
  apiId: string;
  commande: string;
  produit: string;
  vendeur: string;
  type: ReclamationType;
  motif: ReclamationMotif;
  statut: ReclamationStatus;
  dateCreation: string;
  dateMaj: string;
  montant: number;
  montantRembourse?: number;
  description: string;
  preuves: string[];
  timeline: TimelineEvent[];
  propositionVendeur?: PropositionResolution;
  messageCount: number;
}

interface TimelineEvent {
  date: string;
  action: string;
  auteur: string;
  role: "acheteur" | "vendeur" | "mediateur" | "systeme";
  detail?: string;
}

interface PropositionResolution {
  type: "remboursement_total" | "remboursement_partiel" | "remplacement" | "avoir" | "refus";
  montant?: number;
  pourcentage?: number;
  commentaire: string;
  dateProposition: string;
}

interface NouvelleReclamation {
  commande: string;
  produit: string;
  type: ReclamationType;
  motif: ReclamationMotif;
  description: string;
  montantDemande: number;
  preuves: File[];
}

const statutConfig: Record<ReclamationStatus, { label: string; color: string; icon: typeof Clock; step: number }> = {
  brouillon: { label: "Brouillon", color: "text-muted-foreground", icon: FileText, step: 0 },
  soumise: { label: "Soumise", color: "text-blue-500", icon: Send, step: 1 },
  en_examen: { label: "En examen", color: "text-amber-500", icon: Eye, step: 2 },
  approuvee: { label: "Approuvée", color: "text-green-500", icon: CheckCircle2, step: 3 },
  retour_en_cours: { label: "Retour en cours", color: "text-purple-500", icon: Truck, step: 4 },
  recue_vendeur: { label: "Reçue vendeur", color: "text-blue-600", icon: Package, step: 5 },
  remboursee: { label: "Remboursée", color: "text-green-600", icon: CreditCard, step: 6 },
  refusee: { label: "Refusée", color: "text-destructive", icon: XCircle, step: -1 },
  escalade: { label: "Escaladée (litige)", color: "text-red-500", icon: AlertTriangle, step: -2 },
  cloturee: { label: "Clôturée", color: "text-muted-foreground", icon: CheckCircle2, step: 7 },
};

const motifLabels: Record<ReclamationMotif, string> = {
  produit_endommage: "Produit endommagé à la réception",
  non_conforme: "Produit non conforme à la description",
  quantite_incorrecte: "Quantité incorrecte",
  retard_livraison: "Retard de livraison excessif",
  produit_manquant: "Produit manquant dans la commande",
  qualite_insuffisante: "Qualité insuffisante",
  erreur_commande: "Erreur dans la commande",
  autre: "Autre motif",
};

const typeLabels: Record<ReclamationType, { label: string; color: string }> = {
  retour: { label: "Retour produit", color: "text-blue-500" },
  reclamation: { label: "Réclamation", color: "text-amber-500" },
  litige: { label: "Litige", color: "text-red-500" },
};

function getCommandeProduit(cmd: BuyerOrder): string {
  return cmd.productVariant?.product?.name ?? cmd.product?.name ?? cmd.productVariant?.name ?? "Produit";
}

function getCommandeVendeur(cmd: BuyerOrder): string {
  return cmd.boutique?.name ?? cmd.boutique?.nom ?? "Vendeur";
}

function mapReturnToReclamation(r: ReturnBuyerItem): Reclamation {
  const fmtDate = (d?: string | null) => (d ? d.split("T")[0] : "");
  const fmtDateTime = (d?: string | null) => (d ? d.replace("T", " ").slice(0, 16) : "");

  const timeline: TimelineEvent[] = [];
  if (r.createdAt) timeline.push({ date: fmtDateTime(r.createdAt), action: "Réclamation créée", auteur: "Vous", role: "acheteur" });
  if (r.approvedAt) timeline.push({ date: fmtDateTime(r.approvedAt), action: "Approuvée par le vendeur", auteur: "Vendeur", role: "vendeur" });
  if (r.rejectedAt) timeline.push({ date: fmtDateTime(r.rejectedAt), action: `Refusée par le vendeur${r.decisionReason ? ` — ${r.decisionReason}` : ""}`, auteur: "Vendeur", role: "vendeur" });
  if (r.returnedAt) timeline.push({ date: fmtDateTime(r.returnedAt), action: "Produit expédié", auteur: "Vous", role: "acheteur" });
  if (r.refundedAt) timeline.push({ date: fmtDateTime(r.refundedAt), action: "Remboursement effectué", auteur: "Système", role: "systeme" });
  if (r.closedAt) timeline.push({ date: fmtDateTime(r.closedAt), action: "Dossier clôturé", auteur: "Système", role: "systeme" });

  const proposition: PropositionResolution | undefined = r.proposition
    ? {
        type: (r.proposition.type as PropositionResolution["type"]) ?? "remboursement_partiel",
        montant: r.proposition.montant,
        pourcentage: r.proposition.pourcentage,
        commentaire: r.proposition.commentaire ?? "",
        dateProposition: r.proposition.dateProposition ?? "",
      }
    : undefined;

  return {
    id: r.returnNumber || r.id,
    apiId: r.id,
    commande: r.order?.orderNumber ?? r.orderId,
    produit: r.product?.name ?? "Produit",
    vendeur: r.vendor?.name ?? r.vendor?.nom ?? r.boutique?.name ?? r.boutique?.nom ?? "Vendeur",
    type: ((r.requestType ?? r.type) as ReclamationType) ?? "retour",
    motif: ((r.motif ?? r.reason) as ReclamationMotif) ?? "autre",
    statut: r.status as ReclamationStatus,
    dateCreation: fmtDate(r.createdAt),
    dateMaj: fmtDate(r.updatedAt),
    montant: r.requestedAmount ?? r.amount ?? 0,
    montantRembourse: r.refundedAmount || undefined,
    description: r.description ?? "",
    preuves: r.media ?? [],
    timeline,
    propositionVendeur: proposition,
    messageCount: r.messageCount ?? 0,
  };
}

export function ReclamationsAcheteur() {
  const [activeTab, setActiveTab] = useState("mes-reclamations");
  const [searchQuery, setSearchQuery] = useState("");
  const [statutFilter, setStatutFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedReclamation, setSelectedReclamation] = useState<Reclamation | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showPropositionDialog, setShowPropositionDialog] = useState(false);
  const [showEscalateDialog, setShowEscalateDialog] = useState(false);
  const [escalateTarget, setEscalateTarget] = useState<Reclamation | null>(null);
  const [escalateReason, setEscalateReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: commandesPage, isLoading: isLoadingCommandes } = useQuery({
    queryKey: ["marketplace", "orders", "buyer", "for-return"],
    queryFn: () => ordersApi.getBuyerList({ limit: 100 }),
    enabled: showCreateDialog,
  });
  const commandesAcheteur = commandesPage?.data ?? [];

  // Formulaire nouvelle réclamation
  const [newRecl, setNewRecl] = useState({
    commande: "",
    type: "retour" as ReclamationType,
    motif: "" as ReclamationMotif | "",
    description: "",
    montantDemande: 0,
    preuves: [] as File[],
  });

  const createReclamationMutation = useMutation({
    mutationFn: returnsApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["marketplace", "returns", "buyer"] });
      toast({
        title: "Réclamation créée",
        description: `${data.returnNumber ?? "Votre réclamation"} a été soumise et transmise au vendeur.`,
      });
      setShowCreateDialog(false);
      setNewRecl({ commande: "", type: "retour", motif: "", description: "", montantDemande: 0, preuves: [] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de soumettre la réclamation.",
        variant: "destructive",
      });
    },
  });

  const { data: buyerStats } = useQuery({
    queryKey: ["marketplace", "returns", "buyer", "stats"],
    queryFn: returnsApi.getBuyerStats,
  });

  const kpis = {
    enCours: buyerStats?.enCours ?? 0,
    propositionsAttente: buyerStats?.propositionsAttente ?? 0,
    litiges: buyerStats?.litiges ?? 0,
    resolues: buyerStats?.resolues ?? 0,
    montantRecupere: buyerStats?.montantRecupere ?? 0,
  };

  const {
    data: returnsPage,
    isLoading: isLoadingReclamations,
    isError: isReclamationsError,
    refetch: refetchReclamations,
  } = useQuery({
    queryKey: ["marketplace", "returns", "buyer", "list"],
    queryFn: () => returnsApi.getBuyerReturnsList({ limit: 100 }),
  });

  const reclamations = (returnsPage?.data ?? []).map(mapReturnToReclamation);

  const filteredReclamations = reclamations.filter(r => {
    const matchSearch = r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.produit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vendeur.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatut = statutFilter === "all" || r.statut === statutFilter;
    const matchType = typeFilter === "all" || r.type === typeFilter;
    return matchSearch && matchStatut && matchType;
  });

  const handleCreateReclamation = () => {
    if (!newRecl.commande || !newRecl.motif || !newRecl.description) return;
    createReclamationMutation.mutate({
      orderId: newRecl.commande,
      requestType: newRecl.type,
      motif: newRecl.motif,
      description: newRecl.description,
      requestedAmount: newRecl.montantDemande || undefined,
      media: newRecl.preuves,
    });
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setNewRecl((prev) => ({ ...prev, preuves: [...prev.preuves, ...Array.from(files)] }));
  };

  const handleRemoveFile = (index: number) => {
    setNewRecl((prev) => ({ ...prev, preuves: prev.preuves.filter((_, i) => i !== index) }));
  };

  const invalidateReturns = () => {
    queryClient.invalidateQueries({ queryKey: ["marketplace", "returns", "buyer"] });
  };

  const acceptProposalMutation = useMutation({
    mutationFn: returnsApi.acceptProposal,
    onSuccess: () => {
      invalidateReturns();
      toast({
        title: "Proposition acceptée",
        description: "Vous avez accepté la proposition du vendeur. Le processus de résolution est en cours.",
      });
      setShowPropositionDialog(false);
      setShowDetailDialog(false);
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message || "Impossible d'accepter la proposition.", variant: "destructive" });
    },
  });

  const rejectProposalMutation = useMutation({
    mutationFn: returnsApi.rejectProposal,
    onSuccess: () => {
      invalidateReturns();
      toast({
        title: "Proposition refusée",
        description: "Vous pouvez escalader vers la médiation CPU-PME.",
      });
      setShowPropositionDialog(false);
      setShowDetailDialog(false);
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message || "Impossible de refuser la proposition.", variant: "destructive" });
    },
  });

  const confirmReturnedMutation = useMutation({
    mutationFn: returnsApi.confirmReturned,
    onSuccess: () => {
      invalidateReturns();
      toast({
        title: "Expédition confirmée",
        description: "Le vendeur a été notifié de l'expédition de votre retour.",
      });
      setShowDetailDialog(false);
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message || "Impossible de confirmer l'expédition.", variant: "destructive" });
    },
  });

  const escalateMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => returnsApi.escalateBuyer(id, reason),
    onSuccess: () => {
      invalidateReturns();
      toast({
        title: "Réclamation escaladée",
        description: "La réclamation a été transmise au médiateur CPU-PME.",
      });
      setShowEscalateDialog(false);
      setShowDetailDialog(false);
      setEscalateTarget(null);
      setEscalateReason("");
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message || "Impossible d'escalader la réclamation.", variant: "destructive" });
    },
  });

  const handleAcceptProposition = (recl: Reclamation) => {
    acceptProposalMutation.mutate(recl.apiId);
  };

  const handleRejectProposition = (recl: Reclamation) => {
    rejectProposalMutation.mutate(recl.apiId);
  };

  const handleConfirmReturned = (recl: Reclamation) => {
    confirmReturnedMutation.mutate(recl.apiId);
  };

  const handleEscalate = (recl: Reclamation) => {
    setEscalateTarget(recl);
    setEscalateReason("");
    setShowEscalateDialog(true);
  };

  const handleConfirmEscalate = () => {
    if (!escalateTarget || !escalateReason.trim()) return;
    escalateMutation.mutate({ id: escalateTarget.apiId, reason: escalateReason.trim() });
  };

  const openDetail = (recl: Reclamation) => {
    setSelectedReclamation(recl);
    setShowDetailDialog(true);
    returnsApi.getBuyerReturnDetail(recl.apiId)
      .then((full) => setSelectedReclamation(mapReturnToReclamation(full)))
      .catch(() => { /* on garde les infos de la liste */ });
  };

  const renderProgressSteps = (statut: ReclamationStatus) => {
    const steps = ["Soumise", "En examen", "Approuvée", "Retour", "Reçue", "Remboursée"];
    const currentStep = (statutConfig[statut] ?? statutConfig.brouillon).step;
    const isRejected = statut === "refusee";
    const isEscalated = statut === "escalade";

    return (
      <div className="flex items-center gap-1 w-full">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center flex-1">
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2",
              idx + 1 <= currentStep
                ? "bg-green-500 border-green-500 text-white"
                : idx + 1 === currentStep + 1 && !isRejected && !isEscalated
                ? "border-primary text-primary bg-primary/10"
                : "border-muted-foreground/30 text-muted-foreground"
            )}>
              {idx + 1 <= currentStep ? "✓" : idx + 1}
            </div>
            {idx < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-1",
                idx + 1 < currentStep ? "bg-green-500" : "bg-muted-foreground/20"
              )} />
            )}
          </div>
        ))}
        {isRejected && (
          <Badge variant="destructive" className="ml-2 text-xs">Refusée</Badge>
        )}
        {isEscalated && (
          <Badge className="ml-2 text-xs bg-red-500 text-white">Litige</Badge>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* KPIs Acheteur */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">En cours</p>
                <p className="text-2xl font-bold text-blue-500">{kpis.enCours}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <MessageSquare className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Propositions reçues</p>
                <p className="text-2xl font-bold text-amber-500">{kpis.propositionsAttente}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Litiges ouverts</p>
                <p className="text-2xl font-bold text-red-500">{kpis.litiges}</p>
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
                <p className="text-xs text-muted-foreground">Résolues</p>
                <p className="text-2xl font-bold text-green-500">{kpis.resolues}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Récupéré</p>
                <p className="text-lg font-bold text-primary">{kpis.montantRecupere.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">FCFA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions + Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4" />
              Nouvelle réclamation
            </Button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par N°, produit ou vendeur..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="retour">Retours</SelectItem>
                <SelectItem value="reclamation">Réclamations</SelectItem>
                <SelectItem value="litige">Litiges</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statutFilter} onValueChange={setStatutFilter}>
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="soumise">Soumise</SelectItem>
                <SelectItem value="en_examen">En examen</SelectItem>
                <SelectItem value="approuvee">Approuvée</SelectItem>
                <SelectItem value="retour_en_cours">Retour en cours</SelectItem>
                <SelectItem value="remboursee">Remboursée</SelectItem>
                <SelectItem value="refusee">Refusée</SelectItem>
                <SelectItem value="escalade">Escaladée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des réclamations */}
      {isLoadingReclamations ? (
        <Card><CardContent className="py-12 flex items-center justify-center text-muted-foreground">
          <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Chargement des réclamations...
        </CardContent></Card>
      ) : isReclamationsError ? (
        <Card><CardContent className="py-12 text-center">
          <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-destructive opacity-70" />
          <p className="text-sm text-muted-foreground mb-4">Impossible de charger vos réclamations.</p>
          <Button variant="outline" onClick={() => refetchReclamations()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </CardContent></Card>
      ) : filteredReclamations.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <RotateCcw className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">
            {reclamations.length === 0 ? "Aucune réclamation pour le moment." : "Aucune réclamation ne correspond à vos filtres."}
          </p>
        </CardContent></Card>
      ) : (
      <div className="space-y-4">
        {filteredReclamations.map((recl) => {
          const statut = statutConfig[recl.statut] ?? statutConfig.brouillon;
          const StatutIcon = statut.icon;
          const typeInfo = typeLabels[recl.type] ?? typeLabels.retour;
          const hasProposition = recl.propositionVendeur && recl.statut === "en_examen";

          return (
            <Card key={recl.apiId} className={cn(
              "hover:shadow-md transition-shadow",
              hasProposition && "border-amber-500/50 ring-1 ring-amber-500/20",
              recl.statut === "escalade" && "border-red-500/50",
            )}>
              <CardContent className="p-5">
                {/* En-tête */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", 
                      recl.statut === "escalade" ? "bg-red-500/10" : "bg-muted"
                    )}>
                      <StatutIcon className={cn("w-5 h-5", statut.color)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold">{recl.id}</span>
                        <Badge variant="outline" className={statut.color}>{statut.label}</Badge>
                        <Badge variant="secondary" className={cn("text-xs", typeInfo.color)}>{typeInfo.label}</Badge>
                      </div>
                      <p className="font-medium mt-1">{recl.produit}</p>
                      <p className="text-sm text-muted-foreground">
                        Vendeur: {recl.vendeur} • {recl.commande} • Créée le {recl.dateCreation}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{recl.montant.toLocaleString()} FCFA</p>
                    {recl.montantRembourse && (
                      <p className="text-sm text-green-600 font-medium">
                        Remboursé: {recl.montantRembourse.toLocaleString()} FCFA
                      </p>
                    )}
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="mb-4">
                  {renderProgressSteps(recl.statut)}
                </div>

                {/* Motif */}
                <div className="p-3 rounded-lg bg-muted/50 mb-4">
                  <p className="text-sm">
                    <span className="font-medium text-amber-600">Motif: </span>
                    {motifLabels[recl.motif]}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{recl.description}</p>
                </div>

                {/* Proposition vendeur si présente */}
                {hasProposition && recl.propositionVendeur && (
                  <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold text-amber-600">Proposition du vendeur</span>
                      <Badge variant="outline" className="text-xs text-amber-600">
                        Action requise
                      </Badge>
                    </div>
                    <p className="text-sm mb-2">{recl.propositionVendeur.commentaire}</p>
                    {recl.propositionVendeur.montant && (
                      <p className="font-bold text-amber-600 mb-3">
                        {recl.propositionVendeur.type === "remboursement_partiel" 
                          ? `Remboursement ${recl.propositionVendeur.pourcentage}% : ${recl.propositionVendeur.montant.toLocaleString()} FCFA`
                          : recl.propositionVendeur.type === "remplacement"
                          ? "Remplacement du produit"
                          : `${recl.propositionVendeur.montant.toLocaleString()} FCFA`
                        }
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="gap-1"
                        onClick={() => handleAcceptProposition(recl)}
                        disabled={acceptProposalMutation.isPending}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        Accepter
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => handleRejectProposition(recl)}
                        disabled={rejectProposalMutation.isPending}
                      >
                        <ThumbsDown className="w-3 h-3" />
                        Refuser
                      </Button>
                      <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleEscalate(recl)}>
                        <Scale className="w-3 h-3" />
                        Escalader
                      </Button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Camera className="w-3 h-3" />
                    {recl.preuves.length} preuve(s)
                    <span className="mx-1">•</span>
                    <MessageSquare className="w-3 h-3" />
                    {recl.messageCount} message(s)
                    <span className="mx-1">•</span>
                    <History className="w-3 h-3" />
                    {recl.timeline.length} étapes
                  </div>
                  <div className="flex gap-2">
                    {recl.statut === "approuvee" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => handleConfirmReturned(recl)}
                        disabled={confirmReturnedMutation.isPending}
                      >
                        <Truck className="w-3 h-3" />
                        Confirmer l'expédition
                      </Button>
                    )}
                    {recl.statut === "refusee" && (
                      <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleEscalate(recl)}>
                        <AlertTriangle className="w-3 h-3" />
                        Ouvrir un litige
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => openDetail(recl)}
                    >
                      <Eye className="w-4 h-4" />
                      Détails
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      )}

      {/* Dialog Créer une réclamation */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Nouvelle réclamation
            </DialogTitle>
            <DialogDescription>Déposez une réclamation ou demande de retour</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Commande */}
            <div className="space-y-2">
              <Label>Commande concernée *</Label>
              <Select
                value={newRecl.commande}
                onValueChange={(v) => {
                  const cmd = commandesAcheteur.find(c => c.id === v);
                  setNewRecl({ ...newRecl, commande: v, montantDemande: cmd?.totalPrice || 0 });
                }}
                disabled={isLoadingCommandes}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingCommandes ? "Chargement des commandes..." : "Sélectionnez une commande"} />
                </SelectTrigger>
                <SelectContent>
                  {commandesAcheteur.length === 0 && !isLoadingCommandes && (
                    <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                      Aucune commande trouvée
                    </div>
                  )}
                  {commandesAcheteur.map((cmd) => (
                    <SelectItem key={cmd.id} value={cmd.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{cmd.orderNumber}</span>
                        <span className="text-muted-foreground">- {getCommandeProduit(cmd)}</span>
                        <span className="font-semibold">{cmd.totalPrice.toLocaleString()} FCFA</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newRecl.commande && (
                <div className="p-3 rounded-lg bg-muted/50 text-sm">
                  {(() => {
                    const cmd = commandesAcheteur.find(c => c.id === newRecl.commande);
                    return cmd ? (
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{getCommandeProduit(cmd)}</p>
                          <p className="text-muted-foreground">Vendeur: {getCommandeVendeur(cmd)}</p>
                        </div>
                        <p className="font-bold">{cmd.totalPrice.toLocaleString()} FCFA</p>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>Type de demande *</Label>
              <div className="grid grid-cols-3 gap-3">
                {(Object.entries(typeLabels) as [ReclamationType, { label: string; color: string }][]).map(([key, val]) => (
                  <Button
                    key={key}
                    type="button"
                    variant={newRecl.type === key ? "default" : "outline"}
                    className="h-auto py-3 flex-col gap-1"
                    onClick={() => setNewRecl({ ...newRecl, type: key })}
                  >
                    {key === "retour" && <RotateCcw className="w-5 h-5" />}
                    {key === "reclamation" && <AlertCircle className="w-5 h-5" />}
                    {key === "litige" && <Scale className="w-5 h-5" />}
                    <span className="text-xs">{val.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Motif */}
            <div className="space-y-2">
              <Label>Motif *</Label>
              <Select value={newRecl.motif} onValueChange={(v) => setNewRecl({ ...newRecl, motif: v as ReclamationMotif })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le motif" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(motifLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description détaillée *</Label>
              <Textarea
                placeholder="Décrivez le problème en détail : ce que vous avez reçu, ce qui était attendu, l'impact..."
                rows={4}
                value={newRecl.description}
                onChange={(e) => setNewRecl({ ...newRecl, description: e.target.value })}
              />
            </div>

            {/* Montant demandé */}
            <div className="space-y-2">
              <Label>Montant demandé (FCFA)</Label>
              <Input
                type="number"
                value={newRecl.montantDemande}
                onChange={(e) => setNewRecl({ ...newRecl, montantDemande: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">Montant du remboursement ou de la compensation souhaité</p>
            </div>

            {/* Preuves */}
            <div className="space-y-2">
              <Label>Preuves (photos, vidéos, documents)</Label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  handleFilesSelected(e.target.files);
                  e.target.value = "";
                }}
              />
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFilesSelected(e.dataTransfer.files);
                }}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Glissez vos fichiers ici</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Photos du produit, vidéo de déballage, bon de livraison, rapport d'analyse...
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <Camera className="w-4 h-4 mr-1" />
                  Parcourir
                </Button>
              </div>
              {newRecl.preuves.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newRecl.preuves.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 py-1 pl-2 pr-1 rounded-lg bg-muted text-sm">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="max-w-[160px] truncate">{file.name}</span>
                      <button
                        type="button"
                        className="p-0.5 rounded hover:bg-background"
                        onClick={() => handleRemoveFile(idx)}
                      >
                        <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                💡 Conseil : Les réclamations avec preuves sont traitées 3x plus vite
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Annuler</Button>
            <Button
              onClick={handleCreateReclamation}
              disabled={!newRecl.commande || !newRecl.motif || !newRecl.description || createReclamationMutation.isPending}
            >
              <Send className="w-4 h-4 mr-1" />
              {createReclamationMutation.isPending ? "Envoi en cours..." : "Soumettre la réclamation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Détail réclamation */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedReclamation && (() => {
            const statut = statutConfig[selectedReclamation.statut] ?? statutConfig.brouillon;
            const StatutIcon = statut.icon;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <StatutIcon className={cn("w-5 h-5", statut.color)} />
                    Réclamation {selectedReclamation.id}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedReclamation.produit} • {selectedReclamation.vendeur}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Progression */}
                  <div>
                    <p className="text-sm font-medium mb-3">Progression</p>
                    {renderProgressSteps(selectedReclamation.statut)}
                  </div>

                  {/* Infos clés */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Commande</p>
                      <p className="font-mono font-medium">{selectedReclamation.commande}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Montant</p>
                      <p className="font-bold text-primary">{selectedReclamation.montant.toLocaleString()} FCFA</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Motif</p>
                      <p className="font-medium text-amber-600">{motifLabels[selectedReclamation.motif]}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Preuves fournies</p>
                      <p className="font-medium">{selectedReclamation.preuves.length} fichier(s)</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm font-medium mb-2">Description</p>
                    <p className="text-sm text-muted-foreground">{selectedReclamation.description}</p>
                  </div>

                  {/* Preuves */}
                  <div>
                    <p className="text-sm font-medium mb-2">Preuves jointes</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedReclamation.preuves.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted text-sm">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Proposition vendeur */}
                  {selectedReclamation.propositionVendeur && (
                    <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                      <p className="font-semibold text-amber-600 mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Proposition du vendeur ({selectedReclamation.propositionVendeur.dateProposition})
                      </p>
                      <p className="text-sm mb-2">{selectedReclamation.propositionVendeur.commentaire}</p>
                      {selectedReclamation.propositionVendeur.montant && (
                        <p className="font-bold">
                          Montant proposé: {selectedReclamation.propositionVendeur.montant.toLocaleString()} FCFA
                        </p>
                      )}
                    </div>
                  )}

                  {/* Timeline */}
                  <div>
                    <p className="text-sm font-medium mb-3 flex items-center gap-2">
                      <History className="w-4 h-4" />
                      Historique
                    </p>
                    <div className="space-y-0">
                      {selectedReclamation.timeline.map((event, idx) => (
                        <div key={idx} className="flex gap-3 pb-4 relative">
                          {idx < selectedReclamation.timeline.length - 1 && (
                            <div className="absolute left-[11px] top-6 w-0.5 h-full bg-muted-foreground/20" />
                          )}
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10",
                            event.role === "acheteur" && "bg-primary/20",
                            event.role === "vendeur" && "bg-amber-500/20",
                            event.role === "mediateur" && "bg-red-500/20",
                            event.role === "systeme" && "bg-muted",
                          )}>
                            {event.role === "mediateur" ? (
                              <Shield className="w-3 h-3 text-red-500" />
                            ) : event.role === "systeme" ? (
                              <RefreshCw className="w-3 h-3 text-muted-foreground" />
                            ) : (
                              <User className="w-3 h-3 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{event.action}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {event.auteur} • {event.date}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 justify-end border-t pt-4">
                    {selectedReclamation.statut === "approuvee" && (
                      <Button
                        variant="outline"
                        className="gap-1"
                        onClick={() => handleConfirmReturned(selectedReclamation)}
                        disabled={confirmReturnedMutation.isPending}
                      >
                        <Truck className="w-4 h-4" />
                        Confirmer l'expédition
                      </Button>
                    )}
                    {selectedReclamation.statut === "en_examen" && selectedReclamation.propositionVendeur && (
                      <>
                        <Button
                          className="gap-1"
                          onClick={() => handleAcceptProposition(selectedReclamation)}
                          disabled={acceptProposalMutation.isPending}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          Accepter la proposition
                        </Button>
                        <Button
                          variant="outline"
                          className="gap-1"
                          onClick={() => handleRejectProposition(selectedReclamation)}
                          disabled={rejectProposalMutation.isPending}
                        >
                          <ThumbsDown className="w-4 h-4" />
                          Refuser
                        </Button>
                      </>
                    )}
                    {(selectedReclamation.statut === "refusee" || selectedReclamation.statut === "en_examen") && (
                      <Button variant="destructive" className="gap-1" onClick={() => handleEscalate(selectedReclamation)}>
                        <Scale className="w-4 h-4" />
                        Escalader vers médiation
                      </Button>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Dialog Escalader vers médiation */}
      <Dialog open={showEscalateDialog} onOpenChange={setShowEscalateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-red-500" />
              Escalader vers médiation
            </DialogTitle>
            <DialogDescription>
              {escalateTarget && `Réclamation ${escalateTarget.id} — un médiateur CPU-PME sera assigné.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label>Motif de l'escalade *</Label>
            <Textarea
              placeholder="Expliquez pourquoi vous souhaitez escalader cette réclamation vers la médiation..."
              rows={4}
              value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEscalateDialog(false)}>Annuler</Button>
            <Button
              variant="destructive"
              className="gap-1"
              onClick={handleConfirmEscalate}
              disabled={!escalateReason.trim() || escalateMutation.isPending}
            >
              <Scale className="w-4 h-4" />
              {escalateMutation.isPending ? "Envoi en cours..." : "Escalader"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
