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
import { DossierBuilder } from "@/components/financement/DossierBuilder";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Wallet,
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Building2,
  TrendingUp,
  Shield,
  FileCheck,
  Users,
  Calendar,
  DollarSign,
  Target,
  MessageSquare,
  Download,
  Upload,
  Eye,
  Edit,
  Copy,
  Archive,
  ChevronRight,
  CircleDot,
  Sparkles,
  Briefcase,
  BarChart3,
  Send,
  XCircle,
  HandCoins,
  Star,
  Banknote,
  Timer,
  Lock,
  ArrowUpCircle
} from "lucide-react";
import { regions } from "@/data/regions";
import { getSectorN1List } from "@/data/sectors";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { TIER_CONFIGS } from "@/lib/permissions";

// Types et statuts du financement
const financingTypes = [
  { value: "credit", label: "Crédit bancaire", icon: Banknote, description: "Prêt classique avec remboursement" },
  { value: "subvention", label: "Subvention / Grant", icon: HandCoins, description: "Aide non remboursable" },
  { value: "garantie", label: "Garantie", icon: Shield, description: "Couverture de risque" },
  { value: "leasing", label: "Leasing / Crédit-bail", icon: Briefcase, description: "Location avec option d'achat" },
];

const usageTypes = [
  "Fonds de roulement",
  "Investissement équipement",
  "Immobilier / Construction",
  "Stock / Approvisionnement",
  "R&D / Innovation",
  "Export / International",
  "Croissance / Scale-up",
];

const maturiteOptions = [
  { value: "startup", label: "Start-up (< 2 ans)" },
  { value: "early", label: "Jeune entreprise (2-5 ans)" },
  { value: "growth", label: "Croissance (5-10 ans)" },
  { value: "mature", label: "Mature (> 10 ans)" },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: "Brouillon", color: "bg-muted text-muted-foreground", icon: FileText },
  needs_info: { label: "À compléter", color: "bg-warning/10 text-warning", icon: AlertCircle },
  submitted: { label: "Soumis à CPU-PME", color: "bg-primary/10 text-primary", icon: Send },
  in_review: { label: "En vérification", color: "bg-blue-500/10 text-blue-500", icon: Eye },
  ready: { label: "Prêt à transmettre", color: "bg-success/10 text-success", icon: CheckCircle2 },
  sent_partner: { label: "Transmis partenaire", color: "bg-purple-500/10 text-purple-500", icon: Building2 },
  partner_info: { label: "Compléments demandés", color: "bg-orange-500/10 text-orange-500", icon: MessageSquare },
  underwriting: { label: "En analyse", color: "bg-indigo-500/10 text-indigo-500", icon: BarChart3 },
  offer_received: { label: "Offre reçue", color: "bg-emerald-500/10 text-emerald-500", icon: Star },
  accepted: { label: "Offre acceptée", color: "bg-success/10 text-success", icon: CheckCircle2 },
  declined: { label: "Offre refusée", color: "bg-destructive/10 text-destructive", icon: XCircle },
  disbursed: { label: "Décaissé", color: "bg-success/10 text-success", icon: DollarSign },
  monitoring: { label: "Suivi & Reporting", color: "bg-blue-500/10 text-blue-500", icon: TrendingUp },
  closed: { label: "Clôturé", color: "bg-muted text-muted-foreground", icon: Archive },
  rejected: { label: "Rejeté", color: "bg-destructive/10 text-destructive", icon: XCircle },
};

// Données de démonstration
const mockDossiers = [
  {
    id: "FIN-2024-001",
    type: "credit",
    typeName: "Crédit bancaire",
    amount: 25000000,
    usage: "Investissement équipement",
    status: "offer_received",
    completionScore: 95,
    partner: "Banque Atlantique",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
    offers: [
      { partner: "Banque Atlantique", amount: 25000000, rate: 8.5, duration: 36, status: "pending" },
      { partner: "Coris Bank", amount: 20000000, rate: 9.0, duration: 24, status: "pending" },
    ],
  },
  {
    id: "FIN-2024-002",
    type: "subvention",
    typeName: "Subvention",
    amount: 5000000,
    usage: "R&D / Innovation",
    status: "in_review",
    completionScore: 78,
    partner: null,
    createdAt: "2024-01-18",
    updatedAt: "2024-01-19",
    offers: [],
  },
  {
    id: "FIN-2024-003",
    type: "leasing",
    typeName: "Leasing",
    amount: 15000000,
    usage: "Investissement équipement",
    status: "draft",
    completionScore: 35,
    partner: null,
    createdAt: "2024-01-20",
    updatedAt: "2024-01-20",
    offers: [],
  },
];

