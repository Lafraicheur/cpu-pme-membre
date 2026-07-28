import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Package,
  Image as ImageIcon,
  MapPin,
  DollarSign,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Save,
  Plus,
  Trash2,
  Upload,
  ShieldCheck,
  Layers,
  Award,
  Warehouse,
  AlertTriangle,
  ChevronsUpDown,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  marketplaceFamillesApi,
  marketplaceCategoriesApi,
  productUnitsApi,
  boutiquesApi,
  productsApi,
  regionsApi,
  villesApi,
  type MarketplaceFamille,
  type MarketplaceCategory,
  type MarketplaceSousCategorie,
  type MarketplaceProductUnit,
  type Region as ApiRegion,
  type Ville as ApiVille,
  type CreateProductListingPayload,
  type UpdateProductPayload,
  type Product as ApiProduct,
} from "@/lib/api";

interface ProductVariant {
  sku: string;
  name: string;
  price: string;
  stock: string;
  images: string[];
}

interface CertificationEntry {
  type: string;
  reference?: string;
  fileName?: string;
}

interface PricingTier {
  qtyMin: string;
  qtyMax: string;
  price: string;
}

interface ListingFormData {
  listingType: "product" | "service";

  // Étape 1 — Identification
  title: string;
  shortDescription: string;
  description: string;
  designation: string;
  designationCode: string;
  characteristics: string;
  familyId: string;
  categoryId: string;
  subCategoryId: string;
  brand: string;
  model: string;
  skuMerchant: string;
  origin: string;
  countryOfManufacture: string;
  condition: "new" | "used" | "refurbished" | "not_applicable" | "";
  attributes: string[];

  // Étape 2 — Prix
  priceTTC: string;
  currency: string;
  vatRate: string;
  vatCustom: string;
  priceHT: string;
  promoPrice: string;
  promoStart: string;
  promoEnd: string;
  promoLabel: string;
  minOrder: string;
  maxOrderQuantity: string;
  sellPerUnit: boolean;
  sellWholesale: boolean;
  acceptsQuoteRequest: boolean;
  hasTieredPricing: boolean;
  pricingTiers: PricingTier[];
  isNegotiable: boolean;
  unit: string;

  // Étape 3 — Stock
  stock: string;
  stockAlertThreshold: string;
  availability: "in_stock" | "out_of_stock" | "preorder" | "";
  isOnDemand: boolean;
  isMadeToOrder: boolean;
  preparationDelay: string;

  // Étape 4 — Livraison
  deliveryZones: string[];
  deliveryTime: string;
  deliveryMode: "pickup" | "merchant" | "marketplace_api";
  pickupAddress: string;
  netWeight: string;
  netWeightUnitId: string;
  grossWeight: string;
  grossWeightUnitId: string;
  dimensionLength: string;
  dimensionWidth: string;
  dimensionHeight: string;
  dimensionUnitId: string;
  volume: string;
  volumeUnitId: string;
  packageCount: string;
  quantityPerCarton: string;
  quantityPerPallet: string;

  // Étape 5 — Variantes
  hasVariants: boolean;
  variants: ProductVariant[];

  // Étape 6 — Médias
  medias: File[];

  // Étape 7 — Certifications
  certifications: CertificationEntry[];
  // Réglementation
  isRegulated: boolean;
  regFamilyCode: string;
  regType: string;
  regAuthority: string;
  regAuthorizationNumber: string;
  regIssueDate: string;
  regExpiryDate: string;
  regDocumentFileName: string;
  // Made in Côte d'Ivoire
  requestMadeInCI: boolean;
  miciLabelCode: string;
  miciLocalPercentage: string;
  miciManufacturingPlace: string;
  miciRegionId: string;
  miciCityId: string;
  miciOriginCertificateFileName: string;
  miciRequestCpuValidation: boolean;

  // Étape 8 — Garantie & SAV
  acceptsEscrow: boolean;
  warranty: string;
  warrantyDuration: string;
  hasAfterSalesService: boolean;
  acceptsReturn: boolean;
  returnDelay: string;
  specialConditions: string;
}

