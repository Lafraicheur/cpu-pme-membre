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
  Upload,
  X,
  Download,
  Eye,
  Edit2,
  Trash2,
  Copy,
  Image as ImageIcon,
  File,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TechnicalSpec {
  label: string;
  value: string;
  unit?: string;
}

interface TechnicalSheet {
  id: string;
  productId: string;
  productName: string;
  version: string;
  status: "draft" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
  specifications: TechnicalSpec[];
  certifications: string[];
  documents: { name: string; type: string; url: string }[];
  images: string[];
}

interface FicheTechniqueProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId?: string;
  productName?: string;
  existingSheet?: TechnicalSheet;
}

const mockSpecTemplates = {
  produit_alimentaire: [
    { label: "Composition", value: "", unit: "" },
    { label: "Valeur énergétique", value: "", unit: "kcal/100g" },
    { label: "Protéines", value: "", unit: "g/100g" },
    { label: "Glucides", value: "", unit: "g/100g" },
    { label: "Lipides", value: "", unit: "g/100g" },
    { label: "Allergènes", value: "", unit: "" },
    { label: "Conservation", value: "", unit: "" },
    { label: "DLC/DDM", value: "", unit: "jours" },
  ],
  produit_industriel: [
    { label: "Dimensions", value: "", unit: "mm" },
    { label: "Poids", value: "", unit: "kg" },
    { label: "Matériau", value: "", unit: "" },
    { label: "Couleur", value: "", unit: "" },
    { label: "Capacité", value: "", unit: "" },
    { label: "Tension", value: "", unit: "V" },
    { label: "Puissance", value: "", unit: "W" },
  ],
  textile: [
    { label: "Composition", value: "", unit: "%" },
    { label: "Tailles disponibles", value: "", unit: "" },
    { label: "Couleurs disponibles", value: "", unit: "" },
    { label: "Entretien", value: "", unit: "" },
    { label: "Pays de fabrication", value: "", unit: "" },
  ],
  service: [
    { label: "Durée prestation", value: "", unit: "" },
    { label: "Nombre participants max", value: "", unit: "" },
    { label: "Prérequis", value: "", unit: "" },
    { label: "Livrables", value: "", unit: "" },
    { label: "Garantie", value: "", unit: "" },
  ],
};

const certificationOptions = [
  "ISO 9001",
  "ISO 14001",
  "HACCP",
  "CE",
  "NF",
  "Bio",
  "Fair Trade",
  "Made in CI",
  "Halal",
  "Kasher",
];

export function FicheTechnique({ 
  open, 
  onOpenChange, 
  productId, 
  productName,
  existingSheet 
}: FicheTechniqueProps) {
  const [template, setTemplate] = useState<string>("");
  const [specifications, setSpecifications] = useState<TechnicalSpec[]>(
    existingSheet?.specifications || []
  );
  const [certifications, setCertifications] = useState<string[]>(
    existingSheet?.certifications || []
  );
  const [documents, setDocuments] = useState<{ name: string; type: string }[]>([]);
  const [description, setDescription] = useState("");
  const [newSpec, setNewSpec] = useState({ label: "", value: "", unit: "" });

  const handleTemplateChange = (templateKey: string) => {
    setTemplate(templateKey);
    const templateSpecs = mockSpecTemplates[templateKey as keyof typeof mockSpecTemplates] || [];
    setSpecifications(templateSpecs);
  };

  const addSpecification = () => {
    if (newSpec.label.trim()) {
      setSpecifications([...specifications, { ...newSpec }]);
      setNewSpec({ label: "", value: "", unit: "" });
    }
  };

  const updateSpecification = (index: number, field: keyof TechnicalSpec, value: string) => {
    const updated = [...specifications];
    updated[index] = { ...updated[index], [field]: value };
    setSpecifications(updated);
  };

  const removeSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const toggleCertification = (cert: string) => {
    if (certifications.includes(cert)) {
      setCertifications(certifications.filter(c => c !== cert));
    } else {
      setCertifications([...certifications, cert]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Fiche technique
          </DialogTitle>
          <DialogDescription>
            {productName || "Nouveau produit"} - Spécifications et certifications
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Template de départ */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Modèle de base</CardTitle>
              <CardDescription>Choisissez un modèle pour préremplir les champs</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={template} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un modèle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="produit_alimentaire">Produit alimentaire</SelectItem>
                  <SelectItem value="produit_industriel">Produit industriel</SelectItem>
                  <SelectItem value="textile">Textile / Habillement</SelectItem>
                  <SelectItem value="service">Service / Prestation</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Description générale */}
          <div className="space-y-2">
            <Label>Description technique</Label>
            <Textarea
              placeholder="Description détaillée du produit, de ses caractéristiques et usages..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Spécifications */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Spécifications techniques</CardTitle>
                <Badge variant="secondary">{specifications.length} champ(s)</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {specifications.map((spec, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <Input
                    className="col-span-4"
                    placeholder="Caractéristique"
                    value={spec.label}
                    onChange={(e) => updateSpecification(index, "label", e.target.value)}
                  />
                  <Input
                    className="col-span-5"
                    placeholder="Valeur"
                    value={spec.value}
                    onChange={(e) => updateSpecification(index, "value", e.target.value)}
                  />
                  <Input
                    className="col-span-2"
                    placeholder="Unité"
                    value={spec.unit || ""}
                    onChange={(e) => updateSpecification(index, "unit", e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="col-span-1"
                    onClick={() => removeSpecification(index)}
                  >
                    <X className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}

              {/* Ajouter une spécification */}
              <div className="grid grid-cols-12 gap-2 items-center pt-2 border-t">
                <Input
                  className="col-span-4"
                  placeholder="Nouvelle caractéristique"
                  value={newSpec.label}
                  onChange={(e) => setNewSpec({ ...newSpec, label: e.target.value })}
                />
                <Input
                  className="col-span-5"
                  placeholder="Valeur"
                  value={newSpec.value}
                  onChange={(e) => setNewSpec({ ...newSpec, value: e.target.value })}
                />
                <Input
                  className="col-span-2"
                  placeholder="Unité"
                  value={newSpec.unit}
                  onChange={(e) => setNewSpec({ ...newSpec, unit: e.target.value })}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="col-span-1"
                  onClick={addSpecification}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Certifications & Labels</CardTitle>
              <CardDescription>Sélectionnez les certifications applicables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {certificationOptions.map((cert) => (
                  <Badge
                    key={cert}
                    variant={certifications.includes(cert) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleCertification(cert)}
                  >
                    {certifications.includes(cert) && (
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                    )}
                    {cert}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Documents techniques */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Documents techniques</CardTitle>
              <CardDescription>PDF, images, schémas, plans...</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2">
                  Glissez vos fichiers ici ou cliquez pour parcourir
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, DOC, XLS, JPG, PNG (max 10 Mo)
                </p>
              </div>

              {documents.length > 0 && (
                <div className="space-y-2">
                  {documents.map((doc, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 border rounded">
                      <File className="w-5 h-5 text-muted-foreground" />
                      <span className="flex-1 text-sm">{doc.name}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Images techniques */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Images techniques</CardTitle>
              <CardDescription>Photos de détails, schémas cotés, vues éclatées...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">Ajouter</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-1" />
              Prévisualiser
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Enregistrer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
