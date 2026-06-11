import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  Calendar,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  affiliationApi,
  type AffiliationOrganization,
  type AffiliationRequestPayload,
} from "@/lib/api";

type WizardMode = "declare" | "change";

interface AffiliationWizardProps {
  mode: WizardMode;
  onComplete: () => void;
  onCancel: () => void;
  currentOrganization?: AffiliationOrganization;
}

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

const roles = ["Membre", "Membre fondateur", "Partenaire", "Membre associé"];

export function AffiliationWizard({
  mode,
  onComplete,
  onCancel,
  currentOrganization,
}: AffiliationWizardProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedOrg, setSelectedOrg] = useState<AffiliationOrganization | null>(null);
  const [selectedRole, setSelectedRole] = useState("Membre");
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [changeReason, setChangeReason] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [endCurrentAffiliation, setEndCurrentAffiliation] = useState(true);
  const [consents, setConsents] = useState({
    dataSharing: false,
    termsAccepted: false,
  });

  const totalSteps = mode === "change" ? 4 : 3;
  const progress = (step / totalSteps) * 100;

  // "all" = pas de filtre
  const typeFilter = selectedType && selectedType !== "all" ? selectedType : undefined;
  const sectorFilter = selectedSector && selectedSector !== "all" ? selectedSector : undefined;
  const regionFilter = selectedRegion && selectedRegion !== "all" ? selectedRegion : undefined;

  // Chargement des organisations depuis l'API
  const { data: organizations = [], isLoading: orgsLoading } = useQuery({
    queryKey: ["affiliation", "organizations", { search: searchQuery, type: typeFilter, sector: sectorFilter, region: regionFilter }],
    queryFn: () =>
      affiliationApi.getOrganizations({
        search: searchQuery || undefined,
        type: typeFilter,
        sector: sectorFilter,
        region: regionFilter,
        limit: 20,
      }),
    staleTime: 5 * 60 * 1000,
    enabled: step === 1,
  });

  // Mutation pour soumettre ou enregistrer en brouillon
  const submitMutation = useMutation({
    mutationFn: async ({ saveAsDraft }: { saveAsDraft: boolean }) => {
      if (!selectedOrg?.id) throw new Error("Veuillez sélectionner une organisation");

      const payload: AffiliationRequestPayload = {
        requestType: mode,
        organizationId: selectedOrg.id,
        role: selectedRole || undefined,
        sectors: selectedSectors.length > 0 ? selectedSectors : undefined,
        region: selectedRegion || undefined,
        changeReason: mode === "change" ? changeReason : undefined,
        effectiveDate: effectiveDate || undefined,
        endCurrentAffiliation: mode === "change" ? endCurrentAffiliation : undefined,
        saveAsDraft,
        dataSharingConsent: saveAsDraft ? false : consents.dataSharing,
        termsAccepted: saveAsDraft ? false : consents.termsAccepted,
      };

      const created = await affiliationApi.createRequest(payload);

      // Upload des justificatifs après création
      if (uploadedFiles.length > 0 && created?.id) {
        for (const file of uploadedFiles) {
          await affiliationApi.uploadRequestDocument(created.id, file);
        }
      }

      return created;
    },
    onSuccess: (_, { saveAsDraft }) => {
      queryClient.invalidateQueries({ queryKey: ["affiliation", "me"] });
      queryClient.invalidateQueries({ queryKey: ["affiliation", "history"] });
      toast.success(
        saveAsDraft
          ? "Brouillon enregistré"
          : mode === "declare"
          ? "Demande d'affiliation envoyée avec succès"
          : "Demande de changement d'affiliation envoyée"
      );
      onComplete();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Erreur lors de l'envoi de la demande");
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploadedFiles((prev) => [...prev, ...files]);
    toast.success(`${files.length} fichier(s) ajouté(s)`);
    // Reset input pour permettre de re-sélectionner le même fichier
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!consents.dataSharing || !consents.termsAccepted) {
      toast.error("Veuillez accepter les conditions requises");
      return;
    }
    submitMutation.mutate({ saveAsDraft: false });
  };

  const handleSaveDraft = () => {
    submitMutation.mutate({ saveAsDraft: true });
  };

  const toggleSector = (sector: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
    );
  };

  const canProceed = () => {
    switch (step) {
      case 1: return selectedOrg !== null;
      case 2: return selectedRole && selectedSectors.length > 0;
      case 3:
        if (mode === "change") return changeReason.trim().length >= 10;
        return consents.dataSharing && consents.termsAccepted;
      case 4: return consents.dataSharing && consents.termsAccepted;
      default: return false;
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
              : "Modifiez votre affiliation actuelle"}
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
          {/* Step 1 : Sélectionner une organisation */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">
                {mode === "change" ? "Nouvelle organisation" : "Sélectionner une organisation"}
              </h3>

              {/* Recherche & Filtres */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    <SelectItem value="all">Tous</SelectItem>
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
                    <SelectItem value="all">Toutes</SelectItem>
                    {sectors.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Liste des organisations */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {orgsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
                      <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-64" />
                      </div>
                    </div>
                  ))
                ) : organizations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune organisation trouvée</p>
                  </div>
                ) : (
                  organizations.map((org) => (
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
                  ))
                )}
              </div>
            </div>
          )}

          {/* Step 2 : Détails & Documents */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Détails de l'affiliation</h3>

              {selectedOrg && (
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <Building2 className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{selectedOrg.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrg.sector} • {selectedOrg.region}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Rôle dans l'organisation</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                      {selectedSectors.includes(sector) && <Check className="ml-1 h-3 w-3" />}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Région de rattachement</Label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une région" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Upload documents */}
              <div className="space-y-2">
                <Label>Justificatifs (optionnel)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Attestation d'adhésion, reçu, lettre...
                  </p>
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Téléverser un document
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileSelect}
                  />
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {uploadedFiles.map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded bg-muted">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024).toFixed(0)} Ko)
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeFile(i)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3 (mode change) : Motif & Date */}
          {step === 3 && mode === "change" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Motif du changement</h3>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Affiliation actuelle</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{currentOrganization?.name ?? "Organisation actuelle"}</p>
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

              <div className="space-y-2">
                <Label>Motif du changement (obligatoire)</Label>
                <Textarea
                  placeholder="Expliquez la raison de ce changement d'affiliation..."
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  rows={4}
                />
                {changeReason.length > 0 && changeReason.length < 10 && (
                  <p className="text-xs text-destructive">Minimum 10 caractères</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Date d'effet</Label>
                <Input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                />
              </div>

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

          {/* Dernière étape : Consentements */}
          {((step === 3 && mode === "declare") || (step === 4 && mode === "change")) && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Confirmation et consentements</h3>

              <Card>
                <CardHeader>
                  <CardDescription className="font-medium text-foreground">Récapitulatif de votre demande</CardDescription>
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
                  {uploadedFiles.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Documents</span>
                      <span className="font-medium">{uploadedFiles.length} fichier(s)</span>
                    </div>
                  )}
                </CardContent>
              </Card>

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
            <Button variant="outline" onClick={() => setStep(step - 1)} disabled={submitMutation.isPending}>
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
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={submitMutation.isPending || !selectedOrg}
          >
            {submitMutation.isPending && submitMutation.variables?.saveAsDraft ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Enregistrer brouillon
          </Button>
          {step < totalSteps ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
              Suivant
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canProceed() || submitMutation.isPending}>
              {submitMutation.isPending && !submitMutation.variables?.saveAsDraft ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Envoyer la demande
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
