import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  FileText,
  Check,
  AlertCircle,
  Building2,
  DollarSign,
  Calendar,
  Clock,
  Send,
  Save,
  X,
  File,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AppelOffre {
  id: string;
  title: string;
  reference: string;
  organization: string;
  type: string;
  prestation: string;
  budgetMin?: number;
  budgetMax?: number;
  deadline: string;
}

interface SoumissionFormProps {
  ao: AppelOffre;
  onBack: () => void;
  onSubmit: () => void;
}

const steps = [
  { id: 1, title: "Informations", icon: Building2 },
  { id: 2, title: "Offre technique", icon: FileText },
  { id: 3, title: "Offre financière", icon: DollarSign },
  { id: 4, title: "Documents", icon: Upload },
  { id: 5, title: "Validation", icon: Check },
];

const requiredDocuments = [
  { id: "rccm", name: "RCCM", required: true },
  { id: "fiscal", name: "Attestation fiscale", required: true },
  { id: "cnps", name: "Attestation CNPS", required: true },
  { id: "references", name: "Références techniques", required: true },
  { id: "tech", name: "Offre technique", required: true },
  { id: "financial", name: "Offre financière", required: true },
  { id: "cv", name: "CV du personnel clé", required: false },
  { id: "certif", name: "Certifications", required: false },
];

