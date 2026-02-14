import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  BookOpen, Search, Clock, Users, Award, Star, Play, Video, Calendar, 
  User, Filter, MapPin, Target, FileText, ShoppingCart, Wallet, 
  Lightbulb, BarChart3, ArrowRight, X, RefreshCw, Briefcase, GraduationCap
} from "lucide-react";
import { sectors } from "@/data/sectors";
import { regions, getVillesByRegion } from "@/data/regions";
import { cn } from "@/lib/utils";

interface Formation {
  id: string;
  title: string;
  description: string;
  category: string;
  level: "debutant" | "intermediaire" | "avance";
  duration: string;
  format: "video" | "live" | "presentiel" | "hybrid";
  type: "classique" | "rac" | "alternance" | "parcours" | "certifiante" | "webinaire";
  instructor: string;
  price: number;
  isFree: boolean;
  isMemberOnly: boolean;
  hasCertificate: boolean;
  enrolled: number;
  rating: number;
  competences: string[];
  moduleLink: string;
  region?: string;
  ville?: string;
  outcomes: string[];
  alternanceDetails?: { entreprise: string; centre: string; rythme: string };
  racDetails?: { prerequis: string; duree: string };
}

const mockFormations: Formation[] = [
  {
    id: "1", title: "Préparation aux Appels d'Offres", description: "Maîtrisez le processus complet de réponse aux appels d'offres publics et privés.",
    category: "Marchés Publics", level: "intermediaire", duration: "12h", format: "hybrid", type: "classique",
    instructor: "Expert DGMP", price: 0, isFree: true, isMemberOnly: true, hasCertificate: true,
    enrolled: 456, rating: 4.9, competences: ["Rédaction AO", "Conformité", "Soumission"], moduleLink: "AO",
    outcomes: ["Préparer un dossier complet", "Éviter les erreurs éliminatoires"]
  },
  {
    id: "2", title: "Comptabilité SYSCOHADA Révisé", description: "Formation complète sur les normes comptables OHADA en vigueur.",
    category: "Finance", level: "intermediaire", duration: "20h", format: "hybrid", type: "certifiante",
    instructor: "Expert OECCA-CI", price: 150000, isFree: false, isMemberOnly: false, hasCertificate: true,
    enrolled: 156, rating: 4.9, competences: ["Comptabilité", "Fiscalité", "Reporting"], moduleLink: "Financement",
    outcomes: ["Tenir une comptabilité conforme", "Produire des états financiers"]
  },
  {
    id: "3", title: "Vendre sur Marketplace", description: "Développez vos ventes en ligne avec une fiche produit optimisée.",
    category: "E-commerce", level: "debutant", duration: "8h", format: "video", type: "classique",
    instructor: "Marie Bamba", price: 0, isFree: true, isMemberOnly: true, hasCertificate: true,
    enrolled: 789, rating: 4.8, competences: ["Vente en ligne", "Fiche produit", "SEO"], moduleLink: "Marketplace",
    outcomes: ["Créer une boutique attractive", "Gérer les commandes"]
  },
  {
    id: "4", title: "Business Plan & Bancabilité", description: "Structurez votre dossier de financement pour convaincre les banques.",
    category: "Finance", level: "intermediaire", duration: "15h", format: "live", type: "classique",
    instructor: "Consultant BDF", price: 100000, isFree: false, isMemberOnly: false, hasCertificate: true,
    enrolled: 234, rating: 4.7, competences: ["Business plan", "Prévisionnel", "Négociation"], moduleLink: "Financement",
    outcomes: ["Présenter un dossier bancable", "Négocier avec les banques"]
  },
  {
    id: "5", title: "Transformation Digitale PME", description: "Maîtrisez les outils et stratégies pour digitaliser votre entreprise.",
    category: "Numérique", level: "debutant", duration: "8h", format: "video", type: "webinaire",
    instructor: "Dr. Kouamé Jean", price: 0, isFree: true, isMemberOnly: true, hasCertificate: true,
    enrolled: 234, rating: 4.8, competences: ["Outils digitaux", "Stratégie", "ROI"], moduleLink: "Incubateur",
    outcomes: ["Identifier les outils adaptés", "Mesurer le ROI digital"]
  },
  {
    id: "6", title: "Export & Commerce International", description: "Maîtrisez les procédures d'export et les incoterms.",
    category: "Commerce", level: "avance", duration: "25h", format: "presentiel", type: "certifiante",
    instructor: "Expert APEX-CI", price: 200000, isFree: false, isMemberOnly: false, hasCertificate: true,
    enrolled: 67, rating: 4.9, competences: ["Export", "Incoterms", "Logistique"], moduleLink: "Marketplace",
    region: "Abidjan", ville: "Plateau", outcomes: ["Exporter en conformité", "Optimiser la logistique"]
  },
  {
    id: "7", title: "Tableau de bord & KPI", description: "Construisez un tableau de bord efficace pour piloter votre activité.",
    category: "Management", level: "intermediaire", duration: "10h", format: "video", type: "classique",
    instructor: "Coach Data CI", price: 75000, isFree: false, isMemberOnly: false, hasCertificate: false,
    enrolled: 123, rating: 4.6, competences: ["KPI", "Dashboard", "Analyse"], moduleLink: "DataHub",
    outcomes: ["Définir les bons KPI", "Automatiser le reporting"]
  },
  {
    id: "8", title: "Normes Qualité ISO 9001", description: "Préparez votre entreprise à la certification ISO 9001.",
    category: "Qualité", level: "avance", duration: "30h", format: "hybrid", type: "certifiante",
    instructor: "Ing. Koffi Yao", price: 250000, isFree: false, isMemberOnly: false, hasCertificate: true,
    enrolled: 45, rating: 4.8, competences: ["ISO 9001", "Qualité", "Audit"], moduleLink: "Incubateur",
    region: "Bouaké", ville: "Bouaké", outcomes: ["Mettre en place un SMQ", "Réussir l'audit de certification"]
  },
  // RAC - Reconnaissance des Acquis
  {
    id: "9", title: "RAC — Gestion d'entreprise", description: "Faites reconnaître vos acquis professionnels en gestion d'entreprise. Évaluation de vos compétences existantes et certification officielle.",
    category: "Management", level: "intermediaire", duration: "Évaluation 4h + complément si besoin", format: "hybrid", type: "rac",
    instructor: "Jury FDFP-CI", price: 75000, isFree: false, isMemberOnly: false, hasCertificate: true,
    enrolled: 89, rating: 4.7, competences: ["Gestion", "Comptabilité", "RH", "Stratégie"], moduleLink: "Financement",
    outcomes: ["Obtenir une certification sans reprendre la formation complète", "Valider vos années d'expérience"],
    racDetails: { prerequis: "3 ans d'expérience minimum en gestion", duree: "Évaluation 4h, complément 10-20h si nécessaire" }
  },
  {
    id: "10", title: "RAC — Commerce international", description: "Validation des acquis pour les professionnels du commerce international et de l'export.",
    category: "Commerce", level: "avance", duration: "Évaluation 6h", format: "presentiel", type: "rac",
    instructor: "Commission APEX-CI", price: 120000, isFree: false, isMemberOnly: false, hasCertificate: true,
    enrolled: 34, rating: 4.9, competences: ["Export", "Douanes", "Logistique", "Incoterms"], moduleLink: "Marketplace",
    region: "Abidjan", ville: "Plateau",
    outcomes: ["Certificat de compétences Commerce International", "Accès direct aux modules avancés"],
    racDetails: { prerequis: "5 ans d'expérience en import/export", duree: "Évaluation 6h, jury de validation" }
  },
  // Alternance
  {
    id: "11", title: "Alternance — Assistant comptable PME", description: "Formation en alternance : 3 jours en entreprise, 2 jours en centre de formation. Maîtrisez la comptabilité PME en situation réelle.",
    category: "Finance", level: "debutant", duration: "6 mois", format: "presentiel", type: "alternance",
    instructor: "FDFP & Cabinet Koffi", price: 350000, isFree: false, isMemberOnly: false, hasCertificate: true,
    enrolled: 28, rating: 4.8, competences: ["Comptabilité", "Fiscalité", "Paie", "SYSCOHADA"], moduleLink: "Financement",
    region: "Abidjan", ville: "Marcory",
    outcomes: ["Diplôme Assistant Comptable", "Expérience professionnelle intégrée", "Insertion directe en entreprise"],
    alternanceDetails: { entreprise: "3 jours/semaine", centre: "2 jours/semaine", rythme: "6 mois — Rentrée mars & septembre" }
  },
  {
    id: "12", title: "Alternance — Technicien qualité agroalimentaire", description: "Formez-vous au contrôle qualité en alternant entre une unité de production et un centre de formation agréé.",
    category: "Qualité", level: "intermediaire", duration: "9 mois", format: "presentiel", type: "alternance",
    instructor: "LANADA & Partenaires", price: 500000, isFree: false, isMemberOnly: false, hasCertificate: true,
    enrolled: 15, rating: 4.9, competences: ["HACCP", "ISO 22000", "Contrôle qualité", "Traçabilité"], moduleLink: "Incubateur",
    region: "Abidjan", ville: "Yopougon",
    outcomes: ["Certificat Technicien Qualité", "Maîtrise des normes HACCP", "Stage intégré en usine"],
    alternanceDetails: { entreprise: "2 semaines/mois", centre: "2 semaines/mois", rythme: "9 mois — Rentrée janvier" }
  },
  // Parcours structurés
  {
    id: "13", title: "Parcours — Entrepreneur digital", description: "Parcours complet de 5 modules pour lancer et développer une activité digitale : de l'idée au premier client.",
    category: "Numérique", level: "debutant", duration: "40h sur 3 mois", format: "hybrid", type: "parcours",
    instructor: "Pool d'experts CPU Academy", price: 180000, isFree: false, isMemberOnly: false, hasCertificate: true,
    enrolled: 312, rating: 4.8, competences: ["E-commerce", "Marketing digital", "Gestion", "Réseaux sociaux"], moduleLink: "Marketplace",
    outcomes: ["Lancer sa boutique en ligne", "Acquérir ses premiers clients", "Badge Entrepreneur Digital"]
  },
  {
    id: "14", title: "Parcours — Manager opérationnel PME", description: "Parcours en 6 modules couvrant la gestion RH, financière, commerciale et stratégique pour les managers de PME.",
    category: "Management", level: "intermediaire", duration: "60h sur 4 mois", format: "hybrid", type: "parcours",
    instructor: "CGECI & CPU Academy", price: 300000, isFree: false, isMemberOnly: false, hasCertificate: true,
    enrolled: 145, rating: 4.7, competences: ["RH", "Finance", "Stratégie", "Leadership"], moduleLink: "Financement",
    outcomes: ["Piloter une PME efficacement", "Construire un tableau de bord", "Badge Manager PME"]
  },
];