const currencies = [
  { value: "XOF", label: "FCFA (XOF)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "USD", label: "Dollar (USD)" },
];

const vatRates = [
  { value: "0", label: "0%" },
  { value: "5", label: "5%" },
  { value: "18", label: "18%" },
  { value: "custom", label: "Autre (référentiel CPU-PME)" },
];

// Libellés attendus par l'API (valeurs enum en français, distinctes des codes internes du formulaire).
const CONDITION_LABELS: Record<ListingFormData["condition"], string> = {
  new: "Neuf",
  used: "Occasion",
  refurbished: "Reconditionné",
  not_applicable: "Non applicable",
  "": "",
};

const AVAILABILITY_LABELS: Record<ListingFormData["availability"], string> = {
  in_stock: "En stock",
  out_of_stock: "Rupture",
  preorder: "Précommande",
  "": "",
};

const DELIVERY_MODE_LABELS: Record<ListingFormData["deliveryMode"], string> = {
  pickup: "Retrait par le client",
  merchant: "Livraison par le Marchand",
  marketplace_api: "Livraison Marketplace API",
};

function reverseLookup<T extends string>(map: Record<T, string>, value: string | undefined | null, fallback: T): T {
  if (!value) return fallback;
  const entry = (Object.entries(map) as [T, string][]).find(([, v]) => v === value);
  return entry ? entry[0] : fallback;
}

function parseDimensions(dimensions?: string | null): { length: string; width: string; height: string } {
  if (!dimensions) return { length: "", width: "", height: "" };
  const parts = dimensions.split(/x/i).map((p) => p.trim());
  return { length: parts[0] || "", width: parts[1] || "", height: parts[2] || "" };
}

const productAttributes = [
  "Fragile",
  "Périssable",
  "Dangereux",
  "Non applicable",
  "Réfrigéré",
];

// Nomenclature Made in Côte d'Ivoire (référentiel CPU-PME)
const madeInCILabels = [
  { code: "MICI-001", label: "Produit fabriqué en Côte d'Ivoire", conditions: "100 % fabrication locale", percentages: ["80", "85", "90", "95", "100"], minPct: 80 },
  { code: "MICI-002", label: "Assemblé en Côte d'Ivoire", conditions: "Assemblage local", percentages: ["49", "55", "60", "65", "70", "75"], minPct: 49 },
  { code: "MICI-003", label: "Transformé en Côte d'Ivoire", conditions: "Matière première importée", percentages: ["79", "80", "85", "90", "95"], minPct: 79 },
  { code: "MICI-004", label: "Produit agricole ivoirien", conditions: "Origine locale certifiée", percentages: ["90", "95", "100"], minPct: 90 },
  { code: "MICI-005", label: "Artisanat ivoirien", conditions: "Production artisanale", percentages: ["100"], minPct: 100 },
  { code: "MICI-006", label: "Innovation Ivoire", conditions: "Innovation technologie Locale", percentages: ["100"], minPct: 100 },
];

// Nomenclature des produits réglementés (référentiel CPU-PME)
const regulatedFamilies = [
  { code: "REG-001", family: "Produits alimentaires", document: "Certificat sanitaire" },
  { code: "REG-002", family: "Compléments alimentaires", document: "Autorisation Ministère Santé" },
  { code: "REG-003", family: "Médicaments", document: "Autorisation de mise sur le marché" },
  { code: "REG-004", family: "Cosmétiques", document: "Déclaration sanitaire" },
  { code: "REG-005", family: "Produits chimiques", document: "Autorisation environnement" },
  { code: "REG-006", family: "Produits phytosanitaires", document: "Homologation" },
  { code: "REG-007", family: "Engrais", document: "Homologation" },
  { code: "REG-008", family: "Semences", document: "Certification semencière" },
  { code: "REG-009", family: "Équipements médicaux", document: "Homologation" },
  { code: "REG-010", family: "Gaz et carburants", document: "Autorisation" },
  { code: "REG-011", family: "Explosifs", document: "Licence spéciale" },
  { code: "REG-012", family: "Matériel électrique", document: "Certificat de conformité" },
  { code: "REG-013", family: "Télécommunications", document: "Homologation" },
  { code: "REG-014", family: "Produits vétérinaires", document: "Agrément" },
  { code: "REG-015", family: "Alcool", document: "Licence de commercialisation" },
  { code: "REG-016", family: "Tabac", document: "Licence" },
  { code: "REG-017", family: "Déchets dangereux", document: "Autorisation environnement" },
  { code: "REG-018", family: "Bijoux précieux", document: "Certificat d'origine" },
  { code: "REG-019", family: "Armes et sécurité", document: "Licence selon réglementation" },
  { code: "REG-020", family: "Import/Export spécifique", document: "Autorisation douanière" },
];

const certificationTypes = [
  "Produit certifié",
  "Certificat d'origine",
  "Certificat phytosanitaire",
  "Certificat sanitaire",
  "ISO 9001",
  "ISO 14001",
  "ISO 22000",
  "HACCP",
  "CE",
  "FDA",
  "BIO",
  "Halal",
  "Agrément ministériel",
  "Autre certificat",
];

const steps = [
  { id: 1, title: "Identification", icon: Package },
  { id: 2, title: "Prix", icon: DollarSign },
  { id: 3, title: "Stock", icon: Warehouse },
  { id: 4, title: "Livraison", icon: MapPin },
  { id: 5, title: "Variantes", icon: Layers },
  { id: 6, title: "Médias", icon: ImageIcon },
  { id: 7, title: "Certifications", icon: Award },
  { id: 8, title: "Garantie & SAV", icon: ShieldCheck },
];

function initialFormData(): ListingFormData {
  return {
    listingType: "product",
    title: "",
    shortDescription: "",
    description: "",
    designation: "",
    designationCode: "",
    characteristics: "",
    familyId: "",
    categoryId: "",
    subCategoryId: "",
    brand: "",
    model: "",
    skuMerchant: "",
    origin: "",
    countryOfManufacture: "",
    condition: "new",
    attributes: [],
    priceTTC: "",
    currency: "XOF",
    vatRate: "18",
    vatCustom: "",
    priceHT: "",
    promoPrice: "",
    promoStart: "",
    promoEnd: "",
    promoLabel: "",
    minOrder: "1",
    maxOrderQuantity: "",
    sellPerUnit: true,
    sellWholesale: false,
    acceptsQuoteRequest: false,
    hasTieredPricing: false,
    pricingTiers: [{ qtyMin: "0", qtyMax: "10", price: "" }],
    isNegotiable: false,
    unit: "",
    stock: "",
    stockAlertThreshold: "",
    availability: "in_stock",
    isOnDemand: false,
    isMadeToOrder: false,
    preparationDelay: "",
    deliveryZones: [],
    deliveryTime: "",
    deliveryMode: "pickup",
    pickupAddress: "",
    netWeight: "",
    netWeightUnitId: "",
    grossWeight: "",
    grossWeightUnitId: "",
    dimensionLength: "",
    dimensionWidth: "",
    dimensionHeight: "",
    dimensionUnitId: "",
    volume: "",
    volumeUnitId: "",
    packageCount: "",
    quantityPerCarton: "",
    quantityPerPallet: "",
    hasVariants: false,
    variants: [{ sku: "", name: "", price: "", stock: "", images: [] }],
    medias: [],
    certifications: [],
    isRegulated: false,
    regFamilyCode: "",
    regType: "",
    regAuthority: "",
    regAuthorizationNumber: "",
    regIssueDate: "",
    regExpiryDate: "",
    regDocumentFileName: "",
    requestMadeInCI: false,
    miciLabelCode: "",
    miciLocalPercentage: "",
    miciManufacturingPlace: "",
    miciRegionId: "",
    miciCityId: "",
    miciOriginCertificateFileName: "",
    miciRequestCpuValidation: false,

    acceptsEscrow: true,
    warranty: "",
    warrantyDuration: "",
    hasAfterSalesService: false,
    acceptsReturn: true,
    returnDelay: "7",
    specialConditions: "",
  };
}

function RegionsMultiSelect({
  regions: options,
  value,
  onChange,
  placeholder = "Sélectionner des régions",
}: {
  regions: ApiRegion[];
  value: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter(v => v !== id) : [...value, id]);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            <span className="truncate text-left">
              {value.length > 0 ? `${value.length} région(s) sélectionnée(s)` : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Rechercher une région…" />
            <CommandList>
              <CommandEmpty>Aucune région trouvée.</CommandEmpty>
              <CommandGroup>
                {options.map(r => (
                  <CommandItem key={r.id} value={r.name} onSelect={() => toggle(r.id)}>
                    <Check className={cn("mr-2 h-4 w-4", value.includes(r.id) ? "opacity-100" : "opacity-0")} />
                    {r.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map(id => {
            const r = options.find(x => x.id === id);
            return (
              <Badge key={id} variant="secondary" className="gap-1 pr-1">
                {r?.name ?? id}
                <button type="button" onClick={() => toggle(id)} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface ProductWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductCreated?: () => void;
  editProductId?: string;
  editInitialData?: ApiProduct;
}

export function ProductWizard({ open, onOpenChange, onProductCreated, editProductId, editInitialData }: ProductWizardProps) {
  const isEditMode = !!editProductId;
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ListingFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Réinitialise le formulaire à chaque ouverture du wizard.
  useEffect(() => {
    if (open) {
      setCurrentStep(1);
      setFormData(initialFormData());
    }
  }, [open]);

  // Pré-remplissage à partir du produit existant (mode édition).
  useEffect(() => {
    if (!open || !editInitialData) return;
    const p = editInitialData;
    const dims = parseDimensions(p.dimensions);
    setFormData(prev => ({
      ...prev,
      listingType: p.type === "Service" ? "service" : "product",
      title: p.name || "",
      shortDescription: p.shortDescription || "",
      description: p.description || "",
      designation: p.designation || "",
      characteristics: p.characteristics || "",
      familyId: p.familleId || "",
      categoryId: p.categorieId || "",
      subCategoryId: p.sousCategorieId || "",
      brand: p.brand || "",
      model: p.model || "",
      skuMerchant: p.sellerReference || "",
      origin: p.origin || "",
      countryOfManufacture: p.manufacturingCountry || "",
      condition: reverseLookup(CONDITION_LABELS, p.condition, "new"),
      attributes: p.attributes || [],
      priceTTC: p.price != null ? String(parseFloat(String(p.price))) : "",
      currency: p.currency || "XOF",
      vatRate: p.vatRate != null ? String(parseFloat(String(p.vatRate))) : "18",
      priceHT: p.priceHt != null ? String(parseFloat(String(p.priceHt))) : "",
      promoPrice: p.promoPrice != null ? String(parseFloat(String(p.promoPrice))) : "",
      promoStart: p.promoStartsAt ? p.promoStartsAt.split("T")[0] : "",
      promoEnd: p.promoEndsAt ? p.promoEndsAt.split("T")[0] : "",
      promoLabel: p.promoLabel || "",
      minOrder: p.moq != null ? String(p.moq) : "1",
      maxOrderQuantity: p.maxOrderQuantity != null ? String(p.maxOrderQuantity) : "",
      sellPerUnit: p.retailEnabled ?? true,
      sellWholesale: p.wholesaleEnabled ?? false,
      acceptsQuoteRequest: p.quoteRequestEnabled ?? false,
      hasTieredPricing: !!p.quantityPricingEnabled,
      pricingTiers: p.quantityPricingTiers?.length
        ? p.quantityPricingTiers.map(t => ({
            qtyMin: String(t.minQuantity),
            qtyMax: t.maxQuantity != null ? String(t.maxQuantity) : "",
            price: String(t.unitPrice),
          }))
        : prev.pricingTiers,
      unit: p.salesUnitId || "",
      stock: p.stock != null ? String(p.stock) : "",
      stockAlertThreshold: p.stockAlertThreshold != null ? String(p.stockAlertThreshold) : "",
      availability: reverseLookup(AVAILABILITY_LABELS, p.availabilityStatus, "in_stock"),
      isOnDemand: !!p.madeToOrder,
      isMadeToOrder: !!p.onDemandManufacturing,
      preparationDelay: p.availabilityDelay || "",
      deliveryZones: (p.deliveryZones || []).map(z => z.id),
      deliveryTime: p.deliveryEstimatedDelay || "",
      deliveryMode: reverseLookup(DELIVERY_MODE_LABELS, p.deliveryMode, "pickup"),
      netWeight: p.netWeight != null ? String(parseFloat(String(p.netWeight))) : "",
      netWeightUnitId: p.netWeightUnitId || "",
      grossWeight: p.grossWeight != null ? String(parseFloat(String(p.grossWeight))) : "",
      grossWeightUnitId: p.grossWeightUnitId || "",
      dimensionLength: dims.length,
      dimensionWidth: dims.width,
      dimensionHeight: dims.height,
      dimensionUnitId: p.dimensionUnitId || "",
      volume: p.volume != null ? String(parseFloat(String(p.volume))) : "",
      volumeUnitId: p.volumeUnitId || "",
      packageCount: p.packageCount != null ? String(p.packageCount) : "",
      quantityPerCarton: p.quantityPerCarton != null ? String(p.quantityPerCarton) : "",
      quantityPerPallet: p.quantityPerPallet != null ? String(p.quantityPerPallet) : "",
      hasVariants: !!p.variantsEnabled,
      medias: [],
      certifications: p.certificationEntries?.length
        ? p.certificationEntries.map(c => ({ type: c.type, reference: c.reference, fileName: c.documentUrl }))
        : [],
      isRegulated: !!p.isRegulated,
      requestMadeInCI: !!p.madeInCiRequested,
      acceptsEscrow: p.escrowEnabled ?? true,
      warranty: p.warrantyLabel || "",
      warrantyDuration: p.warrantyDuration || "",
      hasAfterSalesService: !!p.savAvailable,
      acceptsReturn: !!p.returnAccepted,
      returnDelay: p.returnDelayDays != null ? String(p.returnDelayDays) : "7",
      specialConditions: p.specialConditions || "",
    }));
  }, [open, editInitialData]);

  // Nomenclature marketplace (Famille → Catégorie → Sous-catégorie)
  const [familles, setFamilles] = useState<MarketplaceFamille[]>([]);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [sousCategories, setSousCategories] = useState<MarketplaceSousCategorie[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingSousCategories, setIsLoadingSousCategories] = useState(false);

  // Charge la cascade catégorie / sous-catégorie du produit édité une fois les familles disponibles.
  useEffect(() => {
    if (!open || !editInitialData?.familleId || familles.length === 0) return;
    setIsLoadingCategories(true);
    marketplaceCategoriesApi.getAll({ familleId: editInitialData.familleId, activeOnly: true })
      .then((list) => {
        setCategories(list);
        if (editInitialData.categorieId) {
          setIsLoadingSousCategories(true);
          marketplaceCategoriesApi.getSousCategories({ categorieId: editInitialData.categorieId, activeOnly: true })
            .then(setSousCategories)
            .catch(() => setSousCategories([]))
            .finally(() => setIsLoadingSousCategories(false));
        }
      })
      .catch(() => setCategories([]))
      .finally(() => setIsLoadingCategories(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editInitialData, familles]);

  useEffect(() => {
    if (!open) return;
    marketplaceFamillesApi.getAll({ activeOnly: true }).then(setFamilles).catch(() => setFamilles([]));
  }, [open]);

  // Unités de vente (référentiel CPU-PME)
  const [productUnits, setProductUnits] = useState<MarketplaceProductUnit[]>([]);
  // Unités de poids (référentiel CPU-PME)
  const [weightUnits, setWeightUnits] = useState<MarketplaceProductUnit[]>([]);
  // Unités de dimensions / volume (référentiel CPU-PME)
  const [dimensionUnits, setDimensionUnits] = useState<MarketplaceProductUnit[]>([]);

  useEffect(() => {
    if (!open) return;
    productUnitsApi.getSalesPicker().then(setProductUnits).catch(() => setProductUnits([]));
    productUnitsApi.getWeightPicker().then(setWeightUnits).catch(() => setWeightUnits([]));
    productUnitsApi.getDimensionsPicker().then(setDimensionUnits).catch(() => setDimensionUnits([]));
  }, [open]);

  // Boutique du vendeur connecté (requise pour la création du produit)
  const [boutiqueId, setBoutiqueId] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    boutiquesApi.getMyShop().then((b) => setBoutiqueId(b?.id ?? "")).catch(() => setBoutiqueId(""));
  }, [open]);

  // Régions / villes (référentiel admin) — zones de livraison + badge Made in Côte d'Ivoire
  const [allRegions, setAllRegions] = useState<ApiRegion[]>([]);
  const [miciVilles, setMiciVilles] = useState<ApiVille[]>([]);

  useEffect(() => {
    if (!open) return;
    regionsApi.getAll()
      .then((list) => setAllRegions([...list].sort((a, b) => a.name.localeCompare(b.name, "fr"))))
      .catch(() => setAllRegions([]));
    villesApi.getAll().then(setMiciVilles).catch(() => setMiciVilles([]));
  }, [open]);

  const handleFamilyChange = (familleId: string) => {
    setFormData(prev => ({ ...prev, familyId: familleId, categoryId: "", subCategoryId: "" }));
    setCategories([]);
    setSousCategories([]);
    setIsLoadingCategories(true);
    marketplaceCategoriesApi.getAll({ familleId, activeOnly: true })
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setIsLoadingCategories(false));
  };

  const handleCategoryChange = (categorieId: string) => {
    setFormData(prev => ({ ...prev, categoryId: categorieId, subCategoryId: "" }));
    setSousCategories([]);
    setIsLoadingSousCategories(true);
    marketplaceCategoriesApi.getSousCategories({ categorieId, activeOnly: true })
      .then(setSousCategories)
      .catch(() => setSousCategories([]))
      .finally(() => setIsLoadingSousCategories(false));
  };

  const updateFormData = <K extends keyof ListingFormData>(field: K, value: ListingFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleAttribute = (attr: string) => {
    const current = formData.attributes;
    updateFormData(
      "attributes",
      current.includes(attr) ? current.filter(a => a !== attr) : [...current, attr],
    );
  };

  const addPricingTier = () =>
    updateFormData("pricingTiers", [
      ...formData.pricingTiers,
      { qtyMin: "", qtyMax: "", price: "" },
    ]);
  const updatePricingTier = (index: number, field: keyof PricingTier, value: string) => {
    const updated = [...formData.pricingTiers];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData("pricingTiers", updated);
  };
  const removePricingTier = (index: number) =>
    updateFormData("pricingTiers", formData.pricingTiers.filter((_, i) => i !== index));

  const addVariant = () =>
    updateFormData("variants", [
      ...formData.variants,
      { sku: "", name: "", price: "", stock: "", images: [] },
    ]);
  const updateVariant = (index: number, field: keyof ProductVariant, value: string | string[]) => {
    const updated = [...formData.variants];
    updated[index] = { ...updated[index], [field]: value } as ProductVariant;
    updateFormData("variants", updated);
  };
  const removeVariant = (index: number) => {
    if (formData.variants.length > 1) {
      updateFormData("variants", formData.variants.filter((_, i) => i !== index));
    }
  };

  const mediaInputRef = useRef<HTMLInputElement>(null);
  const handleMediasSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = Math.max(0, 10 - formData.medias.length);
    updateFormData("medias", [...formData.medias, ...Array.from(files).slice(0, remaining)]);
  };
  const removeImage = (index: number) =>
    updateFormData("medias", formData.medias.filter((_, i) => i !== index));

  const addCertification = () =>
    updateFormData("certifications", [...formData.certifications, { type: "", reference: "" }]);
  const updateCertification = (index: number, field: keyof CertificationEntry, value: string) => {
    const updated = [...formData.certifications];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData("certifications", updated);
  };
  const removeCertification = (index: number) =>
    updateFormData("certifications", formData.certifications.filter((_, i) => i !== index));

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return "Le nom du produit est requis.";
    if (!formData.description.trim()) return "La description détaillée est requise.";
    if (
      formData.stock && formData.stockAlertThreshold &&
      Number(formData.stockAlertThreshold) >= Number(formData.stock)
    ) {
      return "Le seuil d'alerte doit être strictement inférieur au stock disponible.";
    }

    // Le reste des champs (livraison, variantes, Made in CI, garantie...) ne sont pas
    // pris en compte par l'API de modification — pas besoin de les valider en édition.
    if (isEditMode) return null;

    if (!formData.shortDescription.trim()) return "La description courte est requise.";
    if (!formData.designation.trim()) return "La désignation de l'article est requise.";
    if (!formData.subCategoryId) return "La sous-catégorie est requise.";
    if (!formData.origin.trim()) return "L'origine est requise.";
    if (formData.attributes.length === 0) return "Sélectionnez au moins un attribut.";
    if (!formData.unit) return "L'unité de vente est requise.";
    if (!formData.priceTTC || Number(formData.priceTTC) <= 0) return "Le prix de vente TTC est requis.";
    if (formData.vatRate === "custom" && !formData.vatCustom) return "Le taux de TVA personnalisé est requis.";
    if (formData.designationCode.trim() && !formData.designationCode.trim().toUpperCase().startsWith("D-")) {
      return "Le code référence désignation doit commencer par D- (ex. D-RIZ-BLC-25).";
    }
    if (formData.deliveryZones.length === 0) return "Sélectionnez au moins une zone de livraison.";
    if (!formData.deliveryMode) return "Le mode de livraison est requis.";
    if (formData.hasVariants && formData.variants.some(v => !v.name.trim() || !v.price || !v.stock)) {
      return "Chaque variante doit avoir un nom, un prix et un stock.";
    }
    if (formData.requestMadeInCI && (!formData.miciLabelCode || !formData.miciRegionId)) {
      return "Le badge Made in CI requiert un label et une région.";
    }
    if (formData.acceptsReturn && !formData.returnDelay) {
      return "Le délai de retour est requis si les retours sont acceptés.";
    }
    if (!boutiqueId) return "Boutique introuvable. Veuillez créer votre boutique avant de publier un produit.";
    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      setSubmitError(error);
      toast.error(error);
      return;
    }
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      if (isEditMode && editProductId) {
        const updatePayload: UpdateProductPayload = {
          name: formData.title,
          description: formData.description,
          sousCategorieId: formData.subCategoryId || undefined,
          characteristics: formData.characteristics || undefined,
          salesUnitId: formData.unit || undefined,
          price: formData.priceTTC ? Number(formData.priceTTC) : undefined,
          stock: formData.stock ? Number(formData.stock) : undefined,
          moq: formData.minOrder ? Number(formData.minOrder) : undefined,
          maxOrderQuantity: formData.maxOrderQuantity ? Number(formData.maxOrderQuantity) : undefined,
          netWeight: formData.netWeight ? Number(formData.netWeight) : undefined,
          netWeightUnitId: formData.netWeightUnitId || undefined,
          grossWeight: formData.grossWeight ? Number(formData.grossWeight) : undefined,
          grossWeightUnitId: formData.grossWeightUnitId || undefined,
          dimensionLength: formData.dimensionLength ? Number(formData.dimensionLength) : undefined,
          dimensionWidth: formData.dimensionWidth ? Number(formData.dimensionWidth) : undefined,
          dimensionHeight: formData.dimensionHeight ? Number(formData.dimensionHeight) : undefined,
          dimensionUnitId: formData.dimensionUnitId || undefined,
          volume: formData.volume ? Number(formData.volume) : undefined,
          volumeUnitId: formData.volumeUnitId || undefined,
          packageCount: formData.packageCount ? Number(formData.packageCount) : undefined,
          quantityPerCarton: formData.quantityPerCarton ? Number(formData.quantityPerCarton) : undefined,
          quantityPerPallet: formData.quantityPerPallet ? Number(formData.quantityPerPallet) : undefined,
          quantityPricingEnabled: formData.hasTieredPricing,
          quantityPricingTiers: formData.hasTieredPricing
            ? formData.pricingTiers
                .filter(t => t.qtyMin !== "" && t.price !== "")
                .slice(0, 5)
                .map(t => ({
                  minQuantity: Number(t.qtyMin),
                  maxQuantity: t.qtyMax ? Number(t.qtyMax) : undefined,
                  unitPrice: Number(t.price),
                }))
            : undefined,
        };

        await productsApi.updateListing(editProductId, updatePayload, formData.medias);

        toast.success("Produit mis à jour", {
          description: "Vos modifications ont été enregistrées.",
        });
        onProductCreated?.();
        onOpenChange(false);
        return;
      }

      const vatRateNum = Number(formData.vatRate === "custom" ? formData.vatCustom : formData.vatRate);
      const payload: CreateProductListingPayload = {
        boutiqueId,
        name: formData.title,
        type: formData.listingType === "product" ? "Produit" : "Service",
        status: "InModeration",
        description: formData.description,
        shortDescription: formData.shortDescription,
        sousCategorieId: formData.subCategoryId,
        designation: formData.designation,
        designationCode: formData.designationCode || undefined,
        brand: formData.brand || undefined,
        model: formData.model || undefined,
        origin: formData.origin,
        manufacturingCountry: formData.countryOfManufacture || undefined,
        condition: CONDITION_LABELS[formData.condition],
        attributes: formData.attributes,
        sellerReference: formData.skuMerchant || undefined,
        characteristics: formData.characteristics || undefined,
        salesUnitId: formData.unit,
        price: Number(formData.priceTTC),
        currency: formData.currency,
        vatRate: vatRateNum,
        retailEnabled: formData.sellPerUnit,
        wholesaleEnabled: formData.sellWholesale,
        quoteRequestEnabled: formData.acceptsQuoteRequest,
        promoPrice: formData.promoPrice ? Number(formData.promoPrice) : undefined,
        promoStartsAt: formData.promoStart ? new Date(formData.promoStart).toISOString() : undefined,
        promoEndsAt: formData.promoEnd ? new Date(formData.promoEnd).toISOString() : undefined,
        promoLabel: formData.promoLabel || undefined,
        stock: formData.stock ? Number(formData.stock) : undefined,
        stockAlertThreshold: formData.stockAlertThreshold ? Number(formData.stockAlertThreshold) : undefined,
        availabilityStatus: AVAILABILITY_LABELS[formData.availability],
        madeToOrder: formData.isOnDemand,
        onDemandManufacturing: formData.isMadeToOrder,
        availabilityDelay: formData.preparationDelay || undefined,
        moq: formData.minOrder ? Number(formData.minOrder) : undefined,
        maxOrderQuantity: formData.maxOrderQuantity ? Number(formData.maxOrderQuantity) : undefined,
        netWeight: formData.netWeight ? Number(formData.netWeight) : undefined,
        netWeightUnitId: formData.netWeightUnitId || undefined,
        grossWeight: formData.grossWeight ? Number(formData.grossWeight) : undefined,
        grossWeightUnitId: formData.grossWeightUnitId || undefined,
        dimensionLength: formData.dimensionLength ? Number(formData.dimensionLength) : undefined,
        dimensionWidth: formData.dimensionWidth ? Number(formData.dimensionWidth) : undefined,
        dimensionHeight: formData.dimensionHeight ? Number(formData.dimensionHeight) : undefined,
        dimensionUnitId: formData.dimensionUnitId || undefined,
        volume: formData.volume ? Number(formData.volume) : undefined,
        volumeUnitId: formData.volumeUnitId || undefined,
        packageCount: formData.packageCount ? Number(formData.packageCount) : undefined,
        quantityPerCarton: formData.quantityPerCarton ? Number(formData.quantityPerCarton) : undefined,
        quantityPerPallet: formData.quantityPerPallet ? Number(formData.quantityPerPallet) : undefined,
        deliveryZones: formData.deliveryZones.map((id) => {
          const r = allRegions.find(x => x.id === id);
          return { id, name: r?.name ?? id, description: r?.zone };
        }),
        deliveryMode: DELIVERY_MODE_LABELS[formData.deliveryMode],
        deliveryEstimatedDelay: formData.deliveryTime || undefined,
        quantityPricingEnabled: formData.hasTieredPricing,
        quantityPricingTiers: formData.hasTieredPricing
          ? formData.pricingTiers
              .filter(t => t.qtyMin !== "" && t.price !== "")
              .slice(0, 5)
              .map(t => ({
                minQuantity: Number(t.qtyMin),
                maxQuantity: t.qtyMax ? Number(t.qtyMax) : undefined,
                unitPrice: Number(t.price),
              }))
          : undefined,
        variantsEnabled: formData.hasVariants,
        variants: formData.hasVariants
          ? formData.variants
              .filter(v => v.name.trim())
              .map(v => ({ name: v.name, price: Number(v.price) || 0, stock: Number(v.stock) || 0 }))
          : undefined,
        certificationEntries: formData.certifications.length
          ? formData.certifications
              .filter(c => c.type)
              .map(c => ({ type: c.type, reference: c.reference || undefined }))
          : undefined,
        isRegulated: formData.isRegulated,
        madeInCiRequested: formData.requestMadeInCI,
        madeInCiLabelCode: formData.requestMadeInCI ? (formData.miciLabelCode || undefined) : undefined,
        madeInCiLocalPercentage: formData.requestMadeInCI && formData.miciLocalPercentage
          ? Number(formData.miciLocalPercentage) : undefined,
        madeInCiManufacturingPlace: formData.requestMadeInCI ? (formData.miciManufacturingPlace || undefined) : undefined,
        madeInCiRegionId: formData.requestMadeInCI ? (formData.miciRegionId || undefined) : undefined,
        madeInCiVilleId: formData.requestMadeInCI ? (formData.miciCityId || undefined) : undefined,
        madeInCiOriginCertificateUrl: formData.requestMadeInCI ? (formData.miciOriginCertificateFileName || undefined) : undefined,
        madeInCiSubmitForValidation: formData.requestMadeInCI ? formData.miciRequestCpuValidation : undefined,
        escrowEnabled: formData.acceptsEscrow,
        warrantyLabel: formData.warranty || undefined,
        warrantyDuration: formData.warrantyDuration || undefined,
        savAvailable: formData.hasAfterSalesService,
        returnAccepted: formData.acceptsReturn,
        returnDelayDays: formData.acceptsReturn && formData.returnDelay ? Number(formData.returnDelay) : undefined,
        specialConditions: formData.specialConditions || undefined,
      };

      await productsApi.createListing(payload, formData.medias);

      toast.success("Annonce créée avec succès", {
        description: "Votre annonce est en attente de modération.",
      });
      onProductCreated?.();
      onOpenChange(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : `Erreur lors de la ${isEditMode ? "modification" : "création"} de l'annonce.`;
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    const selectedFamille = familles.find(f => f.id === formData.familyId);

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">

            {/* Nomenclature */}
            <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
              <p className="font-medium text-sm">Classification (référentiel CPU-PME) *</p>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Famille *</Label>
                  <Select value={formData.familyId} onValueChange={handleFamilyChange}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {familles.map(f => (
                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Catégorie *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={handleCategoryChange}
                    disabled={!formData.familyId || isLoadingCategories}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !formData.familyId ? "Choisir une famille d'abord" : isLoadingCategories ? "Chargement..." : "Sélectionner"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sous-catégorie *</Label>
                  <Select
                    value={formData.subCategoryId}
                    onValueChange={(v) => updateFormData("subCategoryId", v)}
                    disabled={!formData.categoryId || isLoadingSousCategories}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !formData.categoryId ? "Choisir une catégorie d'abord" : isLoadingSousCategories ? "Chargement..." : "Sélectionner"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {sousCategories.map(sc => (
                        <SelectItem key={sc.id} value={sc.id}>{sc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* {selectedFamille && selectedFamille.filieres.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs text-muted-foreground mr-1">Filières :</span>
                  {selectedFamille.filieres.map(fil => (
                    <Badge key={fil.id} variant="outline" className="text-[10px]">{fil.name}</Badge>
                  ))}
                </div>
              )} */}
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Nom du produit *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Sacs de ciment CIM METAL 50kg"
                  value={formData.title}
                  onChange={(e) => updateFormData("title", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Description courte *</Label>
                <Input
                  id="shortDescription"
                  placeholder="Résumé en une phrase"
                  value={formData.shortDescription}
                  onChange={(e) => updateFormData("shortDescription", e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="designation">Désignation de l'article *</Label>
                  <Input
                    id="designation"
                    placeholder="Ex: Riz blanc long grain 25kg"
                    value={formData.designation}
                    onChange={(e) => updateFormData("designation", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designationCode">Code référence désignation</Label>
                  <Input
                    id="designationCode"
                    placeholder="Ex: D-RIZ-BLC-25"
                    value={formData.designationCode}
                    onChange={(e) => updateFormData("designationCode", e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">Doit commencer par « D- » si renseigné.</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description détaillée (fiche produit) *</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez votre produit en détail..."
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="characteristics">Caractéristiques</Label>
                <Textarea
                  id="characteristics"
                  placeholder="Composition, spécificités techniques, particularités..."
                  value={formData.characteristics}
                  onChange={(e) => updateFormData("characteristics", e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            {/* Marque / Modèle / SKU */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="brand">Marque</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => updateFormData("brand", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Modèle</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => updateFormData("model", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skuMerchant">Référence Marchand (SKU)</Label>
                <Input
                  id="skuMerchant"
                  placeholder="Votre référence interne"
                  value={formData.skuMerchant}
                  onChange={(e) => updateFormData("skuMerchant", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="origin">Origine *</Label>
                <Input
                  id="origin"
                  placeholder="Ex: Côte d'Ivoire"
                  value={formData.origin}
                  onChange={(e) => updateFormData("origin", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="countryOfManufacture">Pays de fabrication</Label>
                <Input
                  id="countryOfManufacture"
                  value={formData.countryOfManufacture}
                  onChange={(e) => updateFormData("countryOfManufacture", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>État *</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(v) => updateFormData("condition", v as ListingFormData["condition"])}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Neuf</SelectItem>
                    <SelectItem value="used">Occasion</SelectItem>
                    <SelectItem value="refurbished">Reconditionné</SelectItem>
                    <SelectItem value="not_applicable">Non applicable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Attributs *</Label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {productAttributes.map(attr => {
                    const active = formData.attributes.includes(attr);
                    return (
                      <Badge
                        key={attr}
                        variant={active ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleAttribute(attr)}
                      >
                        {attr}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      case 2: {
        const priceTTCNum = Number(formData.priceTTC || 0);
        const vat = formData.vatRate === "custom" ? Number(formData.vatCustom || 0) : Number(formData.vatRate || 0);
        const computedHT = priceTTCNum && vat >= 0 ? (priceTTCNum / (1 + vat / 100)).toFixed(0) : "";
        return (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="priceTTC">Prix de vente TTC affiché *</Label>
                <Input
                  id="priceTTC"
                  type="number"
                  placeholder="0"
                  value={formData.priceTTC}
                  onChange={(e) => updateFormData("priceTTC", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Devise *</Label>
                <Select value={formData.currency} onValueChange={(v) => updateFormData("currency", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {currencies.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unité *</Label>
                <Select value={formData.unit} onValueChange={(v) => updateFormData("unit", v)}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {productUnits.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.name} ({u.symbol})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>TVA applicable * <span className="text-[10px] text-muted-foreground">(référentiel CPU-PME)</span></Label>
                <Select value={formData.vatRate} onValueChange={(v) => updateFormData("vatRate", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {vatRates.map(r => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formData.vatRate === "custom" && (
                <div className="space-y-2">
                  <Label>Taux personnalisé (%)</Label>
                  <Input
                    type="number"
                    value={formData.vatCustom}
                    onChange={(e) => updateFormData("vatCustom", e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="priceHT">Prix HT *</Label>
                <Input
                  id="priceHT"
                  type="number"
                  placeholder={computedHT || "Calculé automatiquement"}
                  value={formData.priceHT || computedHT}
                  onChange={(e) => updateFormData("priceHT", e.target.value)}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4 p-4 border rounded-lg">
              <p className="font-medium text-sm">Promotion (optionnel)</p>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-2">
                  <Label>Prix promotionnel</Label>
                  <Input
                    type="number"
                    value={formData.promoPrice}
                    onChange={(e) => updateFormData("promoPrice", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Libellé promotion</Label>
                  <Input
                    placeholder="Ex: -20%"
                    value={formData.promoLabel}
                    onChange={(e) => updateFormData("promoLabel", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Début promotion</Label>
                  <Input
                    type="date"
                    value={formData.promoStart}
                    onChange={(e) => updateFormData("promoStart", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fin promotion</Label>
                  <Input
                    type="date"
                    value={formData.promoEnd}
                    onChange={(e) => updateFormData("promoEnd", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="minOrder">Quantité minimale (MOQ) *</Label>
                <Input
                  id="minOrder"
                  type="number"
                  value={formData.minOrder}
                  onChange={(e) => updateFormData("minOrder", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxOrderQuantity">Quantité maximale</Label>
                <Input
                  id="maxOrderQuantity"
                  type="number"
                  value={formData.maxOrderQuantity}
                  onChange={(e) => updateFormData("maxOrderQuantity", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Vente à l'unité *</p>
                  <p className="text-xs text-muted-foreground">Vente au détail</p>
                </div>
                <Switch
                  checked={formData.sellPerUnit}
                  onCheckedChange={(c) => updateFormData("sellPerUnit", c)}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Vente en gros</p>
                  <p className="text-xs text-muted-foreground">Vente wholesale / B2B</p>
                </div>
                <Switch
                  checked={formData.sellWholesale}
                  onCheckedChange={(c) => updateFormData("sellWholesale", c)}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Demande de devis</p>
                  <p className="text-xs text-muted-foreground">L'acheteur peut demander un devis</p>
                </div>
                <Switch
                  checked={formData.acceptsQuoteRequest}
                  onCheckedChange={(c) => updateFormData("acceptsQuoteRequest", c)}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Prix négociable</p>
                  <p className="text-xs text-muted-foreground">Les acheteurs peuvent proposer un prix</p>
                </div>
                <Switch
                  checked={formData.isNegotiable}
                  onCheckedChange={(c) => updateFormData("isNegotiable", c)}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Tarification dégressive</p>
                  <p className="text-xs text-muted-foreground">
                    Prix par tranche de quantité (ex : 0-10 : 1000, 11-50 : 900...)
                  </p>
                </div>
                <Switch
                  checked={formData.hasTieredPricing}
                  onCheckedChange={(c) => updateFormData("hasTieredPricing", c)}
                />
              </div>

              {formData.hasTieredPricing && (
                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground">
                    <div className="col-span-4">Quantité min</div>
                    <div className="col-span-4">Quantité max</div>
                    <div className="col-span-3">Prix</div>
                    <div className="col-span-1"></div>
                  </div>
                  {formData.pricingTiers.map((tier, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <Input
                        className="col-span-4"
                        type="number"
                        placeholder="0"
                        value={tier.qtyMin}
                        onChange={(e) => updatePricingTier(i, "qtyMin", e.target.value)}
                      />
                      <Input
                        className="col-span-4"
                        type="number"
                        placeholder="10 (laisser vide = +)"
                        value={tier.qtyMax}
                        onChange={(e) => updatePricingTier(i, "qtyMax", e.target.value)}
                      />
                      <Input
                        className="col-span-3"
                        type="number"
                        placeholder="Prix"
                        value={tier.price}
                        onChange={(e) => updatePricingTier(i, "price", e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="col-span-1"
                        onClick={() => removePricingTier(i)}
                        disabled={formData.pricingTiers.length === 1}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPricingTier}
                    disabled={formData.pricingTiers.length >= 5}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Ajouter une tranche
                  </Button>
                  {formData.pricingTiers.length >= 5 && (
                    <p className="text-xs text-muted-foreground">Maximum 5 tranches.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      }

      case 3:
        return (
          <div className="space-y-6">
            <div className="p-3 rounded-md bg-amber-500/10 text-xs text-amber-800 border border-amber-500/20">
              Les produits dont le stock est à zéro ne seront pas affichés sur la marketplace.
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock disponible *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => updateFormData("stock", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockAlertThreshold">Seuil d'alerte *</Label>
                <Input
                  id="stockAlertThreshold"
                  type="number"
                  placeholder="Ex: 10"
                  value={formData.stockAlertThreshold}
                  onChange={(e) => updateFormData("stockAlertThreshold", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Disponibilité *</Label>
                <Select
                  value={formData.availability}
                  onValueChange={(v) => updateFormData("availability", v as ListingFormData["availability"])}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_stock">En stock</SelectItem>
                    <SelectItem value="out_of_stock">Rupture</SelectItem>
                    <SelectItem value="preorder">Précommande</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Produit sur commande</p>
                  <p className="text-xs text-muted-foreground">Livré après réception de la commande</p>
                </div>
                <Switch
                  checked={formData.isOnDemand}
                  onCheckedChange={(c) => updateFormData("isOnDemand", c)}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Fabrication à la demande</p>
                  <p className="text-xs text-muted-foreground">Production lancée à la commande</p>
                </div>
                <Switch
                  checked={formData.isMadeToOrder}
                  onCheckedChange={(c) => updateFormData("isMadeToOrder", c)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preparationDelay">Délai de préparation *</Label>
              <Input
                id="preparationDelay"
                placeholder="Ex: 2-3 jours"
                value={formData.preparationDelay}
                onChange={(e) => updateFormData("preparationDelay", e.target.value)}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Zones de livraison / intervention *</Label>
              <RegionsMultiSelect
                regions={allRegions}
                value={formData.deliveryZones}
                onChange={(ids) => updateFormData("deliveryZones", ids)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => updateFormData(
                  "deliveryZones",
                  formData.deliveryZones.length === allRegions.length ? [] : allRegions.map(r => r.id)
                )}
              >
                {formData.deliveryZones.length === allRegions.length ? "Tout désélectionner" : "Sélectionner toutes les régions"}
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="deliveryTime">Délai de livraison estimé</Label>
              <Input
                id="deliveryTime"
                placeholder="Ex: 2-5 jours ouvrés"
                value={formData.deliveryTime}
                onChange={(e) => updateFormData("deliveryTime", e.target.value)}
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <p className="font-medium text-sm">Mode de livraison * (une seule option)</p>
              <p className="text-xs text-muted-foreground">
                Sélectionnez le mode de livraison applicable à cette annonce.
              </p>

              {[
                {
                  id: "pickup" as const,
                  title: "Retrait par le client",
                  desc: "Le client récupère la commande à l'adresse du vendeur.",
                },
                {
                  id: "merchant" as const,
                  title: "Livraison par le Marchand",
                  desc: "Le vendeur assure lui-même la livraison auprès du client.",
                },
                {
                  id: "marketplace_api" as const,
                  title: "Livraison Marketplace API",
                  desc: "Le prix de livraison est calculé automatiquement par notre prestataire logistique via API selon la zone, le poids et la distance.",
                },
              ].map(option => {
                const active = formData.deliveryMode === option.id;
                return (
                  <div
                    key={option.id}
                    onClick={() => updateFormData("deliveryMode", option.id)}
                    className={cn(
                      "flex items-start justify-between gap-3 p-4 border rounded-lg cursor-pointer transition-colors",
                      active ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("p-2 rounded-md", active ? "bg-primary/15" : "bg-muted")}>
                        <MapPin className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                      </div>
                      <div>
                        <p className="font-medium">{option.title}</p>
                        <p className="text-xs text-muted-foreground">{option.desc}</p>
                      </div>
                    </div>
                    {active && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                  </div>
                );
              })}

              {formData.deliveryMode === "pickup" && (
                <div className="space-y-2">
                  <Label htmlFor="pickupAddress">Adresse de retrait</Label>
                  <Input
                    id="pickupAddress"
                    placeholder="Adresse complète du point de retrait"
                    value={formData.pickupAddress}
                    onChange={(e) => updateFormData("pickupAddress", e.target.value)}
                  />
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4 p-4 border rounded-lg">
              <p className="font-medium text-sm">Logistique & emballage (optionnel)</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid grid-cols-3 gap-2 items-end">
                  <div className="space-y-2 col-span-2">
                    <Label>Poids net</Label>
                    <Input
                      type="number"
                      value={formData.netWeight}
                      onChange={(e) => updateFormData("netWeight", e.target.value)}
                    />
                  </div>
                  <Select value={formData.netWeightUnitId} onValueChange={(v) => updateFormData("netWeightUnitId", v)}>
                    <SelectTrigger><SelectValue placeholder="Unité" /></SelectTrigger>
                    <SelectContent>
                      {weightUnits.map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.name} ({u.symbol})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-2 items-end">
                  <div className="space-y-2 col-span-2">
                    <Label>Poids brut</Label>
                    <Input
                      type="number"
                      value={formData.grossWeight}
                      onChange={(e) => updateFormData("grossWeight", e.target.value)}
                    />
                  </div>
                  <Select value={formData.grossWeightUnitId} onValueChange={(v) => updateFormData("grossWeightUnitId", v)}>
                    <SelectTrigger><SelectValue placeholder="Unité" /></SelectTrigger>
                    <SelectContent>
                      {weightUnits.map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.name} ({u.symbol})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-2">
                  <Label>Longueur (L)</Label>
                  <Input
                    type="number"
                    value={formData.dimensionLength}
                    onChange={(e) => updateFormData("dimensionLength", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Largeur (l)</Label>
                  <Input
                    type="number"
                    value={formData.dimensionWidth}
                    onChange={(e) => updateFormData("dimensionWidth", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hauteur (h)</Label>
                  <Input
                    type="number"
                    value={formData.dimensionHeight}
                    onChange={(e) => updateFormData("dimensionHeight", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unité dimensions</Label>
                  <Select value={formData.dimensionUnitId} onValueChange={(v) => updateFormData("dimensionUnitId", v)}>
                    <SelectTrigger><SelectValue placeholder="Unité" /></SelectTrigger>
                    <SelectContent>
                      {dimensionUnits.map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.name} ({u.symbol})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <div className="grid grid-cols-3 gap-2 items-end col-span-2 sm:col-span-1">
                  <div className="space-y-2 col-span-2">
                    <Label>Volume</Label>
                    <Input
                      type="number"
                      value={formData.volume}
                      onChange={(e) => updateFormData("volume", e.target.value)}
                    />
                  </div>
                  <Select value={formData.volumeUnitId} onValueChange={(v) => updateFormData("volumeUnitId", v)}>
                    <SelectTrigger><SelectValue placeholder="Unité" /></SelectTrigger>
                    <SelectContent>
                      {dimensionUnits.map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.name} ({u.symbol})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nombre de colis</Label>
                  <Input
                    type="number"
                    value={formData.packageCount}
                    onChange={(e) => updateFormData("packageCount", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantité / carton</Label>
                  <Input
                    type="number"
                    value={formData.quantityPerCarton}
                    onChange={(e) => updateFormData("quantityPerCarton", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantité / palette</Label>
                  <Input
                    type="number"
                    value={formData.quantityPerPallet}
                    onChange={(e) => updateFormData("quantityPerPallet", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Le produit possède plusieurs versions</p>
                <p className="text-sm text-muted-foreground">
                  Ex : couleur, taille, volume, puissance, conditionnement, saveur, parfum
                </p>
              </div>
              <Switch
                checked={formData.hasVariants}
                onCheckedChange={(c) => updateFormData("hasVariants", c)}
              />
            </div>

            {formData.hasVariants && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Variantes ({formData.variants.length})</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                    <Plus className="h-4 w-4 mr-1" /> Ajouter une variante
                  </Button>
                </div>

                {formData.variants.map((variant, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">Variante {index + 1}</Badge>
                      {formData.variants.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeVariant(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Nom (ex : Rouge / XL / 500ml)</Label>
                        <Input
                          value={variant.name}
                          onChange={(e) => updateVariant(index, "name", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>SKU variante</Label>
                        <p className="text-xs text-muted-foreground pt-2">
                          Généré automatiquement par le système.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Prix (FCFA)</Label>
                        <Input
                          type="number"
                          value={variant.price}
                          onChange={(e) => updateVariant(index, "price", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Stock</Label>
                        <Input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => updateVariant(index, "stock", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Images de la variante</Label>
                        <Badge variant="outline">{variant.images.length}</Badge>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateVariant(index, "images", [
                            ...variant.images,
                            `var-${index}-img-${variant.images.length + 1}`,
                          ])
                        }
                      >
                        <Upload className="h-4 w-4 mr-1" /> Ajouter une image
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Photos du produit / service</Label>
              <Badge variant="secondary">{formData.medias.length}/10</Badge>
            </div>
            <input
              ref={mediaInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => { handleMediasSelected(e.target.files); e.target.value = ""; }}
            />
            <div className="grid gap-4 sm:grid-cols-4">
              {formData.medias.map((file, index) => (
                <div key={index} className="relative aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                  <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {formData.medias.length < 10 && (
                <button
                  onClick={() => mediaInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Ajouter</span>
                </button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Ajoutez jusqu'à 10 photos. La première sera la photo principale.
            </p>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="p-3 rounded-md bg-muted/40 text-xs text-muted-foreground border">
              Les certifications sont optionnelles mais renforcent la confiance des acheteurs. Elles seront visibles sur la fiche produit.
            </div>

            <div className="flex items-center justify-between">
              <Label>Certifications & Conformité</Label>
              <Button type="button" variant="outline" size="sm" onClick={addCertification}>
                <Plus className="h-4 w-4 mr-1" /> Ajouter une certification
              </Button>
            </div>

            {formData.certifications.length === 0 && (
              <div className="p-6 border-2 border-dashed rounded-lg text-center text-sm text-muted-foreground">
                Aucune certification renseignée
              </div>
            )}

            {formData.certifications.map((cert, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Certification {index + 1}</Badge>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeCertification(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Type (référentiel CPU-PME)</Label>
                    <Select
                      value={cert.type}
                      onValueChange={(v) => updateCertification(index, "type", v)}
                    >
                      <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        {certificationTypes.map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Référence / N°</Label>
                    <Input
                      value={cert.reference || ""}
                      onChange={(e) => updateCertification(index, "reference", e.target.value)}
                      placeholder="Ex: ISO-9001-2024-01234"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Justificatif (PDF)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateCertification(index, "fileName", `justificatif-${index + 1}.pdf`)}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    {cert.fileName ? cert.fileName : "Téléverser un PDF"}
                  </Button>
                </div>
              </div>
            ))}

            {/* Produit réglementé */}
            <div className="p-4 border rounded-lg space-y-4 bg-amber-50/40 dark:bg-amber-950/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Ce produit est soumis à réglementation</p>
                  <p className="text-xs text-muted-foreground">Cochez si le produit nécessite une autorisation ou une homologation</p>
                </div>
                <Switch
                  checked={formData.isRegulated}
                  onCheckedChange={(v) => updateFormData("isRegulated", v)}
                />
              </div>

              {formData.isRegulated && (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Famille réglementaire</Label>
                      <Select
                        value={formData.regFamilyCode}
                        onValueChange={(v) => {
                          updateFormData("regFamilyCode", v);
                          const item = regulatedFamilies.find(r => r.code === v);
                          if (item) updateFormData("regType", item.document);
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                        <SelectContent>
                          {regulatedFamilies.map(r => (
                            <SelectItem key={r.code} value={r.code}>{r.code} — {r.family}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Type de réglementation / document</Label>
                      <Input
                        value={formData.regType}
                        onChange={(e) => updateFormData("regType", e.target.value)}
                        placeholder="Ex: Autorisation de mise sur le marché"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Autorité compétente</Label>
                      <Input
                        value={formData.regAuthority}
                        onChange={(e) => updateFormData("regAuthority", e.target.value)}
                        placeholder="Ex: Ministère de la Santé"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>N° d'autorisation</Label>
                      <Input
                        value={formData.regAuthorizationNumber}
                        onChange={(e) => updateFormData("regAuthorizationNumber", e.target.value)}
                        placeholder="Ex: AMM-2025-01234"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date de délivrance</Label>
                      <Input
                        type="date"
                        value={formData.regIssueDate}
                        onChange={(e) => updateFormData("regIssueDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date d'expiration <span className="text-xs text-muted-foreground">(si applicable)</span></Label>
                      <Input
                        type="date"
                        value={formData.regExpiryDate}
                        onChange={(e) => updateFormData("regExpiryDate", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Document justificatif (PDF, image)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateFormData("regDocumentFileName", "autorisation-reglementaire.pdf")}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      {formData.regDocumentFileName || "Téléverser le justificatif"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Made in Côte d'Ivoire */}
            <div className="p-4 border rounded-lg space-y-4 bg-orange-50/40 dark:bg-orange-950/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Demander le badge « Made in Côte d'Ivoire »</p>
                  <p className="text-xs text-muted-foreground">Valorisez l'origine locale de votre produit</p>
                </div>
                <Switch
                  checked={formData.requestMadeInCI}
                  onCheckedChange={(v) => updateFormData("requestMadeInCI", v)}
                />
              </div>

              {formData.requestMadeInCI && (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Type de label demandé</Label>
                      <Select
                        value={formData.miciLabelCode}
                        onValueChange={(v) => {
                          const l = madeInCILabels.find(x => x.code === v);
                          updateFormData("miciLabelCode", v);
                          // Auto-populate attributes from the selected label
                          updateFormData("miciLocalPercentage", l ? String(l.minPct) : "");
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Sélectionner un label MICI" /></SelectTrigger>
                        <SelectContent>
                          {madeInCILabels.map(l => (
                            <SelectItem key={l.code} value={l.code}>{l.code} — {l.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Pourcentage de fabrication locale (%)</Label>
                      <Select
                        value={formData.miciLocalPercentage}
                        onValueChange={(v) => updateFormData("miciLocalPercentage", v)}
                        disabled={!formData.miciLabelCode || (madeInCILabels.find(l => l.code === formData.miciLabelCode)?.percentages.length ?? 0) <= 1}
                      >
                        <SelectTrigger><SelectValue placeholder={formData.miciLabelCode ? "Sélectionner un pourcentage" : "Choisir un label d'abord"} /></SelectTrigger>
                        <SelectContent>
                          {(madeInCILabels.find(l => l.code === formData.miciLabelCode)?.percentages || []).map(p => (
                            <SelectItem key={p} value={p}>{p} %</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.miciLabelCode && (
                        <p className="text-xs text-muted-foreground">
                          Minimum requis : ≥ {madeInCILabels.find(l => l.code === formData.miciLabelCode)?.minPct}%
                        </p>
                      )}
                    </div>
                  </div>

                  {formData.miciLabelCode && (() => {
                    const l = madeInCILabels.find(x => x.code === formData.miciLabelCode)!;
                    return (
                      <div className="rounded-md border bg-background/60 p-3 grid gap-2 sm:grid-cols-4 text-xs">
                        <div><span className="text-muted-foreground">Code</span><div className="font-medium">{l.code}</div></div>
                        <div><span className="text-muted-foreground">Label</span><div className="font-medium">{l.label}</div></div>
                        <div><span className="text-muted-foreground">Conditions</span><div className="font-medium">{l.conditions}</div></div>
                        <div><span className="text-muted-foreground">% requis</span><div className="font-medium">≥ {l.minPct}%</div></div>
                      </div>
                    );
                  })()}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="hidden" />
                    <div className="space-y-2">
                      <Label>Lieu de fabrication</Label>
                      <Input
                        value={formData.miciManufacturingPlace}
                        onChange={(e) => updateFormData("miciManufacturingPlace", e.target.value)}
                        placeholder="Ex: Usine Yopougon"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Région *</Label>
                      <Select
                        value={formData.miciRegionId}
                        onValueChange={(v) => {
                          updateFormData("miciRegionId", v);
                          updateFormData("miciCityId", "");
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Sélectionner une région" /></SelectTrigger>
                        <SelectContent>
                          {allRegions.map(r => (
                            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Ville</Label>
                      <Select
                        value={formData.miciCityId}
                        onValueChange={(v) => updateFormData("miciCityId", v)}
                        disabled={!formData.miciRegionId}
                      >
                        <SelectTrigger><SelectValue placeholder={formData.miciRegionId ? "Sélectionner une ville" : "Choisir une région d'abord"} /></SelectTrigger>
                        <SelectContent>
                          {miciVilles.filter(v => v.region_id === formData.miciRegionId).map(v => (
                            <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Certificat d'origine <span className="text-xs text-muted-foreground">(optionnel)</span></Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateFormData("miciOriginCertificateFileName", "certificat-origine.pdf")}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      {formData.miciOriginCertificateFileName || "Téléverser le certificat"}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="mici-cpu-validation"
                      checked={formData.miciRequestCpuValidation}
                      onCheckedChange={(v) => updateFormData("miciRequestCpuValidation", Boolean(v))}
                    />
                    <Label htmlFor="mici-cpu-validation" className="text-sm font-normal cursor-pointer">
                      Soumettre pour validation officielle CPU-PME
                    </Label>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="p-3 rounded-md bg-muted/40 text-xs text-muted-foreground border">
              Section optionnelle — informations Garantie & Service Après-Vente.
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-success/5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <p className="font-medium">Paiement sécurisé (Escrow) — obligatoire</p>
                  <p className="text-sm text-muted-foreground">
                    Le paiement est retenu par la Marketplace jusqu'à confirmation de livraison. Cette protection est activée par défaut et ne peut pas être désactivée.
                  </p>
                </div>
              </div>
              <Badge className="bg-success text-success-foreground">Activé</Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="warranty">Garantie</Label>
                <Input
                  id="warranty"
                  placeholder="Ex: Garantie constructeur"
                  value={formData.warranty}
                  onChange={(e) => updateFormData("warranty", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warrantyDuration">Durée</Label>
                <Input
                  id="warrantyDuration"
                  placeholder="Ex: 12 mois"
                  value={formData.warrantyDuration}
                  onChange={(e) => updateFormData("warrantyDuration", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">SAV disponible</p>
                  <p className="text-xs text-muted-foreground">Service après-vente proposé</p>
                </div>
                <Switch
                  checked={formData.hasAfterSalesService}
                  onCheckedChange={(c) => updateFormData("hasAfterSalesService", c)}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Retour accepté</p>
                  <p className="text-xs text-muted-foreground">L'acheteur peut retourner l'article</p>
                </div>
                <Switch
                  checked={formData.acceptsReturn}
                  onCheckedChange={(c) => updateFormData("acceptsReturn", c)}
                />
              </div>
            </div>

            {formData.acceptsReturn && (
              <div className="space-y-2">
                <Label htmlFor="returnDelay">Délai de retour (jours)</Label>
                <Input
                  id="returnDelay"
                  type="number"
                  value={formData.returnDelay}
                  onChange={(e) => updateFormData("returnDelay", e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="specialConditions">Conditions particulières</Label>
              <Textarea
                id="specialConditions"
                rows={3}
                placeholder="Exclusions, conditions d'application, etc."
                value={formData.specialConditions}
                onChange={(e) => updateFormData("specialConditions", e.target.value)}
              />
            </div>

            <Separator />

            <div className="p-4 bg-success/10 rounded-lg border border-success/20">
              <h4 className="font-medium text-success mb-3">Récapitulatif</h4>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Type :</span><span className="font-medium">{formData.listingType === "product" ? "Produit" : "Service"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Nom :</span><span className="font-medium truncate max-w-[240px]">{formData.title || "-"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Prix TTC :</span><span className="font-medium">{formData.priceTTC ? `${Number(formData.priceTTC).toLocaleString()} ${formData.currency}/${productUnits.find(u => u.id === formData.unit)?.name ?? ""}` : "-"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">TVA :</span><span>{formData.vatRate === "custom" ? `${formData.vatCustom}%` : `${formData.vatRate}%`}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Stock :</span><span>{formData.stock || "-"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Livraison :</span><span>{{ pickup: "Retrait client", merchant: "Livraison Marchand", marketplace_api: "Marketplace API" }[formData.deliveryMode]}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Variantes :</span><span>{formData.hasVariants ? formData.variants.length : 0}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Certifications :</span><span>{formData.certifications.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Zones :</span><span>{formData.deliveryZones.length} région(s)</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Photos :</span><span>{formData.medias.length}</span></div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            {isEditMode ? "Modifier le produit" : "Créer une annonce"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Seuls certains champs sont pris en compte par l'API de modification (prix, stock, logistique, tarification dégressive...). Les autres restent affichés à titre indicatif."
              : "Fiche produit Marketplace CPU-PME — 8 étapes structurées"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="flex items-center justify-between overflow-x-auto pb-2 shrink-0">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = step.id === currentStep;
            const isComplete = step.id < currentStep;
            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 min-w-[70px]",
                    isActive ? "text-primary" : isComplete ? "text-green-600" : "text-muted-foreground"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center border-2",
                    isActive ? "border-primary bg-primary/10" : isComplete ? "border-green-600 bg-green-600/10" : "border-border"
                  )}>
                    {isComplete ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <StepIcon className="h-4 w-4" />}
                  </div>
                  <span className="text-[10px] font-medium text-center leading-tight">
                    {step.id}. {step.title}
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <div className={cn("w-4 h-0.5 mx-0.5", isComplete ? "bg-green-600" : "bg-border")} />
                )}
              </div>
            );
          })}
        </div>

        {submitError && (
          <div className="px-1 py-2 rounded-lg border border-red-500/30 bg-red-500/5 text-red-600 text-sm flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {submitError}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-2">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t shrink-0">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1 || isSubmitting}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Précédent
          </Button>

          {currentStep === steps.length ? (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting
                ? (isEditMode ? "Enregistrement..." : "Publication...")
                : (isEditMode ? "Enregistrer les modifications" : "Publier l'annonce")}
            </Button>
          ) : (
            <Button onClick={() => setCurrentStep(prev => Math.min(steps.length, prev + 1))} disabled={isSubmitting}>
              Suivant
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
