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
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formationsApi, type FormationAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

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
  priceMember: number;
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
    description: f.description ?? "",
    category: f.category ?? "",
    level: mapNiveau(f.niveau),
    duration: formatDuration(f.duration),
    format: mapMode(f.mode),
    type: mapType(f.mode),
    instructor: f.formateur ? `${f.formateur.firstname} ${f.formateur.lastname}` : "Formateur inconnu",
    instructorPhoto: f.formateur?.photo ?? null,
    price: formatPrice(f.price),
    priceMember: formatPrice(f.price_member),
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
          <Skeleton className="h-8 w-20 rounded-sm" />
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
  const { user } = useAuth();
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
      <Card className="rounded-sm">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Barre de recherche */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Rechercher une formation..."
                className="pl-8 h-9 text-sm rounded-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Sélects inline */}
            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger className="w-[135px] h-9 text-sm rounded-sm">
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
              <SelectTrigger className="w-[130px] h-9 text-sm rounded-sm">
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
              <SelectTrigger className="w-[120px] h-9 text-sm rounded-sm">
                <SelectValue placeholder="Prix" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous prix</SelectItem>
                <SelectItem value="free">Gratuit</SelectItem>
                <SelectItem value="paid">Payant</SelectItem>
                <SelectItem value="certifiant">Certifiant</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtres avancés + reset */}
            <Button
              variant={showFilters ? "secondary" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="h-9 gap-1.5 text-sm rounded-sm"
            >
              <Filter className="w-3.5 h-3.5" />
              Filtres
              {activeFiltersCount > 0 && (
                <Badge className="ml-0.5 px-1.5 min-w-5 h-4 text-[10px]">{activeFiltersCount}</Badge>
              )}
            </Button>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="icon" onClick={clearFilters} title="Réinitialiser" className="h-9 w-9 rounded-sm">
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedFormations.map((formation) => {
            const level = levelConfig[formation.level];
            const format = formatConfig[formation.format];
            const FormatIcon = format.icon;

            return (
              <Card
                key={formation.id}
                className="overflow-hidden relative h-52 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group border-0"
                onClick={() => onViewDetail(formation.id)}
              >
                {/* ── Image plein fond ── */}
                {formation.image ? (
                  <img
                    src={formation.image}
                    alt={formation.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-secondary/70" />
                )}

                {/* Dégradé sombre bas */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

                {/* ── Badges haut ── */}
                <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-1">
                  <div className="flex gap-1 flex-wrap">
                    <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30")}>
                      <FormatIcon className="w-2.5 h-2.5" />
                      {format.label}
                    </span>
                    {formation.hasCertificate && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-500/90 text-white">
                        <Award className="w-2.5 h-2.5" />
                        Certifiant
                      </span>
                    )}
                  </div>
                  {formation.isFree ? (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500 text-white flex-shrink-0">
                      Gratuit
                    </span>
                  ) : user ? (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/80 backdrop-blur-sm text-white border border-white/30 flex-shrink-0">
                      {(formation.priceMember || formation.price).toLocaleString()} F
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30 flex-shrink-0">
                      {formation.price.toLocaleString()} F
                    </span>
                  )}
                </div>

                {/* ── Contenu bas ── */}
                <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col gap-1.5">
                  {/* Niveau */}
                  <Badge className={cn("self-start text-[10px] h-4 px-1.5 border", level.color)}>
                    {level.label}
                  </Badge>

                  {/* Titre */}
                  <h3 className="font-semibold text-sm text-white leading-snug line-clamp-2">
                    {formation.title}
                  </h3>

                  {/* Meta + CTA */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[11px] text-white/70 min-w-0">
                      <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {formation.instructorPhoto ? (
                          <img src={formation.instructorPhoto} alt={formation.instructor} className="w-full h-full object-cover" />
                        ) : (
                          <GraduationCap className="w-2.5 h-2.5 text-white" />
                        )}
                      </div>
                      <span className="truncate">{formation.instructor}</span>
                      {formation.duration && (
                        <span className="flex items-center gap-0.5 flex-shrink-0">
                          <Clock className="w-3 h-3" />{formation.duration}
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-6 px-2 text-[10px] gap-1 flex-shrink-0 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                      onClick={(e) => { e.stopPropagation(); onViewDetail(formation.id); }}
                    >
                      <Play className="w-2.5 h-2.5" />
                      Voir
                    </Button>
                  </div>
                </div>
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