const levelConfig = {
  debutant: { label: "Débutant", color: "bg-green-500/10 text-green-600" },
  intermediaire: { label: "Intermédiaire", color: "bg-amber-500/10 text-amber-600" },
  avance: { label: "Avancé", color: "bg-red-500/10 text-red-600" },
};

const typeConfig: Record<Formation["type"], { label: string; color: string; icon: typeof GraduationCap }> = {
  classique: { label: "Classique", color: "bg-muted text-muted-foreground", icon: BookOpen },
  rac: { label: "RAC", color: "bg-info/10 text-info", icon: Award },
  alternance: { label: "Alternance", color: "bg-secondary/10 text-secondary", icon: RefreshCw },
  parcours: { label: "Parcours", color: "bg-primary/10 text-primary", icon: Target },
  certifiante: { label: "Certifiante", color: "bg-warning/10 text-warning", icon: GraduationCap },
  webinaire: { label: "Webinaire", color: "bg-destructive/10 text-destructive", icon: Video },
};

const formatConfig = {
  video: { label: "Vidéo", icon: Video },
  live: { label: "Live", icon: Calendar },
  presentiel: { label: "Présentiel", icon: MapPin },
  hybrid: { label: "Hybride", icon: Users },
};

const moduleIcons: Record<string, any> = {
  AO: FileText,
  Financement: Wallet,
  Marketplace: ShoppingCart,
  Incubateur: Lightbulb,
  DataHub: BarChart3,
  Events: Calendar,
};

