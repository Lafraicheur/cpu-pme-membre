import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen, Search, Clock, Users, Award, Play, Video, Calendar,
  Filter, MapPin, Target, X, RefreshCw, GraduationCap, AlertCircle,
  ChevronLeft, ChevronRight, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formationsApi, type FormationAPI } from "@/lib/api";

// ── Mapping API → UI ──────────────────────────────────────────────────────────

function mapNiveau(niveau: FormationAPI["niveau"]): "debutant" | "intermediaire" | "avance" {
  if (niveau === "intermediate") return "intermediaire";
  if (niveau === "advanced") return "avance";
  return "debutant";
}

function mapMode(mode: string): "video" | "live" | "presentiel" | "hybrid" {
  if (mode === "a_son_rythme") return "video";
  if (mode === "webinaire") return "live";
  if (mode === "presentiel") return "presentiel";
  return "live";
}

function mapType(mode: string): "classique" | "rac" | "alternance" | "parcours" | "certifiante" | "webinaire" {
  if (mode === "webinaire") return "webinaire";
  return "classique";
}

function formatDuration(hours: number): string {
  if (!hours) return "";
  return `${hours}h`;
}

function formatPrice(price: string | null): number {
  if (!price) return 0;
  return parseFloat(price) || 0;
}

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
  instructorPhoto: string | null;
  price: number;
  isFree: boolean;
  hasCertificate: boolean;
  enrolled: number;
  competences: string[];
  location: string | null;
  image: string | null;
  date: string | null;
  lien: string | null;
  chapitresCount: number;
  leconsCount: number;
}

function mapApiToFormation(f: FormationAPI): Formation {
  return {
    id: f.id,
    title: f.title,
    description: f.description,
    category: f.category,
    level: mapNiveau(f.niveau),
    duration: formatDuration(f.duration),
    format: mapMode(f.mode),
    type: mapType(f.mode),
    instructor: `${f.formateur.firstname} ${f.formateur.lastname}`,
    instructorPhoto: f.formateur.photo,
    price: formatPrice(f.price),
    isFree: !f.isPaid,
    hasCertificate: f.certification_delivrer_badge,
    enrolled: f.participants?.length ?? 0,
    competences: f.competences ?? [],
    location: f.location,
    image: f.image,
    date: f.date,
    lien: f.lien,
    chapitresCount: f.chapitres?.length ?? 0,
    leconsCount: f.chapitres?.reduce((acc, ch) => acc + (ch.lecons?.length ?? 0), 0) ?? 0,
  };
}

// ── Config ────────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 6;

