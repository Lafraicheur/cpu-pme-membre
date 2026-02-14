import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Building2, 
  Search, 
  Upload, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Check,
  MapPin,
  Users,
  Briefcase,
  Calendar,
  AlertCircle,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type WizardMode = "declare" | "change";

interface Organization {
  id: string;
  name: string;
  type: "cooperative" | "federation" | "association";
  sector: string;
  region: string;
  memberCount: number;
}

interface AffiliationWizardProps {
  mode: WizardMode;
  onComplete: () => void;
  onCancel: () => void;
  currentOrganization?: Organization;
}

const mockOrganizations: Organization[] = [
  { id: "org-1", name: "Coopérative Agricole du Sud", type: "cooperative", sector: "Agriculture", region: "Abidjan", memberCount: 156 },
  { id: "org-2", name: "Fédération des Industries Ivoiriennes", type: "federation", sector: "Industrie", region: "Abidjan", memberCount: 342 },
  { id: "org-3", name: "Association des Exportateurs", type: "association", sector: "Commerce International", region: "National", memberCount: 89 },
  { id: "org-4", name: "Coopérative du Café-Cacao", type: "cooperative", sector: "Agriculture", region: "San-Pédro", memberCount: 523 },
  { id: "org-5", name: "Fédération du Commerce", type: "federation", sector: "Commerce", region: "Bouaké", memberCount: 178 },
];

const sectors = [
  "Agriculture",
  "Agroalimentaire",
  "Industrie",
  "Commerce",
  "Commerce International",
  "Services",
  "Technologies",
  "Construction",
  "Transport",
  "Énergie",
];

const regions = [
  "Abidjan",
  "Yamoussoukro",
  "Bouaké",
  "San-Pédro",
  "Daloa",
  "Korhogo",
  "National",
];

const roles = [
  "Membre",
  "Membre fondateur",
  "Partenaire",
  "Membre associé",
];