const mockPartners = [
  { id: "1", name: "Banque Atlantique", type: "Banque", sectors: ["Tous secteurs"], minAmount: 5000000, maxAmount: 500000000 },
  { id: "2", name: "Coris Bank", type: "Banque", sectors: ["Tous secteurs"], minAmount: 2000000, maxAmount: 100000000 },
  { id: "3", name: "Fonds Afrique Centrale", type: "Fonds", sectors: ["Agriculture", "Industrie"], minAmount: 10000000, maxAmount: 1000000000 },
  { id: "4", name: "Programme FIDA", type: "Programme", sectors: ["Agriculture"], minAmount: 1000000, maxAmount: 50000000 },
];

export default function Financement() {
  const { canAccess } = useSubscription();
  const { user } = useAuth();
  const canReceiveDonations = canAccess('financing.donations');
  const currentTierName = user?.subscription ? TIER_CONFIGS[user.subscription.tier].name : "Argent";

  const [activeTab, setActiveTab] = useState("accueil");
  const [showWizard, setShowWizard] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDossierBuilder, setShowDossierBuilder] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedDossier, setSelectedDossier] = useState<typeof mockDossiers[0] | null>(null);
  
  // État du formulaire pré-diagnostic
  const [preDiagForm, setPreDiagForm] = useState({
    type: "",
    amount: "",
    usage: "",
    horizon: "",
    region: "",
    sector: "",
    maturite: "",
    hasGuarantees: false,
    kycValidated: true, // Simulation
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
  };

  const stats = {
    totalRequested: mockDossiers.reduce((sum, d) => sum + d.amount, 0),
    dossiersInProgress: mockDossiers.filter((d) => !["closed", "rejected", "disbursed"].includes(d.status)).length,
    offersReceived: mockDossiers.filter((d) => d.status === "offer_received").length,
    reportingDue: 2,
  };

  const sectorList = getSectorN1List();

  const renderKPIs = () => (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold">{formatCurrency(stats.totalRequested)}</p>
              <p className="text-sm text-muted-foreground">Montants demandés</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning/10">
              <FileText className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-lg font-bold">{stats.dossiersInProgress}</p>
              <p className="text-sm text-muted-foreground">Dossiers en cours</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10">
              <Star className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-lg font-bold">{stats.offersReceived}</p>
              <p className="text-sm text-muted-foreground">Offres reçues</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-destructive/10">
              <Clock className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-lg font-bold">{stats.reportingDue}</p>
              <p className="text-sm text-muted-foreground">Reporting dû</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPreDiagWizard = () => (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Pré-diagnostic Financement
              </CardTitle>
              <CardDescription>Étape {wizardStep} sur 3</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowWizard(false)}>✕</Button>
          </div>
          <Progress value={(wizardStep / 3) * 100} className="mt-4" />
        </CardHeader>
        <CardContent className="space-y-6">
          {wizardStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold mb-4 block">Type de financement recherché</Label>
                <div className="grid gap-3 md:grid-cols-2">
                  {financingTypes.map((type) => (
                    <Card
                      key={type.value}
                      className={`cursor-pointer transition-all ${preDiagForm.type === type.value ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}
                      onClick={() => setPreDiagForm({ ...preDiagForm, type: type.value })}
                    >
                      <CardContent className="pt-4 flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${preDiagForm.type === type.value ? "bg-primary/20" : "bg-muted"}`}>
                          <type.icon className={`h-5 w-5 ${preDiagForm.type === type.value ? "text-primary" : "text-muted-foreground"}`} />
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
                  <Label>Montant souhaité (FCFA)</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 25 000 000"
                    value={preDiagForm.amount}
                    onChange={(e) => setPreDiagForm({ ...preDiagForm, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Usage des fonds</Label>
                  <Select value={preDiagForm.usage} onValueChange={(v) => setPreDiagForm({ ...preDiagForm, usage: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner l'usage" />
                    </SelectTrigger>
                    <SelectContent>
                      {usageTypes.map((usage) => (
                        <SelectItem key={usage} value={usage}>{usage}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Horizon de remboursement</Label>
                  <Select value={preDiagForm.horizon} onValueChange={(v) => setPreDiagForm({ ...preDiagForm, horizon: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Durée souhaitée" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 mois</SelectItem>
                      <SelectItem value="12">12 mois</SelectItem>
                      <SelectItem value="24">24 mois</SelectItem>
                      <SelectItem value="36">36 mois</SelectItem>
                      <SelectItem value="48">48 mois</SelectItem>
                      <SelectItem value="60">60 mois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Région d'activité</Label>
                  <Select value={preDiagForm.region} onValueChange={(v) => setPreDiagForm({ ...preDiagForm, region: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner la région" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Secteur d'activité</Label>
                  <Select value={preDiagForm.sector} onValueChange={(v) => setPreDiagForm({ ...preDiagForm, sector: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le secteur" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectorList.map((sector) => (
                        <SelectItem key={sector.code} value={sector.code}>
                          {sector.name.split(":")[0]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Maturité de l'entreprise</Label>
                  <Select value={preDiagForm.maturite} onValueChange={(v) => setPreDiagForm({ ...preDiagForm, maturite: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Niveau de maturité" />
                    </SelectTrigger>
                    <SelectContent>
                      {maturiteOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="guarantees"
                  checked={preDiagForm.hasGuarantees}
                  onCheckedChange={(checked) => setPreDiagForm({ ...preDiagForm, hasGuarantees: !!checked })}
                />
                <Label htmlFor="guarantees">J'ai des garanties à proposer (immobilier, équipements, caution...)</Label>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center gap-2 text-success font-medium mb-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Analyse terminée
                </div>
                <p className="text-sm text-muted-foreground">
                  Basé sur votre profil, voici nos recommandations :
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Produits financiers recommandés</h4>
                <div className="grid gap-3">
                  <Card className="border-primary bg-primary/5">
                    <CardContent className="pt-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/20">
                          <Banknote className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Crédit d'investissement</p>
                          <p className="text-sm text-muted-foreground">Durée 24-48 mois • Taux ~8-10%</p>
                        </div>
                      </div>
                      <Badge className="bg-success/10 text-success">Recommandé</Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Shield className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">Garantie FGPME</p>
                          <p className="text-sm text-muted-foreground">Couverture jusqu'à 50%</p>
                        </div>
                      </div>
                      <Badge variant="outline">Compatible</Badge>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Checklist documents requis</h4>
                <div className="grid gap-2 text-sm">
                  {["RCCM / IDU à jour", "Statuts de l'entreprise", "États financiers (2 dernières années)", "Business plan / Note de projet", "Relevés bancaires (6 mois)", "Pièces des garanties proposées"].map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                      <CircleDot className="h-4 w-4 text-primary" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {!preDiagForm.kycValidated && (
                <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                  <div className="flex items-center gap-2 text-warning font-medium">
                    <AlertCircle className="h-5 w-5" />
                    KYC requis
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Veuillez compléter votre KYC avant de soumettre un dossier.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Compléter le KYC
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => wizardStep > 1 ? setWizardStep(wizardStep - 1) : setShowWizard(false)}
            >
              {wizardStep === 1 ? "Annuler" : "Précédent"}
            </Button>
            <Button
              onClick={() => {
                if (wizardStep < 3) {
                  setWizardStep(wizardStep + 1);
                } else {
                  setShowWizard(false);
                  setShowDossierBuilder(true);
                }
              }}
            >
              {wizardStep === 3 ? "Créer le dossier" : "Suivant"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDossiersList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Mes dossiers de financement</h3>
        <Button onClick={() => { setShowWizard(true); setWizardStep(1); }}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau dossier
        </Button>
      </div>

      <div className="space-y-3">
        {mockDossiers.map((dossier) => {
          const statusInfo = statusConfig[dossier.status];
          return (
            <Card
              key={dossier.id}
              className="border-border/50 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedDossier(dossier)}
            >
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Wallet className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-muted-foreground">{dossier.id}</span>
                      <Badge className={statusInfo.color}>
                        <statusInfo.icon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <p className="font-medium mt-1">{dossier.typeName} — {formatCurrency(dossier.amount)}</p>
                    <p className="text-sm text-muted-foreground">{dossier.usage}</p>
                  </div>
                  <div className="hidden md:block text-right">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Target className="h-4 w-4" />
                      Complétude: {dossier.completionScore}%
                    </div>
                    <Progress value={dossier.completionScore} className="w-32 h-2" />
                  </div>
                  <div className="hidden md:flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>

                {dossier.offers.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-sm font-medium mb-2">Offres reçues ({dossier.offers.length})</p>
                    <div className="flex gap-2">
                      {dossier.offers.map((offer, i) => (
                        <Badge key={i} variant="outline" className="bg-success/5">
                          {offer.partner}: {offer.rate}% sur {offer.duration} mois
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderOffers = () => {
    const dossiersWithOffers = mockDossiers.filter((d) => d.offers.length > 0);
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Offres reçues</h3>
        
        {dossiersWithOffers.map((dossier) => (
          <Card key={dossier.id} className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{dossier.id} — {dossier.typeName}</CardTitle>
                  <CardDescription>Montant demandé: {formatCurrency(dossier.amount)}</CardDescription>
                </div>
                <Badge>{dossier.offers.length} offre(s)</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dossier.offers.map((offer, i) => (
                  <div key={i} className="p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{offer.partner}</p>
                          <p className="text-sm text-muted-foreground">Montant: {formatCurrency(offer.amount)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{offer.rate}%</p>
                        <p className="text-sm text-muted-foreground">Taux annuel</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">Durée</p>
                        <p className="font-medium">{offer.duration} mois</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Mensualité estimée</p>
                        <p className="font-medium">{formatCurrency(Math.round(offer.amount / offer.duration * 1.08))}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Coût total</p>
                        <p className="font-medium">{formatCurrency(Math.round(offer.amount * (1 + offer.rate / 100 * offer.duration / 12)))}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button className="flex-1" variant="default">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Accepter
                      </Button>
                      <Button className="flex-1" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Négocier
                      </Button>
                      <Button variant="ghost">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {dossiersWithOffers.length === 0 && (
          <Card className="border-border/50">
            <CardContent className="py-12 text-center">
              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg">Aucune offre pour le moment</h3>
              <p className="text-muted-foreground mt-2">
                Vos offres apparaîtront ici une fois que les partenaires auront répondu
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderPartners = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Partenaires financiers</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {mockPartners.map((partner) => (
          <Card key={partner.id} className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{partner.name}</h4>
                    <Badge variant="outline">{partner.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {partner.minAmount.toLocaleString()} — {partner.maxAmount.toLocaleString()} FCFA
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {partner.sectors.map((sector) => (
                      <Badge key={sector} variant="secondary" className="text-xs">
                        {sector}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderReporting = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Reporting & Suivi</h3>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Nouveau rapport
        </Button>
      </div>

      <Card className="border-border/50">
        <CardContent className="py-12 text-center">
          <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg">Aucun reporting en cours</h3>
          <p className="text-muted-foreground mt-2">
            Les obligations de reporting apparaîtront ici après le décaissement
          </p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Financement</h1>
            <p className="text-muted-foreground">
              Gérez vos demandes de financement et suivez vos dossiers
            </p>
          </div>
          <Button onClick={() => { setShowWizard(true); setWizardStep(1); }} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Nouveau financement
          </Button>
        </div>

        {/* KPIs */}
        {renderKPIs()}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="accueil">Accueil</TabsTrigger>
            <TabsTrigger value="dossiers">Mes dossiers</TabsTrigger>
            <TabsTrigger value="offres">Offres</TabsTrigger>
            <TabsTrigger value="partenaires">Partenaires</TabsTrigger>
            <TabsTrigger value="reporting">Reporting</TabsTrigger>
            {canReceiveDonations ? (
              <TabsTrigger value="dons">Donner</TabsTrigger>
            ) : (
              <button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium text-muted-foreground/60 ring-offset-background transition-all"
              >
                Donner
                <Lock className="w-3 h-3" />
              </button>
            )}
          </TabsList>

          <TabsContent value="accueil" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Quick Actions */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Actions rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start h-auto py-4" onClick={() => { setShowWizard(true); setWizardStep(1); }}>
                    <div className="p-2 rounded-lg bg-primary/10 mr-3">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Pré-diagnostic</p>
                      <p className="text-sm text-muted-foreground">Trouvez le bon produit financier</p>
                    </div>
                    <ArrowRight className="h-5 w-5 ml-auto" />
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-auto py-4">
                    <div className="p-2 rounded-lg bg-warning/10 mr-3">
                      <FileCheck className="h-5 w-5 text-warning" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Compléter mon KYC</p>
                      <p className="text-sm text-muted-foreground">Débloquer la soumission</p>
                    </div>
                    <ArrowRight className="h-5 w-5 ml-auto" />
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-auto py-4">
                    <div className="p-2 rounded-lg bg-success/10 mr-3">
                      <MessageSquare className="h-5 w-5 text-success" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Contacter un conseiller</p>
                      <p className="text-sm text-muted-foreground">Aide pour votre dossier</p>
                    </div>
                    <ArrowRight className="h-5 w-5 ml-auto" />
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Activité récente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-success/10">
                        <Star className="h-4 w-4 text-success" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Offre reçue de Banque Atlantique</p>
                        <p className="text-xs text-muted-foreground">Il y a 2 heures</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Eye className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Dossier FIN-2024-002 en vérification</p>
                        <p className="text-xs text-muted-foreground">Il y a 1 jour</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-warning/10">
                        <FileText className="h-4 w-4 text-warning" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Brouillon FIN-2024-003 créé</p>
                        <p className="text-xs text-muted-foreground">Il y a 2 jours</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pipeline visualization */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle>Pipeline des dossiers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(statusConfig).slice(0, 8).map(([key, config]) => {
                    const count = mockDossiers.filter((d) => d.status === key).length;
                    const hasItems = count > 0;
                    return (
                      <div
                        key={key}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          hasItems ? "border-border bg-card hover:bg-muted/50 cursor-pointer" : "border-dashed border-border/50 bg-muted/20"
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${config.color}`}>
                          <config.icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-lg font-bold leading-none ${hasItems ? "text-foreground" : "text-muted-foreground/50"}`}>{count}</p>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">{config.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dossiers">
            {renderDossiersList()}
          </TabsContent>

          <TabsContent value="offres">
            {renderOffers()}
          </TabsContent>

          <TabsContent value="partenaires">
            {renderPartners()}
          </TabsContent>

          <TabsContent value="reporting">
            {renderReporting()}
          </TabsContent>

          {canReceiveDonations && (
            <TabsContent value="dons">
              <Card>
                <CardHeader>
                  <CardTitle>Dons reçus</CardTitle>
                  <CardDescription>
                    Gérez les dons et contributions reçus par votre organisation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center py-12">
                    Aucun don reçu pour le moment
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Pre-diagnostic Wizard */}
        {showWizard && renderPreDiagWizard()}

        {/* Modal upgrade Donner */}
        <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
          <DialogContent className="max-w-sm">
            <DialogHeader className="text-center">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-7 h-7 text-amber-500" />
              </div>
              <DialogTitle>Fonctionnalité Donner verrouillée</DialogTitle>
              <DialogDescription className="pt-2">
                Pour accéder à la fonctionnalité de dons, vous devez passer au plan <span className="font-semibold text-primary">Institutionnel</span>.
                <br />
                Vous êtes actuellement sur le plan <span className="font-semibold">{currentTierName}</span>.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2 pt-4">
              <Button
                className="w-full gap-2"
                onClick={() => {
                  setShowUpgradeModal(false);
                  // navigate vers la page d'abonnement si besoin
                }}
              >
                <ArrowUpCircle className="w-4 h-4" />
                Voir les plans
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setShowUpgradeModal(false)}
              >
                Plus tard
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dossier Builder */}
        {showDossierBuilder && (
          <DossierBuilder
            onClose={() => setShowDossierBuilder(false)}
            onSave={(data) => { console.log("Saved:", data); }}
            onSubmit={(data) => { setShowDossierBuilder(false); setActiveTab("dossiers"); }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
