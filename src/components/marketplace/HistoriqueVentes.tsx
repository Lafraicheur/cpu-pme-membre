import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ordersApi, type BuyerHistoryItem } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  ShoppingCart,
  Search,
  Download,
  Eye,
  Calendar,
  Store,
  ArrowDownLeft,
  FileText,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TransactionStatus = "completed" | "pending" | "cancelled" | "refunded" | "shipped";

interface Vente {
  id: string;
  reference: string;
  date: string;
  produit: string;
  imageProduit: string;
  quantite: number;
  prixUnitaire: number;
  montantTotal: number;
  status: TransactionStatus;
  acheteur: string;
  livraison: string;
  paiement: string;
}

const statusConfig: Record<TransactionStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  completed: { label: "Terminée", color: "text-green-500", icon: CheckCircle2 },
  pending: { label: "En cours", color: "text-amber-500", icon: Clock },
  cancelled: { label: "Annulée", color: "text-red-500", icon: XCircle },
  refunded: { label: "Remboursée", color: "text-blue-500", icon: RotateCcw },
  shipped: { label: "Expédiée", color: "text-purple-500", icon: Truck },
};
const defaultStatus = statusConfig.pending;

function mapHistoryItem(item: BuyerHistoryItem): Vente {
  return {
    id: item.id,
    reference: item.reference ?? item.orderNumber ?? item.id,
    date: item.date ?? item.createdAt ?? "",
    produit: item.produit ?? item.productNeed ?? "Produit",
    imageProduit: item.imageProduit ?? "📦",
    quantite: item.quantite ?? item.quantity ?? 0,
    prixUnitaire: item.prixUnitaire ?? item.unitPrice ?? 0,
    montantTotal: item.montantTotal ?? item.totalPrice ?? 0,
    status: (item.status as TransactionStatus) ?? "pending",
    acheteur: item.acheteur ?? item.partenaire ?? "Acheteur",
    livraison: item.livraison ?? item.deliveryMode ?? "—",
    paiement: item.paiement ?? item.paymentMethod ?? "—",
  };
}

export function HistoriqueVentes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedVente, setSelectedVente] = useState<Vente | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const {
    data: historyPage,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["marketplace", "orders", "vendor", "history", "vente", { searchQuery, statusFilter, dateFilter, page }],
    queryFn: () => ordersApi.getVendorHistory({
      type: "vente",
      status: statusFilter,
      period: dateFilter,
      q: searchQuery || undefined,
      page,
      limit: 20,
    }),
  });

  const ventes = (historyPage?.data ?? []).map(mapHistoryItem);
  const kpiVentes = historyPage?.kpis.ventes;
  const enCours = ventes.filter(v => v.status === "pending" || v.status === "shipped").length;

  const handleViewDetail = (vente: Vente) => {
    setSelectedVente(vente);
    setShowDetailDialog(true);
    ordersApi.getTransactionDetail(vente.id, "vente")
      .then((full) => setSelectedVente(mapHistoryItem(full)))
      .catch(() => { /* on garde les infos de la liste */ });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Historique des ventes
          </h2>
          <p className="text-sm text-muted-foreground">
            Consultez l'historique de vos ventes sur la marketplace
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exporter
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ShoppingCart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{kpiVentes?.count ?? 0}</p>
                <p className="text-xs text-muted-foreground">Total ventes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <ArrowDownLeft className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{(kpiVentes?.montantFormattedM ?? 0).toFixed(1)}M</p>
                <p className="text-xs text-muted-foreground">Montant total (FCFA)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{enCours}</p>
                <p className="text-xs text-muted-foreground">En cours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par référence, produit, acheteur..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full lg:w-[150px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="completed">Terminées</SelectItem>
                <SelectItem value="pending">En cours</SelectItem>
                <SelectItem value="shipped">Expédiées</SelectItem>
                <SelectItem value="cancelled">Annulées</SelectItem>
                <SelectItem value="refunded">Remboursées</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={(v) => { setDateFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full lg:w-[150px]">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes dates</SelectItem>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="quarter">Ce trimestre</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau */}
      {isLoading ? (
        <Card><CardContent className="py-12 flex items-center justify-center text-muted-foreground">
          <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Chargement des ventes...
        </CardContent></Card>
      ) : isError ? (
        <Card><CardContent className="py-12 text-center">
          <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-destructive opacity-70" />
          <p className="text-sm text-muted-foreground mb-4">Impossible de charger l'historique des ventes.</p>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </CardContent></Card>
      ) : ventes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">Aucune vente</h3>
            <p className="text-sm text-muted-foreground">
              Aucune vente ne correspond à vos critères
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Acheteur</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ventes.map((v) => {
                  const status = statusConfig[v.status] ?? defaultStatus;
                  const StatusIcon = status.icon;

                  return (
                    <TableRow key={v.id}>
                      <TableCell className="font-mono text-sm">{v.reference}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{v.imageProduit}</span>
                          <span className="truncate max-w-[150px]">{v.produit}</span>
                        </div>
                      </TableCell>
                      <TableCell className="truncate max-w-[150px]">{v.acheteur}</TableCell>
                      <TableCell>{v.date ? new Date(v.date).toLocaleDateString('fr-FR') : "—"}</TableCell>
                      <TableCell className="text-right font-medium">
                        {v.montantTotal.toLocaleString()} FCFA
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("bg-transparent hover:bg-transparent border-0", status.color)}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleViewDetail(v)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
          {(historyPage?.totalPages ?? 1) > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Page {historyPage?.page ?? 1} sur {historyPage?.totalPages ?? 1}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= (historyPage?.totalPages ?? 1)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Dialog détail */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowDownLeft className="w-5 h-5 text-green-500" />
              {selectedVente?.reference}
            </DialogTitle>
            <DialogDescription>
              Vente du{" "}
              {selectedVente?.date && new Date(selectedVente.date).toLocaleDateString('fr-FR')}
            </DialogDescription>
          </DialogHeader>

          {selectedVente && (
            <div className="space-y-6 py-4">
              {/* Produit */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <span className="text-4xl">{selectedVente.imageProduit}</span>
                <div className="flex-1">
                  <h3 className="font-semibold">{selectedVente.produit}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedVente.quantite} x {selectedVente.prixUnitaire.toLocaleString()} FCFA
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{selectedVente.montantTotal.toLocaleString()} FCFA</p>
                  <Badge className={cn(
                    (statusConfig[selectedVente.status] ?? defaultStatus).color,
                    "bg-transparent border-0"
                  )}>
                    {(statusConfig[selectedVente.status] ?? defaultStatus).label}
                  </Badge>
                </div>
              </div>

              {/* Détails */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Acheteur</p>
                  <p className="font-medium flex items-center gap-2">
                    <Store className="w-4 h-4" />
                    {selectedVente.acheteur}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {selectedVente.date ? new Date(selectedVente.date).toLocaleDateString('fr-FR') : "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Livraison</p>
                  <p className="font-medium flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    {selectedVente.livraison}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Paiement</p>
                  <p className="font-medium">{selectedVente.paiement}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger facture
                </Button>
                <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