const levelConfig = {
  debutant:      { label: "Débutant",      color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  intermediaire: { label: "Intermédiaire", color: "bg-amber-50 text-amber-700 border-amber-200" },
  avance:        { label: "Avancé",        color: "bg-rose-50 text-rose-700 border-rose-200" },
};

const typeConfig: Record<Formation["type"], { label: string; color: string; icon: typeof GraduationCap }> = {
  classique:   { label: "Classique",   color: "bg-slate-100 text-slate-600",          icon: BookOpen },
  rac:         { label: "RAC",         color: "bg-blue-50 text-blue-700",             icon: Award },
  alternance:  { label: "Alternance",  color: "bg-violet-50 text-violet-700",         icon: RefreshCw },
  parcours:    { label: "Parcours",    color: "bg-primary/10 text-primary",           icon: Target },
  certifiante: { label: "Certifiante", color: "bg-amber-50 text-amber-700",           icon: GraduationCap },
  webinaire:   { label: "Webinaire",   color: "bg-pink-50 text-pink-700",            icon: Video },
};

const formatConfig = {
  video:      { label: "À son rythme", icon: Video },
  live:       { label: "En ligne",     icon: Calendar },
  presentiel: { label: "Présentiel",   icon: MapPin },
  hybrid:     { label: "Hybride",      icon: Users },
};

// ── Skeleton ──────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-44 w-full rounded-none" />
      <CardContent className="p-5 space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface CatalogueProps {
  onViewDetail: (formationId: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CatalogueFormations({ onViewDetail }: CatalogueProps) {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedFormat, setSelectedFormat] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const fetchFormations = () => {
    setLoading(true);
    setError(null);
    formationsApi.getAll()
      .then((data) => { setFormations(data.map(mapApiToFormation)); setLoading(false); })
      .catch((err) => { setError(err.message || "Impossible de charger les formations"); setLoading(false); });
  };

  useEffect(() => { fetchFormations(); }, []);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedCategory, selectedLevel, selectedPrice, selectedFormat, selectedType]);

  const allCategories = [...new Set(formations.map((f) => f.category))].sort();

  const filteredFormations = formations.filter((f) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = f.title.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
    const matchesCategory = selectedCategory === "all" || f.category === selectedCategory;
    const matchesLevel = selectedLevel === "all" || f.level === selectedLevel;
    const matchesPrice =
      selectedPrice === "all" ||
      (selectedPrice === "free" && f.isFree) ||
      (selectedPrice === "paid" && !f.isFree) ||
      (selectedPrice === "certifiant" && f.hasCertificate);
    const matchesFormat = selectedFormat === "all" || f.format === selectedFormat;
    const matchesType = selectedType === "all" || f.type === selectedType;
    return matchesSearch && matchesCategory && matchesLevel && matchesPrice && matchesFormat && matchesType;
  });

  const totalPages = Math.max(1, Math.ceil(filteredFormations.length / ITEMS_PER_PAGE));
  const paginatedFormations = filteredFormations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedLevel("all");
    setSelectedPrice("all");
    setSelectedFormat("all");
    setSelectedType("all");
    setSearchQuery("");
  };

  const activeFiltersCount = [selectedCategory, selectedLevel, selectedPrice, selectedFormat, selectedType]
    .filter((v) => v !== "all").length + (searchQuery ? 1 : 0);

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6">
        <Card><CardContent className="p-4"><Skeleton className="h-10 w-full" /></CardContent></Card>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-16 text-center space-y-4">
          <AlertCircle className="w-12 h-12 mx-auto text-destructive/50" />
          <p className="text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={fetchFormations}>Réessayer</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Search & Filters ── */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une formation..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={showFilters ? "secondary" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2 flex-shrink-0"
              >
                <Filter className="w-4 h-4" />
                Filtres
                {activeFiltersCount > 0 && (
                  <Badge className="ml-1 px-1.5 min-w-5 h-5 text-xs">{activeFiltersCount}</Badge>
                )}
              </Button>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="icon" onClick={clearFilters} title="Réinitialiser">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Quick Filters Row */}
          <div className="flex flex-wrap gap-2">
            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger className="w-[155px] h-9 text-sm">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous formats</SelectItem>
                <SelectItem value="video">À son rythme</SelectItem>
                <SelectItem value="live">En ligne</SelectItem>
                <SelectItem value="presentiel">Présentiel</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-[145px] h-9 text-sm">
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
              <SelectTrigger className="w-[140px] h-9 text-sm">
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

          {/* Advanced Panel */}
          {showFilters && (
            <div className="pt-3 border-t">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Filtres avancés</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Catégorie</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Toutes catégories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes catégories</SelectItem>
                      {allCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Type</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Tous types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous types</SelectItem>
                      <SelectItem value="classique">Classique</SelectItem>
                      <SelectItem value="webinaire">Webinaire</SelectItem>
                      <SelectItem value="certifiante">Certifiante</SelectItem>
                      <SelectItem value="parcours">Parcours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Results info ── */}
      <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
        <span>
          {filteredFormations.length} formation{filteredFormations.length > 1 ? "s" : ""}
          {activeFiltersCount > 0 ? " filtrée" + (filteredFormations.length > 1 ? "s" : "") : ""}
        </span>
        {totalPages > 1 && (
          <span>Page {currentPage} / {totalPages}</span>
        )}
      </div>

      {/* ── Grid ── */}
      {filteredFormations.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-3">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/30" />
            <p className="font-medium">Aucune formation trouvée</p>
            <p className="text-sm text-muted-foreground">Essayez de modifier vos filtres</p>
            <Button variant="outline" size="sm" onClick={clearFilters}>Réinitialiser les filtres</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedFormations.map((formation) => {
            const level = levelConfig[formation.level];
            const format = formatConfig[formation.format];
            const FormatIcon = format.icon;
            const fType = typeConfig[formation.type];
            const TypeIcon = fType.icon;

            return (
              <Card
                key={formation.id}
                className="overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group border border-border/60"
                onClick={() => onViewDetail(formation.id)}
              >
                {/* ── Image banner ── */}
                <div className="relative h-44 overflow-hidden flex-shrink-0">
                  {formation.image ? (
                    <img
                      src={formation.image}
                      alt={formation.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/25 via-primary/10 to-secondary/20 flex items-center justify-center">
                      <BookOpen className="w-14 h-14 text-primary/30" />
                    </div>
                  )}
                  {/* Overlay top badges */}
                  <div className="absolute top-2.5 left-2.5 flex gap-1.5 flex-wrap">
                    {formation.type !== "classique" && (
                      <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm border", fType.color)}>
                        <TypeIcon className="w-3 h-3" />
                        {fType.label}
                      </span>
                    )}
                    {formation.hasCertificate && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm bg-amber-50/90 text-amber-700 border border-amber-200">
                        <Award className="w-3 h-3" />
                        Certifiant
                      </span>
                    )}
                  </div>
                  {/* Price top-right */}
                  <div className="absolute top-2.5 right-2.5">
                    {formation.isFree ? (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-sm">
                        Gratuit
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary text-primary-foreground shadow-sm">
                        {formation.price.toLocaleString()} FCFA
                      </span>
                    )}
                  </div>
                </div>

                {/* ── Body ── */}
                <CardContent className="p-4 flex flex-col flex-1 space-y-3">
                  {/* Level + Format */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="outline" className={cn("text-[11px] font-medium border", level.color)}>
                      {level.label}
                    </Badge>
                    <Badge variant="outline" className="text-[11px] gap-1">
                      <FormatIcon className="w-3 h-3" />
                      {format.label}
                    </Badge>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {formation.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-1">
                    {formation.description}
                  </p>

                  {/* Category tag */}
                  <p className="text-[11px] text-muted-foreground/70 font-medium truncate">{formation.category}</p>

                  {/* Meta row */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {formation.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formation.duration}
                      </span>
                    )}
                    {formation.chapitresCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        {formation.chapitresCount} ch.
                      </span>
                    )}
                    {formation.leconsCount > 0 && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {formation.leconsCount} leçon{formation.leconsCount > 1 ? "s" : ""}
                      </span>
                    )}
                    {formation.enrolled > 0 && (
                      <span className="flex items-center gap-1 ml-auto">
                        <Users className="w-3.5 h-3.5" />
                        {formation.enrolled}
                      </span>
                    )}
                  </div>

                  {/* Location / Date */}
                  {(formation.location || formation.date) && (
                    <div className="flex flex-col gap-1">
                      {formation.location && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{formation.location}</span>
                        </span>
                      )}
                      {formation.date && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          {new Date(formation.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Instructor + CTA */}
                  <div className="flex items-center gap-2 pt-3 border-t mt-auto">
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 border border-border">
                      {formation.instructorPhoto ? (
                        <img src={formation.instructorPhoto} alt={formation.instructor} className="w-full h-full object-cover" />
                      ) : (
                        <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground truncate flex-1">{formation.instructor}</span>
                    <Button
                      size="sm"
                      className="gap-1.5 text-xs h-8 px-3 flex-shrink-0"
                      onClick={(e) => { e.stopPropagation(); onViewDetail(formation.id); }}
                    >
                      <Play className="w-3 h-3" />
                      Voir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                className="w-9 h-9 p-0"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="gap-1.5"
          >
            Suivant
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
