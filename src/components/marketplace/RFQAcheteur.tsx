import { useState } from "react";
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
  Plus,
  Clock,
  CheckCircle2,
  Send,
  Eye,
  XCircle,
  DollarSign,
  Calendar,
  MapPin,
  Package,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { regions } from "@/data/regions";
import { getSectorN1List } from "@/data/sectors";

type RFQStatus = "Draft" | "Published" | "OffersReceived" | "Accepted" | "Cancelled" | "Expired" | "ProformaSent" | "DepositPending" | "InProduction";
type RFQType = "b2b_volume" | "service" | "custom_product" | "variable_price" | "standard";

interface RFQ {
  id: string;
  besoin: string;
  quantite: number;
  unite: string;
  zone: string;
  deadline: string;
  dateCreation: string;
  status: RFQStatus;
  budget?: number;
  offresRecues: number;
  type: RFQType;
  recurrence?: string;
  options?: string[];
  proformaRequired?: boolean;
  depositPercent?: number;
}

const mockRFQs: RFQ[] = [
  {
    id: "RFQ-2024-A01",
    besoin: "Cacao en poudre premium",
    quantite: 500,
    unite: "kg",
    zone: "Abidjan",
    deadline: "2024-02-15",
    dateCreation: "2024-01-20",
    status: "OffersReceived",
    budget: 1500000,
    offresRecues: 3,
    type: "b2b_volume",
    recurrence: "mensuel",
  },
  {
    id: "RFQ-2024-A02",
    besoin: "Transport frigorifique",
    quantite: 5,
    unite: "trajets",
    zone: "Abidjan - San-Pédro",
    deadline: "2024-02-01",
    dateCreation: "2024-01-18",
    status: "Published",
    offresRecues: 0,
    type: "variable_price",
    options: ["Camion 5T", "Camion 10T", "Express 24h"],
  },
  {
    id: "RFQ-2024-A03",
    besoin: "Formation qualité ISO 9001",
    quantite: 1,
    unite: "session",
    zone: "Abidjan",
    deadline: "2024-01-25",
    dateCreation: "2024-01-10",
    status: "Accepted",
    budget: 500000,
    offresRecues: 2,
    type: "service",
  },
  {
    id: "RFQ-2024-A04",
    besoin: "Impression cartons personnalisés",
    quantite: 1000,
    unite: "pièces",
    zone: "Abidjan",
    deadline: "2024-02-20",
    dateCreation: "2024-01-22",
    status: "ProformaSent",
    budget: 800000,
    offresRecues: 2,
    type: "custom_product",
    proformaRequired: true,
    depositPercent: 50,
  },
  {
    id: "RFQ-2024-A05",
    besoin: "Maintenance équipements industriels",
    quantite: 12,
    unite: "interventions/an",
    zone: "Zone Industrielle Yopougon",
    deadline: "2024-03-01",
    dateCreation: "2024-01-25",
    status: "DepositPending",
    budget: 3600000,
    offresRecues: 1,
    type: "service",
    recurrence: "annuel",
    proformaRequired: true,
    depositPercent: 30,
  },
];

interface Offer {
  id: string;
  vendeur: string;
  prix: number;
  delai: string;
  conditions: string;
  dateOffre: string;
}

const mockOffers: Offer[] = [
  {
    id: "OFF-001",
    vendeur: "Coopérative Aboisso Cacao",
    prix: 1400000,
    delai: "7 jours",
    conditions: "Paiement 50% à la commande, 50% à livraison",
    dateOffre: "2024-01-22",
  },
  {
    id: "OFF-002",
    vendeur: "Chocolaterie du Sud",
    prix: 1550000,
    delai: "5 jours",
    conditions: "Livraison gratuite, certifié bio",
    dateOffre: "2024-01-23",
  },
  {
    id: "OFF-003",
    vendeur: "Cacao Express",
    prix: 1350000,
    delai: "10 jours",
    conditions: "Prix négociable pour commandes régulières",
    dateOffre: "2024-01-24",
  },
];

const statusConfig: Record<RFQStatus, { label: string; color: string; icon: typeof Clock }> = {
  Draft: { label: "Brouillon", color: "text-muted-foreground", icon: FileText },
  Published: { label: "Publiée", color: "text-blue-500", icon: Send },
  OffersReceived: { label: "Offres reçues", color: "text-primary", icon: DollarSign },
  Accepted: { label: "Acceptée", color: "text-green-500", icon: CheckCircle2 },
  Cancelled: { label: "Annulée", color: "text-destructive", icon: XCircle },
  Expired: { label: "Expirée", color: "text-muted-foreground", icon: Clock },
  ProformaSent: { label: "Proforma reçue", color: "text-amber-500", icon: FileText },
  DepositPending: { label: "Acompte en attente", color: "text-purple-500", icon: DollarSign },
  InProduction: { label: "En production", color: "text-cyan-500", icon: Package },
};

