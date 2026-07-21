import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Package,
  Briefcase,
  Plus,
  Search,
  MoreVertical,
  Eye,
  Pencil,
  Copy,
  Trash2,
  Archive,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Ban,
  Award,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  BarChart3,
  Truck,
  Star,
  Image as ImageIcon,
  Filter,
  Download,
  Upload,
  Link,
  FileText,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { boutiquesApi, productsApi, madeInCIBadgeLevelsApi, madeInCIRequestsApi, type Product as ApiProduct, type MadeInCIBadgeLevel } from "@/lib/api";
import { ProductWizard } from "./ProductWizard";
import { RestrictedButton } from "@/components/shared/RestrictedButton";
import { useKycGate } from "@/hooks/useKycStatus";

type ProductStatus = "Draft" | "InModeration" | "Published" | "Rejected" | "NeedsChanges" | "Paused" | "OutOfStock" | "Archived";

interface Product {
  id: string;
  type: "product" | "service";
  nom: string;
  categorie: string;
  sousCategorie: string;
  prix: number;
  unite: string;
  stock: number | null;
  status: ProductStatus;
  madeInCI: "or" | "argent" | "bronze" | "innovation" | null;
  produitReglemente: boolean;
  statutReglementaire: "pending" | "approved" | "rejected" | null;
  image: string;
  vues: number;
  commandes: number;
  chiffreAffaires: number;
  createdAt: string;
  updatedAt: string;
  motifRejet?: string;
}

const statusConfig: Record<ProductStatus, { label: string; color: string; icon: typeof CheckCircle2; bgColor: string }> = {
  Draft: { label: "Brouillon", color: "text-muted-foreground", icon: Clock, bgColor: "bg-muted" },
  InModeration: { label: "En modération", color: "text-blue-500", icon: Clock, bgColor: "bg-blue-500/10" },
  Published: { label: "Publié", color: "text-green-500", icon: CheckCircle2, bgColor: "bg-green-500/10" },
  Rejected: { label: "Refusé", color: "text-destructive", icon: XCircle, bgColor: "bg-destructive/10" },
  NeedsChanges: { label: "À corriger", color: "text-amber-500", icon: AlertCircle, bgColor: "bg-amber-500/10" },
  Paused: { label: "En pause", color: "text-purple-500", icon: Ban, bgColor: "bg-purple-500/10" },
  OutOfStock: { label: "Rupture", color: "text-red-500", icon: AlertTriangle, bgColor: "bg-red-500/10" },
  Archived: { label: "Archivé", color: "text-muted-foreground", icon: Archive, bgColor: "bg-muted" },
};

const madeInCIBadges = {
  or: { color: "bg-primary text-primary-foreground", label: "Made in CI - Or" },
  argent: { color: "bg-secondary text-secondary-foreground", label: "Made in CI - Argent" },
  bronze: { color: "bg-amber-600 text-white", label: "Made in CI - Bronze" },
  innovation: { color: "bg-cyan-500 text-white", label: "Innovation Ivoire" },
};

function mapApiProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    type: p.type === "Service" ? "service" : "product",
    nom: p.name,
    categorie: p.category,
    sousCategorie: p.subCategory || "",
    prix: parseFloat(String(p.price)) || 0,
    unite: p.unit || "unité",
    stock: p.type === "Service" ? null : (p.stock ?? null),
    status: (p.status as ProductStatus) || "Draft",
    madeInCI: (p.madeInCiRequested && p.madeInCiBadgeType)
      ? (p.madeInCiBadgeType as "or" | "argent" | "bronze" | "innovation")
      : null,
    produitReglemente: p.isRegulated || false,
    statutReglementaire: null,
    image: (p.productMedia?.find((m) => m.isMain && m.isActive)
      ?? p.productMedia?.find((m) => m.isActive)
      ?? p.productMedia?.[0])?.url ?? "",
    vues: 0,
    commandes: 0,
    chiffreAffaires: 0,
    createdAt: p.created_at ? p.created_at.split("T")[0] : "",
    updatedAt: p.updated_at ? p.updated_at.split("T")[0] : "",
  };
}


interface MesProduitsProps {
  onOpenWizard?: () => void;
}

