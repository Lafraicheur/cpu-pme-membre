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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Download,
  Eye,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Star,
  Sparkles,
  Crown,
  Calendar,
  CreditCard,
  Printer,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface FactureVedette {
  id: string;
  dateEmission: string;
  dateEcheance: string;
  produit: string;
  typeVedette: "vedette" | "special" | "premium";
  duree: number;
  tauxCommission: number;
  montantBase: number;
  montantCommission: number;
  tva: number;
  montantTotal: number;
  statut: "payee" | "en_attente" | "en_retard" | "annulee";
  methode?: string;
  dateReglement?: string;
}

const typeVedetteConfig = {
  vedette: { label: "Vedette", icon: Star, color: "text-amber-500", bg: "bg-amber-500/10", taux: 5 },
  special: { label: "Spécial", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-500/10", taux: 8 },
  premium: { label: "Premium", icon: Crown, color: "text-primary", bg: "bg-primary/10", taux: 12 },
};

const statutConfig = {
  payee: { label: "Payée", color: "text-green-500", bg: "bg-green-500/10", icon: CheckCircle2 },
  en_attente: { label: "En attente", color: "text-amber-500", bg: "bg-amber-500/10", icon: Clock },
  en_retard: { label: "En retard", color: "text-destructive", bg: "bg-destructive/10", icon: AlertCircle },
  annulee: { label: "Annulée", color: "text-muted-foreground", bg: "bg-muted", icon: AlertCircle },
};

const mockFactures: FactureVedette[] = [
  {
    id: "FV-2024-001",
    dateEmission: "2024-01-15",
    dateEcheance: "2024-01-30",
    produit: "Cacao Premium Grade A",
    typeVedette: "premium",
    duree: 30,
    tauxCommission: 12,
    montantBase: 850000,
    montantCommission: 102000,
    tva: 18360,
    montantTotal: 120360,
    statut: "payee",
    methode: "Orange Money",
    dateReglement: "2024-01-18",
  },
  {
    id: "FV-2024-002",
    dateEmission: "2024-01-20",
    dateEcheance: "2024-02-04",
    produit: "Attiéké séché - 25kg",
    typeVedette: "vedette",
    duree: 14,
    tauxCommission: 5,
    montantBase: 15000,
    montantCommission: 750,
    tva: 135,
    montantTotal: 885,
    statut: "en_attente",
  },
  {
    id: "FV-2024-003",
    dateEmission: "2024-01-10",
    dateEcheance: "2024-01-25",
    produit: "Huile de palme raffinée - 20L",
    typeVedette: "special",
    duree: 7,
    tauxCommission: 8,
    montantBase: 25000,
    montantCommission: 2000,
    tva: 360,
    montantTotal: 2360,
    statut: "en_retard",
  },
  {
    id: "FV-2024-004",
    dateEmission: "2024-02-01",
    dateEcheance: "2024-02-15",
    produit: "Beurre de karité bio - 5kg",
    typeVedette: "premium",
    duree: 30,
    tauxCommission: 12,
    montantBase: 45000,
    montantCommission: 5400,
    tva: 972,
    montantTotal: 6372,
    statut: "payee",
    methode: "Wave",
    dateReglement: "2024-02-03",
  },
];

export function FacturationVedette() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statutFilter, setStatutFilter] = useState<string>("all");
  const [selectedFacture, setSelectedFacture] = useState<FactureVedette | null>(null);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const { toast } = useToast();

  const filteredFactures = mockFactures.filter((f) => {
    const matchSearch = f.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.produit.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatut = statutFilter === "all" || f.statut === statutFilter;
    return matchSearch && matchStatut;
  });

  const totaux = {
    total: mockFactures.reduce((s, f) => s + f.montantTotal, 0),
    payees: mockFactures.filter(f => f.statut === "payee").reduce((s, f) => s + f.montantTotal, 0),
    enAttente: mockFactures.filter(f => f.statut === "en_attente").reduce((s, f) => s + f.montantTotal, 0),
    enRetard: mockFactures.filter(f => f.statut === "en_retard").reduce((s, f) => s + f.montantTotal, 0),
  };

  const handleDownloadPDF = (facture: FactureVedette) => {
    const config = typeVedetteConfig[facture.typeVedette];
    const statut = statutConfig[facture.statut];

    const pdfContent = `
%PDF-FACTURE MISE EN VEDETTE
====================================
FACTURE N° ${facture.id}
====================================
CPU-PME Marketplace
Abidjan, Côte d'Ivoire
------------------------------------

Date d'émission: ${facture.dateEmission}
Date d'échéance: ${facture.dateEcheance}
Statut: ${statut.label}

DÉTAILS
------------------------------------
Produit: ${facture.produit}
Type mise en vedette: ${config.label}
Durée: ${facture.duree} jours
Taux commission: ${facture.tauxCommission}%

MONTANTS
------------------------------------
Prix du produit (base):    ${facture.montantBase.toLocaleString()} FCFA
Commission (${facture.tauxCommission}%):     ${facture.montantCommission.toLocaleString()} FCFA
TVA (18%):                 ${facture.tva.toLocaleString()} FCFA
------------------------------------
TOTAL TTC:                 ${facture.montantTotal.toLocaleString()} FCFA

${facture.dateReglement ? `
RÈGLEMENT
------------------------------------
Méthode: ${facture.methode}
Date: ${facture.dateReglement}
` : ""}
====================================
Facture générée automatiquement
CPU-PME Marketplace © 2024
    `.trim();

    const blob = new Blob([pdfContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${facture.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Facture téléchargée",
      description: `La facture ${facture.id} a été téléchargée.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* KPIs Facturation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Receipt className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total facturé</p>
                <p className="text-2xl font-bold">{totaux.total.toLocaleString()} FCFA</p>
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
                <p className="text-sm text-muted-foreground">Payées</p>
                <p className="text-2xl font-bold text-green-500">{totaux.payees.toLocaleString()} FCFA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-amber-500">{totaux.enAttente.toLocaleString()} FCFA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En retard</p>
                <p className="text-2xl font-bold text-destructive">{totaux.enRetard.toLocaleString()} FCFA</p>
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
                placeholder="Rechercher par N° facture ou produit..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statutFilter} onValueChange={setStatutFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="payee">Payées</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="en_retard">En retard</SelectItem>
                <SelectItem value="annulee">Annulées</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des factures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Factures de mise en vedette
          </CardTitle>
          <CardDescription>{filteredFactures.length} facture(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Facture</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Total TTC</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFactures.map((facture) => {
                const type = typeVedetteConfig[facture.typeVedette];
                const statut = statutConfig[facture.statut];
                const TypeIcon = type.icon;
                const StatutIcon = statut.icon;

                return (
                  <TableRow key={facture.id}>
                    <TableCell>
                      <span className="font-mono text-sm">{facture.id}</span>
                      <p className="text-xs text-muted-foreground">{facture.dateEmission}</p>
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">{facture.produit}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("gap-1", type.color)}>
                        <TypeIcon className="w-3 h-3" />
                        {type.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{facture.duree}j</TableCell>
                    <TableCell>
                      <span className="font-medium">{facture.montantCommission.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground"> FCFA</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold">{facture.montantTotal.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground"> FCFA</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("gap-1", statut.color)}>
                        <StatutIcon className="w-3 h-3" />
                        {statut.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedFacture(facture);
                            setShowPDFPreview(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadPDF(facture)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Aperçu Facture PDF */}
      <Dialog open={showPDFPreview} onOpenChange={setShowPDFPreview}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedFacture && (() => {
            const type = typeVedetteConfig[selectedFacture.typeVedette];
            const statut = statutConfig[selectedFacture.statut];
            const TypeIcon = type.icon;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Facture {selectedFacture.id}
                  </DialogTitle>
                  <DialogDescription>Aperçu de la facture de mise en vedette</DialogDescription>
                </DialogHeader>

                <div className="border rounded-lg p-6 space-y-6 bg-card">
                  {/* En-tête facture */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-primary">CPU-PME Marketplace</h3>
                      <p className="text-sm text-muted-foreground">Abidjan, Côte d'Ivoire</p>
                      <p className="text-sm text-muted-foreground">RCCM: CI-ABJ-2024-B-12345</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold font-mono">{selectedFacture.id}</p>
                      <Badge variant="outline" className={cn("mt-1", statut.color)}>
                        {statut.label}
                      </Badge>
                    </div>
                  </div>

                  <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Date d'émission</p>
                      <p className="font-medium">{selectedFacture.dateEmission}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date d'échéance</p>
                      <p className="font-medium">{selectedFacture.dateEcheance}</p>
                    </div>
                  </div>

                  {/* Détails produit */}
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <TypeIcon className={cn("w-5 h-5", type.color)} />
                      <span className="font-semibold">Mise en vedette - {type.label}</span>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Désignation</TableHead>
                          <TableHead className="text-right">Montant</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <p className="font-medium">{selectedFacture.produit}</p>
                            <p className="text-xs text-muted-foreground">
                              Mise en vedette "{type.label}" - {selectedFacture.duree} jours
                            </p>
                          </TableCell>
                          <TableCell className="text-right">{selectedFacture.montantBase.toLocaleString()} FCFA</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Commission ({selectedFacture.tauxCommission}%)</TableCell>
                          <TableCell className="text-right">{selectedFacture.montantCommission.toLocaleString()} FCFA</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>TVA (18%)</TableCell>
                          <TableCell className="text-right">{selectedFacture.tva.toLocaleString()} FCFA</TableCell>
                        </TableRow>
                        <TableRow className="font-bold">
                          <TableCell>Total TTC</TableCell>
                          <TableCell className="text-right text-primary">{selectedFacture.montantTotal.toLocaleString()} FCFA</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Règlement */}
                  {selectedFacture.dateReglement && (
                    <div className="border rounded-lg p-4 bg-green-500/5 border-green-500/20">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-medium">Payée le {selectedFacture.dateReglement}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Via {selectedFacture.methode}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" className="gap-2" onClick={() => handleDownloadPDF(selectedFacture)}>
                    <Download className="w-4 h-4" />
                    Télécharger PDF
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => window.print()}>
                    <Printer className="w-4 h-4" />
                    Imprimer
                  </Button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
