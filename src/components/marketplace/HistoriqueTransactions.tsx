import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  TrendingUp,
  TrendingDown,
  Search,
  Download,
  Eye,
  Calendar,
  Package,
  Store,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TransactionType = "achat" | "vente";
type TransactionStatus = "completed" | "pending" | "cancelled" | "refunded" | "shipped";

interface Transaction {
  id: string;
  type: TransactionType;
  reference: string;
  date: string;
  produit: string;
  imageProduit: string;
  quantite: number;
  prixUnitaire: number;
  montantTotal: number;
  status: TransactionStatus;
  partenaire: string; // vendeur si achat, acheteur si vente
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

const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "achat",
    reference: "CMD-2024-001234",
    date: "2024-03-15",
    produit: "Cacao Premium Grade A",
    imageProduit: "🍫",
    quantite: 2,
    prixUnitaire: 850000,
    montantTotal: 1700000,
    status: "completed",
    partenaire: "Coopérative Aboisso Cacao",
    livraison: "Livraison express - 48h",
    paiement: "Mobile Money",
  },
  {
    id: "2",
    type: "vente",
    reference: "CMD-2024-001198",
    date: "2024-03-14",
    produit: "Attiéké séché - 25kg",
    imageProduit: "🌾",
    quantite: 50,
    prixUnitaire: 15000,
    montantTotal: 750000,
    status: "shipped",
    partenaire: "Restaurant Le Maquis",
    livraison: "Livraison standard",
    paiement: "Virement bancaire",
  },
  {
    id: "3",
    type: "achat",
    reference: "CMD-2024-001156",
    date: "2024-03-12",
    produit: "Service de transport frigorifique",
    imageProduit: "🚛",
    quantite: 1,
    prixUnitaire: 75000,
    montantTotal: 75000,
    status: "pending",
    partenaire: "TransFroid CI",
    livraison: "Sur rendez-vous",
    paiement: "Carte bancaire",
  },
  {
    id: "4",
    type: "vente",
    reference: "CMD-2024-001089",
    date: "2024-03-10",
    produit: "Huile de palme raffinée - 20L",
    imageProduit: "🫒",
    quantite: 100,
    prixUnitaire: 25000,
    montantTotal: 2500000,
    status: "completed",
    partenaire: "Supermarché Ivoire Plus",
    livraison: "Point relais",
    paiement: "Mobile Money",
  },
  {
    id: "5",
    type: "achat",
    reference: "CMD-2024-000987",
    date: "2024-03-05",
    produit: "Matériel d'emballage",
    imageProduit: "📦",
    quantite: 500,
    prixUnitaire: 500,
    montantTotal: 250000,
    status: "cancelled",
    partenaire: "PackPro CI",
    livraison: "Retrait en magasin",
    paiement: "Virement bancaire",
  },
  {
    id: "6",
    type: "vente",
    reference: "CMD-2024-000876",
    date: "2024-02-28",
    produit: "Café torréfié premium",
    imageProduit: "☕",
    quantite: 30,
    prixUnitaire: 12500,
    montantTotal: 375000,
    status: "refunded",
    partenaire: "Café du Plateau",
    livraison: "Livraison express",
    paiement: "Carte bancaire",
  },
];