const typeConfig: Record<RFQType, { label: string; color: string; description: string }> = {
  b2b_volume: { label: "B2B Volume", color: "bg-blue-500/10 text-blue-600", description: "Achats en lots/volumes" },
  service: { label: "Service", color: "bg-purple-500/10 text-purple-600", description: "Prestation, maintenance, consulting" },
  custom_product: { label: "Sur mesure", color: "bg-amber-500/10 text-amber-600", description: "Confection, fabrication" },
  variable_price: { label: "Prix variable", color: "bg-green-500/10 text-green-600", description: "Transport, options, délais" },
  standard: { label: "Standard", color: "bg-gray-500/10 text-gray-600", description: "Demande classique" },
};

export function RFQAcheteur() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showOffersDialog, setShowOffersDialog] = useState(false);
  const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(null);
  const [rfqData, setRfqData] = useState({
    besoin: "",
    categorie: "",
    quantite: "",
    unite: "",
    zone: "",
    deadline: "",
    budget: "",
    details: "",
    type: "standard" as RFQType,
    recurrence: "",
    options: [] as string[],
    proformaRequired: false,
    depositPercent: "30",
  });
  const [newOption, setNewOption] = useState("");

  const sectorsN1 = getSectorN1List();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Mes demandes de devis</h2>
          <p className="text-sm text-muted-foreground">
            Créez des RFQ et recevez des offres des vendeurs
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Nouvelle demande
        </Button>
      </div>

      {/* Liste RFQ */}
      {mockRFQs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">Aucune demande de devis</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Créez une RFQ pour recevoir des offres de nos vendeurs
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              Créer une demande
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {mockRFQs.map((rfq) => {
            const status = statusConfig[rfq.status];
            const StatusIcon = status.icon;
            const typeInfo = typeConfig[rfq.type];

            return (
              <Card key={rfq.id} className="flex flex-col">
                <CardContent className="p-4 flex flex-col flex-1">
                  {/* En-tête : ID + Statut + Type */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-2 rounded-lg bg-muted shrink-0">
                        <StatusIcon className={cn("w-4 h-4", status.color)} />
                      </div>
                      <span className="font-mono text-sm font-medium">{rfq.id}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="outline" className={cn("text-xs", status.color)}>
                        {status.label}
                      </Badge>
                      <Badge className={cn("text-xs", typeInfo.color)}>
                        {typeInfo.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Besoin */}
                  <p className="font-semibold mb-2 line-clamp-1">{rfq.besoin}</p>

                  {/* Détails */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3 shrink-0" />
                      {rfq.quantite} {rfq.unite}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {rfq.zone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 shrink-0" />
                      {rfq.deadline}
                    </span>
                  </div>

                  {/* Budget + Offres */}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t">
                    <div>
                      {rfq.budget ? (
                        <p className="font-bold text-primary">{rfq.budget.toLocaleString()} FCFA</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Budget non défini</p>
                      )}
                      {rfq.offresRecues > 0 && (
                        <Badge variant="default" className="mt-1">
                          {rfq.offresRecues} offre(s)
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {rfq.offresRecues > 0 && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            setSelectedRFQ(rfq);
                            setShowOffersDialog(true);
                          }}
                        >
                          <DollarSign className="w-4 h-4 mr-1" />
                          Offres
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog Créer RFQ */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle demande de devis</DialogTitle>
            <DialogDescription>
              Décrivez votre besoin pour recevoir des offres
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Type de demande */}
            <div className="space-y-2">
              <Label>Type de demande *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(typeConfig).map(([key, config]) => (
                  <div
                    key={key}
                    className={cn(
                      "p-3 border rounded-lg cursor-pointer transition-all text-center",
                      rfqData.type === key ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50"
                    )}
                    onClick={() => setRfqData({ ...rfqData, type: key as RFQType })}
                  >
                    <p className="font-medium text-sm">{config.label}</p>
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="besoin">Besoin / Produit recherché *</Label>
              <Input
                id="besoin"
                placeholder="Ex: Cacao en poudre premium"
                value={rfqData.besoin}
                onChange={(e) => setRfqData({ ...rfqData, besoin: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select 
                value={rfqData.categorie} 
                onValueChange={(v) => setRfqData({ ...rfqData, categorie: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {sectorsN1.map((sector, idx) => (
                    <SelectItem key={idx} value={sector.name}>{sector.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantite">Quantité *</Label>
                <Input
                  id="quantite"
                  type="number"
                  placeholder="500"
                  value={rfqData.quantite}
                  onChange={(e) => setRfqData({ ...rfqData, quantite: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unite">Unité *</Label>
                <Select 
                  value={rfqData.unite} 
                  onValueChange={(v) => setRfqData({ ...rfqData, unite: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilogramme</SelectItem>
                    <SelectItem value="tonne">Tonne</SelectItem>
                    <SelectItem value="litre">Litre</SelectItem>
                    <SelectItem value="piece">Pièce</SelectItem>
                    <SelectItem value="sac">Sac</SelectItem>
                    <SelectItem value="carton">Carton</SelectItem>
                    <SelectItem value="session">Session</SelectItem>
                    <SelectItem value="heure">Heure</SelectItem>
                    <SelectItem value="jour">Jour</SelectItem>
                    <SelectItem value="intervention">Intervention</SelectItem>
                    <SelectItem value="lot">Lot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Récurrence pour B2B Volume */}
            {rfqData.type === "b2b_volume" && (
              <div className="space-y-2">
                <Label>Récurrence</Label>
                <Select 
                  value={rfqData.recurrence} 
                  onValueChange={(v) => setRfqData({ ...rfqData, recurrence: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Fréquence de commande" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unique">Commande unique</SelectItem>
                    <SelectItem value="hebdomadaire">Hebdomadaire</SelectItem>
                    <SelectItem value="mensuel">Mensuel</SelectItem>
                    <SelectItem value="trimestriel">Trimestriel</SelectItem>
                    <SelectItem value="annuel">Annuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Options pour Prix Variable */}
            {rfqData.type === "variable_price" && (
              <div className="space-y-2">
                <Label>Options souhaitées</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: Livraison express, Installation..."
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newOption.trim()) {
                        setRfqData({ ...rfqData, options: [...rfqData.options, newOption.trim()] });
                        setNewOption("");
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      if (newOption.trim()) {
                        setRfqData({ ...rfqData, options: [...rfqData.options, newOption.trim()] });
                        setNewOption("");
                      }
                    }}
                  >
                    Ajouter
                  </Button>
                </div>
                {rfqData.options.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {rfqData.options.map((opt, idx) => (
                      <Badge key={idx} variant="secondary" className="cursor-pointer" onClick={() => {
                        setRfqData({ ...rfqData, options: rfqData.options.filter((_, i) => i !== idx) });
                      }}>
                        {opt} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Zone de livraison *</Label>
                <Select 
                  value={rfqData.zone} 
                  onValueChange={(v) => setRfqData({ ...rfqData, zone: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Région" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Date limite *</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={rfqData.deadline}
                  onChange={(e) => setRfqData({ ...rfqData, deadline: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget estimé (FCFA) - optionnel</Label>
              <Input
                id="budget"
                type="number"
                placeholder="1500000"
                value={rfqData.budget}
                onChange={(e) => setRfqData({ ...rfqData, budget: e.target.value })}
              />
            </div>

            {/* Proforma et Acompte */}
            {(rfqData.type === "custom_product" || rfqData.type === "service") && (
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="proforma"
                      checked={rfqData.proformaRequired}
                      onChange={(e) => setRfqData({ ...rfqData, proformaRequired: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="proforma" className="font-normal cursor-pointer">
                      Proforma obligatoire avant commande
                    </Label>
                  </div>
                  {rfqData.proformaRequired && (
                    <div className="space-y-2 pl-6">
                      <Label>Acompte acceptable (%)</Label>
                      <Select 
                        value={rfqData.depositPercent} 
                        onValueChange={(v) => setRfqData({ ...rfqData, depositPercent: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Pas d'acompte</SelectItem>
                          <SelectItem value="20">20%</SelectItem>
                          <SelectItem value="30">30%</SelectItem>
                          <SelectItem value="50">50%</SelectItem>
                          <SelectItem value="100">100% (paiement intégral)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        L'acompte sera demandé avant le lancement de la production/prestation
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <Label htmlFor="details">Détails / Spécifications</Label>
              <Textarea
                id="details"
                placeholder="Précisez vos exigences: qualité, certifications, conditions..."
                rows={3}
                value={rfqData.details}
                onChange={(e) => setRfqData({ ...rfqData, details: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Pièces jointes (optionnel)</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="w-6 h-6 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-1">Cahier des charges, plans, spécifications...</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Annuler
              </Button>
              <Button onClick={() => setShowCreateDialog(false)}>
                <Send className="w-4 h-4 mr-1" />
                Publier la demande
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Voir offres */}
      <Dialog open={showOffersDialog} onOpenChange={setShowOffersDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Offres reçues</DialogTitle>
            <DialogDescription>
              {selectedRFQ?.besoin} - {selectedRFQ?.quantite} {selectedRFQ?.unite}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {mockOffers.map((offer) => (
              <Card key={offer.id} className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{offer.vendeur}</p>
                      <p className="text-sm text-muted-foreground">Offre du {offer.dateOffre}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {offer.prix.toLocaleString()} FCFA
                      </p>
                      <p className="text-sm text-muted-foreground">Délai: {offer.delai}</p>
                    </div>
                  </div>
                  <div className="mt-3 p-3 rounded-lg bg-muted/50">
                    <p className="text-sm">{offer.conditions}</p>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      Négocier
                    </Button>
                    <Button size="sm">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Accepter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
