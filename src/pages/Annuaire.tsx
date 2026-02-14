import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Users, 
  Star,
  Filter,
  Grid3X3,
  List,
  ChevronRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  Award
} from "lucide-react";
import { regions } from "@/data/regions";
import { sectors, getSectorN1List, getSectorN2List } from "@/data/sectors";

// Données de démonstration des entreprises membres
const mockCompanies = [
  {
    id: "1",
    name: "SARL AgroTech Côte d'Ivoire",
    logo: null,
    sector: "N1-PRI",
    sectorName: "Agriculture",
    filiere: "Cultures de rente",
    region: "LAGUNES",
    ville: "Abidjan",
    commune: "Cocody",
    phone: "+225 07 00 00 00 01",
    email: "contact@agrotech-ci.com",
    website: "www.agrotech-ci.com",
    employeeCount: "10-50",
    yearFounded: 2018,
    description: "Spécialisé dans l'exportation de cacao et café de qualité premium.",
    kycStatus: "validated",
    kycLevel: "renforce",
    memberSince: "2023-01-15",
    plan: "Or",
    rating: 4.8,
    reviewCount: 24,
    certifications: ["Bio", "Fairtrade"],
    activities: ["Cacao", "Café", "Export"],
  },
  {
    id: "2",
    name: "Tech Solutions SARL",
    logo: null,
    sector: "N1-NUM",
    sectorName: "Numérique",
    filiere: "Développement Web/Mobile",
    region: "LAGUNES",
    ville: "Abidjan",
    commune: "Plateau",
    phone: "+225 07 00 00 00 02",
    email: "info@techsolutions.ci",
    website: "www.techsolutions.ci",
    employeeCount: "5-10",
    yearFounded: 2020,
    description: "Développement d'applications mobiles et solutions cloud pour les PME.",
    kycStatus: "validated",
    kycLevel: "standard",
    memberSince: "2023-06-20",
    plan: "Argent",
    rating: 4.5,
    reviewCount: 18,
    certifications: ["ISO 27001"],
    activities: ["Développement mobile", "Cloud", "Cybersécurité"],
  },
  {
    id: "3",
    name: "BTP Excellence SA",
    logo: null,
    sector: "N1-SEC",
    sectorName: "Construction",
    filiere: "Gros œuvre",
    region: "VALLEE DU BANDAMA",
    ville: "Bouaké",
    commune: "Bouaké",
    phone: "+225 07 00 00 00 03",
    email: "contact@btpexcellence.ci",
    website: "www.btpexcellence.ci",
    employeeCount: "50-100",
    yearFounded: 2015,
    description: "Construction de bâtiments et ouvrages de génie civil.",
    kycStatus: "validated",
    kycLevel: "renforce",
    memberSince: "2022-11-01",
    plan: "Or",
    rating: 4.9,
    reviewCount: 45,
    certifications: ["Agrément BTP Classe 2"],
    activities: ["Maçonnerie", "Béton armé", "VRD"],
  },
  {
    id: "4",
    name: "Transport Express CI",
    logo: null,
    sector: "N1-TER",
    sectorName: "Services",
    filiere: "Transport & Logistique",
    region: "LAGUNES",
    ville: "Abidjan",
    commune: "Port-Bouët",
    phone: "+225 07 00 00 00 04",
    email: "info@transportexpress.ci",
    website: "www.transportexpress.ci",
    employeeCount: "20-50",
    yearFounded: 2019,
    description: "Services de transport de marchandises et logistique.",
    kycStatus: "validated",
    kycLevel: "standard",
    memberSince: "2023-03-10",
    plan: "Argent",
    rating: 4.3,
    reviewCount: 32,
    certifications: ["Licence transport"],
    activities: ["Transport routier", "Livraison", "Entreposage"],
  },
  {
    id: "5",
    name: "Hôtel Palm Beach",
    logo: null,
    sector: "N1-TER",
    sectorName: "Tourisme",
    filiere: "Hôtellerie",
    region: "SUD-COMOE",
    ville: "Grand-Bassam",
    commune: "Grand-Bassam",
    phone: "+225 07 00 00 00 05",
    email: "reservation@palmbeach.ci",
    website: "www.palmbeach-ci.com",
    employeeCount: "50-100",
    yearFounded: 2010,
    description: "Hôtel 4 étoiles avec vue sur la mer.",
    kycStatus: "validated",
    kycLevel: "renforce",
    memberSince: "2022-08-15",
    plan: "Or",
    rating: 4.7,
    reviewCount: 156,
    certifications: ["4 étoiles"],
    activities: ["Hébergement", "Restauration", "Événementiel"],
  },
  {
    id: "6",
    name: "Ferme Avicole Moderne",
    logo: null,
    sector: "N1-PRI",
    sectorName: "Agriculture",
    filiere: "Aviculture",
    region: "HAUT-SASSANDRA",
    ville: "Daloa",
    commune: "Daloa",
    phone: "+225 07 00 00 00 06",
    email: "contact@fermeavicole.ci",
    website: null,
    employeeCount: "10-20",
    yearFounded: 2021,
    description: "Élevage de poulets de chair et production d'œufs.",
    kycStatus: "validated",
    kycLevel: "minimum",
    memberSince: "2023-09-01",
    plan: "Basic",
    rating: 4.2,
    reviewCount: 8,
    certifications: [],
    activities: ["Élevage volaille", "Production œufs"],
  },
];