// Composant réutilisable : chaque entrée peut être une URL ou un fichier uploadé
function UrlOrFileList({
  label,
  accept,
  values,
  onChange,
}: {
  label: string;
  accept: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [modes, setModes] = useState<("url" | "file")[]>(values.map(() => "url"));

  const setMode = (i: number, mode: "url" | "file") => {
    const updated = [...modes];
    updated[i] = mode;
    setModes(updated);
    // Réinitialiser la valeur quand on change de mode
    const updatedVals = [...values];
    updatedVals[i] = "";
    onChange(updatedVals);
  };

  const handleFileChange = (i: number, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const updatedVals = [...values];
      updatedVals[i] = reader.result as string;
      onChange(updatedVals);
    };
    reader.readAsDataURL(file);
  };

  const addEntry = () => {
    onChange([...values, ""]);
    setModes([...modes, "url"]);
  };

  const removeEntry = (i: number) => {
    onChange(values.filter((_, idx) => idx !== i));
    setModes(modes.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-3">
        {values.map((val, i) => (
          <div key={i} className="space-y-1.5">
            {/* Toggle URL / Fichier */}
            <div className="flex gap-1 w-fit rounded-lg border p-0.5 bg-muted">
              <button
                type="button"
                onClick={() => setMode(i, "url")}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded text-xs transition-all",
                  modes[i] === "url" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"
                )}
              >
                <Link className="w-3 h-3" /> URL
              </button>
              <button
                type="button"
                onClick={() => setMode(i, "file")}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded text-xs transition-all",
                  modes[i] === "file" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"
                )}
              >
                <Upload className="w-3 h-3" /> Fichier
              </button>
            </div>

            <div className="flex gap-2">
              {modes[i] === "url" ? (
                <Input
                  placeholder="https://..."
                  value={val}
                  onChange={e => {
                    const updated = [...values];
                    updated[i] = e.target.value;
                    onChange(updated);
                  }}
                />
              ) : (
                <>
                  <input
                    ref={el => { fileRefs.current[i] = el; }}
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={e => handleFileChange(i, e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    onClick={() => fileRefs.current[i]?.click()}
                    className="flex-1 flex items-center gap-2 px-3 py-2 border rounded-md text-sm hover:bg-muted transition-colors text-left"
                  >
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                    {val
                      ? <span className="truncate text-foreground">Fichier sélectionné ✓</span>
                      : <span className="text-muted-foreground">Choisir un fichier…</span>}
                  </button>
                </>
              )}

              {values.length > 1 && (
                <Button variant="ghost" size="icon" type="button" onClick={() => removeEntry(i)}>
                  <X className="w-4 h-4 text-destructive" />
                </Button>
              )}
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" type="button" onClick={addEntry}>
          <Plus className="w-4 h-4 mr-1" />
          Ajouter
        </Button>
      </div>
    </div>
  );
}

export function MesProduits({ onOpenWizard }: MesProduitsProps) {
  const { allowed: canPublish, reason: publishReason } = useKycGate(
    "Veuillez compléter votre KYC Marketplace afin de publier vos produits."
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boutiqueId, setBoutiqueId] = useState<string>("");
  const [showWizard, setShowWizard] = useState(false);
  const [editProductId, setEditProductId] = useState<string | undefined>(undefined);
  const [editApiProduct, setEditApiProduct] = useState<ApiProduct | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedApiProduct, setSelectedApiProduct] = useState<ApiProduct | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const fetchProducts = useCallback(async (bid: string) => {
    if (!bid) return;
    setIsLoading(true);
    setError(null);
    try {
      const page = await productsApi.getAll({ boutiqueId: bid, limit: 50 });
      setProducts((page.data ?? []).map(mapApiProduct));
    } catch {
      setError("Impossible de charger les produits.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    madeInCIBadgeLevelsApi.getAll().then(setBadgeLevels).catch(() => {});
    boutiquesApi.getMyShop()
      .then((b) => {
        if (b) {
          setBoutiqueId(b.id);
          fetchProducts(b.id);
        } else {
          setIsLoading(false);
        }
      })
      .catch(() => {
        setError("Impossible de charger la boutique.");
        setIsLoading(false);
      });
  }, [fetchProducts]);

  const openMadeInCIDialog = (product: Product) => {
    setMadeInCIProduct(product);
    setMadeInCIForm({ badgeType: "", transformationProcess: "", localValueAdded: "", inputInvoicesUrls: [""], productionPhotosUrls: [""] });
    setBadgeSubmitError(null);
    setBadgeSubmitSuccess(false);
    setShowMadeInCIDialog(true);
  };

  const handleSubmitMadeInCI = async () => {
    if (!madeInCIProduct || !madeInCIForm.badgeType || !madeInCIForm.transformationProcess) return;
    setIsSubmittingBadge(true);
    setBadgeSubmitError(null);
    try {
      await madeInCIRequestsApi.submit({
        productId: madeInCIProduct.id,
        badgeType: madeInCIForm.badgeType,
        transformationProcess: madeInCIForm.transformationProcess,
        localValueAdded: parseFloat(madeInCIForm.localValueAdded) || 0,
        inputInvoicesUrls: madeInCIForm.inputInvoicesUrls.filter(u => u.trim() !== ""),
        productionPhotosUrls: madeInCIForm.productionPhotosUrls.filter(u => u.trim() !== ""),
      });
      setBadgeSubmitSuccess(true);
    } catch (e: unknown) {
      setBadgeSubmitError(e instanceof Error ? e.message : "Erreur lors de la soumission.");
    } finally {
      setIsSubmittingBadge(false);
    }
  };

  const openWizard = () => {
    setEditProductId(undefined);
    setEditApiProduct(undefined);
    if (onOpenWizard) { onOpenWizard(); } else { setShowWizard(true); }
  };

  const openEditWizard = (product: Product) => {
    setEditProductId(product.id);
    setEditApiProduct(undefined);
    setShowWizard(true);
    productsApi.getById(product.id)
      .then(setEditApiProduct)
      .catch(() => {});
  };

  const openDetail = (product: Product) => {
    setSelectedProduct(product);
    setSelectedApiProduct(null);
    setShowDetailDialog(true);
    setIsLoadingDetail(true);
    productsApi.getById(product.id)
      .then(setSelectedApiProduct)
      .catch(() => {})
      .finally(() => setIsLoadingDetail(false));
  };

  // Stats
  const stats = {
    total: products.length,
    published: products.filter(p => p.status === "Published").length,
    inModeration: products.filter(p => p.status === "InModeration").length,
    drafts: products.filter(p => p.status === "Draft").length,
    issues: products.filter(p => ["Rejected", "NeedsChanges", "OutOfStock"].includes(p.status)).length,
    totalVues: products.reduce((acc, p) => acc + p.vues, 0),
    totalCommandes: products.reduce((acc, p) => acc + p.commandes, 0),
    totalCA: products.reduce((acc, p) => acc + p.chiffreAffaires, 0),
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categorie.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesType = typeFilter === "all" || p.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleStatusChange = (productId: string, newStatus: ProductStatus) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] } : p
    ));
  };

  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const handleDuplicate = async (product: Product) => {
    setDuplicatingId(product.id);
    try {
      const full = await productsApi.getById(product.id);
      const payload: Record<string, unknown> = {
        boutiqueId: full.boutiqueId,
        name: full.name,
        type: full.type,
        description: full.description || "",
        category: full.category,
        subCategory: full.subCategory || "",
        characteristics: full.characteristics || "",
        isRegulated: full.isRegulated,
        madeInCiRequested: full.madeInCiRequested,
        ...(full.madeInCiRequested ? {
          madeInCiBadgeType: full.madeInCiBadgeType,
          madeInCiTransformationProcess: (full as unknown as Record<string, unknown>).madeInCiTransformationProcess || "Non renseigné",
        } : {}),
        unit: full.unit || "kg",
        status: "Draft",
        price: parseFloat(String(full.price)) || 0,
        stock: full.stock ?? 0,
        moq: full.moq || 1,
        weight: parseFloat(String(full.weight)) || 0,
        availabilityDelay: full.availabilityDelay || "",
        deliveryZones: full.deliveryZones ?? [],
        shippingCost: parseFloat(String(full.shippingCost)) || 0,
        pickupAvailable: full.pickupAvailable || false,
        technicalSpecifications: full.technicalSpecifications ?? [],
        certifications: full.certifications ?? [],
        technicalDocuments: [],
        variantsEnabled: full.variantsEnabled || false,
        quantityPricingEnabled: full.quantityPricingEnabled || false,
        quantityPricingTiers: full.quantityPricingTiers ?? [],
        ...(full.premiumOption ? {
          premiumOption: full.premiumOption,
          premiumDurationWeeks: full.premiumDurationWeeks || 1,
        } : {}),
      };
      await productsApi.create(payload);
      await fetchProducts(boutiqueId);
    } catch {
      // silencieux
    } finally {
      setDuplicatingId(null);
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);

  // Made in CI request dialog
  const [showMadeInCIDialog, setShowMadeInCIDialog] = useState(false);
  const [madeInCIProduct, setMadeInCIProduct] = useState<Product | null>(null);
  const [badgeLevels, setBadgeLevels] = useState<MadeInCIBadgeLevel[]>([]);
  const [madeInCIForm, setMadeInCIForm] = useState({
    badgeType: "",
    transformationProcess: "",
    localValueAdded: "",
    inputInvoicesUrls: [""] as string[],
    productionPhotosUrls: [""] as string[],
  });
  const [isSubmittingBadge, setIsSubmittingBadge] = useState(false);
  const [badgeSubmitError, setBadgeSubmitError] = useState<string | null>(null);
  const [badgeSubmitSuccess, setBadgeSubmitSuccess] = useState(false);

  const handleDelete = async (productId: string) => {
    setIsDeleting(true);
    try {
      await productsApi.delete(productId);
      setProducts(products.filter(p => p.id !== productId));
      setShowDeleteDialog(false);
      setSelectedProduct(null);
    } catch {
      // Garder le dialog ouvert en cas d'erreur
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Chargement des produits...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive opacity-70" />
          <h3 className="font-semibold mb-2">Erreur de chargement</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={() => fetchProducts(boutiqueId)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Produits/Services</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2 text-xs">
              <Badge variant="outline" className="bg-green-500/10 text-green-600">{stats.published} publiés</Badge>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600">{stats.inModeration} en attente</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Eye className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalVues.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Vues totales</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <ShoppingCart className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalCommandes}</p>
                <p className="text-sm text-muted-foreground">Commandes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(stats.totalCA / 1000000).toFixed(1)}M</p>
                <p className="text-sm text-muted-foreground">CA (FCFA)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes */}
      {stats.issues > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <div className="flex-1">
                <p className="font-medium">{stats.issues} produit(s) nécessitent votre attention</p>
                <p className="text-sm text-muted-foreground">
                  Produits refusés, à corriger ou en rupture de stock
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setStatusFilter("issues")}>
                Voir les alertes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un produit ou service..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="Published">Publiés</SelectItem>
                <SelectItem value="InModeration">En modération</SelectItem>
                <SelectItem value="Draft">Brouillons</SelectItem>
                <SelectItem value="Rejected">Refusés</SelectItem>
                <SelectItem value="NeedsChanges">À corriger</SelectItem>
                <SelectItem value="OutOfStock">Rupture</SelectItem>
                <SelectItem value="Paused">En pause</SelectItem>
                <SelectItem value="Archived">Archivés</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full lg:w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="product">Produits</SelectItem>
                <SelectItem value="service">Services</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Download className="w-4 h-4" />
              </Button>
              <RestrictedButton onClick={openWizard} allowed={canPublish} reason={publishReason}>
                <Plus className="w-4 h-4 mr-1" />
                Nouveau
              </RestrictedButton>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">Aucun produit trouvé</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all" 
                ? "Modifiez vos filtres pour voir plus de résultats"
                : "Publiez votre premier produit ou service"}
            </p>
            <RestrictedButton onClick={openWizard} allowed={canPublish} reason={publishReason}>
              <Plus className="w-4 h-4 mr-1" />
              Ajouter un produit
            </RestrictedButton>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const status = statusConfig[product.status];
            const StatusIcon = status.icon;

            return (
              <Card key={product.id} className="group hover:shadow-md transition-all">
                <CardContent className="p-0">
                  {/* Image / Header */}
                  <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center h-32 rounded-t-lg overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.nom}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-muted-foreground/40" />
                    )}

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <Badge className={cn(status.bgColor, status.color, "border-0")}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                      {product.madeInCI && (
                        <Badge className={madeInCIBadges[product.madeInCI].color}>
                          <Award className="w-3 h-3 mr-1" />
                          {madeInCIBadges[product.madeInCI].label}
                        </Badge>
                      )}
                    </div>

                    {/* Type badge */}
                    <Badge variant="outline" className="absolute top-2 right-2 bg-background/80">
                      {product.type === "product" ? (
                        <><Package className="w-3 h-3 mr-1" />Produit</>
                      ) : (
                        <><Briefcase className="w-3 h-3 mr-1" />Service</>
                      )}
                    </Badge>

                    {/* Regulated */}
                    {product.produitReglemente && (
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "absolute bottom-2 left-2",
                          product.statutReglementaire === "approved" && "border-green-500 text-green-600",
                          product.statutReglementaire === "pending" && "border-amber-500 text-amber-600",
                          product.statutReglementaire === "rejected" && "border-red-500 text-red-600"
                        )}
                      >
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {product.statutReglementaire === "approved" && "Conforme"}
                        {product.statutReglementaire === "pending" && "En attente"}
                        {product.statutReglementaire === "rejected" && "Non conforme"}
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold line-clamp-1">{product.nom}</h3>
                      <p className="text-sm text-muted-foreground">{product.categorie} • {product.sousCategorie}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-primary">{product.prix.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground ml-1">FCFA/{product.unite}</span>
                      </div>
                      {product.stock !== null && (
                        <Badge variant={product.stock <= 10 ? "destructive" : "outline"}>
                          Stock: {product.stock}
                        </Badge>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground border-t pt-3">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {product.vues}
                      </div>
                      <div className="flex items-center gap-1">
                        <ShoppingCart className="w-4 h-4" />
                        {product.commandes}
                      </div>
                      <div className="flex items-center gap-1 ml-auto text-green-600 font-medium">
                        <TrendingUp className="w-4 h-4" />
                        {(product.chiffreAffaires / 1000).toFixed(0)}K
                      </div>
                    </div>

                    {/* Rejection reason */}
                    {product.status === "Rejected" && product.motifRejet && (
                      <div className="p-2 rounded bg-destructive/10 text-xs text-destructive">
                        <strong>Motif:</strong> {product.motifRejet}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => openDetail(product)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </Button>
                      
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditWizard(product)}>
                        <Pencil className="w-4 h-4 mr-1" />
                        Modifier
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            disabled={duplicatingId === product.id}
                            onClick={() => handleDuplicate(product)}
                          >
                            {duplicatingId === product.id
                              ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              : <Copy className="w-4 h-4 mr-2" />}
                            {duplicatingId === product.id ? "Duplication..." : "Dupliquer"}
                          </DropdownMenuItem>
                          
                          {product.status === "Published" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(product.id, "Paused")}>
                              <Ban className="w-4 h-4 mr-2" />
                              Mettre en pause
                            </DropdownMenuItem>
                          )}
                          
                          {product.status === "Paused" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(product.id, "Published")}>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Réactiver
                            </DropdownMenuItem>
                          )}
                          
                          {product.status === "Draft" && (
                            <DropdownMenuItem onClick={() => openMadeInCIDialog(product)}>
                              <Upload className="w-4 h-4 mr-2" />
                              Soumettre badge Made in CI
                            </DropdownMenuItem>
                          )}

                          {["Rejected", "NeedsChanges"].includes(product.status) && (
                            <DropdownMenuItem onClick={() => openMadeInCIDialog(product)}>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Resoumettre badge Made in CI
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem onClick={() => handleStatusChange(product.id, "Archived")}>
                            <Archive className="w-4 h-4 mr-2" />
                            Archiver
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedProduct.type === "product"
                    ? <Package className="w-5 h-5 text-primary" />
                    : <Briefcase className="w-5 h-5 text-primary" />}
                  {selectedProduct.nom}
                </DialogTitle>
                <DialogDescription>
                  {selectedProduct.categorie}
                  {selectedProduct.sousCategorie ? ` • ${selectedProduct.sousCategorie}` : ""}
                </DialogDescription>
              </DialogHeader>

              {isLoadingDetail ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground mr-2" />
                  <span className="text-sm text-muted-foreground">Chargement des détails...</span>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Status + badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={cn(statusConfig[selectedProduct.status].bgColor, statusConfig[selectedProduct.status].color)}>
                      {statusConfig[selectedProduct.status].label}
                    </Badge>
                    {selectedProduct.madeInCI && (
                      <Badge className={madeInCIBadges[selectedProduct.madeInCI].color}>
                        <Award className="w-3 h-3 mr-1" />
                        {madeInCIBadges[selectedProduct.madeInCI].label}
                      </Badge>
                    )}
                    {selectedProduct.produitReglemente && (
                      <Badge variant="outline" className="border-amber-500 text-amber-600">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Produit réglementé
                      </Badge>
                    )}
                  </div>

                  {/* Prix + stock */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-xs text-muted-foreground mb-1">Prix</p>
                      <p className="text-2xl font-bold text-primary">
                        {selectedProduct.prix.toLocaleString()}
                        <span className="text-sm font-normal text-muted-foreground ml-1">FCFA/{selectedProduct.unite}</span>
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground mb-1">Stock</p>
                      <p className="text-2xl font-bold">{selectedProduct.stock ?? "—"}</p>
                      {selectedApiProduct?.moq && (
                        <p className="text-xs text-muted-foreground">MOQ : {selectedApiProduct.moq}</p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {selectedApiProduct?.description && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Description</p>
                      <p className="text-sm">{selectedApiProduct.description}</p>
                    </div>
                  )}

                  {/* Caractéristiques */}
                  {selectedApiProduct?.characteristics && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Caractéristiques</p>
                      <p className="text-sm">{selectedApiProduct.characteristics}</p>
                    </div>
                  )}

                  {/* Spécifications techniques */}
                  {selectedApiProduct?.technicalSpecifications && selectedApiProduct.technicalSpecifications.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Spécifications techniques</p>
                      <div className="rounded-lg border divide-y text-sm">
                        {selectedApiProduct.technicalSpecifications.map((spec, i) => (
                          <div key={i} className="flex justify-between px-3 py-2">
                            <span className="text-muted-foreground">{spec.name}</span>
                            <span className="font-medium">{spec.value}{spec.unit ? ` ${spec.unit}` : ""}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Livraison */}
                  {selectedApiProduct && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {selectedApiProduct.deliveryZones && selectedApiProduct.deliveryZones.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Zones de livraison</p>
                          <div className="flex flex-wrap gap-1">
                            {(selectedApiProduct.deliveryZones as { name: string }[]).map((z, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{z.name}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Livraison</p>
                        <p>Frais : {parseFloat(String(selectedApiProduct.shippingCost)).toLocaleString()} FCFA</p>
                        {selectedApiProduct.pickupAvailable && <p className="text-green-600">Retrait possible</p>}
                        {selectedApiProduct.availabilityDelay && <p className="text-muted-foreground">{selectedApiProduct.availabilityDelay}</p>}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {selectedApiProduct?.certifications && selectedApiProduct.certifications.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Certifications</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedApiProduct.certifications.map((c, i) =>
                          c.url ? (
                            <a key={i} href={c.url} target="_blank" rel="noopener noreferrer">
                              <Badge variant="secondary" className="cursor-pointer hover:underline">{c.name}</Badge>
                            </a>
                          ) : (
                            <Badge key={i} variant="secondary">{c.name}</Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="flex gap-6 text-xs text-muted-foreground border-t pt-3">
                    <span>Créé le : {selectedProduct.createdAt}</span>
                    <span>Mis à jour : {selectedProduct.updatedAt}</span>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDetailDialog(false)}>Fermer</Button>
                <Button onClick={() => { setShowDetailDialog(false); openEditWizard(selectedProduct!); }}>
                  <Pencil className="w-4 h-4 mr-1" />
                  Modifier
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Supprimer le produit
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer "{selectedProduct?.nom}" ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" disabled={isDeleting} onClick={() => setShowDeleteDialog(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={() => selectedProduct && handleDelete(selectedProduct.id)}
            >
              {isDeleting ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1" />}
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog soumission badge Made in CI */}
      <Dialog open={showMadeInCIDialog} onOpenChange={setShowMadeInCIDialog}>
        <DialogContent className="max-w-lg flex flex-col max-h-[90vh]">
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Demande de badge Made in CI
            </DialogTitle>
            <DialogDescription>
              Produit : <span className="font-medium">{madeInCIProduct?.nom}</span>
            </DialogDescription>
          </DialogHeader>

          {badgeSubmitSuccess ? (
            <div className="py-6 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
              <p className="font-semibold">Demande soumise avec succès !</p>
              <p className="text-sm text-muted-foreground">Votre demande est en cours d'examen.</p>
              <Button className="mt-2" onClick={() => setShowMadeInCIDialog(false)}>Fermer</Button>
            </div>
          ) : (
            <div className="overflow-y-auto flex-1 pr-1 space-y-4">
              {/* Niveau de badge */}
              <div className="space-y-2">
                <Label>Niveau de badge *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {badgeLevels.map(b => {
                    const colorMap: Record<string, string> = {
                      or: "bg-primary", argent: "bg-secondary",
                      bronze: "bg-amber-600", innovation_ivoire: "bg-cyan-500",
                    };
                    return (
                      <div
                        key={b.id}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-all",
                          madeInCIForm.badgeType === b.id && "ring-2 ring-primary bg-primary/5"
                        )}
                        onClick={() => setMadeInCIForm(f => ({ ...f, badgeType: b.id }))}
                      >
                        <Badge className={cn(colorMap[b.id] ?? "bg-muted", "text-white text-xs mb-1")}>
                          {b.label}
                        </Badge>
                        <p className="text-xs text-muted-foreground">{b.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Processus de transformation */}
              <div className="space-y-2">
                <Label htmlFor="transformProcess">Processus de transformation *</Label>
                <Textarea
                  id="transformProcess"
                  rows={4}
                  placeholder="Décrivez les étapes réalisées en Côte d'Ivoire (récolte, fermentation, séchage, torréfaction...)"
                  value={madeInCIForm.transformationProcess}
                  onChange={e => setMadeInCIForm(f => ({ ...f, transformationProcess: e.target.value }))}
                />
              </div>

              {/* Valeur ajoutée locale */}
              <div className="space-y-2">
                <Label htmlFor="localValue">Valeur ajoutée locale (%) *</Label>
                <Input
                  id="localValue"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="Ex: 75"
                  value={madeInCIForm.localValueAdded}
                  onChange={e => setMadeInCIForm(f => ({ ...f, localValueAdded: e.target.value }))}
                />
              </div>

              <UrlOrFileList
                label="Factures d'intrants"
                accept=".pdf,.jpg,.jpeg,.png"
                values={madeInCIForm.inputInvoicesUrls}
                onChange={v => setMadeInCIForm(f => ({ ...f, inputInvoicesUrls: v }))}
              />

              <UrlOrFileList
                label="Photos de production"
                accept=".jpg,.jpeg,.png,.webp"
                values={madeInCIForm.productionPhotosUrls}
                onChange={v => setMadeInCIForm(f => ({ ...f, productionPhotosUrls: v }))}
              />

              {badgeSubmitError && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {badgeSubmitError}
                </div>
              )}

              <DialogFooter className="shrink-0 border-t pt-4 mt-2">
                <Button variant="outline" onClick={() => setShowMadeInCIDialog(false)}>
                  Annuler
                </Button>
                <Button
                  disabled={isSubmittingBadge || !madeInCIForm.badgeType || !madeInCIForm.transformationProcess}
                  onClick={handleSubmitMadeInCI}
                >
                  {isSubmittingBadge
                    ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Soumission...</>
                    : <><Award className="w-4 h-4 mr-2" />Soumettre la demande</>}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Wizard intégré — création ET édition */}
      <ProductWizard
        open={showWizard}
        onOpenChange={(v) => { setShowWizard(v); if (!v) { setEditProductId(undefined); setEditApiProduct(undefined); } }}
        onProductCreated={() => fetchProducts(boutiqueId)}
        editProductId={editProductId}
        editInitialData={editApiProduct}
      />
    </div>
  );
}
