import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Rocket,
  Plus,
  Target,
  Users,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Building2,
  TrendingUp,
  Shield,
  FileText,
  Eye,
  Edit,
  ChevronRight,
  Sparkles,
  BarChart3,
  Lightbulb,
  Award,
  Briefcase,
  GraduationCap,
  Layers,
  Lock,
  Unlock,
  FileCheck,
  Play,
  Pause,
  Flag,
  Star,
  MessageSquare,
  Upload,
  Download,
  Archive,
  ClipboardList,
  Factory,
  Package,
  Globe,
  ShoppingCart,
  Wallet,
  BookOpen,
  Handshake,
  Send,
  XCircle,
  Timer
} from "lucide-react";
import { regions } from "@/data/regions";
import { getSectorN1List } from "@/data/sectors";
import { PasserellesHub } from "@/components/incubateur/PasserellesHub";

// Statuts du pipeline incubateur
const pipelineStatus: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: "Projet créé", color: "bg-muted text-muted-foreground", icon: FileText },
  assessment: { label: "Diagnostic en cours", color: "bg-blue-500/10 text-blue-500", icon: ClipboardList },
  application_submitted: { label: "Candidature soumise", color: "bg-primary/10 text-primary", icon: Send },
  screening: { label: "Pré-screening", color: "bg-purple-500/10 text-purple-500", icon: Eye },
  shortlisted: { label: "Shortlist / Interview", color: "bg-indigo-500/10 text-indigo-500", icon: Star },
  accepted: { label: "Accepté", color: "bg-success/10 text-success", icon: CheckCircle2 },
  rejected: { label: "Refusé", color: "bg-destructive/10 text-destructive", icon: XCircle },
  in_cohort: { label: "En cohorte", color: "bg-primary/10 text-primary", icon: Users },
  sprint_progress: { label: "Sprint en cours", color: "bg-warning/10 text-warning", icon: Play },
  gate_review: { label: "Gate Review", color: "bg-orange-500/10 text-orange-500", icon: Flag },
  production_plus: { label: "Production++", color: "bg-emerald-500/10 text-emerald-500", icon: Factory },
  graduated: { label: "Gradué", color: "bg-success/10 text-success", icon: GraduationCap },
  alumni: { label: "Alumni", color: "bg-muted text-muted-foreground", icon: Award },
  suspended: { label: "Suspendu", color: "bg-destructive/10 text-destructive", icon: Pause },
};

// Types de projets
const projectTypes = [
  { value: "produit", label: "Produit", icon: Package, description: "Développer un nouveau produit" },
  { value: "service", label: "Service", icon: Briefcase, description: "Lancer un nouveau service" },
  { value: "startup", label: "Startup interne", icon: Rocket, description: "Créer une filiale innovante" },
  { value: "filiere", label: "Projet filière", icon: Layers, description: "Initiative de la chaîne de valeur" },
];

// Axes du diagnostic
const diagnosticAxes = [
  { id: "marche", name: "Marché", icon: Target, description: "Connaissance du marché et des clients" },
  { id: "produit", name: "Produit", icon: Package, description: "Maturité du produit/service" },
  { id: "operations", name: "Opérations", icon: Factory, description: "Capacité de production et logistique" },
  { id: "finance", name: "Finance", icon: Wallet, description: "Santé financière et modèle économique" },
  { id: "gouvernance", name: "Gouvernance", icon: Building2, description: "Structure et gestion" },
  { id: "digital", name: "Digital", icon: Globe, description: "Présence numérique et outils" },
  { id: "qualite", name: "Qualité/Normes", icon: Award, description: "Certifications et conformité" },
  { id: "pi", name: "Propriété Intellectuelle", icon: Shield, description: "Protection des actifs immatériels" },
];

// Mock data
const mockProjects = [
  {
    id: "INC-2024-001",
    name: "Cacao Bio Premium",
    type: "produit",
    status: "sprint_progress",
    currentSprint: 3,
    totalSprints: 5,
    readinessScore: 72,
    coach: "Marie Konan",
    cohort: "Cohorte Janvier 2024",
    nextGate: "2024-02-15",
    sector: "Agriculture",
    region: "LAGUNES",
  },
  {
    id: "INC-2024-002",
    name: "App Livraison Locale",
    type: "service",
    status: "assessment",
    currentSprint: 0,
    totalSprints: 5,
    readinessScore: 35,
    coach: null,
    cohort: null,
    nextGate: null,
    sector: "Services numériques",
    region: "ABIDJAN",
  },
  {
    id: "INC-2024-003",
    name: "Transformation Manioc",
    type: "filiere",
    status: "gate_review",
    currentSprint: 4,
    totalSprints: 5,
    readinessScore: 88,
    coach: "Yao Kouadio",
    cohort: "Cohorte Octobre 2023",
    nextGate: "2024-01-25",
    sector: "Agroalimentaire",
    region: "GBEKE",
  },
];

