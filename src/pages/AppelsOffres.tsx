import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  FileText,
  Search,
  Calendar,
  MapPin,
  Building2,
  Clock,
  AlertCircle,
  CheckCircle2,
  Eye,
  Send,
  Plus,
  Briefcase,
  Users,
  Award,
  FileUp,
  DollarSign,
  Layers,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { regions } from "@/data/regions";
import { 
  getSectorN1List, 
  getSectorN2List, 
  opportunityTypes, 
  prestationTypes,
  requiredDocuments,
} from "@/data/sectors";
import { AODetail } from "@/components/appels-offres/AODetail";
import { SoumissionForm } from "@/components/appels-offres/SoumissionForm";
import { MesSoumissions } from "@/components/appels-offres/MesSoumissions";
import { GestionAO } from "@/components/appels-offres/GestionAO";

type AOStatus = "open" | "closing_soon" | "closed" | "awarded";
type UserMode = "acheteur" | "soumissionnaire";
type ViewMode = "list" | "detail" | "submit";

interface AppelOffre {
  id: string;
  title: string;
  reference: string;
  organization: string;
  type: string;
  prestation: string;
  sector: string;
  location: string;
  budgetMin?: number;
  budgetMax?: number;
  deadline: string;
  startDate?: string;
  status: AOStatus;
  description: string;
  submissions: number;
  views: number;
  createdAt: string;
}

const mockAppelsOffres: AppelOffre[] = [
  {
    id: "AO-2024-BTP-001",
    title: "Construction de 5 salles de classe à Bouaké",
    reference: "AO-2024-BTP-001",
    organization: "Ministère de l'Éducation Nationale",
    type: "Marché",
    prestation: "Travaux",
    sector: "BTP, construction & immobilier",
    location: "Bouaké, VALLEE DU BANDAMA",
    budgetMin: 50000000,
    budgetMax: 75000000,
    deadline: "2024-02-15",
    startDate: "2024-03-01",
    status: "open",
    description: "Construction de 5 salles de classe équipées dans la commune de Bouaké, incluant mobilier et équipements.",
    submissions: 12,
    views: 234,
    createdAt: "2024-01-10",
  },
  {
    id: "AO-2024-AGR-002",
    title: "Fourniture de 500 tonnes d'engrais NPK",
    reference: "AO-2024-AGR-002",
    organization: "ANADER",
    type: "Consultation",
    prestation: "Fournitures",
    sector: "Agriculture végétale",
    location: "National",
    budgetMin: 100000000,
    budgetMax: 150000000,
    deadline: "2024-02-01",
    status: "closing_soon",
    description: "Fourniture et livraison de 500 tonnes d'engrais NPK 15-15-15 pour la campagne agricole 2024.",
    submissions: 8,
    views: 189,
    createdAt: "2024-01-05",
  },
  {
    id: "AO-2024-NUM-003",
    title: "Développement d'une application mobile de suivi agricole",
    reference: "AO-2024-NUM-003",
    organization: "Conseil Café-Cacao",
    type: "Marché",
    prestation: "Services",
    sector: "Économie Numérique & Innovation",
    location: "Abidjan, LAGUNES",
    budgetMin: 25000000,
    budgetMax: 40000000,
    deadline: "2024-02-28",
    status: "open",
    description: "Développement d'une application mobile pour le suivi des producteurs de cacao.",
    submissions: 15,
    views: 312,
    createdAt: "2024-01-12",
  },
];

const statusConfig = {
  open: { color: "bg-secondary text-secondary-foreground", label: "Ouvert", icon: CheckCircle2 },
  closing_soon: { color: "bg-primary text-primary-foreground", label: "Clôture proche", icon: AlertCircle },
  closed: { color: "bg-muted text-muted-foreground", label: "Clôturé", icon: Clock },
  awarded: { color: "bg-blue-500 text-white", label: "Attribué", icon: Award },
};

