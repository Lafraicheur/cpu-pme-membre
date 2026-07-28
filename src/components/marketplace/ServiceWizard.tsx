import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Briefcase,
  ChevronRight,
  ChevronLeft,
  ChevronsUpDown,
  Check,
  MapPin,
  User,
  Wallet,
  CalendarClock,
  Plus,
  X,
  Upload,
  ShoppingCart,
  FileText,
  Info,
  CheckCircle2,
  Sparkles,
  Shield,
  Globe,
  Zap,
  Award,
  Clock,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  serviceFamillesApi,
  serviceCategoriesApi,
  serviceSousCategoriesApi,
  servicesReferentialsApi,
  serviceInterventionZonesApi,
  servicesApi,
  boutiquesApi,
  type ServiceFamille,
  type ServiceCategory,
  type ServiceSousCategorie,
  type ServiceReferentialOption,
  type ServiceVatRateOption,
  type ServiceInterventionRegion,
  type ServiceInterventionVille,
  type ServiceCreatePayload,
  type ServiceUpdatePayload,
  type ServiceDocumentFiles,
} from "@/lib/api";

interface ServiceWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: any) => void;
}

const STEPS = [
  { id: 1, label: "Informations", icon: Info },
  { id: 2, label: "Type de prestation", icon: Briefcase },
  { id: 3, label: "Zone & fuseau", icon: MapPin },
  { id: 4, label: "Prestataire & assurance", icon: User },
  { id: 5, label: "Tarification & Packages", icon: Wallet },
  { id: 6, label: "Disponibilité & SLA", icon: CalendarClock },
  { id: 7, label: "Documents & preuves", icon: Upload },
  { id: 8, label: "Mode de commande", icon: ShoppingCart },
  { id: 9, label: "Politiques & conformité", icon: Shield },
  { id: 10, label: "Validation", icon: CheckCircle2 },
];

const OPTIONS_LIST = [
  "Déplacement", "Installation", "Maintenance", "Formation",
  "Support", "Garantie", "Nettoyage", "Livraison", "Assistance",
];

const POLITIQUES_ANNULATION = [
  { id: "flexible", label: "Flexible", desc: "Remboursement 100% jusqu'à 24h avant, 50% après" },
  { id: "moderee", label: "Modérée", desc: "Remboursement 100% jusqu'à 5j avant, 50% jusqu'à 24h, 0% après" },
  { id: "stricte", label: "Stricte", desc: "Remboursement 50% jusqu'à 7j avant, non remboursable après" },
  { id: "personnalisee", label: "Personnalisée", desc: "Définir vos propres conditions" },
];

const FUSEAUX = [
  "GMT (Abidjan / Dakar)",
  "GMT+1 (Paris / Lagos)",
  "GMT+2 (Le Caire / Johannesburg)",
  "GMT-5 (New York)",
  "GMT+8 (Singapour)",
];

type DocKey =
  | "documentsImages"
  | "documentsVideos"
  | "documentsPdf"
  | "documentsBrochure"
  | "documentsCatalogue"
  | "documentsGrilleTarifaire"
  | "documentsCertificats"
  | "documentsAssuranceRc";

const DOC_KIND_TO_KEY: Record<string, DocKey> = {
  "Images": "documentsImages",
  "Vidéos": "documentsVideos",
  "Documents PDF": "documentsPdf",
  "Brochure": "documentsBrochure",
  "Catalogue": "documentsCatalogue",
  "Grille tarifaire": "documentsGrilleTarifaire",
  "Certificats": "documentsCertificats",
  "Assurance RC": "documentsAssuranceRc",
};

const DOC_KIND_ACCEPT: Record<DocKey, string> = {
  documentsImages: "image/*",
  documentsVideos: "video/*",
  documentsPdf: ".pdf",
  documentsBrochure: ".pdf,.jpg,.jpeg,.png",
  documentsCatalogue: ".pdf,.jpg,.jpeg,.png",
  documentsGrilleTarifaire: ".pdf,.jpg,.jpeg,.png,.xlsx,.xls",
  documentsCertificats: ".pdf,.jpg,.jpeg,.png",
  documentsAssuranceRc: ".pdf,.jpg,.jpeg,.png",
};

