import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
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
  Package,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  Upload,
  AlertTriangle,
  Award,
  MapPin,
  Truck,
  X,
  Plus,
  Image as ImageIcon,
  CheckCircle2,
  FileText,
  Layers,
  DollarSign,
  Star,
  Crown,
  Sparkles,
  Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { filieresApi, boutiquesApi, productsApi, madeInCIBadgeLevelsApi, type Filiere, type Product as ApiProduct, type MadeInCIBadgeLevel } from "@/lib/api";
import { regions } from "@/data/regions";

type ProductStatus = "Draft" | "InModeration" | "Published" | "Rejected" | "NeedsChanges";

/**
 * Redimensionne et compresse une image côté client pour éviter les erreurs 413 (File too large).
 * Réduit la plus grande dimension à `maxSize` px et exporte en JPEG.
 */
async function compressImage(file: File, maxSize = 1600, quality = 0.8): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });

  let { width, height } = img;
  if (width > maxSize || height > maxSize) {
    const ratio = Math.min(maxSize / width, maxSize / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );
  if (!blob) return file;

  const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg" });
}

/** Zone d'upload de documents fonctionnelle (sélection multiple, liste, suppression). */
function FileUploadZone({
  hint,
  accept,
  files,
  onChange,
}: {
  hint: string;
  accept: string;
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (selected.length) onChange([...files, ...selected]);
  };

  return (
    <div className="space-y-2">
      <input ref={inputRef} type="file" accept={accept} multiple className="hidden" onChange={handleAdd} />
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
      >
        <Upload className="w-6 h-6 mx-auto text-muted-foreground" />
        <p className="text-sm text-muted-foreground mt-1">{hint}</p>
      </div>
      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm border rounded-md px-2 py-1.5 bg-muted/40">
              <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="truncate flex-1">{f.name}</span>
              <button type="button" onClick={() => onChange(files.filter((_, idx) => idx !== i))}>
                <X className="w-4 h-4 text-destructive" />
              </button>
            </div>
          ))}
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
  const [step, setStep] = useState(1);
  const [productType, setProductType] = useState<"product" | "service" | null>(null);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [badgeLevels, setBadgeLevels] = useState<MadeInCIBadgeLevel[]>([]);
  const [boutiqueId, setBoutiqueId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    filieresApi.getAll().then(setFilieres).catch(() => {});
    madeInCIBadgeLevelsApi.getAll().then(setBadgeLevels).catch(() => {});
    boutiquesApi.getMyShop().then((b) => { if (b) setBoutiqueId(b.id); }).catch(() => {});
  }, []);

  // Pré-remplissage en mode édition
  useEffect(() => {
    if (!open || !editInitialData) return;
    const p = editInitialData;
    const type = p.type === "Service" ? "service" : "product";
    setProductType(type);
    setStep(2); // Sauter l'étape de choix du type
    setFormData(prev => ({
      ...prev,
      type,
      nom: p.name || "",
      categorie: p.category || "",
      sousCategorie: p.subCategory || "",
      description: p.description || "",
      caracteristiques: p.characteristics || "",
      prix: p.price ? String(parseFloat(String(p.price))) : "",
      unite: p.unit || "kg",
      moq: p.moq ? String(p.moq) : "1",
      stock: p.stock != null ? String(p.stock) : "",
      delaiDisponibilite: p.availabilityDelay || "",
      zonesLivraison: p.deliveryZones
        ? (p.deliveryZones as { name: string }[]).map(z => z.name)
        : [],
      fraisLivraison: p.shippingCost ? String(parseFloat(String(p.shippingCost))) : "",
      optionRetrait: p.pickupAvailable || false,
      produitReglemente: p.isRegulated || false,
      madeInCI: p.madeInCiRequested || false,
      badgeMadeInCI: p.madeInCiBadgeType || "",
      ficheTechnique: {
        enabled: !!(p.technicalSpecifications?.length || p.certifications?.length || p.technicalDocuments?.length),
        specifications: p.technicalSpecifications
          ? p.technicalSpecifications.map(s => ({ label: s.name, value: s.value, unit: s.unit || "", imagePreview: s.url }))
          : [],
        certifications: p.certifications
          ? p.certifications.map(c => ({ name: c.name, url: c.url }))
          : [],
        documents: [],
      },
      variantsEnabled: p.variantsEnabled || false,
      variantes: { enabled: p.variantsEnabled || false, attributs: [], options: [] },
      quantityPricingEnabled: p.quantityPricingEnabled || false,
      prixQuantite: {
        enabled: p.quantityPricingEnabled || false,
        paliers: p.quantityPricingTiers
          ? p.quantityPricingTiers.map(t => ({
              quantiteMin: String(t.minQuantity),
              quantiteMax: "",
              prix: String(t.unitPrice),
              reduction: "",
            }))
          : [],
      },
      miseEnVedette: p.premiumOption
        ? {
            enabled: true,
            type: p.premiumOption as "" | "vedette" | "special" | "premium",
            duree: p.premiumDurationWeeks ? String(p.premiumDurationWeeks * 7) : "7",
            acceptCommission: false,
          }
        : prev.miseEnVedette,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editInitialData]);

  const handleSubmit = async () => {
    if (!boutiqueId) { setSubmitError("Boutique introuvable. Veuillez créer votre boutique d'abord."); return; }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Métadonnées des champs structurés. Les fichiers eux-mêmes partent dans "files"
      // (un seul appel à /api/marketplace/products). On conserve les URLs déjà
      // enregistrées (mode édition) ; les nouveaux fichiers sont dans "files".
      const technicalSpecifications = formData.ficheTechnique.specifications.map((s) => ({
        name: s.label,
        value: s.value,
        unit: s.unit,
        ...(!s.image && s.imagePreview ? { url: s.imagePreview } : {}),
      }));

      const certifications = formData.ficheTechnique.certifications.map((c) => ({
        name: c.name,
        ...(!c.file && c.url ? { url: c.url } : {}),
      }));

      const technicalDocuments = [
        ...(editInitialData?.technicalDocuments ?? []),
        ...formData.technicalDocs.map((f) => ({ name: f.name })),
      ];

      const payload = {
        boutiqueId,
        name: formData.nom,
        type: formData.type === "product" ? "Produit" : "Service",
        description: formData.description || "",
        category: formData.categorie,
        subCategory: formData.sousCategorie || "",
        characteristics: formData.caracteristiques || "",
        isRegulated: formData.produitReglemente,
        madeInCiRequested: formData.madeInCI,
        ...(formData.madeInCI ? {
          madeInCiTransformationProcess: formData.madeInCiTransformationProcess || "Non renseigné",
          ...(formData.badgeMadeInCI ? { madeInCiBadgeType: formData.badgeMadeInCI } : {}),
        } : {}),
        unit: formData.unite || "kg",
        status: "Draft",
        price: Number(formData.prix) || 0,
        stock: formData.stock ? Number(formData.stock) : 0,
        moq: Number(formData.moq) || 1,
        weight: 0,
        capacity: 0,
        availabilityDelay: formData.delaiDisponibilite || "",
        deliveryZones: formData.zonesLivraison.map((name, i) => ({ id: i + 1, name, description: name })),
        shippingCost: parseFloat(formData.fraisLivraison) || 0,
        pickupAvailable: formData.optionRetrait,
        technicalSpecifications,
        certifications,
        technicalDocuments,
        variantsEnabled: formData.variantes.enabled,
        quantityPricingEnabled: formData.prixQuantite.enabled,
        quantityPricingTiers: formData.prixQuantite.paliers.map(p => ({ minQuantity: parseFloat(p.quantiteMin) || 0, unitPrice: parseFloat(p.prix) || 0 })),
        ...(formData.miseEnVedette.enabled && formData.miseEnVedette.type ? {
          premiumOption: formData.miseEnVedette.type,
          premiumDurationWeeks: Math.ceil(parseFloat(formData.miseEnVedette.duree) / 7) || 1,
        } : {}),
      };
      // Tous les fichiers passent par le champ multipart "files" du même endpoint.
      // (formData.images sont déjà compressées ; on compresse les autres images,
      //  compressImage laissant les PDF/docs intacts.)
      const specImages = formData.ficheTechnique.specifications
        .map((s) => s.image)
        .filter((f): f is File => !!f);
      const certFiles = formData.ficheTechnique.certifications
        .map((c) => c.file)
        .filter((f): f is File => !!f);
      const extraFiles = await Promise.all(
        [
          ...formData.documentsReglementaires,
          ...formData.madeInCiPreuves,
          ...specImages,
          ...certFiles,
          ...formData.technicalDocs,
        ].map((f) => compressImage(f))
      );
      const allFiles = [...formData.images, ...extraFiles];
      if (isEditMode && editProductId) {
        await productsApi.update(editProductId, payload, allFiles);
      } else {
        await productsApi.create(payload, allFiles);
      }
      onProductCreated?.();
      onOpenChange(false);
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : `Erreur lors de la ${isEditMode ? "modification" : "création"} du produit.`);
    } finally {
      setIsSubmitting(false);
    }
  };
  const [formData, setFormData] = useState({
    type: "",
    nom: "",
    categorie: "",
    sousCategorie: "",
    tags: [] as string[],
    description: "",
    caracteristiques: "",
    prix: "",
    unite: "",
    moq: "1",
    stock: "",
    delaiDisponibilite: "",
    zonesLivraison: [] as string[],
    fraisLivraison: "",
    optionRetrait: false,
    produitReglemente: false,
    categorieReglementee: "",
    documentsReglementaires: [] as File[],
    madeInCI: false,
    badgeMadeInCI: "",
    madeInCiTransformationProcess: "",
    madeInCiPreuves: [] as File[],
    images: [] as File[],
    imagePreviews: [] as string[],
    technicalDocs: [] as File[],
    // Fiche technique
    ficheTechnique: {
      enabled: false,
      specifications: [] as { label: string; value: string; unit: string; image?: File; imagePreview?: string }[],
      certifications: [] as { name: string; file?: File; url?: string }[],
      documents: [] as { name: string; type: string }[],
    },
    // Variantes
    variantes: {
      enabled: false,
      attributs: [] as { nom: string; valeurs: string[] }[],
      options: [] as { combinaison: string; prix: string; stock: string; sku: string }[],
    },
    // Prix par quantité
    prixQuantite: {
      enabled: false,
      paliers: [] as { quantiteMin: string; quantiteMax: string; prix: string; reduction: string }[],
    },
    // Mise en vedette
    miseEnVedette: {
      enabled: false,
      type: "" as "" | "vedette" | "special" | "premium",
      duree: "7" as string,
      acceptCommission: false,
    },
  });

  const totalSteps = 8;
  const progress = (step / totalSteps) * 100;

  const updateForm = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const original = e.target.files?.[0];
    e.target.value = ""; // permet de re-sélectionner le même fichier
    if (!original) return;
    const file = await compressImage(original);
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, file],
        imagePreviews: [...prev.imagePreviews, reader.result as string],
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
    }));
  };

  // Image associée à une spécification technique
  const setSpecImage = (index: number, file: File | undefined) => {
    const apply = (image: File | undefined, imagePreview: string | undefined) => {
      setFormData(prev => {
        const specifications = [...prev.ficheTechnique.specifications];
        specifications[index] = { ...specifications[index], image, imagePreview };
        return { ...prev, ficheTechnique: { ...prev.ficheTechnique, specifications } };
      });
    };
    if (!file) { apply(undefined, undefined); return; }
    const reader = new FileReader();
    reader.onload = () => apply(file, reader.result as string);
    reader.readAsDataURL(file);
  };

  // Fichier (certificat) associé à une certification
  const setCertFile = (index: number, file: File | undefined) => {
    setFormData(prev => {
      const certifications = [...prev.ficheTechnique.certifications];
      certifications[index] = file
        ? { ...certifications[index], file }
        : { name: certifications[index].name }; // retire fichier + url existante
      return { ...prev, ficheTechnique: { ...prev.ficheTechnique, certifications } };
    });
  };

  const categoriesReglementees = [
    "Alimentation",
    "Cosmétiques",
    "Produits chimiques",
    "Médicaments",
    "Produits électriques",
    "Jouets",
    "Équipements de protection",
  ];

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold">Type d'offre</h3>
              <p className="text-sm text-muted-foreground">Que souhaitez-vous publier ?</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card 
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  productType === "product" && "ring-2 ring-primary"
                )}
                onClick={() => {
                  setProductType("product");
                  updateForm("type", "product");
                }}
              >
                <CardContent className="p-6 text-center">
                  <Package className="w-12 h-12 mx-auto mb-3 text-primary" />
                  <h4 className="font-semibold">Produit</h4>
                  <p className="text-sm text-muted-foreground">Bien physique à vendre</p>
                </CardContent>
              </Card>
              <Card 
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  productType === "service" && "ring-2 ring-secondary"
                )}
                onClick={() => {
                  setProductType("service");
                  updateForm("type", "service");
                }}
              >
                <CardContent className="p-6 text-center">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 text-secondary" />
                  <h4 className="font-semibold">Service</h4>
                  <p className="text-sm text-muted-foreground">Prestation à proposer</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Informations générales</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom du {productType === "product" ? "produit" : "service"} *</Label>
                <Input
                  id="nom"
                  placeholder="Ex: Cacao Premium Grade A"
                  value={formData.nom}
                  onChange={(e) => updateForm("nom", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Catégorie (filière) *</Label>
                  <Select 
                    value={formData.categorie} 
                    onValueChange={(v) => updateForm("categorie", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      {filieres.map((f) => (
                        <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sous-catégorie</Label>
                  <Input
                    placeholder="Ex: Cacao transformé"
                    value={formData.sousCategorie}
                    onChange={(e) => updateForm("sousCategorie", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez votre produit/service en détail..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="caracteristiques">Caractéristiques / Spécifications</Label>
                <Textarea
                  id="caracteristiques"
                  placeholder="Poids, dimensions, composition, etc."
                  rows={2}
                  value={formData.caracteristiques}
                  onChange={(e) => updateForm("caracteristiques", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Médias</Label>
                <div className="grid grid-cols-4 gap-3">
                  {/* Images déjà enregistrées (mode édition) */}
                  {(editInitialData?.productMedia ?? [])
                    .filter((m) => m.isActive)
                    .map((m) => (
                      <div key={m.id} className="relative aspect-square border-2 rounded-lg overflow-hidden">
                        <img src={m.url} alt="" className="w-full h-full object-cover" />
                        {m.isMain && (
                          <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded">
                            Principal
                          </span>
                        )}
                      </div>
                    ))}

                  {/* Nouvelles images sélectionnées */}
                  {formData.imagePreviews.map((preview, i) => (
                    <div key={i} className="relative aspect-square border-2 rounded-lg overflow-hidden group">
                      <img src={preview} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-background/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-destructive" />
                      </button>
                      {i === 0 && (editInitialData?.productMedia ?? []).filter((m) => m.isActive).length === 0 && (
                        <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded">
                          Principal
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Tuile d'ajout */}
                  {(editInitialData?.productMedia ?? []).filter((m) => m.isActive).length + formData.images.length < 4 && (
                    <label className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={handleAddImage}
                      />
                      {(editInitialData?.productMedia ?? []).filter((m) => m.isActive).length + formData.images.length === 0 ? (
                        <>
                          <Upload className="w-6 h-6 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground mt-1">Principal</span>
                        </>
                      ) : (
                        <Plus className="w-5 h-5 text-muted-foreground" />
                      )}
                    </label>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Ajoutez jusqu'à 4 photos. La première sera la photo principale.</p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Prix et disponibilité</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prix">Prix (FCFA) *</Label>
                  <Input
                    id="prix"
                    type="number"
                    placeholder="850000"
                    value={formData.prix}
                    onChange={(e) => updateForm("prix", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unite">Unité *</Label>
                  <Select 
                    value={formData.unite} 
                    onValueChange={(v) => updateForm("unite", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="piece">Pièce</SelectItem>
                      <SelectItem value="kg">Kilogramme</SelectItem>
                      <SelectItem value="tonne">Tonne</SelectItem>
                      <SelectItem value="litre">Litre</SelectItem>
                      <SelectItem value="sac">Sac</SelectItem>
                      <SelectItem value="carton">Carton</SelectItem>
                      <SelectItem value="session">Session</SelectItem>
                      <SelectItem value="heure">Heure</SelectItem>
                      <SelectItem value="jour">Jour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="moq">Quantité minimum (MOQ)</Label>
                  <Input
                    id="moq"
                    type="number"
                    placeholder="1"
                    value={formData.moq}
                    onChange={(e) => updateForm("moq", e.target.value)}
                  />
                </div>
                {productType === "product" && (
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock disponible</Label>
                    <Input
                      id="stock"
                      type="number"
                      placeholder="100"
                      value={formData.stock}
                      onChange={(e) => updateForm("stock", e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="delai">Délai de disponibilité</Label>
                <Input
                  id="delai"
                  placeholder="Ex: Immédiat, 48h, 1 semaine..."
                  value={formData.delaiDisponibilite}
                  onChange={(e) => updateForm("delaiDisponibilite", e.target.value)}
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Livraison
                </h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Zones de livraison</Label>
                    <div className="flex flex-wrap gap-2">
                      {regions.slice(0, 6).map(region => (
                        <Badge
                          key={region}
                          variant={formData.zonesLivraison.includes(region) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            if (formData.zonesLivraison.includes(region)) {
                              updateForm("zonesLivraison", formData.zonesLivraison.filter(z => z !== region));
                            } else {
                              updateForm("zonesLivraison", [...formData.zonesLivraison, region]);
                            }
                          }}
                        >
                          {region}
                        </Badge>
                      ))}
                      <Badge variant="outline" className="cursor-pointer">+ Autres</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frais">Frais de livraison (FCFA)</Label>
                    <Input
                      id="frais"
                      placeholder="Ex: 5000 ou 'Gratuit'"
                      value={formData.fraisLivraison}
                      onChange={(e) => updateForm("fraisLivraison", e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="retrait"
                      checked={formData.optionRetrait}
                      onCheckedChange={(checked) => updateForm("optionRetrait", checked)}
                    />
                    <Label htmlFor="retrait" className="text-sm font-normal">
                      Proposer le retrait sur place / point relais
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Conformité</h3>

            {/* Produits réglementés */}
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Produits réglementés
                </CardTitle>
                <CardDescription>
                  Certains produits nécessitent des autorisations pour être vendus
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reglemente"
                    checked={formData.produitReglemente}
                    onCheckedChange={(checked) => updateForm("produitReglemente", checked)}
                  />
                  <Label htmlFor="reglemente" className="text-sm font-normal">
                    Ce produit est soumis à réglementation
                  </Label>
                </div>

                {formData.produitReglemente && (
                  <div className="space-y-4 pl-6 border-l-2 border-amber-500/30">
                    <div className="space-y-2">
                      <Label>Catégorie réglementée</Label>
                      <Select
                        value={formData.categorieReglementee}
                        onValueChange={(v) => updateForm("categorieReglementee", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriesReglementees.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Documents obligatoires</Label>
                      <FileUploadZone
                        hint="Uploader certificats, autorisations..."
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        files={formData.documentsReglementaires}
                        onChange={(f) => updateForm("documentsReglementaires", f)}
                      />
                      <p className="text-xs text-amber-600">
                        ⚠️ La publication sera bloquée tant que les documents ne sont pas validés
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Made in CI */}
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Label Made in Côte d'Ivoire
                </CardTitle>
                <CardDescription>
                  Valorisez votre production locale avec un badge officiel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="madeinci"
                    checked={formData.madeInCI}
                    onCheckedChange={(checked) => updateForm("madeInCI", checked)}
                  />
                  <Label htmlFor="madeinci" className="text-sm font-normal">
                    Demander le badge Made in CI
                  </Label>
                </div>

                {formData.madeInCI && (
                  <div className="space-y-4 pl-6 border-l-2 border-primary/30">
                    <div className="space-y-2">
                      <Label>Niveau de badge souhaité</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {badgeLevels.map(badge => {
                          const colorMap: Record<string, string> = {
                            or: "bg-primary",
                            argent: "bg-secondary",
                            bronze: "bg-amber-600",
                            innovation_ivoire: "bg-cyan-500",
                          };
                          const color = colorMap[badge.id] ?? "bg-muted";
                          return (
                          <div
                            key={badge.id}
                            className={cn(
                              "p-3 rounded-lg border cursor-pointer transition-all",
                              formData.badgeMadeInCI === badge.id && "ring-2 ring-primary"
                            )}
                            onClick={() => updateForm("badgeMadeInCI", badge.id)}
                          >
                            <Badge className={cn(color, "text-white mb-1")}>
                              {badge.label}
                            </Badge>
                            <p className="text-xs text-muted-foreground">{badge.description}</p>
                          </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transformProcess">Processus de transformation local *</Label>
                      <Textarea
                        id="transformProcess"
                        placeholder="Décrivez comment ce produit est fabriqué ou transformé en Côte d'Ivoire (matières premières locales, étapes de production, valeur ajoutée locale...)"
                        rows={4}
                        value={formData.madeInCiTransformationProcess}
                        onChange={(e) => updateForm("madeInCiTransformationProcess", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Requis pour la demande du badge Made in CI</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Preuves (factures intrants, photos, etc.)</Label>
                      <FileUploadZone
                        hint="Uploader les justificatifs"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        files={formData.madeInCiPreuves}
                        onChange={(f) => updateForm("madeInCiPreuves", f)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Fiche technique</h3>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Spécifications techniques</CardTitle>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="enableFiche"
                      checked={formData.ficheTechnique.enabled}
                      onCheckedChange={(checked) => 
                        updateForm("ficheTechnique", { ...formData.ficheTechnique, enabled: !!checked })
                      }
                    />
                    <Label htmlFor="enableFiche" className="text-sm font-normal">
                      Ajouter une fiche technique
                    </Label>
                  </div>
                </div>
                <CardDescription>
                  Détaillez les caractéristiques de votre {productType === "product" ? "produit" : "service"}
                </CardDescription>
              </CardHeader>
              {formData.ficheTechnique.enabled && (
                <CardContent className="space-y-4">
                  {/* Spécifications */}
                  <div className="space-y-3">
                    <Label>Caractéristiques</Label>
                    {formData.ficheTechnique.specifications.map((spec, index) => (
                      <div key={index} className="p-3 border rounded-lg space-y-2">
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <Input
                            className="col-span-4"
                            placeholder="Caractéristique"
                            value={spec.label}
                            onChange={(e) => {
                              const specs = [...formData.ficheTechnique.specifications];
                              specs[index] = { ...specs[index], label: e.target.value };
                              updateForm("ficheTechnique", { ...formData.ficheTechnique, specifications: specs });
                            }}
                          />
                          <Input
                            className="col-span-5"
                            placeholder="Valeur"
                            value={spec.value}
                            onChange={(e) => {
                              const specs = [...formData.ficheTechnique.specifications];
                              specs[index] = { ...specs[index], value: e.target.value };
                              updateForm("ficheTechnique", { ...formData.ficheTechnique, specifications: specs });
                            }}
                          />
                          <Input
                            className="col-span-2"
                            placeholder="Unité"
                            value={spec.unit}
                            onChange={(e) => {
                              const specs = [...formData.ficheTechnique.specifications];
                              specs[index] = { ...specs[index], unit: e.target.value };
                              updateForm("ficheTechnique", { ...formData.ficheTechnique, specifications: specs });
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="col-span-1"
                            onClick={() => {
                              const specs = formData.ficheTechnique.specifications.filter((_, i) => i !== index);
                              updateForm("ficheTechnique", { ...formData.ficheTechnique, specifications: specs });
                            }}
                          >
                            <X className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                        {/* Image de la spécification */}
                        {spec.imagePreview ? (
                          <div className="relative w-16 h-16 rounded border overflow-hidden">
                            <img src={spec.imagePreview} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setSpecImage(index, undefined)}
                              className="absolute top-0 right-0 bg-background/80 rounded-bl p-0.5"
                            >
                              <X className="w-3 h-3 text-destructive" />
                            </button>
                          </div>
                        ) : (
                          <label className="inline-flex items-center gap-1 text-xs text-muted-foreground border rounded-md px-2 py-1 cursor-pointer hover:bg-muted/50 w-fit">
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              className="hidden"
                              onChange={(e) => setSpecImage(index, e.target.files?.[0])}
                            />
                            <ImageIcon className="w-3.5 h-3.5" /> Ajouter une image
                          </label>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const specs = [...formData.ficheTechnique.specifications, { label: "", value: "", unit: "" }];
                        updateForm("ficheTechnique", { ...formData.ficheTechnique, specifications: specs });
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Ajouter une caractéristique
                    </Button>
                  </div>

                  {/* Certifications */}
                  <div className="space-y-2">
                    <Label>Certifications & Labels</Label>
                    <div className="flex flex-wrap gap-2">
                      {["ISO 9001", "ISO 14001", "HACCP", "CE", "Bio", "Fair Trade", "Made in CI", "Halal"].map((cert) => {
                        const selected = formData.ficheTechnique.certifications.some(c => c.name === cert);
                        return (
                          <Badge
                            key={cert}
                            variant={selected ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              const certs = selected
                                ? formData.ficheTechnique.certifications.filter(c => c.name !== cert)
                                : [...formData.ficheTechnique.certifications, { name: cert }];
                              updateForm("ficheTechnique", { ...formData.ficheTechnique, certifications: certs });
                            }}
                          >
                            {selected && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {cert}
                          </Badge>
                        );
                      })}
                    </div>
                    {/* Certificat (fichier) par certification sélectionnée */}
                    {formData.ficheTechnique.certifications.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {formData.ficheTechnique.certifications.map((c, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm border rounded-md px-2 py-1.5">
                            <span className="flex-1 font-medium">{c.name}</span>
                            {c.file || c.url ? (
                              <span className="flex items-center gap-1.5 text-xs text-green-600">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {c.file ? "Fichier ajouté" : "Document existant"}
                                <button type="button" onClick={() => setCertFile(index, undefined)}>
                                  <X className="w-3.5 h-3.5 text-destructive" />
                                </button>
                              </span>
                            ) : (
                              <label className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                                  className="hidden"
                                  onChange={(e) => setCertFile(index, e.target.files?.[0])}
                                />
                                <Upload className="w-3.5 h-3.5" /> Joindre le certificat
                              </label>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Documents */}
                  <div className="space-y-2">
                    <Label>Documents techniques</Label>
                    {(editInitialData?.technicalDocuments ?? []).length > 0 && (
                      <div className="space-y-1.5">
                        {editInitialData!.technicalDocuments!.map((d, i) => (
                          <a
                            key={i}
                            href={d.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm border rounded-md px-2 py-1.5 bg-muted/40 hover:bg-muted"
                          >
                            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="truncate flex-1">{d.name}</span>
                            <span className="text-xs text-green-600">Enregistré</span>
                          </a>
                        ))}
                      </div>
                    )}
                    <FileUploadZone
                      hint="PDF, schémas, plans, notices..."
                      accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"
                      files={formData.technicalDocs}
                      onChange={(f) => updateForm("technicalDocs", f)}
                    />
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Variantes & Prix par quantité
            </h3>

            {/* Variantes de produit */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Variantes du produit</CardTitle>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="enableVariantes"
                      checked={formData.variantes.enabled}
                      onCheckedChange={(checked) => 
                        updateForm("variantes", { ...formData.variantes, enabled: !!checked })
                      }
                    />
                    <Label htmlFor="enableVariantes" className="text-sm font-normal">
                      Activer les variantes
                    </Label>
                  </div>
                </div>
                <CardDescription>
                  Créez des déclinaisons (taille, couleur, format...)
                </CardDescription>
              </CardHeader>
              {formData.variantes.enabled && (
                <CardContent className="space-y-4">
                  {/* Attributs */}
                  <div className="space-y-3">
                    <Label>Attributs de variation</Label>
                    {formData.variantes.attributs.map((attr, index) => (
                      <div key={index} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Nom (ex: Taille, Couleur)"
                            value={attr.nom}
                            onChange={(e) => {
                              const attrs = [...formData.variantes.attributs];
                              attrs[index] = { ...attrs[index], nom: e.target.value };
                              updateForm("variantes", { ...formData.variantes, attributs: attrs });
                            }}
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const attrs = formData.variantes.attributs.filter((_, i) => i !== index);
                              updateForm("variantes", { ...formData.variantes, attributs: attrs });
                            }}
                          >
                            <X className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {attr.valeurs.map((val, vIndex) => (
                            <Badge key={vIndex} variant="secondary" className="gap-1">
                              {val}
                              <X 
                                className="w-3 h-3 cursor-pointer" 
                                onClick={() => {
                                  const attrs = [...formData.variantes.attributs];
                                  attrs[index].valeurs = attrs[index].valeurs.filter((_, vi) => vi !== vIndex);
                                  updateForm("variantes", { ...formData.variantes, attributs: attrs });
                                }}
                              />
                            </Badge>
                          ))}
                          <Input
                            placeholder="+ Ajouter valeur"
                            className="w-32 h-6 text-xs"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && e.currentTarget.value) {
                                const attrs = [...formData.variantes.attributs];
                                attrs[index].valeurs = [...attrs[index].valeurs, e.currentTarget.value];
                                updateForm("variantes", { ...formData.variantes, attributs: attrs });
                                e.currentTarget.value = "";
                              }
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const attrs = [...formData.variantes.attributs, { nom: "", valeurs: [] }];
                        updateForm("variantes", { ...formData.variantes, attributs: attrs });
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Ajouter un attribut
                    </Button>
                  </div>

                  {/* Options générées */}
                  {formData.variantes.attributs.length > 0 && formData.variantes.attributs.some(a => a.valeurs.length > 0) && (
                    <div className="space-y-3 border-t pt-4">
                      <Label>Prix et stock par variante</Label>
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {formData.variantes.options.map((opt, index) => (
                          <div key={index} className="grid grid-cols-12 gap-2 items-center text-sm">
                            <span className="col-span-4 font-medium">{opt.combinaison}</span>
                            <Input
                              className="col-span-3"
                              placeholder="Prix"
                              type="number"
                              value={opt.prix}
                              onChange={(e) => {
                                const opts = [...formData.variantes.options];
                                opts[index] = { ...opts[index], prix: e.target.value };
                                updateForm("variantes", { ...formData.variantes, options: opts });
                              }}
                            />
                            <Input
                              className="col-span-2"
                              placeholder="Stock"
                              type="number"
                              value={opt.stock}
                              onChange={(e) => {
                                const opts = [...formData.variantes.options];
                                opts[index] = { ...opts[index], stock: e.target.value };
                                updateForm("variantes", { ...formData.variantes, options: opts });
                              }}
                            />
                            <Input
                              className="col-span-3"
                              placeholder="SKU"
                              value={opt.sku}
                              onChange={(e) => {
                                const opts = [...formData.variantes.options];
                                opts[index] = { ...opts[index], sku: e.target.value };
                                updateForm("variantes", { ...formData.variantes, options: opts });
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          // Générer les combinaisons
                          const attrs = formData.variantes.attributs.filter(a => a.valeurs.length > 0);
                          if (attrs.length === 0) return;
                          
                          const combinations: string[] = [];
                          const generateCombos = (current: string, attrIndex: number) => {
                            if (attrIndex >= attrs.length) {
                              combinations.push(current);
                              return;
                            }
                            for (const val of attrs[attrIndex].valeurs) {
                              generateCombos(current ? `${current} / ${val}` : val, attrIndex + 1);
                            }
                          };
                          generateCombos("", 0);
                          
                          const options = combinations.map(c => ({
                            combinaison: c,
                            prix: formData.prix,
                            stock: "",
                            sku: ""
                          }));
                          updateForm("variantes", { ...formData.variantes, options });
                        }}
                      >
                        Générer les variantes
                      </Button>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Prix par quantité */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Percent className="w-4 h-4" />
                    Prix dégressifs par quantité
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="enablePrixQuantite"
                      checked={formData.prixQuantite.enabled}
                      onCheckedChange={(checked) => 
                        updateForm("prixQuantite", { ...formData.prixQuantite, enabled: !!checked })
                      }
                    />
                    <Label htmlFor="enablePrixQuantite" className="text-sm font-normal">
                      Activer
                    </Label>
                  </div>
                </div>
                <CardDescription>
                  Offrez des réductions pour les achats en volume
                </CardDescription>
              </CardHeader>
              {formData.prixQuantite.enabled && (
                <CardContent className="space-y-3">
                  {formData.prixQuantite.paliers.map((palier, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-3">
                        <Label className="text-xs text-muted-foreground">De</Label>
                        <Input
                          type="number"
                          placeholder="Min"
                          value={palier.quantiteMin}
                          onChange={(e) => {
                            const paliers = [...formData.prixQuantite.paliers];
                            paliers[index] = { ...paliers[index], quantiteMin: e.target.value };
                            updateForm("prixQuantite", { ...formData.prixQuantite, paliers });
                          }}
                        />
                      </div>
                      <div className="col-span-3">
                        <Label className="text-xs text-muted-foreground">À</Label>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={palier.quantiteMax}
                          onChange={(e) => {
                            const paliers = [...formData.prixQuantite.paliers];
                            paliers[index] = { ...paliers[index], quantiteMax: e.target.value };
                            updateForm("prixQuantite", { ...formData.prixQuantite, paliers });
                          }}
                        />
                      </div>
                      <div className="col-span-3">
                        <Label className="text-xs text-muted-foreground">Prix unitaire</Label>
                        <Input
                          type="number"
                          placeholder="FCFA"
                          value={palier.prix}
                          onChange={(e) => {
                            const paliers = [...formData.prixQuantite.paliers];
                            paliers[index] = { ...paliers[index], prix: e.target.value };
                            updateForm("prixQuantite", { ...formData.prixQuantite, paliers });
                          }}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs text-muted-foreground">Réduction</Label>
                        <Input
                          placeholder="%"
                          value={palier.reduction}
                          onChange={(e) => {
                            const paliers = [...formData.prixQuantite.paliers];
                            paliers[index] = { ...paliers[index], reduction: e.target.value };
                            updateForm("prixQuantite", { ...formData.prixQuantite, paliers });
                          }}
                        />
                      </div>
                      <div className="col-span-1 pt-5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const paliers = formData.prixQuantite.paliers.filter((_, i) => i !== index);
                            updateForm("prixQuantite", { ...formData.prixQuantite, paliers });
                          }}
                        >
                          <X className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const paliers = [...formData.prixQuantite.paliers, { quantiteMin: "", quantiteMax: "", prix: "", reduction: "" }];
                      updateForm("prixQuantite", { ...formData.prixQuantite, paliers });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter un palier
                  </Button>
                </CardContent>
              )}
            </Card>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Mise en vedette & Commission
            </h3>
            
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Booster votre produit</CardTitle>
                <CardDescription>
                  Augmentez la visibilité de votre produit avec nos options premium
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Option Vedette */}
                  <Card 
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      formData.miseEnVedette.type === "vedette" && "ring-2 ring-primary"
                    )}
                    onClick={() => updateForm("miseEnVedette", { ...formData.miseEnVedette, enabled: true, type: "vedette" })}
                  >
                    <CardContent className="p-4 text-center">
                      <Star className="w-10 h-10 mx-auto mb-2 text-amber-500" />
                      <h4 className="font-semibold">Vedette</h4>
                      <p className="text-xs text-muted-foreground mb-2">Page d'accueil catégorie</p>
                      <Badge className="bg-amber-500">5% commission</Badge>
                      <p className="text-lg font-bold text-primary mt-2">15 000 FCFA/sem</p>
                    </CardContent>
                  </Card>

                  {/* Option Spécial */}
                  <Card 
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      formData.miseEnVedette.type === "special" && "ring-2 ring-secondary"
                    )}
                    onClick={() => updateForm("miseEnVedette", { ...formData.miseEnVedette, enabled: true, type: "special" })}
                  >
                    <CardContent className="p-4 text-center">
                      <Sparkles className="w-10 h-10 mx-auto mb-2 text-purple-500" />
                      <h4 className="font-semibold">Offre Spéciale</h4>
                      <p className="text-xs text-muted-foreground mb-2">Bannière promo + newsletter</p>
                      <Badge className="bg-purple-500">8% commission</Badge>
                      <p className="text-lg font-bold text-primary mt-2">35 000 FCFA/sem</p>
                    </CardContent>
                  </Card>

                  {/* Option Premium */}
                  <Card 
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md border-2",
                      formData.miseEnVedette.type === "premium" && "ring-2 ring-primary border-primary"
                    )}
                    onClick={() => updateForm("miseEnVedette", { ...formData.miseEnVedette, enabled: true, type: "premium" })}
                  >
                    <CardContent className="p-4 text-center relative">
                      <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-secondary">
                        Populaire
                      </Badge>
                      <Crown className="w-10 h-10 mx-auto mb-2 text-primary" />
                      <h4 className="font-semibold">Premium</h4>
                      <p className="text-xs text-muted-foreground mb-2">Top résultats + toutes options</p>
                      <Badge className="bg-primary">12% commission</Badge>
                      <p className="text-lg font-bold text-primary mt-2">75 000 FCFA/sem</p>
                    </CardContent>
                  </Card>
                </div>

                {formData.miseEnVedette.enabled && formData.miseEnVedette.type && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="space-y-2">
                      <Label>Durée de mise en vedette</Label>
                      <Select
                        value={formData.miseEnVedette.duree}
                        onValueChange={(v) => updateForm("miseEnVedette", { ...formData.miseEnVedette, duree: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">1 semaine</SelectItem>
                          <SelectItem value="14">2 semaines</SelectItem>
                          <SelectItem value="30">1 mois (-10%)</SelectItem>
                          <SelectItem value="90">3 mois (-20%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="p-4 rounded-lg bg-muted">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Frais de mise en vedette</span>
                        <span className="font-medium">
                          {formData.miseEnVedette.type === "vedette" && "15 000"}
                          {formData.miseEnVedette.type === "special" && "35 000"}
                          {formData.miseEnVedette.type === "premium" && "75 000"}
                          {" FCFA/sem"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Commission sur ventes</span>
                        <span className="font-medium">
                          {formData.miseEnVedette.type === "vedette" && "5%"}
                          {formData.miseEnVedette.type === "special" && "8%"}
                          {formData.miseEnVedette.type === "premium" && "12%"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-bold border-t pt-2">
                        <span>Total estimé ({formData.miseEnVedette.duree} jours)</span>
                        <span className="text-primary">
                          {(() => {
                            const weeks = parseInt(formData.miseEnVedette.duree) / 7;
                            let base = 0;
                            if (formData.miseEnVedette.type === "vedette") base = 15000;
                            if (formData.miseEnVedette.type === "special") base = 35000;
                            if (formData.miseEnVedette.type === "premium") base = 75000;
                            let discount = 1;
                            if (formData.miseEnVedette.duree === "30") discount = 0.9;
                            if (formData.miseEnVedette.duree === "90") discount = 0.8;
                            return (base * weeks * discount).toLocaleString();
                          })()}
                          {" FCFA"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="acceptCommission"
                        checked={formData.miseEnVedette.acceptCommission}
                        onCheckedChange={(checked) => updateForm("miseEnVedette", { ...formData.miseEnVedette, acceptCommission: !!checked })}
                      />
                      <div className="space-y-1">
                        <Label htmlFor="acceptCommission" className="text-sm font-normal">
                          J'accepte les conditions de commission
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          La commission sera prélevée automatiquement sur chaque vente pendant la période de mise en vedette.
                          <br />
                          <a href="#" className="text-primary underline">Voir les conditions générales</a>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!formData.miseEnVedette.enabled && (
                  <div className="text-center p-4 text-muted-foreground">
                    <p className="text-sm">Sélectionnez une option pour booster votre produit, ou passez à l'étape suivante pour une publication standard.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Récapitulatif</h3>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{formData.nom || "Nom du produit"}</h4>
                    <p className="text-sm text-muted-foreground">{formData.categorie || "Catégorie"}</p>
                    <p className="text-xl font-bold text-primary mt-1">
                      {formData.prix ? `${parseInt(formData.prix).toLocaleString()} FCFA` : "Prix non défini"} 
                      <span className="text-sm font-normal text-muted-foreground">/{formData.unite || "unité"}</span>
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium capitalize">{formData.type || "-"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">MOQ</span>
                    <span className="font-medium">{formData.moq}</span>
                  </div>
                  {formData.stock && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Stock</span>
                      <span className="font-medium">{formData.stock}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Zones livraison</span>
                    <span className="font-medium">{formData.zonesLivraison.length || 0} zones</span>
                  </div>
                  {formData.variantes.enabled && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Variantes</span>
                      <span className="font-medium">{formData.variantes.options.length} combinaisons</span>
                    </div>
                  )}
                  {formData.prixQuantite.enabled && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Paliers de prix</span>
                      <span className="font-medium">{formData.prixQuantite.paliers.length} paliers</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 flex flex-wrap gap-2">
                  {formData.produitReglemente && (
                    <Badge variant="outline" className="text-amber-600 border-amber-600">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Produit réglementé
                    </Badge>
                  )}
                  {formData.madeInCI && (
                    <Badge className="bg-primary text-primary-foreground">
                      <Award className="w-3 h-3 mr-1" />
                      Made in CI - {formData.badgeMadeInCI}
                    </Badge>
                  )}
                  {formData.miseEnVedette.enabled && formData.miseEnVedette.type && (
                    <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                      {formData.miseEnVedette.type === "vedette" && <Star className="w-3 h-3 mr-1" />}
                      {formData.miseEnVedette.type === "special" && <Sparkles className="w-3 h-3 mr-1" />}
                      {formData.miseEnVedette.type === "premium" && <Crown className="w-3 h-3 mr-1" />}
                      {formData.miseEnVedette.type.charAt(0).toUpperCase() + formData.miseEnVedette.type.slice(1)}
                    </Badge>
                  )}
                </div>

                {formData.miseEnVedette.enabled && formData.miseEnVedette.type && (
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                    <p className="text-sm flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <span>
                        Commission: {formData.miseEnVedette.type === "vedette" && "5%"}
                        {formData.miseEnVedette.type === "special" && "8%"}
                        {formData.miseEnVedette.type === "premium" && "12%"} sur chaque vente
                      </span>
                    </p>
                  </div>
                )}

                {formData.produitReglemente && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <p className="text-sm text-amber-700 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      En attente de validation des documents réglementaires
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex items-center gap-2 p-4 rounded-lg bg-muted">
              <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Votre offre sera soumise à modération avant publication
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            {isEditMode ? "Modifier le produit" : "Nouveau produit / service"}
          </DialogTitle>
          <DialogDescription>
            Étape {step} sur {totalSteps}
          </DialogDescription>
        </DialogHeader>

        <Progress value={progress} className="h-2" />

        {submitError && (
          <div className="px-1 py-2 rounded-lg border border-red-500/30 bg-red-500/5 text-red-600 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {submitError}
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-4">
          {renderStep()}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              if (step === 1) {
                onOpenChange(false);
              } else {
                setStep(step - 1);
              }
            }}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {step === 1 ? "Annuler" : "Précédent"}
          </Button>

          {step < totalSteps ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !productType}
            >
              Suivant
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              <CheckCircle2 className="w-4 h-4 mr-1" />
              {isSubmitting
                ? (isEditMode ? "Enregistrement..." : "Soumission...")
                : (isEditMode ? "Enregistrer les modifications" : "Soumettre pour modération")}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
