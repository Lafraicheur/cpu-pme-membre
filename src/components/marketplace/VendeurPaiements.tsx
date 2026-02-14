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
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Banknote,
  Search,
  Eye,
  Building,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TransactionStatus = "Pending" | "Processing" | "Completed" | "Failed" | "OnHold";
type TransactionType = "Vente" | "Commission" | "Reversement" | "Retenue" | "Remboursement";

interface Transaction {
  id: string;
  type: TransactionType;
  montant: number;
  statut: TransactionStatus;
  date: string;
  description: string;
  commande?: string;
}

interface Facture {
  id: string;
  periode: string;
  montantVentes: number;
  commission: number;
  netAPayer: number;
  statut: "Payée" | "EnAttente" | "Émise";
  dateEmission: string;
}

const mockTransactions: Transaction[] = [
  {
    id: "TRX-001",
    type: "Vente",
    montant: 1700000,
    statut: "Completed",
    date: "2024-01-20",
    description: "Vente Cacao Premium Grade A",
    commande: "CMD-2024-001",
  },
  {
    id: "TRX-002",
    type: "Commission",
    montant: -85000,
    statut: "Completed",
    date: "2024-01-20",
    description: "Commission marketplace 5%",
    commande: "CMD-2024-001",
  },
  {
    id: "TRX-003",
    type: "Reversement",
    montant: 1615000,
    statut: "Processing",
    date: "2024-01-21",
    description: "Reversement vers compte bancaire",
  },
  {
    id: "TRX-004",
    type: "Vente",
    montant: 150000,
    statut: "Pending",
    date: "2024-01-22",
    description: "Vente Attiéké séché",
    commande: "CMD-2024-002",
  },
  {
    id: "TRX-005",
    type: "Retenue",
    montant: -50000,
    statut: "OnHold",
    date: "2024-01-22",
    description: "Retenue litige en cours",
    commande: "CMD-2024-003",
  },
];

const mockFactures: Facture[] = [
  {
    id: "FAC-2024-001",
    periode: "Janvier 2024",
    montantVentes: 4500000,
    commission: 225000,
    netAPayer: 4275000,
    statut: "EnAttente",
    dateEmission: "2024-01-31",
  },
  {
    id: "FAC-2023-012",
    periode: "Décembre 2023",
    montantVentes: 3200000,
    commission: 160000,
    netAPayer: 3040000,
    statut: "Payée",
    dateEmission: "2023-12-31",
  },
  {
    id: "FAC-2023-011",
    periode: "Novembre 2023",
    montantVentes: 2800000,
    commission: 140000,
    netAPayer: 2660000,
    statut: "Payée",
    dateEmission: "2023-11-30",
  },
];

const statusConfig: Record<TransactionStatus, { label: string; color: string; icon: typeof Clock }> = {
  Pending: { label: "En attente", color: "text-amber-500", icon: Clock },
  Processing: { label: "En cours", color: "text-blue-500", icon: Clock },
  Completed: { label: "Terminé", color: "text-green-500", icon: CheckCircle2 },
  Failed: { label: "Échoué", color: "text-destructive", icon: AlertCircle },
  OnHold: { label: "Bloqué", color: "text-orange-500", icon: AlertCircle },
};

const typeConfig: Record<TransactionType, { color: string; icon: typeof ArrowUpRight }> = {
  Vente: { color: "text-green-500", icon: ArrowUpRight },
  Commission: { color: "text-muted-foreground", icon: ArrowDownRight },
  Reversement: { color: "text-blue-500", icon: Banknote },
  Retenue: { color: "text-orange-500", icon: AlertCircle },
  Remboursement: { color: "text-destructive", icon: ArrowDownRight },
};