const employeeSizes = [
  { value: "all", label: "Toutes tailles" },
  { value: "1-5", label: "1-5 employés" },
  { value: "5-10", label: "5-10 employés" },
  { value: "10-50", label: "10-50 employés" },
  { value: "50-100", label: "50-100 employés" },
  { value: "100+", label: "100+ employés" },
];

const plans = [
  { value: "all", label: "Tous les plans" },
  { value: "Basic", label: "Basic" },
  { value: "Argent", label: "Argent" },
  { value: "Or", label: "Or" },
];

const kycLevels = [
  { value: "all", label: "Tous les niveaux" },
  { value: "minimum", label: "KYC Minimum" },
  { value: "standard", label: "KYC Standard" },
  { value: "renforce", label: "KYC Renforcé" },
];

const planColors = {
  Basic: "bg-muted text-muted-foreground",
  Argent: "bg-gradient-to-r from-gray-400 to-gray-500 text-white",
  Or: "bg-gradient-to-r from-yellow-500 to-amber-500 text-white",
};

export default function Annuaire() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [selectedFiliere, setSelectedFiliere] = useState<string>("all");
  const [selectedSize, setSelectedSize] = useState<string>("all");
  const [selectedPlan, setSelectedPlan] = useState<string>("all");
  const [selectedKycLevel, setSelectedKycLevel] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCompany, setSelectedCompany] = useState<typeof mockCompanies[0] | null>(null);

  const sectorList = getSectorN1List();
  const filiereList = selectedSector !== "all" ? getSectorN2List(selectedSector) : [];

  const filteredCompanies = useMemo(() => {
    return mockCompanies.filter((company) => {
      const matchesSearch =
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.activities.some((a) => a.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesRegion = selectedRegion === "all" || company.region === selectedRegion;
      const matchesSector = selectedSector === "all" || company.sector === selectedSector;
      const matchesSize = selectedSize === "all" || company.employeeCount === selectedSize;
      const matchesPlan = selectedPlan === "all" || company.plan === selectedPlan;
      const matchesKycLevel = selectedKycLevel === "all" || company.kycLevel === selectedKycLevel;

      return matchesSearch && matchesRegion && matchesSector && matchesSize && matchesPlan && matchesKycLevel;
    });
  }, [searchTerm, selectedRegion, selectedSector, selectedSize, selectedPlan, selectedKycLevel]);

  const stats = {
    totalMembers: mockCompanies.length,
    regionsCount: new Set(mockCompanies.map((c) => c.region)).size,
    sectorsCount: new Set(mockCompanies.map((c) => c.sector)).size,
    kycValidated: mockCompanies.filter((c) => c.kycStatus === "validated").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Annuaire des Membres
            </h1>
            <p className="text-muted-foreground">
              Recherchez et connectez-vous avec les entreprises membres CPU-PME
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalMembers}</p>
                  <p className="text-sm text-muted-foreground">Entreprises membres</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <MapPin className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.regionsCount}</p>
                  <p className="text-sm text-muted-foreground">Régions couvertes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-warning/10">
                  <Briefcase className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.sectorsCount}</p>
                  <p className="text-sm text-muted-foreground">Secteurs d'activité</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.kycValidated}</p>
                  <p className="text-sm text-muted-foreground">KYC validés</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 lg:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, activité, mot-clé..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Première ligne de filtres */}
              <div className="grid gap-4 md:grid-cols-3">
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger>
                    <MapPin className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Région" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les régions</SelectItem>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSector} onValueChange={(v) => { setSelectedSector(v); setSelectedFiliere("all"); }}>
                  <SelectTrigger>
                    <Briefcase className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Secteur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les secteurs</SelectItem>
                    {sectorList.map((sector) => (
                      <SelectItem key={sector.code} value={sector.code}>
                        {sector.name.split(":")[0]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedFiliere} onValueChange={setSelectedFiliere} disabled={selectedSector === "all"}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filière" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les filières</SelectItem>
                    {filiereList.map((filiere) => (
                      <SelectItem key={filiere.code} value={filiere.code}>
                        {filiere.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Deuxième ligne de filtres */}
              <div className="grid gap-4 md:grid-cols-3">
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger>
                    <Users className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Taille" />
                  </SelectTrigger>
                  <SelectContent>
                    {employeeSizes.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                  <SelectTrigger>
                    <Award className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.value} value={plan.value}>
                        {plan.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedKycLevel} onValueChange={setSelectedKycLevel}>
                  <SelectTrigger>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Niveau KYC" />
                  </SelectTrigger>
                  <SelectContent>
                    {kycLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredCompanies.length} entreprise(s) trouvée(s)
          </p>
        </div>

        {viewMode === "grid" ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCompanies.map((company) => (
              <Card
                key={company.id}
                className="border-border/50 transition-all cursor-pointer group"
                onClick={() => setSelectedCompany(company)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={company.logo || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {company.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                          {company.name}
                        </h3>
                        <Badge className={planColors[company.plan as keyof typeof planColors]} variant="secondary">
                          {company.plan}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{company.sectorName} • {company.filiere}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
                    {company.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1">
                    {company.activities.slice(0, 3).map((activity) => (
                      <Badge key={activity} variant="outline" className="text-xs">
                        {activity}
                      </Badge>
                    ))}
                    {company.activities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{company.activities.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{company.ville}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{company.rating}</span>
                      <span className="text-muted-foreground text-sm">({company.reviewCount})</span>
                    </div>
                  </div>

                  {company.certifications.length > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      <div className="flex flex-wrap gap-1">
                        {company.certifications.map((cert) => (
                          <Badge key={cert} variant="none" className="text-xs bg-primary/10 text-primary">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCompanies.map((company) => (
              <Card
                key={company.id}
                className="border-border/50 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => setSelectedCompany(company)}
              >
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={company.logo || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {company.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{company.name}</h3>
                        <Badge className={planColors[company.plan as keyof typeof planColors]} variant="secondary">
                          {company.plan}
                        </Badge>
                        {company.certifications.map((cert) => (
                          <Badge key={cert} variant="secondary" className="text-xs bg-primary/10 text-primary">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {company.sectorName} • {company.filiere} • {company.ville}, {company.region}
                      </p>
                    </div>
                    <div className="hidden md:flex items-center gap-6">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{company.employeeCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{company.rating}</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Company Detail Modal */}
        {selectedCompany && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setSelectedCompany(null)}
          >
            <Card
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader className="flex flex-row items-start justify-between sticky top-0 bg-card z-10 border-b">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedCompany.logo || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                      {selectedCompany.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle>{selectedCompany.name}</CardTitle>
                      <Badge className={planColors[selectedCompany.plan as keyof typeof planColors]}>
                        {selectedCompany.plan}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">
                      {selectedCompany.sectorName} • {selectedCompany.filiere}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{selectedCompany.rating}</span>
                      <span className="text-muted-foreground">({selectedCompany.reviewCount} avis)</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedCompany(null)}
                  className="hover:bg-destructive/10 hover:text-destructive rounded-full"
                >
                  <span className="text-xl">×</span>
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">À propos</h4>
                  <p className="text-muted-foreground">{selectedCompany.description}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Coordonnées</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedCompany.commune}, {selectedCompany.ville}, {selectedCompany.region}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedCompany.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedCompany.email}</span>
                      </div>
                      {selectedCompany.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedCompany.website}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Informations</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedCompany.employeeCount} employés</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Fondée en {selectedCompany.yearFounded}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span>KYC validé</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Activités</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompany.activities.map((activity) => (
                      <Badge key={activity} variant="outline">
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </div>

                {selectedCompany.certifications.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Certifications</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCompany.certifications.map((cert) => (
                        <Badge key={cert} className="bg-primary/10 text-primary">
                          <Award className="h-3 w-3 mr-1" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  <Button className="flex-1">
                    <Mail className="h-4 w-4 mr-2" />
                    Contacter
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Phone className="h-4 w-4 mr-2" />
                    Appeler
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {filteredCompanies.length === 0 && (
          <Card className="border-border/50">
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg">Aucune entreprise trouvée</h3>
              <p className="text-muted-foreground mt-2">
                Essayez de modifier vos critères de recherche
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