export function SoumissionForm({ ao, onBack, onSubmit }: SoumissionFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    companyName: "SOGEPIE SARL",
    rccm: "CI-ABJ-2020-B-12345",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    // Step 2
    approach: "",
    methodology: "",
    planning: "",
    team: "",
    experience: "",
    // Step 3
    totalAmount: "",
    breakdown: "",
    validity: "90",
    paymentTerms: "",
    // Step 4
    documents: {} as Record<string, File | null>,
    // Step 5
    acceptTerms: false,
    confirmAccuracy: false,
  });

  const progress = (currentStep / steps.length) * 100;

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (docId: string, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      documents: { ...prev.documents, [docId]: file }
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSaveDraft = () => {
    toast.success("Brouillon enregistré");
  };

  const handleSubmit = () => {
    if (!formData.acceptTerms || !formData.confirmAccuracy) {
      toast.error("Veuillez accepter les conditions");
      return;
    }
    toast.success("Soumission envoyée avec succès !");
    onSubmit();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Soumettre une offre</h1>
          <p className="text-muted-foreground">{ao.title}</p>
        </div>
        <Button variant="outline" onClick={handleSaveDraft} className="gap-2">
          <Save className="w-4 h-4" />
          Sauvegarder
        </Button>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 transition-colors",
                      isCompleted && "cursor-pointer",
                      !isCompleted && !isCurrent && "opacity-50"
                    )}
                    disabled={step.id > currentStep}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                        isCompleted && "bg-secondary text-secondary-foreground",
                        isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                        !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={cn(
                      "text-xs font-medium hidden sm:block",
                      isCurrent && "text-primary"
                    )}>
                      {step.title}
                    </span>
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "h-0.5 w-12 mx-2 hidden sm:block",
                        currentStep > step.id ? "bg-secondary" : "bg-muted"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Informations */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Informations du soumissionnaire
                </CardTitle>
                <CardDescription>
                  Vérifiez et complétez les informations de votre entreprise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Raison sociale</Label>
                    <Input value={formData.companyName} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>N° RCCM</Label>
                    <Input value={formData.rccm} disabled className="bg-muted" />
                  </div>
                </div>
                <Separator />
                <h4 className="font-medium">Contact pour ce dossier</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom du contact *</Label>
                    <Input
                      placeholder="Prénom et Nom"
                      value={formData.contactName}
                      onChange={e => updateField("contactName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      placeholder="contact@entreprise.ci"
                      value={formData.contactEmail}
                      onChange={e => updateField("contactEmail", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Téléphone *</Label>
                    <Input
                      placeholder="+225 XX XX XX XX XX"
                      value={formData.contactPhone}
                      onChange={e => updateField("contactPhone", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Offre technique */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Offre technique
                </CardTitle>
                <CardDescription>
                  Présentez votre approche et méthodologie
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Compréhension du besoin *</Label>
                  <Textarea
                    placeholder="Décrivez votre compréhension du besoin et les enjeux..."
                    rows={4}
                    value={formData.approach}
                    onChange={e => updateField("approach", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Méthodologie proposée *</Label>
                  <Textarea
                    placeholder="Détaillez votre approche et méthodes de travail..."
                    rows={4}
                    value={formData.methodology}
                    onChange={e => updateField("methodology", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Planning prévisionnel *</Label>
                  <Textarea
                    placeholder="Présentez les phases et jalons du projet..."
                    rows={3}
                    value={formData.planning}
                    onChange={e => updateField("planning", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Équipe proposée</Label>
                  <Textarea
                    placeholder="Décrivez la composition de l'équipe..."
                    rows={3}
                    value={formData.team}
                    onChange={e => updateField("team", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Références similaires</Label>
                  <Textarea
                    placeholder="Listez vos expériences similaires..."
                    rows={3}
                    value={formData.experience}
                    onChange={e => updateField("experience", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Offre financière */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Offre financière
                </CardTitle>
                <CardDescription>
                  Détaillez votre proposition financière
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">Budget estimatif de l'AO</p>
                  {ao.budgetMin && ao.budgetMax ? (
                    <p className="text-lg font-bold text-primary">
                      {(ao.budgetMin / 1000000).toFixed(0)} - {(ao.budgetMax / 1000000).toFixed(0)} M FCFA
                    </p>
                  ) : (
                    <p className="text-muted-foreground">Non communiqué</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Montant total TTC (FCFA) *</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 65000000"
                    value={formData.totalAmount}
                    onChange={e => updateField("totalAmount", e.target.value)}
                  />
                  {formData.totalAmount && (
                    <p className="text-sm text-muted-foreground">
                      = {(parseInt(formData.totalAmount) / 1000000).toFixed(1)} M FCFA
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Décomposition du prix</Label>
                  <Textarea
                    placeholder="Détaillez les postes de coût (main d'œuvre, matériaux, équipements, etc.)..."
                    rows={4}
                    value={formData.breakdown}
                    onChange={e => updateField("breakdown", e.target.value)}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Durée de validité de l'offre (jours) *</Label>
                    <Input
                      type="number"
                      value={formData.validity}
                      onChange={e => updateField("validity", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Conditions de paiement souhaitées</Label>
                    <Input
                      placeholder="Ex: 30% - 40% - 30%"
                      value={formData.paymentTerms}
                      onChange={e => updateField("paymentTerms", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Documents */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Documents à joindre
                </CardTitle>
                <CardDescription>
                  Téléversez les documents requis pour votre soumission
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {requiredDocuments.map(doc => {
                  const file = formData.documents[doc.id];
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {doc.name}
                            {doc.required && (
                              <span className="text-primary ml-1">*</span>
                            )}
                          </p>
                          {file && (
                            <p className="text-sm text-muted-foreground">
                              {file.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {file ? (
                          <>
                            <Badge variant="outline" className="text-secondary">
                              <Check className="w-3 h-3 mr-1" />
                              Ajouté
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleFileChange(doc.id, null)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              className="hidden"
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) handleFileChange(doc.id, file);
                              }}
                            />
                            <Button variant="outline" size="sm" asChild>
                              <span className="gap-1">
                                <Upload className="w-4 h-4" />
                                Ajouter
                              </span>
                            </Button>
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Step 5: Validation */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  Validation et envoi
                </CardTitle>
                <CardDescription>
                  Vérifiez votre soumission avant envoi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary */}
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-3">Récapitulatif</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Appel d'offres</span>
                        <span className="font-medium">{ao.reference}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Montant proposé</span>
                        <span className="font-medium text-primary">
                          {formData.totalAmount
                            ? `${(parseInt(formData.totalAmount) / 1000000).toFixed(1)} M FCFA`
                            : "Non renseigné"
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Documents joints</span>
                        <span className="font-medium">
                          {Object.values(formData.documents).filter(Boolean).length} / {requiredDocuments.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        checked={formData.acceptTerms}
                        onCheckedChange={checked => updateField("acceptTerms", checked)}
                      />
                      <label htmlFor="terms" className="text-sm text-muted-foreground">
                        J'accepte les conditions générales de soumission et le règlement de consultation
                      </label>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="accuracy"
                        checked={formData.confirmAccuracy}
                        onCheckedChange={checked => updateField("confirmAccuracy", checked)}
                      />
                      <label htmlFor="accuracy" className="text-sm text-muted-foreground">
                        Je certifie l'exactitude des informations fournies et l'authenticité des documents joints
                      </label>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-primary">Important</p>
                        <p className="text-muted-foreground">
                          Une fois soumise, votre offre ne pourra plus être modifiée.
                          Assurez-vous que toutes les informations sont correctes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Précédent
            </Button>
            {currentStep < steps.length ? (
              <Button onClick={handleNext} className="gap-2">
                Suivant
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="gap-2"
                disabled={!formData.acceptTerms || !formData.confirmAccuracy}
              >
                <Send className="w-4 h-4" />
                Soumettre l'offre
              </Button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Appel d'offres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium text-sm line-clamp-2">{ao.title}</p>
                <p className="text-xs text-muted-foreground mt-1">Réf: {ao.reference}</p>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  <span className="truncate">{ao.organization}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Limite: {new Date(ao.deadline).toLocaleDateString("fr-FR")}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Progression</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {steps.map(step => {
                  const isCompleted = currentStep > step.id;
                  const isCurrent = currentStep === step.id;
                  return (
                    <div
                      key={step.id}
                      className={cn(
                        "flex items-center gap-2 text-sm p-2 rounded",
                        isCompleted && "text-secondary",
                        isCurrent && "bg-primary/10 text-primary font-medium",
                        !isCompleted && !isCurrent && "text-muted-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center text-xs">
                          {step.id}
                        </span>
                      )}
                      {step.title}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
