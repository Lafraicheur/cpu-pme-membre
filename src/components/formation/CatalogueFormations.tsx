import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Search, Clock, Users, Award, Star, Play, Video, Calendar, User, Filter } from "lucide-react";

interface Formation {
  id: string;
  title: string;
  description: string;
  category: string;
  level: "debutant" | "intermediaire" | "avance";
  duration: string;
  format: "video" | "live" | "hybrid";
  instructor: string;
  price: number;
  isFree: boolean;
  isMemberOnly: boolean;
  hasCertificate: boolean;
  enrolled: number;
  rating: number;
  image?: string;
}

const mockFormations: Formation[] = [
  {
    id: "1",
    title: "Transformation Digitale pour PME",
    description: "Maîtrisez les outils et stratégies pour digitaliser votre entreprise.",
    category: "Numérique",
    level: "debutant",
    duration: "8h",
    format: "video",
    instructor: "Dr. Kouamé Jean",
    price: 0,
    isFree: true,
    isMemberOnly: true,
    hasCertificate: true,
    enrolled: 234,
    rating: 4.8,
  },
  {
    id: "2",
    title: "Comptabilité SYSCOHADA Révisé",
    description: "Formation complète sur les normes comptables OHADA en vigueur.",
    category: "Finance",
    level: "intermediaire",
    duration: "20h",
    format: "hybrid",
    instructor: "Expert OECCA-CI",
    price: 150000,
    isFree: false,
    isMemberOnly: false,
    hasCertificate: true,
    enrolled: 156,
    rating: 4.9,
  },
  {
    id: "3",
    title: "Marketing Digital & Réseaux Sociaux",
    description: "Développez votre présence en ligne et générez des leads qualifiés.",
    category: "Marketing",
    level: "debutant",
    duration: "12h",
    format: "video",
    instructor: "Marie Bamba",
    price: 75000,
    isFree: false,
    isMemberOnly: false,
    hasCertificate: true,
    enrolled: 312,
    rating: 4.7,
  },
  {
    id: "4",
    title: "Gestion de Projet Agile",
    description: "Apprenez les méthodologies Scrum et Kanban pour vos projets.",
    category: "Management",
    level: "intermediaire",
    duration: "15h",
    format: "live",
    instructor: "Coach Agile CI",
    price: 0,
    isFree: true,
    isMemberOnly: true,
    hasCertificate: false,
    enrolled: 89,
    rating: 4.6,
  },
  {
    id: "5",
    title: "Export & Commerce International",
    description: "Maîtrisez les procédures d'export et les incoterms.",
    category: "Commerce",
    level: "avance",
    duration: "25h",
    format: "hybrid",
    instructor: "Expert APEX-CI",
    price: 200000,
    isFree: false,
    isMemberOnly: false,
    hasCertificate: true,
    enrolled: 67,
    rating: 4.9,
  },
];

const levelConfig = {
  debutant: { label: "Débutant", color: "bg-green-500/10 text-green-600" },
  intermediaire: { label: "Intermédiaire", color: "bg-amber-500/10 text-amber-600" },
  avance: { label: "Avancé", color: "bg-red-500/10 text-red-600" },
};

const formatConfig = {
  video: { label: "Vidéo", icon: Video },
  live: { label: "Live", icon: Calendar },
  hybrid: { label: "Hybride", icon: Users },
};

interface CatalogueProps {
  onViewDetail: (formationId: string) => void;
}

export function CatalogueFormations({ onViewDetail }: CatalogueProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");

  const filteredFormations = mockFormations.filter((f) => {
    const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || f.category === selectedCategory;
    const matchesLevel = selectedLevel === "all" || f.level === selectedLevel;
    const matchesPrice = selectedPrice === "all" ||
      (selectedPrice === "free" && f.isFree) ||
      (selectedPrice === "paid" && !f.isFree);
    return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
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
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-[150px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="Numérique">Numérique</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Management">Management</SelectItem>
                <SelectItem value="Commerce">Commerce</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-full lg:w-[150px]">
                <SelectValue placeholder="Niveau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous niveaux</SelectItem>
                <SelectItem value="debutant">Débutant</SelectItem>
                <SelectItem value="intermediaire">Intermédiaire</SelectItem>
                <SelectItem value="avance">Avancé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPrice} onValueChange={setSelectedPrice}>
              <SelectTrigger className="w-full lg:w-[150px]">
                <SelectValue placeholder="Prix" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous prix</SelectItem>
                <SelectItem value="free">Gratuit</SelectItem>
                <SelectItem value="paid">Payant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Formations Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFormations.map((formation) => {
          const level = levelConfig[formation.level];
          const format = formatConfig[formation.format];
          const FormatIcon = format.icon;

          return (
            <Card key={formation.id} className="overflow-hidden hover:shadow-lg transition-all cursor-pointer" onClick={() => onViewDetail(formation.id)}>
              <div className="h-32 bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-primary/50" />
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
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

                <h3 className="font-semibold line-clamp-2">{formation.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{formation.description}</p>

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
            <p className="text-muted-foreground">Aucune formation trouvée</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
