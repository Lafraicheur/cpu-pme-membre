import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, Star, MapPin, BookOpen, Users, Search, 
  MessageCircle, Calendar, Award, ArrowRight, Video
} from "lucide-react";
import { regions } from "@/data/regions";

interface Expert {
  id: string;
  name: string;
  title: string;
  avatar?: string;
  domains: string[];
  region: string;
  ville: string;
  rating: number;
  reviews: number;
  courses: number;
  students: number;
  formats: ("video" | "live" | "présentiel")[];
  available: boolean;
  bio: string;
}

const mockExperts: Expert[] = [
  {
    id: "1",
    name: "Dr. Kouamé Jean",
    title: "Expert Transformation Digitale",
    domains: ["Numérique", "Innovation", "Stratégie"],
    region: "Abidjan",
    ville: "Cocody",
    rating: 4.9,
    reviews: 156,
    courses: 8,
    students: 1250,
    formats: ["video", "live"],
    available: true,
    bio: "15 ans d'expérience dans la transformation digitale des PME africaines."
  },
  {
    id: "2",
    name: "Marie Bamba",
    title: "Consultante Marketing & Vente",
    domains: ["Marketing", "Vente", "E-commerce"],
    region: "Abidjan",
    ville: "Plateau",
    rating: 4.8,
    reviews: 89,
    courses: 5,
    students: 890,
    formats: ["video", "live", "présentiel"],
    available: true,
    bio: "Spécialiste du marketing digital et du développement commercial en Afrique de l'Ouest."
  },
  {
    id: "3",
    name: "Expert OECCA-CI",
    title: "Expert-Comptable Agréé",
    domains: ["Finance", "Comptabilité", "Fiscalité"],
    region: "Abidjan",
    ville: "Marcory",
    rating: 4.9,
    reviews: 234,
    courses: 12,
    students: 2100,
    formats: ["video", "présentiel"],
    available: false,
    bio: "Membre de l'Ordre des Experts-Comptables, spécialisé SYSCOHADA."
  },
  {
    id: "4",
    name: "Coach Agile CI",
    title: "Formateur Gestion de Projet",
    domains: ["Management", "Agilité", "Leadership"],
    region: "Yamoussoukro",
    ville: "Yamoussoukro",
    rating: 4.7,
    reviews: 67,
    courses: 4,
    students: 450,
    formats: ["live", "présentiel"],
    available: true,
    bio: "Certifié Scrum Master et Product Owner, accompagne les équipes dans leur transformation agile."
  },
  {
    id: "5",
    name: "Expert APEX-CI",
    title: "Spécialiste Commerce International",
    domains: ["Export", "Commerce", "Logistique"],
    region: "San Pedro",
    ville: "San Pedro",
    rating: 4.8,
    reviews: 45,
    courses: 3,
    students: 320,
    formats: ["video", "présentiel"],
    available: true,
    bio: "Expert en procédures d'export et incoterms, partenaire APEX-CI."
  },
  {
    id: "6",
    name: "Ing. Koffi Yao",
    title: "Expert Qualité & Normes",
    domains: ["Qualité", "Normes", "Certification"],
    region: "Bouaké",
    ville: "Bouaké",
    rating: 4.6,
    reviews: 38,
    courses: 6,
    students: 280,
    formats: ["présentiel", "live"],
    available: true,
    bio: "Auditeur certifié ISO 9001 et ISO 22000, accompagne les PME vers la certification."
  },
];

const allDomains = [...new Set(mockExperts.flatMap(e => e.domains))];
const allRegions = [...new Set(mockExperts.map(e => e.region))];

const formatIcons = {
  video: Video,
  live: Calendar,
  présentiel: MapPin,
};

export function ExpertsFormateurs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedFormat, setSelectedFormat] = useState("all");

  const filteredExperts = mockExperts.filter((expert) => {
    const matchesSearch = expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.domains.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDomain = selectedDomain === "all" || expert.domains.includes(selectedDomain);
    const matchesRegion = selectedRegion === "all" || expert.region === selectedRegion;
    const matchesFormat = selectedFormat === "all" || expert.formats.includes(selectedFormat as any);
    return matchesSearch && matchesDomain && matchesRegion && matchesFormat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-none bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Experts & Formateurs</h2>
                <p className="text-muted-foreground">Découvrez nos experts certifiés par domaine et région</p>
              </div>
            </div>
            <div className="md:ml-auto">
              <Button variant="outline" className="gap-2">
                <Award className="w-4 h-4" />
                Devenir formateur
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un expert..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedDomain} onValueChange={setSelectedDomain}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Domaine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les domaines</SelectItem>
                {allDomains.map((domain) => (
                  <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Région" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les régions</SelectItem>
                {allRegions.map((region) => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger className="w-full lg:w-[150px]">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous formats</SelectItem>
                <SelectItem value="video">Vidéo</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="présentiel">Présentiel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Experts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExperts.map((expert) => (
          <Card key={expert.id} className="overflow-hidden hover:shadow-lg transition-all group">
            <CardContent className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{expert.name}</h3>
                    {expert.available && (
                      <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{expert.title}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{expert.ville}, {expert.region}</span>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-medium ml-1">{expert.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">({expert.reviews} avis)</span>
              </div>

              {/* Domains */}
              <div className="flex flex-wrap gap-1">
                {expert.domains.map((domain) => (
                  <Badge key={domain} variant="secondary" className="text-xs">{domain}</Badge>
                ))}
              </div>

              {/* Formats */}
              <div className="flex items-center gap-2">
                {expert.formats.map((format) => {
                  const Icon = formatIcons[format];
                  return (
                    <Badge key={format} variant="outline" className="text-xs gap-1">
                      <Icon className="w-3 h-3" />
                      {format}
                    </Badge>
                  );
                })}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {expert.courses} cours
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {expert.students} apprenants
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1">
                  <MessageCircle className="w-4 h-4" />
                  Contacter
                </Button>
                <Button size="sm" className="flex-1 gap-1">
                  Voir profil
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExperts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">Aucun expert trouvé</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