function SearchableMultiSelect({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  disabled,
}: {
  options: { id: string; label: string }[];
  value: string[];
  onChange: (ids: string[]) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyLabel: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className="truncate text-left">
            {value.length > 0 ? `${value.length} sélectionné(s)` : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyLabel}</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem
                  key={o.id}
                  value={o.label}
                  onMouseDown={(e) => e.preventDefault()}
                  onSelect={() => toggle(o.id)}
                >
                  <Check className={cn("mr-2 h-4 w-4", value.includes(o.id) ? "opacity-100" : "opacity-0")} />
                  {o.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function ServiceWizard({ open, onOpenChange, onSubmit }: ServiceWizardProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<any>({
    // Step 1 — Infos & SEO
    nom: "",
    famille: "",
    categorie: "",
    sousCategorie: "",
    codeUnspsc: "",
    slug: "",
    metaTitle: "",
    metaDesc: "",
    typeService: "",
    segment: "B2B",
    descCourte: "",
    descLongue: "",
    // Step 2
    typesPrestation: [] as string[],
    paysInternational: "",
    // Step 3
    zones: [] as string[],
    villes: [] as string[],
    rayonKm: "",
    fuseau: "GMT (Abidjan / Dakar)",
    // Step 4 — Prestataire
    presentation: "",
    experience: "",
    collaborateurs: "",
    certifications: "",
    agrements: "",
    langues: [] as string[],
    langueAutre: "",
    portfolioUrl: "",
    references: "",
    // Step 5 — Tarification
    usePackages: false,
    packages: {
      essentiel: { actif: true, prix: "", delai: "", revisions: "1", inclus: "" },
      standard: { actif: true, prix: "", delai: "", revisions: "3", inclus: "" },
      premium: { actif: false, prix: "", delai: "", revisions: "Illimitées", inclus: "" },
    },
    tarifMode: "Prix fixe",
    montant: "",
    devise: "XOF",
    tva: "18",
    promo: false,
    prixPromo: "",
    prixBarre: "",
    // Step 6 — Dispo & SLA
    dispoJours: [] as string[],
    heureDebut: "08:00",
    heureFin: "18:00",
    urgence24: false,
    weekend: false,
    joursFeries: false,
    delai: "Sur rendez-vous",
    slaReponse: "24h",
    slaResolution: "",
    leadTimeMin: "24h",
    capaciteJour: "",
    syncCalendrier: false,
    // Step 7
    options: [] as { groupe: string; label: string; exemple: string; prix: string }[],
    documents: [] as string[],
    // Step 9
    modesCommande: [] as string[],
    // Step 10 — Commercial & conformité
    delaiRealisation: "",
    conditions: "",
    politiqueAnnulation: "moderee",
    annulation: "",
    remboursement: "",
    garantie: "",
    dureeGarantie: "",
    paiement: "",
    facturation: "",
    conditionsSpeciales: "",
    rgpd: false,
    juridiction: "Côte d'Ivoire",
    mediation: false,
  });

  // Taxonomie services : familles → catégories → sous-catégories
  const [familles, setFamilles] = useState<ServiceFamille[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [sousCategories, setSousCategories] = useState<ServiceSousCategorie[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSousCategories, setLoadingSousCategories] = useState(false);
  const [prestationTypes, setPrestationTypes] = useState<ServiceReferentialOption[]>([]);
  const [spokenLanguageOptions, setSpokenLanguageOptions] = useState<ServiceReferentialOption[]>([]);
  const [pricingModels, setPricingModels] = useState<ServiceReferentialOption[]>([]);
  const [currencies, setCurrencies] = useState<ServiceReferentialOption[]>([]);
  const [vatRates, setVatRates] = useState<ServiceVatRateOption[]>([]);
  const [complementaryOptionTypes, setComplementaryOptionTypes] = useState<ServiceReferentialOption[]>([]);
  const [weekDays, setWeekDays] = useState<ServiceReferentialOption[]>([]);
  const [interventionDelays, setInterventionDelays] = useState<ServiceReferentialOption[]>([]);
  const [orderModes, setOrderModes] = useState<ServiceReferentialOption[]>([]);
  const [documentKinds, setDocumentKinds] = useState<ServiceReferentialOption[]>([]);
  const [optionTypeSelect, setOptionTypeSelect] = useState("");
  const [optionTypePrice, setOptionTypePrice] = useState("");

  // Zones d'intervention : régions → villes
  const [interventionRegions, setInterventionRegions] = useState<ServiceInterventionRegion[]>([]);
  const [interventionVilles, setInterventionVilles] = useState<ServiceInterventionVille[]>([]);
  const [loadingVilles, setLoadingVilles] = useState(false);

  const [boutiqueId, setBoutiqueId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [documents, setDocuments] = useState<Required<ServiceDocumentFiles>>({
    documentsImages: [],
    documentsVideos: [],
    documentsPdf: [],
    documentsBrochure: [],
    documentsCatalogue: [],
    documentsGrilleTarifaire: [],
    documentsCertificats: [],
    documentsAssuranceRc: [],
  });

  useEffect(() => {
    if (!open) return;
    serviceFamillesApi.getAll({ activeOnly: true }).then(setFamilles).catch(() => {});
    servicesReferentialsApi.getPrestationTypes().then(setPrestationTypes).catch(() => {});
    servicesReferentialsApi.getSpokenLanguages().then(setSpokenLanguageOptions).catch(() => {});
    servicesReferentialsApi.getPricingModels().then(setPricingModels).catch(() => {});
    servicesReferentialsApi.getCurrencies().then(setCurrencies).catch(() => {});
    servicesReferentialsApi.getVatRates().then(setVatRates).catch(() => {});
    servicesReferentialsApi.getComplementaryOptionTypes().then(setComplementaryOptionTypes).catch(() => {});
    servicesReferentialsApi.getWeekDays().then(setWeekDays).catch(() => {});
    servicesReferentialsApi.getInterventionDelays().then(setInterventionDelays).catch(() => {});
    servicesReferentialsApi.getOrderModes().then(setOrderModes).catch(() => {});
    servicesReferentialsApi.getDocumentKinds().then(setDocumentKinds).catch(() => {});
    serviceInterventionZonesApi.getRegions().then(setInterventionRegions).catch(() => {});
    boutiquesApi.getMyShop().then((b) => setBoutiqueId(b?.id ?? "")).catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!data.zones.length) { setInterventionVilles([]); return; }
    setLoadingVilles(true);
    serviceInterventionZonesApi.getVilles(data.zones)
      .then((villes) => {
        setInterventionVilles(villes);
        const validIds = new Set(villes.map((v) => v.id));
        setData((d: any) => ({ ...d, villes: d.villes.filter((id: string) => validIds.has(id)) }));
      })
      .catch(() => setInterventionVilles([]))
      .finally(() => setLoadingVilles(false));
  }, [data.zones]);

  useEffect(() => {
    if (!data.famille) { setCategories([]); return; }
    setLoadingCategories(true);
    serviceCategoriesApi.getAll({ familleId: data.famille, activeOnly: true })
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoadingCategories(false));
  }, [data.famille]);

  useEffect(() => {
    if (!data.categorie) { setSousCategories([]); return; }
    setLoadingSousCategories(true);
    serviceSousCategoriesApi.getAll({ categorieId: data.categorie, activeOnly: true })
      .then(setSousCategories)
      .catch(() => setSousCategories([]))
      .finally(() => setLoadingSousCategories(false));
  }, [data.categorie]);

  const update = (k: string, v: any) => setData((d: any) => ({ ...d, [k]: v }));
  const toggle = (k: string, v: string) => {
    setData((d: any) => ({
      ...d,
      [k]: d[k].includes(v) ? d[k].filter((x: string) => x !== v) : [...d[k], v],
    }));
  };

  const addDocumentFiles = (key: DocKey, files: FileList | null) => {
    if (!files || !files.length) return;
    setDocuments((d) => ({ ...d, [key]: [...d[key], ...Array.from(files)] }));
  };
  const removeDocumentFile = (key: DocKey, index: number) => {
    setDocuments((d) => ({ ...d, [key]: d[key].filter((_, i) => i !== index) }));
  };

  const canNext = () => {
    if (step === 1) return data.nom && data.famille && data.categorie && data.sousCategorie && data.descCourte && data.descLongue;
    if (step === 2) return data.typesPrestation.length > 0;
    if (step === 3) return data.zones.length > 0;
    if (step === 5) return data.tarifMode === "Prix sur devis" || data.montant;
    if (step === 6) return data.dispoJours.length > 0;
    if (step === 8) return data.modesCommande.length > 0;
    return true;
  };

  const next = () => step < 10 && setStep(step + 1);
  const prev = () => step > 1 && setStep(step - 1);

  const buildCommonFields = () => {
    const cancellationLabel = POLITIQUES_ANNULATION.find((p) => p.id === data.politiqueAnnulation)?.label ?? "";
    const cancellationPolicy = data.politiqueAnnulation === "personnalisee"
      ? (data.annulation || cancellationLabel)
      : [cancellationLabel, data.annulation].filter(Boolean).join(" — ");

    return {
      boutiqueId,
      name: data.nom,
      shortDescription: data.descCourte,
      description: data.descLongue,
      serviceSousCategorieId: data.sousCategorie,
      prestationType: data.typesPrestation.join(", "),
      interventionCountry: data.paysInternational || undefined,
      interventionRadiusKm: data.rayonKm ? parseFloat(data.rayonKm) : undefined,
      coveredRegionIds: data.zones,
      coveredVilleIds: data.villes,
      providerPresentation: data.presentation,
      yearsOfExperience: data.experience ? parseInt(data.experience, 10) : undefined,
      collaboratorsCount: data.collaborateurs ? parseInt(data.collaborateurs, 10) : undefined,
      certifications: data.certifications,
      agreements: data.agrements,
      spokenLanguages: data.langues,
      spokenLanguageOther: data.langueAutre,
      portfolioUrl: data.portfolioUrl,
      clientReferences: data.references,
      pricingModel: data.tarifMode,
      price: data.montant ? parseFloat(data.montant) : undefined,
      currency: data.devise,
      vatRate: data.tva && data.tva !== "autre" ? parseFloat(data.tva) : undefined,
      promoPrice: data.promo && data.prixPromo ? parseFloat(data.prixPromo) : undefined,
      strikethroughPrice: data.promo && data.prixBarre ? parseFloat(data.prixBarre) : undefined,
      availableDays: data.dispoJours,
      emergency24h: data.urgence24,
      weekendAvailable: data.weekend,
      holidaysAvailable: data.joursFeries,
      interventionDelay: data.delai,
      orderModes: data.modesCommande,
      completionDelay: data.delaiRealisation,
      generalConditions: data.conditions,
      cancellationPolicy,
      refundPolicy: data.remboursement,
      warranty: data.garantie,
      paymentTerms: data.paiement,
      invoicingTerms: data.facturation,
      specialConditions: data.conditionsSpeciales,
    };
  };

  const buildCreatePayload = (): ServiceCreatePayload => ({
    ...buildCommonFields(),
    complementaryOptions: JSON.stringify(data.options.map((o: any) => ({ type: o.label, additionalPrice: parseFloat(o.prix) || 0 }))),
    timeSlots: JSON.stringify(data.dispoJours.map((day: string) => ({ day, from: data.heureDebut, to: data.heureFin }))),
    selectedOptionTypes: data.options.map((o: any) => o.label),
  });

  const buildJsonPayload = (status: string): ServiceUpdatePayload => ({
    ...buildCommonFields(),
    status,
    complementaryOptions: data.options.map((o: any) => ({ type: o.label, additionalPrice: parseFloat(o.prix) || 0 })),
    timeSlots: data.dispoJours.map((day: string) => ({ day, from: data.heureDebut, to: data.heureFin })),
  });

  const handleSubmit = async (action: "draft" | "moderate") => {
    if (!boutiqueId) {
      toast.error("Boutique introuvable. Impossible de créer le service.");
      return;
    }
    setSubmitting(true);
    try {
      const created = await servicesApi.create(buildCreatePayload(), documents);
      if (action === "moderate") {
        await servicesApi.submit(created.id, buildJsonPayload("InModeration"));
        toast.success("Service soumis à validation CPU-PME");
      } else {
        await servicesApi.saveDraft(created.id, buildJsonPayload("Draft"));
        toast.success("Brouillon enregistré");
      }
      onSubmit?.({ ...data, action });
      onOpenChange(false);
      setStep(1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "La création du service a échoué.");
    } finally {
      setSubmitting(false);
    }
  };

  const progress = (step / 10) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Créer un service — Étape {step}/10
          </DialogTitle>
          <DialogDescription>{STEPS[step - 1].label}</DialogDescription>
          <Progress value={progress} className="h-2 mt-2" />
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 pr-2 space-y-4">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Taxonomie : Famille → Catégorie → Sous-catégorie */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>1. Famille *</Label>
                  <Select
                    value={data.famille}
                    onValueChange={(v) => {
                      update("famille", v);
                      update("categorie", "");
                      update("sousCategorie", "");
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Choisir une famille" /></SelectTrigger>
                    <SelectContent>
                      {familles.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>2. Catégorie *</Label>
                  <Select
                    value={data.categorie}
                    onValueChange={(v) => {
                      update("categorie", v);
                      update("sousCategorie", "");
                    }}
                    disabled={!data.famille || loadingCategories}
                  >
                    <SelectTrigger><SelectValue placeholder={!data.famille ? "Sélectionnez d'abord la famille" : loadingCategories ? "Chargement..." : "Choisir une catégorie"} /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>3. Sous-catégorie *</Label>
                  <Select
                    value={data.sousCategorie}
                    onValueChange={(v) => update("sousCategorie", v)}
                    disabled={!data.categorie || loadingSousCategories}
                  >
                    <SelectTrigger><SelectValue placeholder={!data.categorie ? "Sélectionnez d'abord la catégorie" : loadingSousCategories ? "Chargement..." : "Choisir une sous-catégorie"} /></SelectTrigger>
                    <SelectContent>
                      {sousCategories.map((sc) => <SelectItem key={sc.id} value={sc.id}>{sc.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Nom du service *</Label>
                <Input value={data.nom} onChange={(e) => update("nom", e.target.value)} placeholder="Ex : Installation électrique bâtiment" />
              </div>

              <div>
                <Label>Description courte * ({data.descCourte.length}/150)</Label>
                <Textarea
                  maxLength={150}
                  value={data.descCourte}
                  onChange={(e) => update("descCourte", e.target.value)}
                  rows={2}
                  placeholder="Résumez votre service en une phrase percutante"
                />
              </div>

              <div>
                <Label>Description complète *</Label>
                <Textarea
                  value={data.descLongue}
                  onChange={(e) => update("descLongue", e.target.value)}
                  rows={5}
                  placeholder="Décrivez en détail votre service : étapes, méthodologie, ce qui est inclus..."
                />
              </div>

            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Type(s) de prestation *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {prestationTypes.map((t) => (
                    <label key={t.value} className={cn("border rounded-lg p-3 cursor-pointer flex items-center gap-3", data.typesPrestation.includes(t.value) && "border-primary bg-primary/5")}>
                      <Checkbox checked={data.typesPrestation.includes(t.value)} onCheckedChange={() => toggle("typesPrestation", t.value)} />
                      <span className="text-sm font-medium">{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-muted/50 border rounded-lg p-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 inline mr-1" />
                Un service n'a pas de stock. Définissez plutôt vos zones d'intervention.
              </div>
              <div>
                <Label>Pays</Label>
                <Input value={data.paysInternational} onChange={(e) => update("paysInternational", e.target.value)} placeholder="Ex : Côte d'Ivoire, Sénégal..." />
              </div>
              <div>
                <Label>Régions couvertes</Label>
                <SearchableMultiSelect
                  options={interventionRegions.map((r) => ({ id: r.id, label: r.name }))}
                  value={data.zones}
                  onChange={(ids) => update("zones", ids)}
                  placeholder="Sélectionner des régions"
                  searchPlaceholder="Rechercher une région…"
                  emptyLabel="Aucune région trouvée."
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {data.zones.map((id: string) => {
                  const r = interventionRegions.find((x) => x.id === id);
                  return (
                    <Badge key={id} variant="secondary" className="gap-1 text-sm py-1.5">
                      <MapPin className="w-3 h-3" /> {r?.name ?? id}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => update("zones", data.zones.filter((z: string) => z !== id))} />
                    </Badge>
                  );
                })}
              </div>
              <div>
                <Label>Villes / communes couvertes {loadingVilles && "(chargement...)"}</Label>
                <SearchableMultiSelect
                  options={interventionVilles.map((v) => ({ id: v.id, label: `${v.name} (${v.regionName})` }))}
                  value={data.villes}
                  onChange={(ids) => update("villes", ids)}
                  placeholder={!data.zones.length ? "Sélectionnez d'abord une région" : "Sélectionner des villes"}
                  searchPlaceholder="Rechercher une ville…"
                  emptyLabel="Aucune ville trouvée."
                  disabled={!data.zones.length || loadingVilles}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {data.villes.map((id: string) => {
                    const v = interventionVilles.find((x) => x.id === id);
                    return (
                      <Badge key={id} variant="secondary" className="gap-1 text-sm py-1.5">
                        {v?.name ?? id}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => update("villes", data.villes.filter((z: string) => z !== id))} />
                      </Badge>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label>Rayon d'intervention (km) — optionnel</Label>
                <Input type="number" value={data.rayonKm} onChange={(e) => update("rayonKm", e.target.value)} placeholder="Ex : 50" />
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Années d'expérience</Label>
                  <Input type="number" value={data.experience} onChange={(e) => update("experience", e.target.value)} />
                </div>
                <div>
                  <Label>Nombre de collaborateurs</Label>
                  <Input type="number" value={data.collaborateurs} onChange={(e) => update("collaborateurs", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Présentation du prestataire</Label>
                <Textarea value={data.presentation} onChange={(e) => update("presentation", e.target.value)} rows={4} placeholder="Votre expertise, savoir-faire, différenciation..." />
              </div>
              <div>
                <Label className="flex items-center gap-1"><Award className="w-3 h-3" /> Certifications standards internationales</Label>
                <Textarea
                  value={data.certifications}
                  onChange={(e) => update("certifications", e.target.value)}
                  rows={2}
                  placeholder="Ex : ISO 9001, HACCP, Qualiopi..."
                />
              </div>
              <div>
                <Label>Agréments</Label>
                <Input value={data.agrements} onChange={(e) => update("agrements", e.target.value)} placeholder="Agrément ministère..." />
              </div>
              <div>
                <Label>Langues parlées</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {spokenLanguageOptions.map((l) => (
                    <label key={l.value} className="flex items-center gap-1.5 text-sm border rounded px-2 py-1 cursor-pointer">
                      <Checkbox checked={data.langues.includes(l.value)} onCheckedChange={() => toggle("langues", l.value)} /> {l.label}
                    </label>
                  ))}
                </div>
                {data.langues.includes("Autre") && (
                  <Input
                    className="mt-2"
                    value={data.langueAutre}
                    onChange={(e) => update("langueAutre", e.target.value)}
                    placeholder="Précisez la ou les autre(s) langue(s) (Mandarin, Allemand...)"
                  />
                )}
              </div>
              <div>
                <Label>Lien portfolio (URL)</Label>
                <Input value={data.portfolioUrl} onChange={(e) => update("portfolioUrl", e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <Label>Références clients</Label>
                <Textarea value={data.references} onChange={(e) => update("references", e.target.value)} rows={2} placeholder="Principaux clients / projets réalisés" />
              </div>
              <Card className="bg-muted/40">
                <CardContent className="p-3 text-xs text-muted-foreground flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Photo, logo, portfolio & attestation RC Pro à ajouter à l'étape 7
                </CardContent>
              </Card>
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <Label>Mode de tarification *</Label>
                <RadioGroup value={data.tarifMode} onValueChange={(v) => update("tarifMode", v)} className="grid grid-cols-2 gap-2 mt-2">
                  {pricingModels.map((t) => (
                    <label key={t.value} className={cn("border rounded p-2 flex items-center gap-2 cursor-pointer text-sm", data.tarifMode === t.value && "border-primary bg-primary/5")}>
                      <RadioGroupItem value={t.value} /> {t.label}
                    </label>
                  ))}
                </RadioGroup>
              </div>
              {data.tarifMode !== "Prix sur devis" && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label>Montant (HT) *</Label>
                      <Input type="number" value={data.montant} onChange={(e) => update("montant", e.target.value)} />
                    </div>
                    <div>
                      <Label>Devise</Label>
                      <Select value={data.devise} onValueChange={(v) => update("devise", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {currencies.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>TVA (%)</Label>
                      <Select value={data.tva} onValueChange={(v) => update("tva", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {vatRates.map((r) => <SelectItem key={String(r.value)} value={String(r.value)}>{r.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="border-t pt-3 space-y-2">
                    <label className="flex items-center gap-2">
                      <Checkbox checked={data.promo} onCheckedChange={(c) => update("promo", c)} /> Activer une promotion
                    </label>
                    {data.promo && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Prix promotionnel</Label>
                          <Input type="number" value={data.prixPromo} onChange={(e) => update("prixPromo", e.target.value)} placeholder="Prix affiché pendant la promo" />
                        </div>
                        <div>
                          <Label>Prix barré (avant remise)</Label>
                          <Input type="number" value={data.prixBarre} onChange={(e) => update("prixBarre", e.target.value)} />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
              {data.tarifMode === "Prix sur devis" && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm">
                  Le client devra passer par le mode "Demander un devis" (voir étape 9).
                </div>
              )}

              <div className="border-t pt-4 space-y-3">
                <Label>Options complémentaires</Label>
                <div className="flex gap-2">
                  <Select value={optionTypeSelect} onValueChange={setOptionTypeSelect}>
                    <SelectTrigger><SelectValue placeholder="Type d'option" /></SelectTrigger>
                    <SelectContent>
                      {complementaryOptionTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Prix additionnel"
                    className="w-40"
                    value={optionTypePrice}
                    onChange={(e) => setOptionTypePrice(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!optionTypeSelect}
                    onClick={() => {
                      if (optionTypeSelect) {
                        update("options", [...data.options, { groupe: "Complémentaire", label: optionTypeSelect, exemple: "", prix: optionTypePrice }]);
                        setOptionTypeSelect("");
                        setOptionTypePrice("");
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {data.options.length > 0 && (
                  <div className="border rounded-lg divide-y">
                    {data.options.map((o: any, i: number) => (
                      <div key={i} className="p-2.5 flex items-center gap-3 text-sm">
                        <div className="flex-1">{o.label}</div>
                        <div className="text-muted-foreground">{o.prix ? `${o.prix} ${data.devise}` : "—"}</div>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => update("options", data.options.filter((_: any, x: number) => x !== i))}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 6 */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Jours disponibles *</Label>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map((j) => (
                    <label key={j.value} className={cn("border rounded px-3 py-1.5 text-sm cursor-pointer", data.dispoJours.includes(j.value) && "border-primary bg-primary/5")}>
                      <Checkbox className="mr-2" checked={data.dispoJours.includes(j.value)} onCheckedChange={() => toggle("dispoJours", j.value)} /> {j.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Heure début</Label>
                  <Input type="time" value={data.heureDebut} onChange={(e) => update("heureDebut", e.target.value)} />
                </div>
                <div>
                  <Label>Heure fin</Label>
                  <Input type="time" value={data.heureFin} onChange={(e) => update("heureFin", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2 border-t pt-3">
                <label className="flex items-center gap-2"><Checkbox checked={data.urgence24} onCheckedChange={(c) => update("urgence24", c)} /> Urgence 24h/24</label>
                <label className="flex items-center gap-2"><Checkbox checked={data.weekend} onCheckedChange={(c) => update("weekend", c)} /> Week-end</label>
                <label className="flex items-center gap-2"><Checkbox checked={data.joursFeries} onCheckedChange={(c) => update("joursFeries", c)} /> Jours fériés</label>
              </div>
              <div>
                <Label>Délai d'intervention</Label>
                <Select value={data.delai} onValueChange={(v) => update("delai", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {interventionDelays.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* STEP 7 */}
          {step === 7 && (
            <div className="space-y-3">
              {documentKinds.map((kind) => {
                const key = DOC_KIND_TO_KEY[kind.value];
                if (!key) return null;
                const files = documents[key];
                const inputId = `doc-input-${key}`;
                return (
                  <div key={key} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm"><Upload className="w-4 h-4 text-muted-foreground" /> {kind.label}</div>
                      <Button variant="outline" size="sm" type="button" onClick={() => document.getElementById(inputId)?.click()}>
                        Téléverser
                      </Button>
                      <input
                        id={inputId}
                        type="file"
                        accept={DOC_KIND_ACCEPT[key]}
                        multiple
                        className="hidden"
                        onChange={(e) => { addDocumentFiles(key, e.target.files); e.target.value = ""; }}
                      />
                    </div>
                    {files.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {files.map((f, i) => (
                          <Badge key={i} variant="secondary" className="gap-1 text-xs">
                            <FileText className="w-3 h-3" /> {f.name}
                            <X className="w-3 h-3 cursor-pointer" onClick={() => removeDocumentFile(key, i)} />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP 8 */}
          {step === 8 && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">Sélectionnez les modes de commande activés — le parcours acheteur s'adaptera automatiquement.</div>
              {orderModes.map((m) => (
                <label key={m.value} className={cn("border rounded-lg p-3 flex items-start gap-3 cursor-pointer", data.modesCommande.includes(m.value) && "border-primary bg-primary/5")}>
                  <Checkbox checked={data.modesCommande.includes(m.value)} onCheckedChange={() => toggle("modesCommande", m.value)} />
                  <div className="font-medium text-sm">{m.label}</div>
                </label>
              ))}
            </div>
          )}

          {/* STEP 9 */}
          {step === 9 && (
            <div className="space-y-3">
              <div><Label>Délai de réalisation</Label><Input value={data.delaiRealisation} onChange={(e) => update("delaiRealisation", e.target.value)} placeholder="Ex : 5 jours ouvrés" /></div>
              <div><Label>Conditions générales</Label><Textarea value={data.conditions} onChange={(e) => update("conditions", e.target.value)} rows={2} /></div>
              <div>
                <Label>Politique d'annulation</Label>
                <RadioGroup value={data.politiqueAnnulation} onValueChange={(v) => update("politiqueAnnulation", v)} className="grid grid-cols-2 gap-2 mt-1">
                  {POLITIQUES_ANNULATION.map((p) => (
                    <label key={p.id} className={cn("border rounded p-2 text-xs cursor-pointer flex flex-col gap-1", data.politiqueAnnulation === p.id && "border-primary bg-primary/5")}>
                      <span className="flex items-center gap-2 font-medium"><RadioGroupItem value={p.id} /> {p.label}</span>
                      <span className="text-muted-foreground">{p.desc}</span>
                    </label>
                  ))}
                </RadioGroup>
                {data.politiqueAnnulation === "personnalisee" && (
                  <Textarea className="mt-2" value={data.annulation} onChange={(e) => update("annulation", e.target.value)} rows={2} placeholder="Détaillez vos conditions d'annulation personnalisées" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Remboursement</Label><Textarea value={data.remboursement} onChange={(e) => update("remboursement", e.target.value)} rows={2} /></div>
                <div><Label>Garantie</Label><Textarea value={data.garantie} onChange={(e) => update("garantie", e.target.value)} rows={2} /></div>
                <div><Label>Modes de paiement</Label><Textarea value={data.paiement} onChange={(e) => update("paiement", e.target.value)} rows={2} placeholder="Mobile Money, virement, espèces..." /></div>
                <div><Label>Facturation</Label><Textarea value={data.facturation} onChange={(e) => update("facturation", e.target.value)} rows={2} placeholder="Facture sur simple demande, mensuelle..." /></div>
              </div>
              <div><Label>Conditions particulières</Label><Textarea value={data.conditionsSpeciales} onChange={(e) => update("conditionsSpeciales", e.target.value)} rows={2} placeholder="Clauses ou conditions spécifiques à ce service" /></div>
            </div>
          )}

          {/* STEP 10 */}
          {step === 10 && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-primary">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-semibold">Aperçu du service</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Nom :</span> {data.nom || "—"}</div>
                  <div><span className="text-muted-foreground">Famille :</span> {familles.find((f) => f.id === data.famille)?.name || "—"}</div>
                  <div><span className="text-muted-foreground">Catégorie :</span> {categories.find((c) => c.id === data.categorie)?.name || "—"}</div>
                  <div><span className="text-muted-foreground">Prestation :</span> {data.typesPrestation.join(", ") || "—"}</div>
                    <div><span className="text-muted-foreground">Zone :</span> {data.zones.map((id: string) => interventionRegions.find((r) => r.id === id)?.name).filter(Boolean).join(", ") || "—"}</div>
                    <div><span className="text-muted-foreground">Tarif :</span> {data.tarifMode}{data.montant ? ` — ${data.montant} ${data.devise}` : ""}</div>
                    <div><span className="text-muted-foreground">Disponibilité :</span> {data.dispoJours.length} jour(s)</div>
                    <div><span className="text-muted-foreground">Options :</span> {data.options.length}</div>
                    <div className="col-span-2"><span className="text-muted-foreground">Modes de commande :</span> {data.modesCommande.join(", ") || "—"}</div>
                  </div>
                </CardContent>
              </Card>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" disabled={submitting} onClick={() => handleSubmit("draft")}>
                  {submitting && <RefreshCw className="w-4 h-4 mr-1 animate-spin" />}
                  Enregistrer brouillon
                </Button>
                <Button disabled={submitting} onClick={() => handleSubmit("moderate")}>
                  {submitting && <RefreshCw className="w-4 h-4 mr-1 animate-spin" />}
                  Soumettre
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between border-t pt-3">
          <Button variant="outline" onClick={prev} disabled={step === 1}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Précédent
          </Button>
          {step < 10 && (
            <Button onClick={next} disabled={!canNext()}>
              Suivant <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
