import { useState } from "react";
import { 
  ArrowLeft, 
  ArrowRight,
  FileText, 
  Calendar,
  Building2,
  Download,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

interface ReportWizardProps {
  onBack: () => void;
  onComplete: () => void;
  canExport: boolean;
}

const reportTypes = [
  { id: "monthly", name: "Rapport mensuel", description: "Vue complète de vos activités" },
  { id: "sales", name: "Ventes & commandes", description: "Performance commerciale détaillée" },
  { id: "ao", name: "Appels d'offres", description: "Soumissions et résultats" },
  { id: "formation", name: "Formation", description: "Heures et certifications" },
  { id: "custom", name: "Rapport personnalisé", description: "Sélectionnez les modules" },
];

const modules = [
  { id: "marketplace", name: "Marketplace" },
  { id: "ao", name: "Appels d'offres" },
  { id: "formation", name: "Formation" },
  { id: "financement", name: "Financement" },
  { id: "incubateur", name: "Incubateur" },
  { id: "evenements", name: "Événements" },
];

export function ReportWizard({ onBack, onComplete, canExport }: ReportWizardProps) {
  const [step, setStep] = useState(1);
  const [reportType, setReportType] = useState("");
  const [period, setPeriod] = useState("30j");
  const [format, setFormat] = useState("pdf");
  const [detailLevel, setDetailLevel] = useState("summary");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate generation
    setTimeout(() => {
      setIsGenerating(false);
      setIsComplete(true);
    }, 3000);
  };

  const toggleModule = (moduleId: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  if (isComplete) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Rapport généré</h1>
          </div>
        </div>

        <Card className="max-w-md mx-auto">
          <CardContent className="py-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2">Rapport prêt !</h2>
            <p className="text-muted-foreground mb-6">
              Votre rapport a été généré avec succès.
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={onComplete}>
                Retour
              </Button>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Télécharger
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Générer un rapport</h1>
          <p className="text-muted-foreground">Étape {step} sur {totalSteps}</p>
        </div>
      </div>

      {/* Progress */}
      <Progress value={progress} className="h-2" />

      {/* Step Content */}
      <Card className="max-w-2xl mx-auto">
        {/* Step 1: Choose Report Type */}
        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle>Type de rapport</CardTitle>
              <CardDescription>Sélectionnez le type de rapport à générer</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={reportType} onValueChange={setReportType}>
                <div className="space-y-3">
                  {reportTypes.map((type) => (
                    <div
                      key={type.id}
                      className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        reportType === type.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                      }`}
                      onClick={() => setReportType(type.id)}
                    >
                      <RadioGroupItem value={type.id} id={type.id} />
                      <div className="flex-1">
                        <Label htmlFor={type.id} className="font-medium cursor-pointer">
                          {type.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </>
        )}

        {/* Step 2: Parameters */}
        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle>Paramètres</CardTitle>
              <CardDescription>Définissez les critères du rapport</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Période</Label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger>
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7j">7 derniers jours</SelectItem>
                    <SelectItem value="30j">30 derniers jours</SelectItem>
                    <SelectItem value="90j">90 derniers jours</SelectItem>
                    <SelectItem value="12m">12 derniers mois</SelectItem>
                    <SelectItem value="custom">Période personnalisée</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {reportType === "custom" && (
                <div className="space-y-2">
                  <Label>Modules à inclure</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {modules.map((module) => (
                      <div
                        key={module.id}
                        className="flex items-center space-x-2 p-3 rounded-lg border"
                      >
                        <Checkbox
                          id={module.id}
                          checked={selectedModules.includes(module.id)}
                          onCheckedChange={() => toggleModule(module.id)}
                        />
                        <Label htmlFor={module.id} className="cursor-pointer">
                          {module.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Site / Branche</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <Building2 className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les sites</SelectItem>
                    <SelectItem value="abidjan">Abidjan - Siège</SelectItem>
                    <SelectItem value="bouake">Bouaké - Agence</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </>
        )}

        {/* Step 3: Format */}
        {step === 3 && (
          <>
            <CardHeader>
              <CardTitle>Format de sortie</CardTitle>
              <CardDescription>Choisissez le format et le niveau de détail</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Format</Label>
                <RadioGroup value={format} onValueChange={setFormat}>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer ${
                        format === "pdf" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                      }`}
                      onClick={() => setFormat("pdf")}
                    >
                      <RadioGroupItem value="pdf" id="pdf" />
                      <div>
                        <Label htmlFor="pdf" className="font-medium cursor-pointer">PDF</Label>
                        <p className="text-xs text-muted-foreground">Format document</p>
                      </div>
                    </div>
                    <div
                      className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer ${
                        format === "xlsx" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                      } ${!canExport ? "opacity-50" : ""}`}
                      onClick={() => canExport && setFormat("xlsx")}
                    >
                      <RadioGroupItem value="xlsx" id="xlsx" disabled={!canExport} />
                      <div>
                        <Label htmlFor="xlsx" className="font-medium cursor-pointer">XLSX</Label>
                        <p className="text-xs text-muted-foreground">
                          {canExport ? "Format tableur" : "Plan Argent/Or requis"}
                        </p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Niveau de détail</Label>
                <RadioGroup value={detailLevel} onValueChange={setDetailLevel}>
                  <div className="space-y-3">
                    <div
                      className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer ${
                        detailLevel === "summary" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                      }`}
                      onClick={() => setDetailLevel("summary")}
                    >
                      <RadioGroupItem value="summary" id="summary" />
                      <div>
                        <Label htmlFor="summary" className="font-medium cursor-pointer">Résumé</Label>
                        <p className="text-sm text-muted-foreground">KPIs principaux et tendances</p>
                      </div>
                    </div>
                    <div
                      className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer ${
                        detailLevel === "detailed" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                      } ${!canExport ? "opacity-50" : ""}`}
                      onClick={() => canExport && setDetailLevel("detailed")}
                    >
                      <RadioGroupItem value="detailed" id="detailed" disabled={!canExport} />
                      <div>
                        <Label htmlFor="detailed" className="font-medium cursor-pointer">Détaillé</Label>
                        <p className="text-sm text-muted-foreground">
                          {canExport ? "Toutes les données ligne par ligne" : "Plan Argent/Or requis"}
                        </p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <>
            <CardHeader>
              <CardTitle>Confirmation</CardTitle>
              <CardDescription>Vérifiez les paramètres avant de générer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type de rapport</span>
                  <span className="font-medium">
                    {reportTypes.find((t) => t.id === reportType)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Période</span>
                  <span className="font-medium">{period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Format</span>
                  <span className="font-medium">{format.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Détail</span>
                  <span className="font-medium">
                    {detailLevel === "summary" ? "Résumé" : "Détaillé"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Ce qui sera exporté
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    Données agrégées de votre entreprise. Aucune donnée personnelle tierce.
                  </p>
                </div>
              </div>
            </CardContent>
          </>
        )}

        {/* Navigation */}
        <div className="flex justify-between p-6 border-t">
          <Button variant="outline" onClick={step === 1 ? onBack : handlePrev}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {step === 1 ? "Annuler" : "Précédent"}
          </Button>
          {step < totalSteps ? (
            <Button onClick={handleNext} disabled={step === 1 && !reportType}>
              Suivant
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Générer le rapport
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