export function AffiliationWizard({ mode, onComplete, onCancel, currentOrganization }: AffiliationWizardProps) {
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [selectedRole, setSelectedRole] = useState("Membre");
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [changeReason, setChangeReason] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [endCurrentAffiliation, setEndCurrentAffiliation] = useState(true);
  const [consents, setConsents] = useState({
    dataSharing: false,
    termsAccepted: false,
  });

  const totalSteps = mode === "change" ? 4 : 3;
  const progress = (step / totalSteps) * 100;

  const filteredOrganizations = mockOrganizations.filter((org) => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || org.type === selectedType;
    const matchesSector = !selectedSector || org.sector === selectedSector;
    const matchesRegion = !selectedRegion || org.region === selectedRegion;
    return matchesSearch && matchesType && matchesSector && matchesRegion;
  });

  const handleFileUpload = () => {
    // Simulated file upload
    setUploadedFiles([...uploadedFiles, `document_${uploadedFiles.length + 1}.pdf`]);
    toast.success("Document téléversé avec succès");
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles(uploadedFiles.filter((f) => f !== fileName));
  };

  const handleSubmit = () => {
    if (!consents.dataSharing || !consents.termsAccepted) {
      toast.error("Veuillez accepter les conditions requises");
      return;
    }
    toast.success(
      mode === "declare" 
        ? "Demande d'affiliation envoyée avec succès" 
        : "Demande de changement d'affiliation envoyée"
    );
    onComplete();
  };

  const handleSaveDraft = () => {
    toast.success("Brouillon enregistré");
  };

  const toggleSector = (sector: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
    );
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedOrg !== null;
      case 2:
        return selectedRole && selectedSectors.length > 0;
      case 3:
        if (mode === "change") {
          return changeReason.trim().length > 0;
        }
        return consents.dataSharing && consents.termsAccepted;
      case 4:
        return consents.dataSharing && consents.termsAccepted;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {mode === "declare" ? "Déclarer une affiliation" : "Demander un changement d'affiliation"}
          </h2>
          <p className="text-muted-foreground">
            {mode === "declare" 
              ? "Rattachez votre entreprise à une organisation collective"
              : "Modifiez votre affiliation actuelle"
            }
          </p>
        </div>
        <Button variant="ghost" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Étape {step} sur {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {/* Step 1: Select Organization */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {mode === "change" ? "Nouvelle organisation" : "Sélectionner une organisation"}
                </h3>

                {/* Search & Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher une organisation..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cooperative">Coopérative</SelectItem>
                      <SelectItem value="federation">Fédération</SelectItem>
                      <SelectItem value="association">Association</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedSector} onValueChange={setSelectedSector}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filière" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map((sector) => (
                        <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Organizations List */}
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {filteredOrganizations.map((org) => (
                    <div
                      key={org.id}
                      onClick={() => setSelectedOrg(org)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all",
                        selectedOrg?.id === org.id
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50 hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{org.name}</p>
                          <div className="flex gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {org.type === "cooperative" ? "Coopérative" : 
                               org.type === "federation" ? "Fédération" : "Association"}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {org.region}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {org.memberCount} membres
                            </span>
                          </div>
                        </div>
                      </div>
                      {selectedOrg?.id === org.id && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  ))}

                  {filteredOrganizations.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucune organisation trouvée</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Details & Documents */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Détails de l'affiliation</h3>

              {/* Selected Organization Summary */}
              {selectedOrg && (
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <Building2 className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{selectedOrg.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrg.sector} • {selectedOrg.region}</p>
                  </div>
                </div>
              )}

              {/* Role Selection */}
              <div className="space-y-2">
                <Label>Rôle dans l'organisation</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sectors Selection */}
              <div className="space-y-2">
                <Label>Filière(s) concernée(s)</Label>
                <div className="flex flex-wrap gap-2">
                  {sectors.map((sector) => (
                    <Badge
                      key={sector}
                      variant={selectedSectors.includes(sector) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleSector(sector)}
                    >
                      {sector}
                      {selectedSectors.includes(sector) && (
                        <Check className="ml-1 h-3 w-3" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Region */}
              <div className="space-y-2">
                <Label>Région de rattachement</Label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une région" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Document Upload */}
              <div className="space-y-2">
                <Label>Justificatifs (optionnel)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Attestation d'adhésion, reçu, lettre...
                  </p>
                  <Button variant="outline" size="sm" onClick={handleFileUpload}>
                    <Upload className="mr-2 h-4 w-4" />
                    Téléverser un document
                  </Button>
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {uploadedFiles.map((file) => (
                      <div key={file} className="flex items-center justify-between p-2 rounded bg-muted">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-sm">{file}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeFile(file)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3 (Change mode): Reason & Date */}
          {step === 3 && mode === "change" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Motif du changement</h3>

              {/* Current vs New */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Affiliation actuelle</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{currentOrganization?.name || "Coopérative Agricole du Sud"}</p>
                  </CardContent>
                </Card>
                <Card className="border-primary">
                  <CardHeader className="pb-2">
                    <CardDescription>Nouvelle affiliation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{selectedOrg?.name}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label>Motif du changement (obligatoire)</Label>
                <Textarea
                  placeholder="Expliquez la raison de ce changement d'affiliation..."
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Effective Date */}
              <div className="space-y-2">
                <Label>Date d'effet</Label>
                <Input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                />
              </div>

              {/* End Current Affiliation */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="endCurrent"
                  checked={endCurrentAffiliation}
                  onCheckedChange={(checked) => setEndCurrentAffiliation(checked as boolean)}
                />
                <Label htmlFor="endCurrent" className="font-normal">
                  Mettre fin à l'affiliation actuelle à la date d'effet
                </Label>
              </div>
            </div>
          )}

          {/* Final Step: Consents */}
          {((step === 3 && mode === "declare") || (step === 4 && mode === "change")) && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Confirmation et consentements</h3>

              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Récapitulatif de votre demande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Organisation</span>
                    <span className="font-medium">{selectedOrg?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">
                      {selectedOrg?.type === "cooperative" ? "Coopérative" : 
                       selectedOrg?.type === "federation" ? "Fédération" : "Association"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rôle</span>
                    <span className="font-medium">{selectedRole}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Filière(s)</span>
                    <span className="font-medium">{selectedSectors.join(", ") || "Non spécifié"}</span>
                  </div>
                  {mode === "change" && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date d'effet</span>
                      <span className="font-medium">
                        {effectiveDate ? new Date(effectiveDate).toLocaleDateString("fr-FR") : "Immédiate"}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Consents */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 rounded-lg border">
                  <Checkbox
                    id="dataSharing"
                    checked={consents.dataSharing}
                    onCheckedChange={(checked) => 
                      setConsents({ ...consents, dataSharing: checked as boolean })
                    }
                  />
                  <div>
                    <Label htmlFor="dataSharing" className="font-medium cursor-pointer">
                      Partage de données
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      J'accepte le partage des données de base de mon entreprise avec l'organisation 
                      (profil public, statistiques pour reporting filière).
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-lg border">
                  <Checkbox
                    id="terms"
                    checked={consents.termsAccepted}
                    onCheckedChange={(checked) => 
                      setConsents({ ...consents, termsAccepted: checked as boolean })
                    }
                  />
                  <div>
                    <Label htmlFor="terms" className="font-medium cursor-pointer">
                      Conditions générales
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      J'ai lu et j'accepte les conditions générales d'affiliation et la politique de 
                      confidentialité de CPU-PME.
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Alert */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Prochaine étape</p>
                  <p>
                    Votre demande sera transmise à l'organisation pour confirmation. 
                    Vous serez notifié par email de leur décision.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <div>
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Précédent
            </Button>
          ) : (
            <Button variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft}>
            Enregistrer brouillon
          </Button>
          {step < totalSteps ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
              Suivant
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canProceed()}>
              <Check className="mr-2 h-4 w-4" />
              Envoyer la demande
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
