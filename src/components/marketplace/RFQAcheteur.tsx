import { useEffect, useRef, useState } from "react";
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
  Loader2,
  AlertCircle,
  X,
  Pencil,
  MessageSquare,
  ThumbsDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { rfqApi, regionsApi, type RFQApiType, type Region, type RFQFromAPI, type RFQOffer } from "@/lib/api";
import { RestrictedButton } from "@/components/shared/RestrictedButton";
import { useKycGate } from "@/hooks/useKycStatus";

type RFQType = "b2b_volume" | "service" | "custom_product" | "variable_price" | "standard";

const RFQ_API_CATEGORIES = [
  "Secteur Primaire : Agriculture, Élevage, Pêche",
  "Secteur Secondaire : Industrie, BTP, Énergie",
  "Secteur Tertiaire : Commerce, Services, Transport",
  "Économie Numérique & Innovation",
  "Artisanat & Industries Créatives",
] as const;

const TYPE_TO_API: Record<RFQType, RFQApiType> = {
  b2b_volume: "B2B Volume",
  service: "Service",
  custom_product: "Sur mesure",
  variable_price: "Prix variable",
  standard: "Standard",
};



type StatusDisplay = { label: string; color: string; icon: typeof Clock };
const statusConfig: Record<string, StatusDisplay> = {
  "Brouillon":          { label: "Brouillon",          color: "text-muted-foreground", icon: FileText },
  "Publiée":            { label: "Publiée",             color: "text-blue-500",         icon: Send },
  "Offres reçues":      { label: "Offres reçues",       color: "text-primary",          icon: DollarSign },
  "Acceptée":           { label: "Acceptée",            color: "text-green-500",        icon: CheckCircle2 },
  "Annulée":            { label: "Annulée",             color: "text-destructive",      icon: XCircle },
  "Clôturée":           { label: "Clôturée",            color: "text-muted-foreground", icon: CheckCircle2 },
  "Expirée":            { label: "Expirée",             color: "text-muted-foreground", icon: Clock },
  "Proforma reçue":     { label: "Proforma reçue",      color: "text-amber-500",        icon: FileText },
  "Acompte en attente": { label: "Acompte en attente",  color: "text-purple-500",       icon: DollarSign },
};
const defaultStatus: StatusDisplay = { label: "Inconnu", color: "text-muted-foreground", icon: Clock };

type TypeDisplay = { label: string; color: string; description: string };
const typeConfig: Record<string, TypeDisplay> = {
  "B2B Volume":  { label: "B2B Volume",  color: "bg-blue-500/10 text-blue-600",   description: "Achats en lots/volumes" },
  "Service":     { label: "Service",     color: "bg-purple-500/10 text-purple-600", description: "Prestation, maintenance, consulting" },
  "Sur mesure":  { label: "Sur mesure",  color: "bg-amber-500/10 text-amber-600", description: "Confection, fabrication" },
  "Prix variable":{ label: "Prix variable", color: "bg-green-500/10 text-green-600", description: "Transport, options, délais" },
  "Standard":    { label: "Standard",    color: "bg-gray-500/10 text-gray-600",   description: "Demande classique" },
};
const defaultType: TypeDisplay = { label: "Standard", color: "bg-gray-500/10 text-gray-600", description: "" };

const typeConfigForm: Record<RFQType, { label: string; color: string; description: string }> = {
  b2b_volume:    { label: "B2B Volume",   color: "bg-blue-500/10 text-blue-600",    description: "Achats en lots/volumes" },
  service:       { label: "Service",      color: "bg-purple-500/10 text-purple-600", description: "Prestation, maintenance, consulting" },
  custom_product:{ label: "Sur mesure",   color: "bg-amber-500/10 text-amber-600",  description: "Confection, fabrication" },
  variable_price:{ label: "Prix variable",color: "bg-green-500/10 text-green-600",  description: "Transport, options, délais" },
  standard:      { label: "Standard",     color: "bg-gray-500/10 text-gray-600",    description: "Demande classique" },
};