const mockSprints = [
  { id: 1, name: "Marché & Offre", status: "completed", tasks: 8, completed: 8 },
  { id: 2, name: "Produit / MVP", status: "completed", tasks: 6, completed: 6 },
  { id: 3, name: "Traction & Vente", status: "in_progress", tasks: 7, completed: 4 },
  { id: 4, name: "Finance & Scale", status: "pending", tasks: 5, completed: 0 },
  { id: 5, name: "Production++", status: "pending", tasks: 8, completed: 0 },
];

const mockPIItems = [
  { id: "1", type: "nda", name: "NDA Partenaire X", status: "signed", date: "2024-01-10" },
  { id: "2", type: "marque", name: "Marque 'CacaoBio'", status: "pending", date: null },
  { id: "3", type: "preuve", name: "Preuves antériorité v1.0", status: "deposited", date: "2024-01-05" },
];

export default function Incubateur() {
  const [activeTab, setActiveTab] = useState("accueil");
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCandidature, setShowCandidature] = useState(false);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [selectedProject, setSelectedProject] = useState<typeof mockProjects[0] | null>(null);
  const [diagnosticStep, setDiagnosticStep] = useState(0);
  const [diagnosticScores, setDiagnosticScores] = useState<Record<string, number>>({});
  const [candidatureStep, setCandidatureStep] = useState(1);

  const sectorList = getSectorN1List();

  const stats = {
    totalProjects: mockProjects.length,
    inProgress: mockProjects.filter(p => ["sprint_progress", "in_cohort"].includes(p.status)).length,
    gatesDue: mockProjects.filter(p => p.status === "gate_review").length,
    avgReadiness: Math.round(mockProjects.reduce((acc, p) => acc + p.readinessScore, 0) / mockProjects.length),
  };

  const renderKPIs = () => (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Rocket className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalProjects}</p>
              <p className="text-sm text-muted-foreground">Projets actifs</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning/10">
              <Play className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.inProgress}</p>
              <p className="text-sm text-muted-foreground">En exécution</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-orange-500/10">
              <Flag className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.gatesDue}</p>
              <p className="text-sm text-muted-foreground">Gates à valider</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10">
              <BarChart3 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.avgReadiness}%</p>
              <p className="text-sm text-muted-foreground">Readiness moyen</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCreateProjectModal = () => (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Créer un projet
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowCreateProject(false)}>✕</Button>
          </div>
          <CardDescription>Structurez votre initiative d'incubation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-semibold mb-4 block">Type de projet</Label>
            <div className="grid gap-3 md:grid-cols-2">
              {projectTypes.map((type) => (
                <Card key={type.value} className="cursor-pointer transition-all hover:border-primary/50">
                  <CardContent className="pt-4 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <type.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{type.label}</p>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nom du projet *</Label>
              <Input placeholder="Ex: Cacao Bio Premium" />
            </div>
            <div className="space-y-2">
              <Label>Filière / Secteur</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {sectorList.map((s) => (
                    <SelectItem key={s.code} value={s.code}>{s.name.split(":")[0]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Région</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Maturité</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Niveau de maturité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idee">Idée / Concept</SelectItem>
                  <SelectItem value="prototype">Prototype</SelectItem>
                  <SelectItem value="mvp">MVP / Pilote</SelectItem>
                  <SelectItem value="traction">Traction initiale</SelectItem>
                  <SelectItem value="scale">Prêt à scaler</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Besoins principaux</Label>
            <div className="grid grid-cols-2 gap-2">
              {["Accès marché", "Financement", "Qualité / Normes", "Export", "Digital", "Formation"].map((need) => (
                <div key={need} className="flex items-center space-x-2">
                  <Checkbox id={need} />
                  <Label htmlFor={need} className="text-sm">{need}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCreateProject(false)}>Annuler</Button>
            <Button onClick={() => { setShowCreateProject(false); setShowDiagnostic(true); }}>
              Créer et lancer le diagnostic
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDiagnosticModal = () => {
    const currentAxis = diagnosticAxes[diagnosticStep];
    const isComplete = diagnosticStep >= diagnosticAxes.length;

    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
        <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Diagnostic 360°
                </CardTitle>
                <CardDescription>
                  {isComplete ? "Diagnostic terminé" : `Axe ${diagnosticStep + 1} sur ${diagnosticAxes.length}`}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowDiagnostic(false)}>✕</Button>
            </div>
            <Progress value={((diagnosticStep) / diagnosticAxes.length) * 100} className="mt-4" />
          </CardHeader>
          <CardContent>
            {isComplete ? (
              <div className="space-y-6">
                <div className="text-center py-6">
                  <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-10 w-10 text-success" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Diagnostic terminé !</h3>
                  <p className="text-muted-foreground">Score de readiness global</p>
                  <p className="text-4xl font-bold text-primary mt-2">
                    {Math.round(Object.values(diagnosticScores).reduce((a, b) => a + b, 0) / diagnosticAxes.length)}%
                  </p>
                </div>

                <div className="grid gap-3">
                  {diagnosticAxes.map((axis) => (
                    <div key={axis.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <axis.icon className="h-5 w-5 text-muted-foreground" />
                      <span className="flex-1 font-medium">{axis.name}</span>
                      <Progress value={diagnosticScores[axis.id] || 0} className="w-24 h-2" />
                      <span className="text-sm font-medium w-10 text-right">{diagnosticScores[axis.id] || 0}%</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h4 className="font-semibold mb-2">Recommandations</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-primary" />
                      Candidater à la prochaine cohorte d'incubation
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-primary" />
                      Renforcer l'axe Qualité/Normes avant production
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-primary" />
                      Préparer la protection PI avant pitch public
                    </li>
                  </ul>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowDiagnostic(false)}>
                    Fermer
                  </Button>
                  <Button onClick={() => { setShowDiagnostic(false); setShowCandidature(true); }}>
                    Candidater à une cohorte
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <currentAxis.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{currentAxis.name}</h3>
                    <p className="text-sm text-muted-foreground">{currentAxis.description}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[1, 2, 3, 4].map((q) => (
                    <div key={q} className="space-y-2">
                      <Label>Question {q} sur l'axe {currentAxis.name}</Label>
                      <RadioGroup defaultValue="3" className="flex gap-4">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <div key={v} className="flex items-center space-x-2">
                            <RadioGroupItem value={String(v)} id={`q${q}-${v}`} />
                            <Label htmlFor={`q${q}-${v}`}>{v}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => diagnosticStep > 0 ? setDiagnosticStep(diagnosticStep - 1) : setShowDiagnostic(false)}
                  >
                    {diagnosticStep === 0 ? "Annuler" : "Précédent"}
                  </Button>
                  <Button onClick={() => {
                    setDiagnosticScores({
                      ...diagnosticScores,
                      [currentAxis.id]: Math.floor(Math.random() * 40) + 50
                    });
                    setDiagnosticStep(diagnosticStep + 1);
                  }}>
                    Suivant
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCandidatureModal = () => (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Candidature Cohorte
              </CardTitle>
              <CardDescription>Étape {candidatureStep} sur 4</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowCandidature(false)}>✕</Button>
          </div>
          <Progress value={(candidatureStep / 4) * 100} className="mt-4" />
        </CardHeader>
        <CardContent className="space-y-6">
          {candidatureStep === 1 && (
            <div className="space-y-6">
              <h3 className="font-semibold">Pitch & Problème</h3>
              <div className="space-y-2">
                <Label>Pitch en une phrase *</Label>
                <Textarea placeholder="Décrivez votre projet en une phrase percutante..." rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Problème adressé *</Label>
                <Textarea placeholder="Quel problème résolvez-vous ?" rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Solution proposée *</Label>
                <Textarea placeholder="Comment résolvez-vous ce problème ?" rows={3} />
              </div>
            </div>
          )}

          {candidatureStep === 2 && (
            <div className="space-y-6">
              <h3 className="font-semibold">Marché & Concurrence</h3>
              <div className="space-y-2">
                <Label>Marché cible *</Label>
                <Textarea placeholder="Décrivez votre marché cible, taille, segments..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Concurrence *</Label>
                <Textarea placeholder="Qui sont vos concurrents ? Quelle est votre différenciation ?" rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Modèle économique *</Label>
                <Textarea placeholder="Comment générez-vous des revenus ?" rows={3} />
              </div>
            </div>
          )}

          {candidatureStep === 3 && (
            <div className="space-y-6">
              <h3 className="font-semibold">Équipe & Traction</h3>
              <div className="space-y-2">
                <Label>Équipe fondatrice *</Label>
                <Textarea placeholder="Présentez votre équipe et ses compétences clés..." rows={3} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Chiffre d'affaires actuel (FCFA)</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Nombre de clients</Label>
                  <Input type="number" placeholder="0" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Traction / Preuves de marché</Label>
                <Textarea placeholder="Ventes, partenariats, pilotes, lettres d'intention..." rows={3} />
              </div>
            </div>
          )}

          {candidatureStep === 4 && (
            <div className="space-y-6">
              <h3 className="font-semibold">Documents & Soumission</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Pitch Deck (PDF)</p>
                      <p className="text-sm text-muted-foreground">Téléversez votre présentation</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Preuves de traction</p>
                      <p className="text-sm text-muted-foreground">Contrats, factures, témoignages...</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Démo / Vidéo (optionnel)</p>
                      <p className="text-sm text-muted-foreground">Lien ou fichier</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms" className="text-sm">
                  J'accepte les conditions du programme d'incubation
                </Label>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => candidatureStep > 1 ? setCandidatureStep(candidatureStep - 1) : setShowCandidature(false)}
            >
              {candidatureStep === 1 ? "Annuler" : "Précédent"}
            </Button>
            <Button onClick={() => {
              if (candidatureStep < 4) {
                setCandidatureStep(candidatureStep + 1);
              } else {
                setShowCandidature(false);
                setActiveTab("projets");
              }
            }}>
              {candidatureStep === 4 ? "Soumettre la candidature" : "Suivant"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProjectsList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Mes Projets</h3>
        <Button onClick={() => setShowCreateProject(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau projet
        </Button>
      </div>

      <div className="space-y-3">
        {mockProjects.map((project) => {
          const statusInfo = pipelineStatus[project.status];
          return (
            <Card
              key={project.id}
              className="border-border/50 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Rocket className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-muted-foreground">{project.id}</span>
                      <Badge className={statusInfo.color}>
                        <statusInfo.icon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <p className="font-medium mt-1">{project.name}</p>
                    <p className="text-sm text-muted-foreground">{project.sector} • {project.region}</p>
                  </div>
                  <div className="hidden md:block text-right">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Target className="h-4 w-4" />
                      Readiness: {project.readinessScore}%
                    </div>
                    <Progress value={project.readinessScore} className="w-32 h-2" />
                  </div>
                  {project.coach && (
                    <div className="hidden lg:block text-right">
                      <p className="text-sm text-muted-foreground">Coach</p>
                      <p className="font-medium">{project.coach}</p>
                    </div>
                  )}
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>

                {project.currentSprint > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Sprint {project.currentSprint}/{project.totalSprints}</span>
                      {project.nextGate && (
                        <span className="flex items-center gap-1 text-warning">
                          <Calendar className="h-4 w-4" />
                          Gate: {new Date(project.nextGate).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                    </div>
                    <Progress value={(project.currentSprint / project.totalSprints) * 100} className="h-2 mt-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderWorkspace = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setSelectedProject(null)}>
          <ArrowRight className="h-5 w-5 rotate-180" />
        </Button>
        <div>
          <h2 className="text-xl font-bold">{selectedProject?.name}</h2>
          <p className="text-muted-foreground">{selectedProject?.id} • {selectedProject?.cohort || "Non assigné"}</p>
        </div>
      </div>

      <Tabs defaultValue="roadmap">
        <TabsList>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          <TabsTrigger value="livrables">Livrables</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="pi">PI</TabsTrigger>
          <TabsTrigger value="conformite">Conformité</TabsTrigger>
          <TabsTrigger value="production">Production++</TabsTrigger>
        </TabsList>

        <TabsContent value="roadmap" className="space-y-4 mt-4">
          <div className="grid gap-3">
            {mockSprints.map((sprint) => (
              <Card key={sprint.id} className={sprint.status === "in_progress" ? "border-primary" : ""}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      sprint.status === "completed" ? "bg-success/10" :
                      sprint.status === "in_progress" ? "bg-warning/10" : "bg-muted"
                    }`}>
                      {sprint.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : sprint.status === "in_progress" ? (
                        <Play className="h-5 w-5 text-warning" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Sprint {sprint.id}: {sprint.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {sprint.completed}/{sprint.tasks} tâches complétées
                      </p>
                    </div>
                    <Progress value={(sprint.completed / sprint.tasks) * 100} className="w-24 h-2" />
                    <Badge variant={sprint.status === "completed" ? "default" : "outline"}>
                      {sprint.status === "completed" ? "Validé" : 
                       sprint.status === "in_progress" ? "En cours" : "À venir"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="livrables" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Livrables du Sprint 3</CardTitle>
              <CardDescription>Traction & Vente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["Analyse concurrentielle", "Stratégie pricing", "Premiers leads qualifiés", "Funnel de vente"].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Checkbox checked={i < 2} />
                      <span className={i < 2 ? "line-through text-muted-foreground" : ""}>{item}</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sessions de mentorat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Session avec {selectedProject?.coach}</p>
                      <p className="text-sm text-muted-foreground">Prochaine: 25 Jan 2024 à 10h00</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Rejoindre
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pi" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Propriété Intellectuelle</CardTitle>
              <CardDescription>Coffre de preuves et protections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockPIItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{item.type}</p>
                    </div>
                  </div>
                  <Badge variant={item.status === "signed" || item.status === "deposited" ? "default" : "outline"}>
                    {item.status === "signed" ? "Signé" : item.status === "deposited" ? "Déposé" : "En attente"}
                  </Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une preuve
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conformite" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conformité & Certification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border border-warning/50 bg-warning/5">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  <div>
                    <p className="font-medium">Pré-audit en attente</p>
                    <p className="text-sm text-muted-foreground">3 écarts à corriger avant certification</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {["Étiquetage conforme", "Hygiène atelier", "Traçabilité lots"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="production" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Production++ (Industrialisation)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Capacité mensuelle</p>
                  <p className="text-xl font-bold">5,000 unités</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Coût unitaire</p>
                  <p className="text-xl font-bold">2,500 FCFA</p>
                </div>
              </div>
              <div className="p-4 rounded-lg border">
                <h4 className="font-semibold mb-2">Readiness Made in CI</h4>
                <Progress value={65} className="h-2 mb-2" />
                <p className="text-sm text-muted-foreground">65% - Transformation locale validée</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderPasserelles = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Passerelles</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/50 hover:shadow-md transition-all cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Marketplace</p>
                <p className="text-sm text-muted-foreground">Publier vos produits</p>
              </div>
              <Badge variant="outline" className="bg-success/10 text-success">
                <Unlock className="h-3 w-3 mr-1" />
                Disponible
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 hover:shadow-md transition-all cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Financement</p>
                <p className="text-sm text-muted-foreground">Créer un dossier de financement</p>
              </div>
              <Badge variant="outline" className="bg-success/10 text-success">
                <Unlock className="h-3 w-3 mr-1" />
                Disponible
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 hover:shadow-md transition-all cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Événements</p>
                <p className="text-sm text-muted-foreground">Demo Day, B2B matchmaking</p>
              </div>
              <Badge variant="outline">
                <Lock className="h-3 w-3 mr-1" />
                Gate 4 requis
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 hover:shadow-md transition-all cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Formation</p>
                <p className="text-sm text-muted-foreground">Cours recommandés</p>
              </div>
              <Badge variant="outline" className="bg-success/10 text-success">
                <Unlock className="h-3 w-3 mr-1" />
                Disponible
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      {showCreateProject && renderCreateProjectModal()}
      {showDiagnostic && renderDiagnosticModal()}
      {showCandidature && renderCandidatureModal()}

      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Incubateur</h1>
          <p className="text-muted-foreground">Accélérez vos projets avec notre programme d'incubation</p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="accueil">Accueil</TabsTrigger>
            <TabsTrigger value="projets">Mes Projets</TabsTrigger>
            <TabsTrigger value="diagnostic">Diagnostic</TabsTrigger>
            <TabsTrigger value="passerelles">Passerelles</TabsTrigger>
          </TabsList>

          <TabsContent value="accueil" className="space-y-6">
            {renderKPIs()}

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Actions rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" onClick={() => setShowCreateProject(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un projet
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setShowDiagnostic(true)}>
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Lancer un diagnostic 360°
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setShowCandidature(true)}>
                    <Send className="h-4 w-4 mr-2" />
                    Candidater à une cohorte
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Prochaine cohorte</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Cohorte Mars 2024</p>
                      <p className="text-sm text-muted-foreground">Candidatures ouvertes jusqu'au 15 Fév</p>
                    </div>
                  </div>
                  <Button className="w-full mt-4" onClick={() => setShowCandidature(true)}>
                    Candidater maintenant
                  </Button>
                </CardContent>
              </Card>
            </div>

            {mockProjects.length > 0 && (
              <Card className="border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Projets récents</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("projets")}>
                      Voir tout
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockProjects.slice(0, 2).map((project) => {
                      const statusInfo = pipelineStatus[project.status];
                      return (
                        <div key={project.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                          <Rocket className="h-5 w-5 text-primary" />
                          <div className="flex-1">
                            <p className="font-medium">{project.name}</p>
                            <p className="text-sm text-muted-foreground">{project.sector}</p>
                          </div>
                          <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Widget Passerelles recommandées */}
            <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Passerelles recommandées</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("passerelles")}>
                    Tout voir
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <CardDescription>Opportunités débloquées selon votre progression</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-3">
                  {/* Formation - Toujours disponible */}
                  <div className="p-4 rounded-xl bg-background border border-border/50 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <GraduationCap className="h-5 w-5 text-purple-500" />
                      </div>
                      <Badge className="bg-success/10 text-success text-xs">
                        <Unlock className="h-3 w-3 mr-1" />
                        Disponible
                      </Badge>
                    </div>
                    <h4 className="font-semibold mb-1">Formation</h4>
                    <p className="text-sm text-muted-foreground mb-3">4 formations recommandées selon votre diagnostic</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-primary font-medium">Gaps identifiés: 3</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>

                  {/* Financement - Gate 2 */}
                  <div className="p-4 rounded-xl bg-background border border-border/50 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Wallet className="h-5 w-5 text-primary" />
                      </div>
                      <Badge className="bg-success/10 text-success text-xs">
                        <Unlock className="h-3 w-3 mr-1" />
                        Disponible
                      </Badge>
                    </div>
                    <h4 className="font-semibold mb-1">Financement</h4>
                    <p className="text-sm text-muted-foreground mb-3">3 programmes compatibles avec votre profil</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-primary font-medium">+25M FCFA potentiel</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>

                  {/* Marketplace - Gate 3 */}
                  <div className="p-4 rounded-xl bg-background border border-border/50 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <ShoppingCart className="h-5 w-5 text-green-500" />
                      </div>
                      {stats.avgReadiness >= 60 ? (
                        <Badge className="bg-success/10 text-success text-xs">
                          <Unlock className="h-3 w-3 mr-1" />
                          Disponible
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          Gate 3 requis
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-semibold mb-1">Marketplace</h4>
                    <p className="text-sm text-muted-foreground mb-3">Vendez vos produits à 10,000+ acheteurs</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-primary font-medium">+45% ventes</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Actions rapides passerelles */}
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/50">
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => setActiveTab("passerelles")}>
                    <FileCheck className="h-4 w-4" />
                    12 AO compatibles
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => setActiveTab("passerelles")}>
                    <Calendar className="h-4 w-4" />
                    Demo Day 15 Fév
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => setActiveTab("passerelles")}>
                    <Globe className="h-4 w-4" />
                    Évaluer export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projets">
            {selectedProject ? renderWorkspace() : renderProjectsList()}
          </TabsContent>

          <TabsContent value="diagnostic" className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Diagnostic 360°</CardTitle>
                <CardDescription>
                  Évaluez la maturité de votre projet sur 8 axes clés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {diagnosticAxes.map((axis) => (
                    <Card key={axis.id} className="border-border/50">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-muted">
                            <axis.icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{axis.name}</p>
                            <p className="text-xs text-muted-foreground">{axis.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button className="mt-6" onClick={() => { setDiagnosticStep(0); setDiagnosticScores({}); setShowDiagnostic(true); }}>
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Commencer le diagnostic
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="passerelles">
            <PasserellesHub project={selectedProject} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
