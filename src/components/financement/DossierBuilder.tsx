import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Building2, 
  Target,
  TrendingUp,
  Briefcase,
  Shield,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Save,
  Send,
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  Phone,
  Mail,
  Globe,
  Trash2,
  Plus,
  FileCheck,
  Clock,
  Award,
  BarChart3,
  ShoppingCart,
  Handshake,
  Home,
  Car,
  Banknote,
  Eye
} from "lucide-react";
import { regions, getVillesByRegion } from "@/data/regions";
import { getSectorN1List, getSectorN2List } from "@/data/sectors";

interface DossierBuilderProps {
  dossierId?: string;
  onClose: () => void;
  onSave: (data: any) => void;
  onSubmit: (data: any) => void;
}

interface DocumentItem {
  id: string;
  name: string;
  required: boolean;
  uploaded: boolean;
  fileName?: string;
  expirationDate?: string;
}

const initialDocuments: DocumentItem[] = [
  { id: "rccm", name: "RCCM / Registre du Commerce", required: true, uploaded: false },
  { id: "idu", name: "IDU / Numéro fiscal", required: true, uploaded: false },
  { id: "statuts", name: "Statuts de l'entreprise", required: true, uploaded: false },
  { id: "id_representant", name: "Pièce d'identité du représentant", required: true, uploaded: false },
  { id: "etats_financiers", name: "États financiers (2 dernières années)", required: true, uploaded: false },
  { id: "releves_bancaires", name: "Relevés bancaires (6 mois)", required: true, uploaded: false },
  { id: "business_plan", name: "Business plan / Note de projet", required: false, uploaded: false },
  { id: "attestation_cnps", name: "Attestation CNPS", required: false, uploaded: false },
  { id: "certifications", name: "Certifications (qualité, bio, etc.)", required: false, uploaded: false },
];