export function RFQAcheteur() {
  const { allowed: canCreateRFQ, reason: createRFQReason } = useKycGate(
    "Veuillez compléter votre KYC afin de déposer un appel d'offres."
  );
  const [rfqs, setRfqs] = useState<RFQFromAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showOffersDialog, setShowOffersDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedRFQ, setSelectedRFQ] = useState<RFQFromAPI | null>(null);
  const [editData, setEditData] = useState<Partial<{
    productNeed: string; category: string; quantity: string; unit: string;
    deliveryZone: string; deadline: string; estimatedBudget: string; specifications: string; type: string;
  }>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [offers, setOffers] = useState<RFQOffer[]>([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<RFQOffer | null>(null);

  // Dialog négocier
  const [showNegotiateDialog, setShowNegotiateDialog] = useState(false);
  const [negotiateCounterPrice, setNegotiateCounterPrice] = useState("");
  const [negotiateMessage, setNegotiateMessage] = useState("");
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [negotiateError, setNegotiateError] = useState<string | null>(null);

  // Dialog rejeter
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);

  // Accepter offre
  const [acceptingOfferId, setAcceptingOfferId] = useState<string | null>(null);

  // Proforma
  const [proformaActionId, setProformaActionId] = useState<string | null>(null);
  const [rfqData, setRfqData] = useState({
    besoin: "",
    categorie: "",
    quantite: "",
    unite: "",
    zone: "",
    deadline: "",
    estimatedBudget: "",
    specifications: "",
    type: "standard" as RFQType,
    recurrence: "",
    options: [] as string[],
    proformaRequired: false,
    depositPercent: "30",
  });
  const [newOption, setNewOption] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [apiRegions, setApiRegions] = useState<Region[]>([]);

  const handleSubmit = async (publishNow: boolean) => {
    setSubmitError(null);
    const qty = parseFloat(rfqData.quantite);
    if (isNaN(qty) || qty < 0.01) {
      setSubmitError("La quantité doit être un nombre supérieur à 0.");
      return;
    }
    setIsSubmitting(true);
    try {
      await rfqApi.create({
        title: rfqData.besoin,
        productNeed: rfqData.besoin,
        description: rfqData.specifications || undefined,
        category: rfqData.categorie,
        quantity: qty,
        unit: rfqData.unite,
        deadline: new Date(rfqData.deadline).toISOString(),
        type: TYPE_TO_API[rfqData.type],
        deliveryZone: rfqData.zone,
        publishNow,
        files: files.length > 0 ? files : undefined,
      });
      setSubmitSuccess(true);
      setShowCreateDialog(false);
      rfqApi.getAll().then(setRfqs).catch(() => {});
      setRfqData({
        besoin: "", categorie: "", quantite: "", unite: "", zone: "",
        deadline: "", estimatedBudget: "", specifications: "", type: "standard",
        recurrence: "", options: [], proformaRequired: false, depositPercent: "30",
      });
      setFiles([]);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erreur lors de la création");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    regionsApi.getAll().then(setApiRegions).catch(() => {});
    rfqApi.getAll()
      .then(setRfqs)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

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
        <RestrictedButton onClick={() => setShowCreateDialog(true)} allowed={canCreateRFQ} reason={createRFQReason}>
          <Plus className="w-4 h-4 mr-1" />
          Nouvelle demande
        </RestrictedButton>
      </div>

      {submitSuccess && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Votre demande de devis a été publiée avec succès.
          <button className="ml-auto hover:opacity-70" onClick={() => setSubmitSuccess(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Liste RFQ */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Chargement...
        </div>
      ) : rfqs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">Aucune demande de devis</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Créez une RFQ pour recevoir des offres de nos vendeurs
            </p>
            <RestrictedButton onClick={() => setShowCreateDialog(true)} allowed={canCreateRFQ} reason={createRFQReason}>
              Créer une demande
            </RestrictedButton>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {rfqs.map((rfq) => {
            const status = statusConfig[rfq.status] ?? defaultStatus;
            const StatusIcon = status.icon;
            const typeInfo = typeConfig[rfq.type] ?? defaultType;

            return (
              <Card key={rfq.id} className="flex flex-col">
                <CardContent className="p-4 flex flex-col flex-1">
                  {/* En-tête : N° RFQ + Statut + Type */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-2 rounded-lg bg-muted shrink-0">
                        <StatusIcon className={cn("w-4 h-4", status.color)} />
                      </div>
                      <span className="font-mono text-sm font-medium">{rfq.rfqNumber}</span>
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
                  <p className="font-semibold mb-2 line-clamp-1">{rfq.productNeed}</p>

                  {/* Détails */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3 shrink-0" />
                      {parseFloat(rfq.quantity).toLocaleString()} {rfq.unit}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {rfq.deliveryZone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 shrink-0" />
                      {rfq.deadline}
                    </span>
                  </div>

                  {/* Budget + Offres */}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t">
                    <div>
                      {rfq.estimatedBudget ? (
                        <p className="font-bold text-primary">{rfq.estimatedBudget.toLocaleString()} FCFA</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Budget non défini</p>
                      )}
                      {rfq.offersCount > 0 && (
                        <Badge variant="default" className="mt-1">
                          {rfq.offersCount} offre(s)
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {rfq.status === "Brouillon" && (
                        <Button
                          size="sm"
                          variant="default"
                          disabled={publishingId === rfq.id}
                          onClick={async () => {
                            setPublishingId(rfq.id);
                            try {
                              await rfqApi.publish(rfq.id);
                              rfqApi.getAll().then(setRfqs).catch(() => {});
                            } catch {
                              // silencieux, l'erreur peut être affichée plus tard
                            } finally {
                              setPublishingId(null);
                            }
                          }}
                        >
                          {publishingId === rfq.id
                            ? <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            : <Send className="w-4 h-4 mr-1" />}
                          Publier
                        </Button>
                      )}
                      {rfq.offersCount > 0 && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            setSelectedRFQ(rfq);
                            setOffers([]);
                            setIsLoadingOffers(true);
                            setShowOffersDialog(true);
                            rfqApi.getOffers(rfq.id)
                              .then(setOffers)
                              .catch(() => {})
                              .finally(() => setIsLoadingOffers(false));
                          }}
                        >
                          <DollarSign className="w-4 h-4 mr-1" />
                          Offres
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedRFQ(rfq);
                          setShowDetailDialog(true);
                        }}
                      >
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
                {Object.entries(typeConfigForm).map(([key, config]) => (
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
              <Label>Catégorie *</Label>
              <Select
                value={rfqData.categorie}
                onValueChange={(v) => setRfqData({ ...rfqData, categorie: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {RFQ_API_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
                    <SelectItem value="Kilogramme">Kilogramme</SelectItem>
                    <SelectItem value="Tonne">Tonne</SelectItem>
                    <SelectItem value="Litre">Litre</SelectItem>
                    <SelectItem value="Pièce">Pièce</SelectItem>
                    <SelectItem value="Sac">Sac</SelectItem>
                    <SelectItem value="Carton">Carton</SelectItem>
                    <SelectItem value="Session">Session</SelectItem>
                    <SelectItem value="Heure">Heure</SelectItem>
                    <SelectItem value="Jour">Jour</SelectItem>
                    <SelectItem value="Intervention">Intervention</SelectItem>
                    <SelectItem value="Lot">Lot</SelectItem>
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
                    <SelectValue placeholder="Sélectionner une région" />
                  </SelectTrigger>
                  <SelectContent>
                    {apiRegions.map((region) => (
                      <SelectItem key={region.id} value={region.name}>
                        {region.name}
                      </SelectItem>
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
              <Label htmlFor="estimatedBudget">Budget estimé (FCFA) - optionnel</Label>
              <Input
                id="estimatedBudget"
                type="number"
                placeholder="1500000"
                value={rfqData.estimatedBudget}
                onChange={(e) => setRfqData({ ...rfqData, estimatedBudget: e.target.value })}
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
              <Label htmlFor="specifications">Détails / Spécifications</Label>
              <Textarea
                id="specifications"
                placeholder="Précisez vos exigences: qualité, certifications, conditions..."
                rows={3}
                value={rfqData.specifications}
                onChange={(e) => setRfqData({ ...rfqData, specifications: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Pièces jointes (optionnel)</Label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  const selected = Array.from(e.target.files ?? []);
                  setFiles((prev) => [...prev, ...selected]);
                  e.target.value = "";
                }}
              />
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-6 h-6 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-1">
                  Cahier des charges, plans, spécifications...
                </p>
              </div>
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {files.map((f, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1 pr-1">
                      {f.name}
                      <button
                        type="button"
                        onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {submitError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {submitError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={isSubmitting}>
                Annuler
              </Button>
              {/* Bouton Brouillon masqué temporairement */}
              <Button
                disabled={isSubmitting || !rfqData.besoin || !rfqData.categorie || !rfqData.quantite || !rfqData.unite || !rfqData.zone || !rfqData.deadline}
                onClick={() => handleSubmit(true)}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
                Publier
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Détail RFQ */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {selectedRFQ?.rfqNumber}
            </DialogTitle>
            <DialogDescription>
              Détails de la demande de devis
            </DialogDescription>
          </DialogHeader>
          {selectedRFQ && (
            <div className="space-y-3 py-2">
              {[
                { label: "Besoin", value: selectedRFQ.productNeed },
                { label: "Type", value: selectedRFQ.type },
                { label: "Catégorie", value: selectedRFQ.category },
                { label: "Quantité", value: `${parseFloat(selectedRFQ.quantity).toLocaleString()} ${selectedRFQ.unit}` },
                { label: "Zone de livraison", value: selectedRFQ.deliveryZone },
                { label: "Date limite", value: selectedRFQ.deadline },
                { label: "Budget estimé", value: selectedRFQ.estimatedBudget ? `${selectedRFQ.estimatedBudget.toLocaleString()} FCFA` : "Non défini" },
                { label: "Spécifications", value: selectedRFQ.specifications ?? "—" },
                { label: "Statut", value: selectedRFQ.status },
                { label: "Créé le", value: new Date(selectedRFQ.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start gap-3 text-sm">
                  <span className="w-36 shrink-0 text-muted-foreground">{label}</span>
                  <span className="font-medium break-words">{value}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Fermer
            </Button>
            <Button
              onClick={() => {
                if (!selectedRFQ) return;
                setEditData({
                  productNeed: selectedRFQ.productNeed,
                  category: selectedRFQ.category,
                  quantity: selectedRFQ.quantity,
                  unit: selectedRFQ.unit,
                  deliveryZone: selectedRFQ.deliveryZone,
                  deadline: selectedRFQ.deadline,
                  estimatedBudget: selectedRFQ.estimatedBudget?.toString() ?? "",
                  specifications: selectedRFQ.specifications ?? "",
                  type: selectedRFQ.type,
                });
                setSaveError(null);
                setShowDetailDialog(false);
                setShowEditDialog(true);
              }}
            >
              <Pencil className="w-4 h-4 mr-1" />
              Modifier
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Modifier RFQ */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier la demande</DialogTitle>
            <DialogDescription>{selectedRFQ?.rfqNumber}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Type de demande</Label>
              <Select value={editData.type ?? ""} onValueChange={(v) => setEditData({ ...editData, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(typeConfig).map(([key]) => (
                    <SelectItem key={key} value={key}>{key}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Besoin / Produit *</Label>
              <Input value={editData.productNeed ?? ""} onChange={(e) => setEditData({ ...editData, productNeed: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>Catégorie *</Label>
              <Select value={editData.category ?? ""} onValueChange={(v) => setEditData({ ...editData, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RFQ_API_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantité *</Label>
                <Input type="number" value={editData.quantity ?? ""} onChange={(e) => setEditData({ ...editData, quantity: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Unité *</Label>
                <Select value={editData.unit ?? ""} onValueChange={(v) => setEditData({ ...editData, unit: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Kilogramme","Tonne","Litre","Pièce","Sac","Carton","Session","Heure","Jour","Intervention","Lot"].map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Zone de livraison *</Label>
                <Select value={editData.deliveryZone ?? ""} onValueChange={(v) => setEditData({ ...editData, deliveryZone: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {apiRegions.map((r) => (
                      <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date limite *</Label>
                <Input type="date" value={editData.deadline ?? ""} onChange={(e) => setEditData({ ...editData, deadline: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Budget estimé (FCFA)</Label>
              <Input type="number" placeholder="Optionnel" value={editData.estimatedBudget ?? ""} onChange={(e) => setEditData({ ...editData, estimatedBudget: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>Spécifications</Label>
              <Textarea rows={3} value={editData.specifications ?? ""} onChange={(e) => setEditData({ ...editData, specifications: e.target.value })} />
            </div>

            {saveError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {saveError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={isSaving}>
                Annuler
              </Button>
              <Button
                disabled={isSaving || !editData.productNeed || !editData.category || !editData.quantity || !editData.unit || !editData.deliveryZone || !editData.deadline}
                onClick={async () => {
                  if (!selectedRFQ) return;
                  setSaveError(null);
                  const qty = parseFloat(editData.quantity ?? "");
                  if (isNaN(qty) || qty < 0.01) {
                    setSaveError("La quantité doit être un nombre supérieur à 0.");
                    return;
                  }
                  setIsSaving(true);
                  try {
                    await rfqApi.update(selectedRFQ.id, {
                      type: editData.type,
                      productNeed: editData.productNeed,
                      category: editData.category,
                      quantity: qty,
                      unit: editData.unit,
                      deliveryZone: editData.deliveryZone,
                      deadline: editData.deadline,
                      estimatedBudget: editData.estimatedBudget ? parseFloat(editData.estimatedBudget) : null,
                      specifications: editData.specifications || null,
                    });
                    setShowEditDialog(false);
                    rfqApi.getAll().then(setRfqs).catch(() => {});
                  } catch (err) {
                    setSaveError(err instanceof Error ? err.message : "Erreur lors de la mise à jour");
                  } finally {
                    setIsSaving(false);
                  }
                }}
              >
                {isSaving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Négocier une offre */}
      <Dialog open={showNegotiateDialog} onOpenChange={setShowNegotiateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Négocier cette offre
            </DialogTitle>
            <DialogDescription>
              Proposez un contre-prix et un message au vendeur
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Contre-prix proposé (FCFA) *</Label>
              <Input
                type="number"
                placeholder="Ex : 1 350 000"
                value={negotiateCounterPrice}
                onChange={(e) => setNegotiateCounterPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea
                rows={3}
                placeholder="Ex: Pouvez-vous ajuster le prix et confirmer une livraison en 7 jours ?"
                value={negotiateMessage}
                onChange={(e) => setNegotiateMessage(e.target.value)}
              />
            </div>
            {negotiateError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {negotiateError}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowNegotiateDialog(false)} disabled={isNegotiating}>
              Annuler
            </Button>
            <Button
              disabled={isNegotiating || !negotiateCounterPrice || !negotiateMessage.trim()}
              onClick={async () => {
                if (!selectedOffer) return;
                const counterPrice = parseFloat(negotiateCounterPrice);
                if (isNaN(counterPrice) || counterPrice <= 0) {
                  setNegotiateError("Le contre-prix doit être un nombre supérieur à 0.");
                  return;
                }
                setNegotiateError(null);
                setIsNegotiating(true);
                try {
                  await rfqApi.negotiateOffer(selectedOffer.id, counterPrice, negotiateMessage);
                  setShowNegotiateDialog(false);
                  if (selectedRFQ) {
                    rfqApi.getOffers(selectedRFQ.id).then(setOffers).catch(() => {});
                  }
                } catch (err) {
                  setNegotiateError(err instanceof Error ? err.message : "Erreur lors de la négociation");
                } finally {
                  setIsNegotiating(false);
                }
              }}
            >
              {isNegotiating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
              Envoyer la contre-offre
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Rejeter une offre */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ThumbsDown className="w-5 h-5 text-destructive" />
              Rejeter cette offre
            </DialogTitle>
            <DialogDescription>
              Indiquez la raison du rejet (optionnel)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Raison du rejet</Label>
              <Textarea
                rows={3}
                placeholder="Ex: Prix au-dessus du budget alloué"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            {rejectError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {rejectError}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={isRejecting}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={isRejecting}
              onClick={async () => {
                if (!selectedOffer) return;
                setRejectError(null);
                setIsRejecting(true);
                try {
                  await rfqApi.rejectOffer(selectedOffer.id, rejectReason || "Rejet de l'offre");
                  setShowRejectDialog(false);
                  if (selectedRFQ) {
                    rfqApi.getOffers(selectedRFQ.id).then(setOffers).catch(() => {});
                    rfqApi.getAll().then(setRfqs).catch(() => {});
                  }
                } catch (err) {
                  setRejectError(err instanceof Error ? err.message : "Erreur lors du rejet");
                } finally {
                  setIsRejecting(false);
                }
              }}
            >
              {isRejecting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <XCircle className="w-4 h-4 mr-1" />}
              Confirmer le rejet
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Voir offres */}
      <Dialog open={showOffersDialog} onOpenChange={setShowOffersDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Offres reçues</DialogTitle>
            <DialogDescription>
              {selectedRFQ?.productNeed} — {selectedRFQ ? parseFloat(selectedRFQ.quantity).toLocaleString() : ""} {selectedRFQ?.unit}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {isLoadingOffers ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Chargement des offres...
              </div>
            ) : offers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucune offre reçue pour le moment</p>
              </div>
            ) : (
              offers.map((offer) => (
                <Card key={offer.id} className="border-2 hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Badge variant="outline" className="mb-1 text-xs">{offer.status}</Badge>
                        <p className="text-sm text-muted-foreground">
                          Offre du {new Date(offer.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                        {offer.validityDate && (
                          <p className="text-xs text-muted-foreground">
                            Valide jusqu'au {new Date(offer.validityDate).toLocaleDateString("fr-FR")}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-2xl font-bold text-primary">
                          {offer.price.toLocaleString()} FCFA
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Délai : {offer.deliveryDays} jour{offer.deliveryDays > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    {offer.conditions && (
                      <div className="mt-3 p-3 rounded-lg bg-muted/50">
                        <p className="text-sm">{offer.conditions}</p>
                      </div>
                    )}
                    {offer.proformaNumber && (
                      <div className="mt-2 text-xs text-muted-foreground flex gap-4">
                        <span>Proforma : {offer.proformaNumber}</span>
                        <span>Total : {offer.proformaTotal.toLocaleString()} FCFA</span>
                        <span>Acompte : {offer.proformaDepositRate}%</span>
                      </div>
                    )}
                    {offer.proformaNumber && (
                      <div className="flex justify-end gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={proformaActionId === offer.id}
                          className="text-destructive border-destructive/50 hover:bg-destructive/10"
                          onClick={async () => {
                            setProformaActionId(offer.id);
                            try {
                              await rfqApi.rejectProforma(offer.id);
                              rfqApi.getOffers(selectedRFQ!.id).then(setOffers).catch(() => {});
                            } catch { /* silencieux */ }
                            finally { setProformaActionId(null); }
                          }}
                        >
                          {proformaActionId === offer.id ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <XCircle className="w-3 h-3 mr-1" />}
                          Refuser proforma
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          disabled={proformaActionId === offer.id}
                          onClick={async () => {
                            setProformaActionId(offer.id);
                            try {
                              await rfqApi.acceptProforma(offer.id);
                              rfqApi.getOffers(selectedRFQ!.id).then(setOffers).catch(() => {});
                            } catch { /* silencieux */ }
                            finally { setProformaActionId(null); }
                          }}
                        >
                          {proformaActionId === offer.id ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                          Accepter proforma
                        </Button>
                      </div>
                    )}
                    <div className="flex justify-end gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive/50 hover:bg-destructive/10"
                        onClick={() => {
                          setSelectedOffer(offer);
                          setRejectReason("");
                          setRejectError(null);
                          setShowRejectDialog(true);
                        }}
                      >
                        <ThumbsDown className="w-4 h-4 mr-1" />
                        Rejeter
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOffer(offer);
                          setNegotiateCounterPrice(String(offer.price));
                          setNegotiateMessage("");
                          setNegotiateError(null);
                          setShowNegotiateDialog(true);
                        }}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Négocier
                      </Button>
                      <Button
                        size="sm"
                        disabled={acceptingOfferId === offer.id}
                        onClick={async () => {
                          setAcceptingOfferId(offer.id);
                          try {
                            await rfqApi.acceptOffer(offer.id);
                            rfqApi.getOffers(selectedRFQ!.id).then(setOffers).catch(() => {});
                            rfqApi.getAll().then(setRfqs).catch(() => {});
                          } catch { /* silencieux */ }
                          finally { setAcceptingOfferId(null); }
                        }}
                      >
                        {acceptingOfferId === offer.id
                          ? <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          : <CheckCircle2 className="w-4 h-4 mr-1" />}
                        Accepter
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