export function HistoriqueTransactions() {
  const [transactions] = useState<Transaction[]>(mockTransactions);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Stats
  const achats = transactions.filter(t => t.type === "achat");
  const ventes = transactions.filter(t => t.type === "vente");
  const totalAchats = achats.reduce((acc, t) => acc + (t.status !== "cancelled" ? t.montantTotal : 0), 0);
  const totalVentes = ventes.reduce((acc, t) => acc + (t.status !== "cancelled" ? t.montantTotal : 0), 0);

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.produit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.partenaire.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || t.type === typeFilter;
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleViewDetail = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Historique des Transactions
          </h2>
          <p className="text-sm text-muted-foreground">
            Consultez l'historique de vos achats et ventes
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exporter
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ShoppingCart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{transactions.length}</p>
                <p className="text-xs text-muted-foreground">Total transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <ArrowUpRight className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{(totalAchats / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-muted-foreground">Achats (FCFA)</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{achats.length} commandes</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <ArrowDownLeft className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{(totalVentes / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-muted-foreground">Ventes (FCFA)</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{ventes.length} ventes</p>
          </CardContent>
        </Card>

        <Card className={totalVentes > totalAchats ? "border-green-500/30" : "border-red-500/30"}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                totalVentes > totalAchats ? "bg-green-500/10" : "bg-red-500/10"
              )}>
                {totalVentes > totalAchats ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                )}
              </div>
              <div>
                <p className={cn(
                  "text-xl font-bold",
                  totalVentes > totalAchats ? "text-green-500" : "text-red-500"
                )}>
                  {totalVentes > totalAchats ? "+" : "-"}
                  {(Math.abs(totalVentes - totalAchats) / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-muted-foreground">Balance nette</p>
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
                placeholder="Rechercher par référence, produit, partenaire..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full lg:w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="achat">Achats</SelectItem>
                <SelectItem value="vente">Ventes</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
            <Select value={dateFilter} onValueChange={setDateFilter}>
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

      {/* Tabs Achats / Ventes */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Toutes ({transactions.length})</TabsTrigger>
          <TabsTrigger value="achats">Achats ({achats.length})</TabsTrigger>
          <TabsTrigger value="ventes">Ventes ({ventes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <TransactionTable 
            transactions={filteredTransactions} 
            onViewDetail={handleViewDetail}
          />
        </TabsContent>

        <TabsContent value="achats" className="space-y-4">
          <TransactionTable 
            transactions={filteredTransactions.filter(t => t.type === "achat")} 
            onViewDetail={handleViewDetail}
          />
        </TabsContent>

        <TabsContent value="ventes" className="space-y-4">
          <TransactionTable 
            transactions={filteredTransactions.filter(t => t.type === "vente")} 
            onViewDetail={handleViewDetail}
          />
        </TabsContent>
      </Tabs>

      {/* Dialog détail */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTransaction?.type === "achat" ? (
                <ArrowUpRight className="w-5 h-5 text-red-500" />
              ) : (
                <ArrowDownLeft className="w-5 h-5 text-green-500" />
              )}
              {selectedTransaction?.reference}
            </DialogTitle>
            <DialogDescription>
              {selectedTransaction?.type === "achat" ? "Achat" : "Vente"} du{" "}
              {selectedTransaction?.date && new Date(selectedTransaction.date).toLocaleDateString('fr-FR')}
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-6 py-4">
              {/* Produit */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <span className="text-4xl">{selectedTransaction.imageProduit}</span>
                <div className="flex-1">
                  <h3 className="font-semibold">{selectedTransaction.produit}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedTransaction.quantite} x {selectedTransaction.prixUnitaire.toLocaleString()} FCFA
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{selectedTransaction.montantTotal.toLocaleString()} FCFA</p>
                  <Badge className={cn(
                    statusConfig[selectedTransaction.status].color,
                    "bg-transparent border-0"
                  )}>
                    {statusConfig[selectedTransaction.status].label}
                  </Badge>
                </div>
              </div>

              {/* Détails */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {selectedTransaction.type === "achat" ? "Vendeur" : "Acheteur"}
                  </p>
                  <p className="font-medium flex items-center gap-2">
                    <Store className="w-4 h-4" />
                    {selectedTransaction.partenaire}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedTransaction.date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Livraison</p>
                  <p className="font-medium flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    {selectedTransaction.livraison}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Paiement</p>
                  <p className="font-medium">{selectedTransaction.paiement}</p>
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

// Composant Table
function TransactionTable({ 
  transactions, 
  onViewDetail 
}: { 
  transactions: Transaction[];
  onViewDetail: (t: Transaction) => void;
}) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-semibold mb-2">Aucune transaction</h3>
          <p className="text-sm text-muted-foreground">
            Aucune transaction ne correspond à vos critères
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Référence</TableHead>
              <TableHead>Produit</TableHead>
              <TableHead>Partenaire</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((t) => {
              const status = statusConfig[t.status];
              const StatusIcon = status.icon;
              
              return (
                <TableRow key={t.id}>
                  <TableCell>
                    {t.type === "achat" ? (
                      <Badge variant="outline" className="text-red-500 border-red-500/30">
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                        Achat
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-500 border-green-500/30">
                        <ArrowDownLeft className="w-3 h-3 mr-1" />
                        Vente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{t.reference}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{t.imageProduit}</span>
                      <span className="truncate max-w-[150px]">{t.produit}</span>
                    </div>
                  </TableCell>
                  <TableCell className="truncate max-w-[120px]">{t.partenaire}</TableCell>
                  <TableCell>{new Date(t.date).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell className="text-right font-medium">
                    {t.montantTotal.toLocaleString()} FCFA
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("bg-transparent hover:bg-transparent border-0", status.color)}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => onViewDetail(t)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}