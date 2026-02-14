import { useState } from "react";
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
import { getSectorN1List } from "@/data/sectors";
import { regions } from "@/data/regions";

type ProductStatus = "Draft" | "InModeration" | "Published" | "Rejected" | "NeedsChanges";

interface ProductWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: any) => void;
}

export function ProductWizard({ open, onOpenChange, onSubmit }: ProductWizardProps) {
  const [step, setStep] = useState(1);
  const [productType, setProductType] = useState<"product" | "service" | null>(null);
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
    documentsReglementaires: [] as string[],
    madeInCI: false,
    badgeMadeInCI: "",
    images: [] as string[],
    // Fiche technique
    ficheTechnique: {
      enabled: false,
      specifications: [] as { label: string; value: string; unit: string }[],
      certifications: [] as string[],
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

  const sectorsN1 = getSectorN1List();

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
                      {sectorsN1.map((sector, idx) => (
                        <SelectItem key={idx} value={sector.name}>{sector.name}</SelectItem>
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
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      {i === 1 ? (
                        <>
                          <Upload className="w-6 h-6 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground mt-1">Principal</span>
                        </>
                      ) : (
                        <Plus className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  ))}
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
                      <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                        <Upload className="w-6 h-6 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mt-1">
                          Uploader certificats, autorisations...
                        </p>
                      </div>
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
                        {[
                          { value: "or", label: "Or", desc: ">70% VA locale", color: "bg-primary" },
                          { value: "argent", label: "Argent", desc: ">50% VA locale", color: "bg-secondary" },
                          { value: "bronze", label: "Bronze", desc: ">30% VA locale", color: "bg-amber-600" },
                          { value: "innovation", label: "Innovation Ivoire", desc: "Innovation locale", color: "bg-cyan-500" },
                        ].map(badge => (
                          <div
                            key={badge.value}
                            className={cn(
                              "p-3 rounded-lg border cursor-pointer transition-all",
                              formData.badgeMadeInCI === badge.value && "ring-2 ring-primary"
                            )}
                            onClick={() => updateForm("badgeMadeInCI", badge.value)}
                          >
                            <Badge className={cn(badge.color, "text-white mb-1")}>
                              {badge.label}
                            </Badge>
                            <p className="text-xs text-muted-foreground">{badge.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Preuves (factures intrants, photos, etc.)</Label>
                      <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                        <Upload className="w-6 h-6 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mt-1">
                          Uploader les justificatifs
                        </p>
                      </div>
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
                      <div key={index} className="grid grid-cols-12 gap-2 items-center">
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
                      {["ISO 9001", "ISO 14001", "HACCP", "CE", "Bio", "Fair Trade", "Made in CI", "Halal"].map((cert) => (
                        <Badge
                          key={cert}
                          variant={formData.ficheTechnique.certifications.includes(cert) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const certs = formData.ficheTechnique.certifications.includes(cert)
                              ? formData.ficheTechnique.certifications.filter(c => c !== cert)
                              : [...formData.ficheTechnique.certifications, cert];
                            updateForm("ficheTechnique", { ...formData.ficheTechnique, certifications: certs });
                          }}
                        >
                          {formData.ficheTechnique.certifications.includes(cert) && (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                          )}
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="space-y-2">
                    <Label>Documents techniques</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                      <Upload className="w-6 h-6 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-1">
                        PDF, schémas, plans, notices...
                      </p>
                    </div>
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
            Nouveau produit / service
          </DialogTitle>
          <DialogDescription>
            Étape {step} sur {totalSteps}
          </DialogDescription>
        </DialogHeader>

        <Progress value={progress} className="h-2" />

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
            <Button onClick={() => {
              onSubmit?.(formData);
              onOpenChange(false);
            }}>
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Soumettre pour modération
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
