import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Store,
  ShoppingCart,
  Package,
  TrendingUp,
  FileText,
  AlertTriangle,
  Truck,
  Award,
  Clock,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  DollarSign,
  Users,
  AlertCircle,
  Eye,
  MessageSquare,
  FileCheck,
  CalendarClock,
  ShieldCheck,
  Star,
  TrendingDown,
  MapPin,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketplaceOverviewProps {
  isVendeur: boolean;
  onNavigate: (tab: string) => void;
}

export function MarketplaceOverview({ isVendeur, onNavigate }: MarketplaceOverviewProps) {
  // Mock KPIs vendeur enrichis
  const vendeurKPIs = {
    ca: 2850000,
    caEvolution: 12.5,
    commandes: 24,
    commandesEvolution: 8,
    panierMoyen: 118750,
    topProduits: [
      { nom: "Cacao Premium", ventes: 12, ca: 850000 },
      { nom: "Attiéké séché", ventes: 8, ca: 420000 },
      { nom: "Huile de palme", ventes: 4, ca: 380000 },
    ],
    commandesRetard: 2,
    tauxLitiges: 3.2,
    delaiMoyenLivraison: 2.5,
    noteVendeur: 4.7,
    // RFQ stats
    rfqARepondre: 5,
    rfqNegociation: 3,
    rfqGagnees: 8,
    rfqTauxConversion: 72,
    // Conformité
    produitsBloques: 1,
    madeInCIEnAudit: 2,
    madeInCIValide: 5,
    documentsExpirant: 3,
    // Expéditions
    expeditionsEnCours: 4,
    expeditionsAConfirmer: 2,
    tauxLivraisonATemps: 94,
  };

  // Mock KPIs acheteur enrichis
  const acheteurKPIs = {
    commandesEnCours: 3,
    commandesEnTransit: 2,
    commandesLivrees: 15,
    commandesAConfirmer: 1,
    rfqEnCours: 2,
    rfqEnNegociation: 1,
    offreRecues: 4,
    depensesTotales: 4500000,
    economiesRealisees: 320000,
    fournisseursActifs: 7,
  };

  // Mock alertes documents
  const alertesDocuments = [
    { type: "DCC", nom: "Certificat conformité Cacao", expiration: "5 jours", urgent: true },
    { type: "Phyto", nom: "Certificat phytosanitaire Lot-23", expiration: "12 jours", urgent: false },
    { type: "Made in CI", nom: "Label Bronze - Renouvellement", expiration: "20 jours", urgent: false },
  ];

  // Mock RFQ récentes pour vendeur
  const rfqRecentes = [
    { id: "RFQ-2024-015", demandeur: "Hôtel Sofitel", besoin: "Cacao premium 500kg", delai: "2j", montant: 1500000 },
    { id: "RFQ-2024-014", demandeur: "Carrefour CI", besoin: "Huile palme 1000L", delai: "5j", montant: 2200000 },
  ];

  // Mock commandes récentes
  const commandesRecentes = [
    { id: "CMD-2024-089", client: "Restaurant Chez Ali", statut: "À expédier", montant: 125000 },
    { id: "CMD-2024-088", client: "Supermarché Sococé", statut: "En transit", montant: 340000 },
  ];

  // Mock RFQ acheteur
  const mesRFQ = [
    { id: "RFQ-2024-010", besoin: "Café torréfié 200kg", offres: 3, meilleurPrix: 890000, statut: "Offres reçues" },
    { id: "RFQ-2024-009", besoin: "Cacao bio 100kg", offres: 2, meilleurPrix: 450000, statut: "En négociation" },
  ];

  return (
    <div className="space-y-6">
      {/* Cockpit Vendeur */}
      {isVendeur && (
        <>
          {/* Actions Rapides Vendeur */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Store className="w-6 h-6 text-primary" />
                    Mon Cockpit Vendeur
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Vue unifiée de votre activité commerciale
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button className="gap-2" onClick={() => onNavigate("nouveau-produit")}>
                    <Package className="w-4 h-4" />
                    Publier produit
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => onNavigate("rfq-vendeur")}>
                    <FileText className="w-4 h-4" />
                    RFQ ({vendeurKPIs.rfqARepondre})
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => onNavigate("expeditions")}>
                    <Truck className="w-4 h-4" />
                    Expéditions ({vendeurKPIs.expeditionsAConfirmer})
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPIs Performance Ventes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Performance Commerciale
            </h3>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <Card className="transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                        <DollarSign className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground truncate">Chiffre d'affaires</p>
                        <p className="text-xl font-bold text-primary">
                          {vendeurKPIs.ca.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">FCFA</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1 bg-green-500/10 text-green-600 shrink-0">
                      <TrendingUp className="w-3 h-3" />
                      +{vendeurKPIs.caEvolution}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-secondary/10 shrink-0">
                        <ShoppingCart className="w-5 h-5 text-secondary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground truncate">Commandes</p>
                        <p className="text-xl font-bold text-secondary">{vendeurKPIs.commandes}</p>
                        <p className="text-xs text-muted-foreground">ce mois</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1 bg-green-500/10 text-green-600 shrink-0">
                      <TrendingUp className="w-3 h-3" />
                      +{vendeurKPIs.commandesEvolution}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 shrink-0">
                      <Star className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground truncate">Note vendeur</p>
                      <p className="text-xl font-bold text-amber-500">{vendeurKPIs.noteVendeur}/5</p>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "w-3 h-3",
                              star <= Math.floor(vendeurKPIs.noteVendeur)
                                ? "fill-amber-500 text-amber-500"
                                : "text-muted-foreground"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10 shrink-0">
                      <Truck className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground truncate">Livraison à temps</p>
                      <p className="text-xl font-bold text-green-500">{vendeurKPIs.tauxLivraisonATemps}%</p>
                      <Progress value={vendeurKPIs.tauxLivraisonATemps} className="h-1.5 mt-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Alertes Urgentes */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Alertes Opérationnelles */}
            <Card className={cn(
              (vendeurKPIs.commandesRetard > 0 || vendeurKPIs.documentsExpirant > 0) && "border-amber-500/50"
            )}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Alertes Opérationnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {vendeurKPIs.commandesRetard > 0 && (
                  <div 
                    className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/30 cursor-pointer hover:bg-red-500/20 transition-colors"
                    onClick={() => onNavigate("commandes-vendeur")}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="font-medium text-red-600">{vendeurKPIs.commandesRetard} commandes en retard</p>
                        <p className="text-xs text-muted-foreground">Action immédiate requise</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-red-500" />
                  </div>
                )}

                {vendeurKPIs.expeditionsAConfirmer > 0 && (
                  <div 
                    className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 cursor-pointer hover:bg-amber-500/20 transition-colors"
                    onClick={() => onNavigate("expeditions")}
                  >
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="font-medium">{vendeurKPIs.expeditionsAConfirmer} expéditions à confirmer</p>
                        <p className="text-xs text-muted-foreground">Confirmez l'envoi avec code QR/OTP</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}

                {vendeurKPIs.produitsBloques > 0 && (
                  <div 
                    className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20 cursor-pointer hover:bg-red-500/20 transition-colors"
                    onClick={() => onNavigate("produits-reglementes")}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="font-medium text-red-600">{vendeurKPIs.produitsBloques} produit(s) bloqué(s)</p>
                        <p className="text-xs text-muted-foreground">Documents conformité manquants</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-red-500" />
                  </div>
                )}

                <div 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => onNavigate("litiges")}
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Taux litiges: {vendeurKPIs.tauxLitiges}%</p>
                      <p className="text-xs text-muted-foreground">Objectif: {"<"}2%</p>
                    </div>
                  </div>
                  <Badge variant={vendeurKPIs.tauxLitiges > 2 ? "destructive" : "secondary"}>
                    {vendeurKPIs.tauxLitiges > 2 ? "Attention" : "OK"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Documents expirant */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarClock className="w-5 h-5 text-amber-500" />
                  Documents à renouveler
                </CardTitle>
                <CardDescription>{alertesDocuments.length} document(s)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {alertesDocuments.map((doc, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-lg text-sm",
                      doc.urgent ? "bg-red-500/10" : "bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <FileCheck className={cn("w-4 h-4", doc.urgent ? "text-red-500" : "text-muted-foreground")} />
                      <div>
                        <p className="font-medium truncate max-w-[140px]">{doc.nom}</p>
                        <p className="text-xs text-muted-foreground">{doc.type}</p>
                      </div>
                    </div>
                    <Badge variant={doc.urgent ? "destructive" : "outline"} className="text-xs">
                      {doc.expiration}
                    </Badge>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => onNavigate("produits-reglementes")}>
                  Gérer les documents
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* RFQ & Commandes */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* RFQ Vendeur */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Demandes de Devis (RFQ)
                  </CardTitle>
                  <Badge className="bg-primary/10 text-primary">
                    {vendeurKPIs.rfqTauxConversion}% conversion
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats RFQ */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <p className="text-lg font-bold text-blue-500">{vendeurKPIs.rfqARepondre}</p>
                    <p className="text-xs text-muted-foreground">À répondre</p>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <p className="text-lg font-bold text-purple-500">{vendeurKPIs.rfqNegociation}</p>
                    <p className="text-xs text-muted-foreground">Négociation</p>
                  </div>
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <p className="text-lg font-bold text-green-500">{vendeurKPIs.rfqGagnees}</p>
                    <p className="text-xs text-muted-foreground">Gagnées</p>
                  </div>
                </div>

                {/* RFQ récentes */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">RFQ prioritaires</p>
                  {rfqRecentes.map((rfq) => (
                    <div
                      key={rfq.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => onNavigate("rfq-vendeur")}
                    >
                      <div>
                        <p className="font-medium text-sm">{rfq.demandeur}</p>
                        <p className="text-xs text-muted-foreground">{rfq.besoin}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {rfq.delai}
                        </Badge>
                        <p className="text-xs font-medium mt-1">{rfq.montant.toLocaleString()} F</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full" onClick={() => onNavigate("rfq-vendeur")}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Gérer toutes les RFQ
                </Button>
              </CardContent>
            </Card>

            {/* Commandes récentes */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="w-5 h-5 text-secondary" />
                    Commandes à traiter
                  </CardTitle>
                  <Badge variant="secondary">{vendeurKPIs.expeditionsEnCours} en cours</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats commandes */}
                <div className="flex gap-4">
                  <div className="flex-1 p-3 rounded-lg bg-amber-500/10 text-center">
                    <p className="text-lg font-bold text-amber-500">{vendeurKPIs.expeditionsAConfirmer}</p>
                    <p className="text-xs text-muted-foreground">À expédier</p>
                  </div>
                  <div className="flex-1 p-3 rounded-lg bg-blue-500/10 text-center">
                    <p className="text-lg font-bold text-blue-500">{vendeurKPIs.expeditionsEnCours}</p>
                    <p className="text-xs text-muted-foreground">En transit</p>
                  </div>
                </div>

                {/* Commandes récentes */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Actions requises</p>
                  {commandesRecentes.map((cmd) => (
                    <div
                      key={cmd.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => onNavigate("commandes-vendeur")}
                    >
                      <div>
                        <p className="font-medium text-sm">{cmd.id}</p>
                        <p className="text-xs text-muted-foreground">{cmd.client}</p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={cmd.statut === "À expédier" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {cmd.statut}
                        </Badge>
                        <p className="text-xs font-medium mt-1">{cmd.montant.toLocaleString()} F</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full" onClick={() => onNavigate("commandes-vendeur")}>
                  <Eye className="w-4 h-4 mr-2" />
                  Voir toutes les commandes
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Labels & Conformité */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Made in CI */}
            <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Label Made in Côte d'Ivoire
                </CardTitle>
                <CardDescription>Valorisez votre production locale</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <p className="text-lg font-bold text-amber-500">{vendeurKPIs.madeInCIValide}</p>
                    <p className="text-xs text-muted-foreground">Validés</p>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <p className="text-lg font-bold text-blue-500">{vendeurKPIs.madeInCIEnAudit}</p>
                    <p className="text-xs text-muted-foreground">En audit</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted">
                    <p className="text-lg font-bold">3</p>
                    <p className="text-xs text-muted-foreground">Éligibles</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium">Niveaux de certification</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className="bg-amber-600 text-white">🥇 Or</Badge>
                    <Badge className="bg-gray-400 text-white">🥈 Argent</Badge>
                    <Badge className="bg-amber-700 text-white">🥉 Bronze</Badge>
                    <Badge variant="outline">💡 Innovation</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => onNavigate("made-in-ci")}>
                  <Award className="w-4 h-4 mr-2" />
                  Demander une certification
                </Button>
              </CardContent>
            </Card>

            {/* Top Produits */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Meilleurs Produits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vendeurKPIs.topProduits.map((produit, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                          idx === 0 ? "bg-amber-500 text-white" :
                          idx === 1 ? "bg-gray-400 text-white" :
                          "bg-amber-700 text-white"
                        )}>
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{produit.nom}</p>
                          <p className="text-xs text-muted-foreground">{produit.ventes} ventes</p>
                        </div>
                      </div>
                      <p className="font-semibold text-sm">{produit.ca.toLocaleString()} F</p>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-3" onClick={() => onNavigate("mes-produits")}>
                  Voir tous les produits
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Cockpit Acheteur */}
      <Card className="border-secondary/20 bg-gradient-to-r from-secondary/5 via-primary/5 to-accent/5">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-secondary" />
                Mon Espace Achats
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Gérez vos commandes et demandes de devis
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="gap-2" onClick={() => onNavigate("rfq-acheteur")}>
                <FileText className="w-4 h-4" />
                Nouvelle RFQ
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => onNavigate("panier")}>
                <ShoppingCart className="w-4 h-4" />
                Mon panier
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Acheteur */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 shrink-0">
                <Package className="w-5 h-5 text-blue-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground truncate">Commandes en cours</p>
                <p className="text-xl font-bold text-blue-500">{acheteurKPIs.commandesEnCours}</p>
                <p className="text-xs text-muted-foreground">{acheteurKPIs.commandesEnTransit} en transit</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10 shrink-0">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground truncate">Commandes livrées</p>
                <p className="text-xl font-bold text-green-500">{acheteurKPIs.commandesLivrees}</p>
                {acheteurKPIs.commandesAConfirmer > 0 && (
                  <p className="text-xs text-amber-500">{acheteurKPIs.commandesAConfirmer} à confirmer</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 shrink-0">
                <FileText className="w-5 h-5 text-purple-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground truncate">Mes RFQ</p>
                <p className="text-xl font-bold text-purple-500">{acheteurKPIs.rfqEnCours + acheteurKPIs.rfqEnNegociation}</p>
                <p className="text-xs text-muted-foreground">{acheteurKPIs.offreRecues} offres reçues</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10 shrink-0">
                <TrendingDown className="w-5 h-5 text-green-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground truncate">Économies réalisées</p>
                <p className="text-xl font-bold text-green-500">{acheteurKPIs.economiesRealisees.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">FCFA via RFQ</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RFQ Acheteur & Suivi */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Mes RFQ */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" />
              Mes Demandes de Devis
            </CardTitle>
            <CardDescription>Comparez les offres de vos fournisseurs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mesRFQ.map((rfq) => (
              <div
                key={rfq.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                onClick={() => onNavigate("rfq-acheteur")}
              >
                <div>
                  <p className="font-medium text-sm">{rfq.besoin}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{rfq.offres} offres</Badge>
                    <Badge 
                      variant={rfq.statut === "En négociation" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {rfq.statut}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Meilleur prix</p>
                  <p className="font-semibold text-green-600">{rfq.meilleurPrix.toLocaleString()} F</p>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={() => onNavigate("rfq-acheteur")}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Créer une nouvelle RFQ
            </Button>
          </CardContent>
        </Card>

        {/* Fournisseurs & Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-secondary" />
              Mes Fournisseurs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold text-secondary">{acheteurKPIs.fournisseursActifs}</p>
                <p className="text-xs text-muted-foreground">Fournisseurs actifs</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold">{acheteurKPIs.depensesTotales.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total achats (FCFA)</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium">Privilégiez le Made in CI</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                3 de vos fournisseurs ont le label Made in Côte d'Ivoire
              </p>
            </div>
            <Button variant="ghost" size="sm" className="w-full" onClick={() => onNavigate("historique")}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Voir l'historique complet
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