const allCompetences = [...new Set(mockFormations.flatMap(f => f.competences))];
const allModules = [...new Set(mockFormations.map(f => f.moduleLink))];
const allCategories = [...new Set(mockFormations.map(f => f.category))];

interface CatalogueProps {
  onViewDetail: (formationId: string) => void;
}

export function CatalogueFormations({ onViewDetail }: CatalogueProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedFormat, setSelectedFormat] = useState("all");
  const [selectedModule, setSelectedModule] = useState("all");
  const [selectedCompetences, setSelectedCompetences] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredFormations = mockFormations.filter((f) => {
    const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || f.category === selectedCategory;
    const matchesLevel = selectedLevel === "all" || f.level === selectedLevel;
    const matchesPrice = selectedPrice === "all" ||
      (selectedPrice === "free" && f.isFree) ||
      (selectedPrice === "paid" && !f.isFree) ||
      (selectedPrice === "certifiant" && f.hasCertificate);
    const matchesFormat = selectedFormat === "all" || f.format === selectedFormat;
    const matchesModule = selectedModule === "all" || f.moduleLink === selectedModule;
    const matchesCompetences = selectedCompetences.length === 0 || 
      selectedCompetences.some(c => f.competences.includes(c));
    const matchesRegion = selectedRegion === "all" || f.region === selectedRegion;
    const matchesType = selectedType === "all" || f.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesLevel && matchesPrice && 
           matchesFormat && matchesModule && matchesCompetences && matchesRegion && matchesType;
  });

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedLevel("all");
    setSelectedPrice("all");
    setSelectedFormat("all");
    setSelectedModule("all");
    setSelectedCompetences([]);
    setSelectedRegion("all");
    setSelectedType("all");
    setSearchQuery("");
  };

  const hasActiveFilters = selectedCategory !== "all" || selectedLevel !== "all" || 
    selectedPrice !== "all" || selectedFormat !== "all" || selectedModule !== "all" ||
    selectedCompetences.length > 0 || selectedRegion !== "all" || selectedType !== "all" || searchQuery !== "";

  return (
    <div className="space-y-6">
      {/* Search & Quick Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une formation..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant={showFilters ? "secondary" : "outline"} 
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtres avancés
              {hasActiveFilters && <Badge className="ml-1">{
                [selectedCategory, selectedLevel, selectedPrice, selectedFormat, selectedModule, selectedRegion]
                  .filter(f => f !== "all").length + selectedCompetences.length
              }</Badge>}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="gap-1">
                <X className="w-4 h-4" />
                Réinitialiser
              </Button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="classique">Classique</SelectItem>
                <SelectItem value="rac">RAC (Acquis)</SelectItem>
                <SelectItem value="alternance">Alternance</SelectItem>
                <SelectItem value="parcours">Parcours</SelectItem>
                <SelectItem value="certifiante">Certifiante</SelectItem>
                <SelectItem value="webinaire">Webinaire</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedModule} onValueChange={setSelectedModule}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Module lié" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous modules</SelectItem>
                {allModules.map((mod) => (
                  <SelectItem key={mod} value={mod}>{mod}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Niveau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous niveaux</SelectItem>
                <SelectItem value="debutant">Débutant</SelectItem>
                <SelectItem value="intermediaire">Intermédiaire</SelectItem>
                <SelectItem value="avance">Avancé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous formats</SelectItem>
                <SelectItem value="video">Vidéo</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="presentiel">Présentiel</SelectItem>
                <SelectItem value="hybrid">Hybride</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPrice} onValueChange={setSelectedPrice}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Prix" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous prix</SelectItem>
                <SelectItem value="free">Gratuit</SelectItem>
                <SelectItem value="paid">Payant</SelectItem>
                <SelectItem value="certifiant">Certifiant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Catégorie</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      {allCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Région (présentiel)</label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Région" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes régions</SelectItem>
                      {regions.slice(0, 10).map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Compétences</label>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                    {allCompetences.slice(0, 8).map((comp) => (
                      <Badge 
                        key={comp}
                        variant={selectedCompetences.includes(comp) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedCompetences(prev => 
                            prev.includes(comp) 
                              ? prev.filter(c => c !== comp)
                              : [...prev, comp]
                          );
                        }}
                      >
                        {comp}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredFormations.length} formation{filteredFormations.length > 1 ? 's' : ''} trouvée{filteredFormations.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Formations Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFormations.map((formation) => {
          const level = levelConfig[formation.level];
          const format = formatConfig[formation.format];
          const FormatIcon = format.icon;
          const ModuleIcon = moduleIcons[formation.moduleLink] || Target;
          const fType = typeConfig[formation.type];
          const TypeIcon = fType.icon;

          return (
            <Card key={formation.id} className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group" onClick={() => onViewDetail(formation.id)}>
              <div className="h-32 bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center relative">
                <BookOpen className="w-12 h-12 text-primary/50" />
                {/* Module badge */}
                <Badge className="absolute top-3 right-3 gap-1" variant="secondary">
                  <ModuleIcon className="w-3 h-3" />
                  {formation.moduleLink}
                </Badge>
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {formation.type !== "classique" && (
                    <Badge className={cn(fType.color, "border-0 gap-1")}>
                      <TypeIcon className="w-3 h-3" />
                      {fType.label}
                    </Badge>
                  )}
                  <Badge className={level.color}>{level.label}</Badge>
                  <Badge variant="outline" className="gap-1">
                    <FormatIcon className="w-3 h-3" />
                    {format.label}
                  </Badge>
                  {formation.hasCertificate && (
                    <Badge variant="outline" className="gap-1">
                      <Award className="w-3 h-3" />
                      Certifiant
                    </Badge>
                  )}
                </div>

                <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">{formation.title}</h3>

                {/* RAC details */}
                {formation.type === "rac" && formation.racDetails && (
                  <div className="p-2.5 rounded-lg bg-info/5 border border-info/20 text-xs space-y-1">
                    <p className="font-medium text-info flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Reconnaissance des Acquis
                    </p>
                    <p className="text-muted-foreground">Prérequis : {formation.racDetails.prerequis}</p>
                    <p className="text-muted-foreground">Durée : {formation.racDetails.duree}</p>
                  </div>
                )}

                {/* Alternance details */}
                {formation.type === "alternance" && formation.alternanceDetails && (
                  <div className="p-2.5 rounded-lg bg-secondary/5 border border-secondary/20 text-xs space-y-1">
                    <p className="font-medium text-secondary flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" />
                      Formation en alternance
                    </p>
                    <p className="text-muted-foreground">Entreprise : {formation.alternanceDetails.entreprise}</p>
                    <p className="text-muted-foreground">Centre : {formation.alternanceDetails.centre}</p>
                    <p className="text-muted-foreground">Rythme : {formation.alternanceDetails.rythme}</p>
                  </div>
                )}
                
                {/* Outcomes (hidden for rac/alternance to save space) */}
                {formation.type !== "rac" && formation.type !== "alternance" && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Ce que vous saurez faire :</p>
                    {formation.outcomes.slice(0, 2).map((outcome, i) => (
                      <p key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                        <Target className="w-3 h-3 mt-0.5 text-secondary flex-shrink-0" />
                        {outcome}
                      </p>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formation.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {formation.enrolled}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500" />
                    {formation.rating}
                  </span>
                </div>

                {formation.region && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {formation.ville}, {formation.region}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    {formation.isFree ? (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-secondary/10 text-secondary">Gratuit</Badge>
                        {formation.isMemberOnly && (
                          <span className="text-xs text-muted-foreground">Membres</span>
                        )}
                      </div>
                    ) : (
                      <p className="font-bold text-primary">{formation.price.toLocaleString()} FCFA</p>
                    )}
                  </div>
                  <Button size="sm" className="gap-1">
                    <Play className="w-3 h-3" />
                    S'inscrire
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredFormations.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground mb-4">Aucune formation trouvée</p>
            <Button variant="outline" onClick={clearFilters}>Réinitialiser les filtres</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