export function VendeurPaiements() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showDemandeRetrait, setShowDemandeRetrait] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null);

  // Mock soldes
  const soldes = {
    disponible: 2850000,
    enAttente: 1615000,
    bloque: 50000,
    totalMois: 4500000,
  };

  const filteredTransactions = mockTransactions.filter(trx => {
    const matchesSearch = trx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trx.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || trx.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Soldes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-green-500/30 bg-gradient-to-br from-green-500/5 to-green-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Wallet className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Solde disponible</p>
                <p className="text-2xl font-bold text-green-500">
                  {soldes.disponible.toLocaleString()} FCFA
                </p>
              </div>
            </div>
            <Button className="w-full mt-3" size="sm" onClick={() => setShowDemandeRetrait(true)}>
              <Banknote className="w-4 h-4 mr-1" />
              Demander un retrait
            </Button>
          </CardContent>
        </Card>

        <Card className="border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En attente de versement</p>
                <p className="text-2xl font-bold text-blue-500">
                  {soldes.enAttente.toLocaleString()} FCFA
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <AlertCircle className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fonds bloqués</p>
                <p className="text-2xl font-bold text-orange-500">
                  {soldes.bloque.toLocaleString()} FCFA
                </p>
                <p className="text-xs text-muted-foreground">1 litige en cours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <TrendingUp className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ventes ce mois</p>
                <p className="text-2xl font-bold">
                  {soldes.totalMois.toLocaleString()} FCFA
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compte bancaire */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-muted">
                <Building className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Compte de reversement</p>
                <p className="font-medium">BICICI - **** **** **** 4521</p>
                <p className="text-xs text-muted-foreground">Entreprise Demo SARL</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Modifier</Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="factures">Factures & Commissions</TabsTrigger>
          <TabsTrigger value="retraits">Historique retraits</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          {/* Filtres */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher une transaction..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="Vente">Ventes</SelectItem>
                    <SelectItem value="Commission">Commissions</SelectItem>
                    <SelectItem value="Reversement">Reversements</SelectItem>
                    <SelectItem value="Retenue">Retenues</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Liste transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Historique des transactions</CardTitle>
              <CardDescription>{filteredTransactions.length} transaction(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredTransactions.map((trx) => {
                  const status = statusConfig[trx.statut];
                  const type = typeConfig[trx.type];
                  const StatusIcon = status.icon;
                  const TypeIcon = type.icon;
                  const isPositive = trx.montant > 0;

                  return (
                    <div
                      key={trx.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn("p-2 rounded-lg bg-muted", type.color)}>
                          <TypeIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">{trx.id}</span>
                            <Badge variant="outline" className={status.color}>
                              {status.label}
                            </Badge>
                          </div>
                          <p className="font-medium">{trx.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {trx.date}
                            {trx.commande && ` • ${trx.commande}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-xl font-bold",
                          isPositive ? "text-green-500" : "text-muted-foreground"
                        )}>
                          {isPositive ? "+" : ""}{trx.montant.toLocaleString()} FCFA
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {trx.type}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="factures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Factures de commission</CardTitle>
              <CardDescription>Récapitulatif mensuel des commissions prélevées</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockFactures.map((facture) => (
                  <div
                    key={facture.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-muted">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{facture.id}</span>
                          <Badge variant={facture.statut === "Payée" ? "default" : "secondary"}>
                            {facture.statut}
                          </Badge>
                        </div>
                        <p className="font-medium">{facture.periode}</p>
                        <p className="text-sm text-muted-foreground">
                          Émise le {facture.dateEmission}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Ventes</p>
                        <p className="font-semibold">{facture.montantVentes.toLocaleString()} FCFA</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Commission (5%)</p>
                        <p className="font-semibold text-muted-foreground">
                          -{facture.commission.toLocaleString()} FCFA
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Net</p>
                        <p className="font-bold text-primary">{facture.netAPayer.toLocaleString()} FCFA</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedFacture(facture)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retraits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des retraits</CardTitle>
              <CardDescription>Vos demandes de reversement vers votre compte bancaire</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { id: "RET-001", montant: 2000000, date: "2024-01-15", statut: "Completed" as TransactionStatus },
                  { id: "RET-002", montant: 1500000, date: "2024-01-05", statut: "Completed" as TransactionStatus },
                  { id: "RET-003", montant: 1615000, date: "2024-01-21", statut: "Processing" as TransactionStatus },
                ].map((retrait) => {
                  const status = statusConfig[retrait.statut];
                  return (
                    <div
                      key={retrait.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-muted">
                          <Banknote className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <span className="font-mono text-sm">{retrait.id}</span>
                          <p className="text-sm text-muted-foreground">{retrait.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold">{retrait.montant.toLocaleString()} FCFA</p>
                        <Badge variant="outline" className={status.color}>
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Demande de retrait */}
      <Dialog open={showDemandeRetrait} onOpenChange={setShowDemandeRetrait}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Demander un retrait</DialogTitle>
            <DialogDescription>
              Transférer des fonds vers votre compte bancaire
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-sm text-muted-foreground">Solde disponible</p>
              <p className="text-2xl font-bold text-green-500">
                {soldes.disponible.toLocaleString()} FCFA
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Montant à retirer (FCFA)</label>
              <Input 
                type="number" 
                placeholder="2000000" 
                max={soldes.disponible}
              />
              <p className="text-xs text-muted-foreground">
                Minimum: 50 000 FCFA • Maximum: {soldes.disponible.toLocaleString()} FCFA
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Compte de destination</label>
              <div className="p-3 rounded-lg bg-muted flex items-center gap-3">
                <Building className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">BICICI - **** 4521</p>
                  <p className="text-xs text-muted-foreground">Entreprise Demo SARL</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Délai de traitement: 24-48h ouvrées
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowDemandeRetrait(false)}>
                Annuler
              </Button>
              <Button onClick={() => setShowDemandeRetrait(false)}>
                <Banknote className="w-4 h-4 mr-1" />
                Confirmer le retrait
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Détail facture */}
      {selectedFacture && (
        <Dialog open={!!selectedFacture} onOpenChange={() => setSelectedFacture(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Facture {selectedFacture.id}</DialogTitle>
              <DialogDescription>{selectedFacture.periode}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Montant des ventes</span>
                  <span className="font-medium">{selectedFacture.montantVentes.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Commission marketplace (5%)</span>
                  <span className="font-medium text-muted-foreground">
                    -{selectedFacture.commission.toLocaleString()} FCFA
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold">Net à payer</span>
                  <span className="font-bold text-primary">
                    {selectedFacture.netAPayer.toLocaleString()} FCFA
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Badge variant={selectedFacture.statut === "Payée" ? "default" : "secondary"}>
                  {selectedFacture.statut}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Émise le {selectedFacture.dateEmission}
                </p>
              </div>

              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-1" />
                Télécharger la facture PDF
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