export function DossierBuilder({ dossierId, onClose, onSave, onSubmit }: DossierBuilderProps) {
  const [activeTab, setActiveTab] = useState("entreprise");
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [entrepriseData, setEntrepriseData] = useState({
    raisonSociale: "Entreprise Demo SARL",
    formeJuridique: "sarl",
    rccm: "CI-ABJ-2020-B-12345",
    idu: "1234567A",
    dateCreation: "2020-01-15",
    capital: "10000000",
    effectif: "15",
    secteur: "N1-PRI",
    filiere: "",
    activitePrincipale: "Production et export de cacao",
    adresse: "Cocody, Abidjan",
    region: "LAGUNES",
    ville: "Abidjan",
    telephone: "+225 07 00 00 00 00",
    email: "contact@entreprise.ci",
    siteWeb: "",
    representantNom: "Jean Kouassi",
    representantFonction: "Gérant",
    representantTelephone: "+225 07 00 00 00 01",
    representantEmail: "jean@entreprise.ci",
  });

  const [projetData, setProjetData] = useState({
    titre: "",
    description: "",
    objectifs: "",
    usageFonds: "",
    montantTotal: "",
    montantDemande: "",
    apportPersonnel: "",
    dateDebutProjet: "",
    dureeProjet: "",
    localisationProjet: "",
    impactEmplois: "",
    impactEnvironnemental: "",
  });

  const [financesData, setFinancesData] = useState({
    caAnnee1: "",
    caAnnee2: "",
    resultatAnnee1: "",
    resultatAnnee2: "",
    tresorerieActuelle: "",
    dettesLongTerme: "",
    dettesCourTerme: "",
    chargesMensuelles: "",
    capaciteRemboursement: "",
    margeNette: "",
    ratioEndettement: "",
  });

  const [tractionData, setTractionData] = useState({
    nombreClients: "",
    clientsPrincipaux: "",
    contratsEnCours: "",
    valeurContratsEnCours: "",
    ventesMarketplace: "",
    aoGagnes: "",
    references: "",
    partenariats: "",
    croissanceCA: "",
  });

  const [garantiesData, setGarantiesData] = useState({
    immobilier: false,
    immobilierValeur: "",
    immobilierDescription: "",
    equipements: false,
    equipementsValeur: "",
    equipementsDescription: "",
    vehicules: false,
    vehiculesValeur: "",
    vehiculesDescription: "",
    stocks: false,
    stocksValeur: "",
    stocksDescription: "",
    cautionPersonnelle: false,
    cautionMontant: "",
    assuranceVie: false,
    assuranceMontant: "",
    nantissement: false,
    nantissementDescription: "",
    autresGaranties: "",
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);

  const sectorList = getSectorN1List();
  const filiereList = entrepriseData.secteur ? getSectorN2List(entrepriseData.secteur) : [];
  const villeList = entrepriseData.region ? getVillesByRegion(entrepriseData.region as any) : [];

  // Calculate completion score
  const calculateCompletionScore = () => {
    let score = 0;
    let total = 0;

    // Entreprise (25%)
    const entrepriseFields = Object.values(entrepriseData).filter(v => v !== "");
    score += (entrepriseFields.length / Object.keys(entrepriseData).length) * 25;
    total += 25;

    // Projet (25%)
    const projetFields = Object.values(projetData).filter(v => v !== "");
    score += (projetFields.length / Object.keys(projetData).length) * 25;
    total += 25;

    // Finances (20%)
    const financesFields = Object.values(financesData).filter(v => v !== "");
    score += (financesFields.length / Object.keys(financesData).length) * 20;
    total += 20;

    // Traction (15%)
    const tractionFields = Object.values(tractionData).filter(v => v !== "");
    score += (tractionFields.length / Object.keys(tractionData).length) * 15;
    total += 15;

    // Documents (15%)
    const requiredDocs = documents.filter(d => d.required);
    const uploadedRequiredDocs = requiredDocs.filter(d => d.uploaded);
    score += (uploadedRequiredDocs.length / requiredDocs.length) * 15;
    total += 15;

    return Math.round(score);
  };

  const completionScore = calculateCompletionScore();

  const getBlockingIssues = () => {
    const issues: string[] = [];
    
    if (!entrepriseData.rccm) issues.push("RCCM manquant");
    if (!entrepriseData.idu) issues.push("IDU manquant");
    if (!projetData.montantDemande) issues.push("Montant demandé non renseigné");
    if (!projetData.usageFonds) issues.push("Usage des fonds non précisé");
    
    const requiredDocsNotUploaded = documents.filter(d => d.required && !d.uploaded);
    if (requiredDocsNotUploaded.length > 0) {
      issues.push(`${requiredDocsNotUploaded.length} document(s) obligatoire(s) manquant(s)`);
    }

    return issues;
  };

  const blockingIssues = getBlockingIssues();
  const canSubmit = completionScore >= 80 && blockingIssues.length === 0;

  const handleDocumentUpload = (docId: string) => {
    setDocuments(docs => 
      docs.map(d => d.id === docId ? { ...d, uploaded: true, fileName: "document_" + docId + ".pdf" } : d)
    );
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onSave({
        entreprise: entrepriseData,
        projet: projetData,
        finances: financesData,
        traction: tractionData,
        garanties: garantiesData,
        documents,
        completionScore,
      });
      setIsSaving(false);
    }, 1000);
  };

  const formatCurrency = (value: string) => {
    const num = parseInt(value.replace(/\D/g, ""));
    if (isNaN(num)) return "";
    return num.toLocaleString("fr-FR");
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 overflow-y-auto">
      <div className="container max-w-6xl py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Dossier de Financement</h1>
              <p className="text-muted-foreground">
                {dossierId || "Nouveau dossier"} — Complétez toutes les sections
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Complétude: {completionScore}%</span>
              </div>
              <Progress value={completionScore} className="w-32 h-2 mt-1" />
            </div>
            <Button variant="outline" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
            <Button onClick={() => onSubmit({ completionScore })} disabled={!canSubmit}>
              <Send className="h-4 w-4 mr-2" />
              Soumettre
            </Button>
          </div>
        </div>

        {/* Blocking issues */}
        {blockingIssues.length > 0 && (
          <Card className="mb-6 border-warning/50 bg-warning/5">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-warning">Éléments bloquants</p>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                    {blockingIssues.map((issue, i) => (
                      <li key={i}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="entreprise" className="gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden md:inline">Entreprise</span>
            </TabsTrigger>
            <TabsTrigger value="projet" className="gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden md:inline">Projet</span>
            </TabsTrigger>
            <TabsTrigger value="finances" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden md:inline">Finances</span>
            </TabsTrigger>
            <TabsTrigger value="traction" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden md:inline">Traction</span>
            </TabsTrigger>
            <TabsTrigger value="garanties" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden md:inline">Garanties</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden md:inline">Documents</span>
            </TabsTrigger>
          </TabsList>

          {/* Entreprise Tab */}
          <TabsContent value="entreprise">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Raison sociale *</Label>
                      <Input
                        value={entrepriseData.raisonSociale}
                        onChange={(e) => setEntrepriseData({ ...entrepriseData, raisonSociale: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Forme juridique *</Label>
                      <Select value={entrepriseData.formeJuridique} onValueChange={(v) => setEntrepriseData({ ...entrepriseData, formeJuridique: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sarl">SARL</SelectItem>
                          <SelectItem value="sa">SA</SelectItem>
                          <SelectItem value="sas">SAS</SelectItem>
                          <SelectItem value="ei">Entreprise Individuelle</SelectItem>
                          <SelectItem value="gie">GIE</SelectItem>
                          <SelectItem value="cooperative">Coopérative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>RCCM *</Label>
                      <Input
                        value={entrepriseData.rccm}
                        onChange={(e) => setEntrepriseData({ ...entrepriseData, rccm: e.target.value })}
                        placeholder="CI-ABJ-2020-B-12345"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>IDU / N° fiscal *</Label>
                      <Input
                        value={entrepriseData.idu}
                        onChange={(e) => setEntrepriseData({ ...entrepriseData, idu: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Date de création</Label>
                      <Input
                        type="date"
                        value={entrepriseData.dateCreation}
                        onChange={(e) => setEntrepriseData({ ...entrepriseData, dateCreation: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Capital social (FCFA)</Label>
                      <Input
                        value={formatCurrency(entrepriseData.capital)}
                        onChange={(e) => setEntrepriseData({ ...entrepriseData, capital: e.target.value.replace(/\D/g, "") })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Effectif</Label>
                      <Input
                        type="number"
                        value={entrepriseData.effectif}
                        onChange={(e) => setEntrepriseData({ ...entrepriseData, effectif: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Secteur d'activité</Label>
                      <Select value={entrepriseData.secteur} onValueChange={(v) => setEntrepriseData({ ...entrepriseData, secteur: v, filiere: "" })}>
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
                    <div className="space-y-2">
                      <Label>Filière</Label>
                      <Select value={entrepriseData.filiere} onValueChange={(v) => setEntrepriseData({ ...entrepriseData, filiere: v })} disabled={!entrepriseData.secteur}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {filiereList.map((f) => (
                            <SelectItem key={f.code} value={f.code}>{f.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Activité principale</Label>
                    <Textarea
                      value={entrepriseData.activitePrincipale}
                      onChange={(e) => setEntrepriseData({ ...entrepriseData, activitePrincipale: e.target.value })}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Coordonnées</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Région</Label>
                        <Select value={entrepriseData.region} onValueChange={(v) => setEntrepriseData({ ...entrepriseData, region: v, ville: "" })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {regions.map((r) => (
                              <SelectItem key={r} value={r}>{r}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Ville</Label>
                        <Select value={entrepriseData.ville} onValueChange={(v) => setEntrepriseData({ ...entrepriseData, ville: v })} disabled={!entrepriseData.region}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {villeList.map((v) => (
                              <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Adresse complète</Label>
                      <Input
                        value={entrepriseData.adresse}
                        onChange={(e) => setEntrepriseData({ ...entrepriseData, adresse: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Téléphone</Label>
                        <Input
                          value={entrepriseData.telephone}
                          onChange={(e) => setEntrepriseData({ ...entrepriseData, telephone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={entrepriseData.email}
                          onChange={(e) => setEntrepriseData({ ...entrepriseData, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Site web</Label>
                      <Input
                        value={entrepriseData.siteWeb}
                        onChange={(e) => setEntrepriseData({ ...entrepriseData, siteWeb: e.target.value })}
                        placeholder="https://"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Représentant légal</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Nom complet</Label>
                        <Input
                          value={entrepriseData.representantNom}
                          onChange={(e) => setEntrepriseData({ ...entrepriseData, representantNom: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Fonction</Label>
                        <Input
                          value={entrepriseData.representantFonction}
                          onChange={(e) => setEntrepriseData({ ...entrepriseData, representantFonction: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Téléphone</Label>
                        <Input
                          value={entrepriseData.representantTelephone}
                          onChange={(e) => setEntrepriseData({ ...entrepriseData, representantTelephone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={entrepriseData.representantEmail}
                          onChange={(e) => setEntrepriseData({ ...entrepriseData, representantEmail: e.target.value })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Projet Tab */}
          <TabsContent value="projet">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Description du projet</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Titre du projet *</Label>
                    <Input
                      value={projetData.titre}
                      onChange={(e) => setProjetData({ ...projetData, titre: e.target.value })}
                      placeholder="Ex: Extension de l'unité de transformation"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description détaillée *</Label>
                    <Textarea
                      value={projetData.description}
                      onChange={(e) => setProjetData({ ...projetData, description: e.target.value })}
                      rows={4}
                      placeholder="Décrivez votre projet en détail..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Objectifs attendus</Label>
                    <Textarea
                      value={projetData.objectifs}
                      onChange={(e) => setProjetData({ ...projetData, objectifs: e.target.value })}
                      rows={3}
                      placeholder="Quels sont les objectifs quantifiés du projet?"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Usage des fonds *</Label>
                    <Select value={projetData.usageFonds} onValueChange={(v) => setProjetData({ ...projetData, usageFonds: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fonds_roulement">Fonds de roulement</SelectItem>
                        <SelectItem value="investissement">Investissement équipement</SelectItem>
                        <SelectItem value="immobilier">Immobilier / Construction</SelectItem>
                        <SelectItem value="stock">Stock / Approvisionnement</SelectItem>
                        <SelectItem value="rd">R&D / Innovation</SelectItem>
                        <SelectItem value="export">Export / International</SelectItem>
                        <SelectItem value="croissance">Croissance / Scale-up</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Budget & Planning</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Coût total du projet (FCFA)</Label>
                        <Input
                          value={formatCurrency(projetData.montantTotal)}
                          onChange={(e) => setProjetData({ ...projetData, montantTotal: e.target.value.replace(/\D/g, "") })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Montant demandé (FCFA) *</Label>
                        <Input
                          value={formatCurrency(projetData.montantDemande)}
                          onChange={(e) => setProjetData({ ...projetData, montantDemande: e.target.value.replace(/\D/g, "") })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Apport personnel (FCFA)</Label>
                      <Input
                        value={formatCurrency(projetData.apportPersonnel)}
                        onChange={(e) => setProjetData({ ...projetData, apportPersonnel: e.target.value.replace(/\D/g, "") })}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Date de début prévue</Label>
                        <Input
                          type="date"
                          value={projetData.dateDebutProjet}
                          onChange={(e) => setProjetData({ ...projetData, dateDebutProjet: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Durée du projet</Label>
                        <Select value={projetData.dureeProjet} onValueChange={(v) => setProjetData({ ...projetData, dureeProjet: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3 mois</SelectItem>
                            <SelectItem value="6">6 mois</SelectItem>
                            <SelectItem value="12">12 mois</SelectItem>
                            <SelectItem value="18">18 mois</SelectItem>
                            <SelectItem value="24">24 mois</SelectItem>
                            <SelectItem value="36">36 mois</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Localisation du projet</Label>
                      <Input
                        value={projetData.localisationProjet}
                        onChange={(e) => setProjetData({ ...projetData, localisationProjet: e.target.value })}
                        placeholder="Région, ville..."
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Impact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Emplois créés / maintenus</Label>
                      <Input
                        value={projetData.impactEmplois}
                        onChange={(e) => setProjetData({ ...projetData, impactEmplois: e.target.value })}
                        placeholder="Ex: 10 emplois créés, 5 maintenus"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Impact environnemental</Label>
                      <Textarea
                        value={projetData.impactEnvironnemental}
                        onChange={(e) => setProjetData({ ...projetData, impactEnvironnemental: e.target.value })}
                        rows={2}
                        placeholder="Décrire l'impact environnemental si applicable..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Finances Tab */}
          <TabsContent value="finances">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chiffre d'affaires & Résultats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>CA Année N-1 (FCFA)</Label>
                      <Input
                        value={formatCurrency(financesData.caAnnee1)}
                        onChange={(e) => setFinancesData({ ...financesData, caAnnee1: e.target.value.replace(/\D/g, "") })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CA Année N-2 (FCFA)</Label>
                      <Input
                        value={formatCurrency(financesData.caAnnee2)}
                        onChange={(e) => setFinancesData({ ...financesData, caAnnee2: e.target.value.replace(/\D/g, "") })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Résultat net N-1 (FCFA)</Label>
                      <Input
                        value={formatCurrency(financesData.resultatAnnee1)}
                        onChange={(e) => setFinancesData({ ...financesData, resultatAnnee1: e.target.value.replace(/\D/g, "") })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Résultat net N-2 (FCFA)</Label>
                      <Input
                        value={formatCurrency(financesData.resultatAnnee2)}
                        onChange={(e) => setFinancesData({ ...financesData, resultatAnnee2: e.target.value.replace(/\D/g, "") })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Marge nette (%)</Label>
                    <Input
                      value={financesData.margeNette}
                      onChange={(e) => setFinancesData({ ...financesData, margeNette: e.target.value })}
                      placeholder="Ex: 15"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Trésorerie & Dettes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Trésorerie actuelle (FCFA)</Label>
                    <Input
                      value={formatCurrency(financesData.tresorerieActuelle)}
                      onChange={(e) => setFinancesData({ ...financesData, tresorerieActuelle: e.target.value.replace(/\D/g, "") })}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Dettes long terme (FCFA)</Label>
                      <Input
                        value={formatCurrency(financesData.dettesLongTerme)}
                        onChange={(e) => setFinancesData({ ...financesData, dettesLongTerme: e.target.value.replace(/\D/g, "") })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Dettes court terme (FCFA)</Label>
                      <Input
                        value={formatCurrency(financesData.dettesCourTerme)}
                        onChange={(e) => setFinancesData({ ...financesData, dettesCourTerme: e.target.value.replace(/\D/g, "") })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Charges mensuelles (FCFA)</Label>
                    <Input
                      value={formatCurrency(financesData.chargesMensuelles)}
                      onChange={(e) => setFinancesData({ ...financesData, chargesMensuelles: e.target.value.replace(/\D/g, "") })}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Capacité de remboursement mensuelle</Label>
                      <Input
                        value={formatCurrency(financesData.capaciteRemboursement)}
                        onChange={(e) => setFinancesData({ ...financesData, capaciteRemboursement: e.target.value.replace(/\D/g, "") })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ratio d'endettement (%)</Label>
                      <Input
                        value={financesData.ratioEndettement}
                        onChange={(e) => setFinancesData({ ...financesData, ratioEndettement: e.target.value })}
                        placeholder="Ex: 30"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Traction Tab */}
          <TabsContent value="traction">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Clients & Commandes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Nombre de clients actifs</Label>
                      <Input
                        type="number"
                        value={tractionData.nombreClients}
                        onChange={(e) => setTractionData({ ...tractionData, nombreClients: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Croissance CA (%)</Label>
                      <Input
                        value={tractionData.croissanceCA}
                        onChange={(e) => setTractionData({ ...tractionData, croissanceCA: e.target.value })}
                        placeholder="Ex: +25%"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Clients principaux</Label>
                    <Textarea
                      value={tractionData.clientsPrincipaux}
                      onChange={(e) => setTractionData({ ...tractionData, clientsPrincipaux: e.target.value })}
                      rows={2}
                      placeholder="Listez vos principaux clients..."
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Contrats en cours</Label>
                      <Input
                        type="number"
                        value={tractionData.contratsEnCours}
                        onChange={(e) => setTractionData({ ...tractionData, contratsEnCours: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Valeur des contrats (FCFA)</Label>
                      <Input
                        value={formatCurrency(tractionData.valeurContratsEnCours)}
                        onChange={(e) => setTractionData({ ...tractionData, valeurContratsEnCours: e.target.value.replace(/\D/g, "") })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance CPU-PME</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Ventes Marketplace (FCFA)</Label>
                      <Input
                        value={formatCurrency(tractionData.ventesMarketplace)}
                        onChange={(e) => setTractionData({ ...tractionData, ventesMarketplace: e.target.value.replace(/\D/g, "") })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>AO gagnés</Label>
                      <Input
                        type="number"
                        value={tractionData.aoGagnes}
                        onChange={(e) => setTractionData({ ...tractionData, aoGagnes: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Références clients</Label>
                    <Textarea
                      value={tractionData.references}
                      onChange={(e) => setTractionData({ ...tractionData, references: e.target.value })}
                      rows={3}
                      placeholder="Détaillez vos références et réalisations..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Partenariats stratégiques</Label>
                    <Textarea
                      value={tractionData.partenariats}
                      onChange={(e) => setTractionData({ ...tractionData, partenariats: e.target.value })}
                      rows={2}
                      placeholder="Partenaires, distributeurs, fournisseurs clés..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Garanties Tab */}
          <TabsContent value="garanties">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Garanties réelles</CardTitle>
                  <CardDescription>Actifs pouvant servir de garantie</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Immobilier */}
                  <div className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="immobilier"
                        checked={garantiesData.immobilier}
                        onCheckedChange={(c) => setGarantiesData({ ...garantiesData, immobilier: !!c })}
                      />
                      <Label htmlFor="immobilier" className="flex items-center gap-2 cursor-pointer">
                        <Home className="h-4 w-4" />
                        Bien immobilier
                      </Label>
                    </div>
                    {garantiesData.immobilier && (
                      <div className="grid gap-4 pl-6">
                        <div className="space-y-2">
                          <Label>Valeur estimée (FCFA)</Label>
                          <Input
                            value={formatCurrency(garantiesData.immobilierValeur)}
                            onChange={(e) => setGarantiesData({ ...garantiesData, immobilierValeur: e.target.value.replace(/\D/g, "") })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            value={garantiesData.immobilierDescription}
                            onChange={(e) => setGarantiesData({ ...garantiesData, immobilierDescription: e.target.value })}
                            placeholder="Type, localisation, titre foncier..."
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Équipements */}
                  <div className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="equipements"
                        checked={garantiesData.equipements}
                        onCheckedChange={(c) => setGarantiesData({ ...garantiesData, equipements: !!c })}
                      />
                      <Label htmlFor="equipements" className="flex items-center gap-2 cursor-pointer">
                        <Briefcase className="h-4 w-4" />
                        Équipements / Machines
                      </Label>
                    </div>
                    {garantiesData.equipements && (
                      <div className="grid gap-4 pl-6">
                        <div className="space-y-2">
                          <Label>Valeur estimée (FCFA)</Label>
                          <Input
                            value={formatCurrency(garantiesData.equipementsValeur)}
                            onChange={(e) => setGarantiesData({ ...garantiesData, equipementsValeur: e.target.value.replace(/\D/g, "") })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            value={garantiesData.equipementsDescription}
                            onChange={(e) => setGarantiesData({ ...garantiesData, equipementsDescription: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Véhicules */}
                  <div className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="vehicules"
                        checked={garantiesData.vehicules}
                        onCheckedChange={(c) => setGarantiesData({ ...garantiesData, vehicules: !!c })}
                      />
                      <Label htmlFor="vehicules" className="flex items-center gap-2 cursor-pointer">
                        <Car className="h-4 w-4" />
                        Véhicules
                      </Label>
                    </div>
                    {garantiesData.vehicules && (
                      <div className="grid gap-4 pl-6">
                        <div className="space-y-2">
                          <Label>Valeur estimée (FCFA)</Label>
                          <Input
                            value={formatCurrency(garantiesData.vehiculesValeur)}
                            onChange={(e) => setGarantiesData({ ...garantiesData, vehiculesValeur: e.target.value.replace(/\D/g, "") })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            value={garantiesData.vehiculesDescription}
                            onChange={(e) => setGarantiesData({ ...garantiesData, vehiculesDescription: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stocks */}
                  <div className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="stocks"
                        checked={garantiesData.stocks}
                        onCheckedChange={(c) => setGarantiesData({ ...garantiesData, stocks: !!c })}
                      />
                      <Label htmlFor="stocks" className="flex items-center gap-2 cursor-pointer">
                        <ShoppingCart className="h-4 w-4" />
                        Stocks / Marchandises
                      </Label>
                    </div>
                    {garantiesData.stocks && (
                      <div className="grid gap-4 pl-6">
                        <div className="space-y-2">
                          <Label>Valeur estimée (FCFA)</Label>
                          <Input
                            value={formatCurrency(garantiesData.stocksValeur)}
                            onChange={(e) => setGarantiesData({ ...garantiesData, stocksValeur: e.target.value.replace(/\D/g, "") })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            value={garantiesData.stocksDescription}
                            onChange={(e) => setGarantiesData({ ...garantiesData, stocksDescription: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Garanties personnelles</CardTitle>
                  <CardDescription>Engagements personnels et assurances</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Caution personnelle */}
                  <div className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="caution"
                        checked={garantiesData.cautionPersonnelle}
                        onCheckedChange={(c) => setGarantiesData({ ...garantiesData, cautionPersonnelle: !!c })}
                      />
                      <Label htmlFor="caution" className="flex items-center gap-2 cursor-pointer">
                        <Handshake className="h-4 w-4" />
                        Caution personnelle
                      </Label>
                    </div>
                    {garantiesData.cautionPersonnelle && (
                      <div className="pl-6">
                        <div className="space-y-2">
                          <Label>Montant de la caution (FCFA)</Label>
                          <Input
                            value={formatCurrency(garantiesData.cautionMontant)}
                            onChange={(e) => setGarantiesData({ ...garantiesData, cautionMontant: e.target.value.replace(/\D/g, "") })}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Assurance vie */}
                  <div className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="assurance"
                        checked={garantiesData.assuranceVie}
                        onCheckedChange={(c) => setGarantiesData({ ...garantiesData, assuranceVie: !!c })}
                      />
                      <Label htmlFor="assurance" className="flex items-center gap-2 cursor-pointer">
                        <Shield className="h-4 w-4" />
                        Assurance vie / Décès
                      </Label>
                    </div>
                    {garantiesData.assuranceVie && (
                      <div className="pl-6">
                        <div className="space-y-2">
                          <Label>Capital assuré (FCFA)</Label>
                          <Input
                            value={formatCurrency(garantiesData.assuranceMontant)}
                            onChange={(e) => setGarantiesData({ ...garantiesData, assuranceMontant: e.target.value.replace(/\D/g, "") })}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Nantissement */}
                  <div className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="nantissement"
                        checked={garantiesData.nantissement}
                        onCheckedChange={(c) => setGarantiesData({ ...garantiesData, nantissement: !!c })}
                      />
                      <Label htmlFor="nantissement" className="flex items-center gap-2 cursor-pointer">
                        <Banknote className="h-4 w-4" />
                        Nantissement (compte, titres, créances)
                      </Label>
                    </div>
                    {garantiesData.nantissement && (
                      <div className="pl-6">
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={garantiesData.nantissementDescription}
                            onChange={(e) => setGarantiesData({ ...garantiesData, nantissementDescription: e.target.value })}
                            rows={2}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Autres garanties</Label>
                    <Textarea
                      value={garantiesData.autresGaranties}
                      onChange={(e) => setGarantiesData({ ...garantiesData, autresGaranties: e.target.value })}
                      rows={3}
                      placeholder="Autres garanties ou sûretés à proposer..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Documents requis</CardTitle>
                    <CardDescription>
                      {documents.filter(d => d.uploaded).length} / {documents.length} documents téléchargés
                    </CardDescription>
                  </div>
                  <Progress 
                    value={(documents.filter(d => d.uploaded).length / documents.length) * 100} 
                    className="w-32 h-2"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className={`p-4 rounded-lg border ${doc.uploaded ? "border-success/50 bg-success/5" : doc.required ? "border-warning/50 bg-warning/5" : "border-border"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {doc.uploaded ? (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          ) : (
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          )}
                          <div>
                            <p className="font-medium">
                              {doc.name}
                              {doc.required && <span className="text-destructive ml-1">*</span>}
                            </p>
                            {doc.uploaded && doc.fileName && (
                              <p className="text-sm text-muted-foreground">{doc.fileName}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.required && !doc.uploaded && (
                            <Badge variant="outline" className="text-warning border-warning">
                              Obligatoire
                            </Badge>
                          )}
                          {doc.uploaded ? (
                            <>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setDocuments(docs => docs.map(d => d.id === doc.id ? { ...d, uploaded: false, fileName: undefined } : d))}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => handleDocumentUpload(doc.id)}>
                              <Upload className="h-4 w-4 mr-2" />
                              Télécharger
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