export default function AppelsOffres() {
  const { canAccess } = useSubscription();
  const canSubmit = canAccess('ao.submission');
  const canPublish = canAccess('ao.publishing');

  const [userMode, setUserMode] = useState<UserMode>("soumissionnaire");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedAO, setSelectedAO] = useState<AppelOffre | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const [newAO, setNewAO] = useState({
    title: "",
    type: "",
    prestation: "",
    sectorN1: "",
    sectorN2: "",
    location: "",
    budgetMin: "",
    budgetMax: "",
    deadline: "",
    description: "",
    documents: [] as string[],
  });

  const filteredAOs = mockAppelsOffres.filter((ao) => {
    const matchesSearch = ao.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ao.organization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = selectedSector === "all" || ao.sector.includes(selectedSector);
    const matchesType = selectedType === "all" || ao.type === selectedType;
    const matchesStatus = selectedStatus === "all" || ao.status === selectedStatus;
    return matchesSearch && matchesSector && matchesType && matchesStatus;
  });

  const sectorN1List = getSectorN1List();

  const handleViewDetail = (ao: AppelOffre) => {
    setSelectedAO(ao);
    setViewMode("detail");
  };

  const handleSubmit = (ao: AppelOffre) => {
    setSelectedAO(ao);
    setViewMode("submit");
  };

  const handleBack = () => {
    setViewMode("list");
    setSelectedAO(null);
  };

  const toggleFavorite = (aoId: string) => {
    setFavorites(prev => 
      prev.includes(aoId) ? prev.filter(id => id !== aoId) : [...prev, aoId]
    );
  };

  // Render detail view
  if (viewMode === "detail" && selectedAO) {
    return (
      <DashboardLayout>
        <AODetail 
          ao={selectedAO} 
          onBack={handleBack}
          onSubmit={() => setViewMode("submit")}
        />
      </DashboardLayout>
    );
  }

  // Render submission form
  if (viewMode === "submit" && selectedAO) {
    return (
      <DashboardLayout>
        <SoumissionForm 
          ao={selectedAO}
          onBack={() => setViewMode("detail")}
          onSubmit={handleBack}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              Appels d'Offres
            </h1>
            <p className="text-muted-foreground mt-1">
              Consultez et soumissionnez aux opportunités de marché
            </p>
          </div>

          <div className="inline-flex items-center gap-2 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setUserMode("soumissionnaire")}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                userMode === "soumissionnaire"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Send className="w-4 h-4" />
              Soumissionnaire
            </button>
            {canPublish && (
              <button
                onClick={() => setUserMode("acheteur")}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                  userMode === "acheteur"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Briefcase className="w-4 h-4" />
                Acheteur
              </button>
            )}
          </div>
        </div>

        {userMode === "soumissionnaire" ? (
          <Tabs defaultValue="explorer" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
              <TabsTrigger value="explorer">Explorer</TabsTrigger>
              <TabsTrigger value="mes-soumissions">Mes Soumissions</TabsTrigger>
              <TabsTrigger value="favoris">Favoris</TabsTrigger>
            </TabsList>

            <TabsContent value="explorer" className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{mockAppelsOffres.filter(ao => ao.status === "open").length}</p>
                      <p className="text-sm text-muted-foreground">AO Ouverts</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-secondary/10">
                      <Send className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">5</p>
                      <p className="text-sm text-muted-foreground">Mes Soumissions</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-amber-500/10">
                      <Clock className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">2</p>
                      <p className="text-sm text-muted-foreground">En évaluation</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-green-500/10">
                      <Award className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">1</p>
                      <p className="text-sm text-muted-foreground">Marchés gagnés</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher par titre, organisation..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={selectedSector} onValueChange={setSelectedSector}>
                      <SelectTrigger className="w-full lg:w-[200px]">
                        <SelectValue placeholder="Secteur" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous secteurs</SelectItem>
                        {sectorN1List.map((sector) => (
                          <SelectItem key={sector.code} value={sector.name}>
                            {sector.name.split(":")[0]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-full lg:w-[150px]">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous types</SelectItem>
                        {opportunityTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-full lg:w-[150px]">
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous statuts</SelectItem>
                        <SelectItem value="open">Ouvert</SelectItem>
                        <SelectItem value="closing_soon">Clôture proche</SelectItem>
                        <SelectItem value="closed">Clôturé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* AO List */}
              <div className="space-y-4">
                {filteredAOs.map((ao) => {
                  const status = statusConfig[ao.status];
                  const StatusIcon = status.icon;
                  const isFavorite = favorites.includes(ao.id);
                  
                  return (
                    <Card key={ao.id} className="hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge className={status.color}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {status.label}
                                  </Badge>
                                  <Badge variant="outline">{ao.type}</Badge>
                                  <Badge variant="outline">{ao.prestation}</Badge>
                                </div>
                                <h3 className="text-lg font-semibold mt-2 text-foreground hover:text-primary transition-colors cursor-pointer"
                                    onClick={() => handleViewDetail(ao)}>
                                  {ao.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">Réf: {ao.reference}</p>
                              </div>
                            </div>

                            <p className="text-muted-foreground line-clamp-2">{ao.description}</p>

                            <div className="flex flex-wrap gap-4 text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Building2 className="w-4 h-4" />
                                {ao.organization}
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                {ao.location}
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Layers className="w-4 h-4" />
                                {ao.sector}
                              </div>
                            </div>
                          </div>

                          <div className="lg:w-64 space-y-4">
                            {ao.budgetMin && ao.budgetMax && (
                              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                                <p className="text-xs text-muted-foreground mb-1">Budget estimatif</p>
                                <p className="font-semibold text-primary">
                                  {(ao.budgetMin / 1000000).toFixed(0)} - {(ao.budgetMax / 1000000).toFixed(0)} M FCFA
                                </p>
                              </div>
                            )}

                            <div className="space-y-2 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  Date limite
                                </span>
                                <span className="font-medium">{new Date(ao.deadline).toLocaleDateString("fr-FR")}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  Soumissions
                                </span>
                                <span className="font-medium">{ao.submissions}</span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => toggleFavorite(ao.id)}
                              >
                                <Heart className={cn("w-4 h-4", isFavorite && "fill-red-500 text-red-500")} />
                              </Button>
                              <Button variant="outline" className="flex-1 gap-1" onClick={() => handleViewDetail(ao)}>
                                <Eye className="w-4 h-4" />
                                Détails
                              </Button>
                              {(ao.status === "open" || ao.status === "closing_soon") && canSubmit ? (
                                <Button className="flex-1 gap-1" onClick={() => handleSubmit(ao)}>
                                  <Send className="w-4 h-4" />
                                  Postuler
                                </Button>
                              ) : canSubmit ? (
                                <Button disabled className="flex-1">Clôturé</Button>
                              ) : (
                                <Button disabled className="flex-1">Argent requis</Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="mes-soumissions">
              <MesSoumissions />
            </TabsContent>

            <TabsContent value="favoris">
              <Card>
                <CardContent className="py-12 text-center">
                  {favorites.length > 0 ? (
                    <div className="space-y-4">
                      {mockAppelsOffres.filter(ao => favorites.includes(ao.id)).map(ao => (
                        <div key={ao.id} className="p-4 border rounded-lg text-left">
                          <h3 className="font-medium">{ao.title}</h3>
                          <p className="text-sm text-muted-foreground">{ao.organization}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground">Aucun appel d'offres en favoris</p>
                      <p className="text-sm text-muted-foreground">
                        Ajoutez des AO à vos favoris pour les retrouver facilement
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          /* Mode Acheteur */
          <GestionAO onCreateAO={() => setIsCreateDialogOpen(true)} />
        )}

        {/* Create AO Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un Appel d'Offres</DialogTitle>
              <DialogDescription>Remplissez les informations pour publier votre AO</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Identification</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre de l'Appel d'Offres *</Label>
                    <Input
                      id="title"
                      placeholder="Ex: Audit comptable 2025"
                      value={newAO.title}
                      onChange={(e) => setNewAO({ ...newAO, title: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type d'opportunité *</Label>
                      <Select value={newAO.type} onValueChange={(v) => setNewAO({ ...newAO, type: v })}>
                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                        <SelectContent>
                          {opportunityTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Type de prestation *</Label>
                      <Select value={newAO.prestation} onValueChange={(v) => setNewAO({ ...newAO, prestation: v })}>
                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                        <SelectContent>
                          {prestationTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Classification</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Secteur (N1) *</Label>
                    <Select value={newAO.sectorN1} onValueChange={(v) => setNewAO({ ...newAO, sectorN1: v, sectorN2: "" })}>
                      <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        {sectorN1List.map((sector) => (
                          <SelectItem key={sector.code} value={sector.code}>{sector.name.split(":")[0]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Filière (N2)</Label>
                    <Select value={newAO.sectorN2} onValueChange={(v) => setNewAO({ ...newAO, sectorN2: v })} disabled={!newAO.sectorN1}>
                      <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        {getSectorN2List(newAO.sectorN1).map((sector) => (
                          <SelectItem key={sector.code} value={sector.code}>{sector.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Zone géographique *</Label>
                  <Select value={newAO.location} onValueChange={(v) => setNewAO({ ...newAO, location: v })}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="national">National</SelectItem>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Description</h3>
                <Textarea
                  placeholder="Décrivez le contexte, les objectifs et le périmètre..."
                  rows={4}
                  value={newAO.description}
                  onChange={(e) => setNewAO({ ...newAO, description: e.target.value })}
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Budget & Calendrier</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Budget min (FCFA)</Label>
                    <Input type="number" placeholder="50000000" value={newAO.budgetMin} onChange={(e) => setNewAO({ ...newAO, budgetMin: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Budget max (FCFA)</Label>
                    <Input type="number" placeholder="75000000" value={newAO.budgetMax} onChange={(e) => setNewAO({ ...newAO, budgetMax: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Date limite *</Label>
                  <Input type="date" value={newAO.deadline} onChange={(e) => setNewAO({ ...newAO, deadline: e.target.value })} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Documents requis</h3>
                <div className="grid grid-cols-2 gap-2">
                  {requiredDocuments.slice(0, 6).map((doc) => (
                    <div key={doc} className="flex items-center space-x-2">
                      <Checkbox
                        id={doc}
                        checked={newAO.documents.includes(doc)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewAO({ ...newAO, documents: [...newAO.documents, doc] });
                          } else {
                            setNewAO({ ...newAO, documents: newAO.documents.filter((d) => d !== doc) });
                          }
                        }}
                      />
                      <Label htmlFor={doc} className="text-sm">{doc}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Annuler</Button>
                <Button className="gap-2">
                  <FileUp className="w-4 h-4" />
                  Publier l'Appel d'Offres
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
