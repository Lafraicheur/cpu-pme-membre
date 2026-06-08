import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen, Search, Clock, Award, Play, Video, Calendar,
  MapPin, Users, GraduationCap, X, ExternalLink,
} from "lucide-react";
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

function formatDuration(hours: number): string {
  if (!hours) return "";
  return `${hours}h`;
}

function formatPrice(price: string | null): number {
  if (!price) return 0;
  return parseFloat(price) || 0;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

const CATALOGUE_URL = "https://formation.cpupme.ci/catalogue";

function toFormationUrl(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return `https://formation.cpupme.ci/formations/${slug}`;
}

interface Formation {
  id: string;
  title: string;
  description: string;
  category: string;
  level: "debutant" | "intermediaire" | "avance";
  duration: string;
  format: "video" | "live" | "presentiel" | "hybrid";
  instructor: string;
  instructorPhoto: string | null;
  price: number;
  priceMember: number;
  isFree: boolean;
  hasCertificate: boolean;
  image: string | null;
  date: string | null;
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
    instructor: f.formateur ? `${f.formateur.firstname} ${f.formateur.lastname}` : "Formateur inconnu",
    instructorPhoto: f.formateur?.photo ?? null,
    price: formatPrice(f.price),
    priceMember: formatPrice(f.price_member),
    isFree: !f.isPaid,
    hasCertificate: f.certification_delivrer_badge,
    image: f.image,
    date: f.date,
  };
}

// ── Config ────────────────────────────────────────────────────────────────────

const UPCOMING_COUNT = 6;

const formatConfig = {
  video:      { label: "À son rythme", icon: Video },
  live:       { label: "En ligne",     icon: Calendar },
  presentiel: { label: "Présentiel",   icon: MapPin },
  hybrid:     { label: "Hybride",      icon: Users },
};

// ── Skeleton ──────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <Card className="overflow-hidden h-52">
      <Skeleton className="h-full w-full rounded-none" />
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
  const [allPublic, setAllPublic] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");

  useEffect(() => {
    setLoading(true);
    formationsApi.getPublic({ sort: "date" })
      .then((data) => setAllPublic(data.map(mapApiToFormation)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();

  const upcoming = allPublic
    .filter((f) => {
      if (!f.date || new Date(f.date) < now) return false;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || f.title.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
      const matchesFormat = selectedFormat === "all" || f.format === selectedFormat;
      const matchesLevel = selectedLevel === "all" || f.level === selectedLevel;
      const matchesPrice =
        selectedPrice === "all" ||
        (selectedPrice === "free" && f.isFree) ||
        (selectedPrice === "paid" && !f.isFree) ||
        (selectedPrice === "certifiant" && f.hasCertificate);
      return matchesSearch && matchesFormat && matchesLevel && matchesPrice;
    })
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
    .slice(0, UPCOMING_COUNT);

  const activeFiltersCount =
    [selectedFormat, selectedLevel, selectedPrice].filter((v) => v !== "all").length +
    (searchQuery ? 1 : 0);

  const clearFilters = () => {
    setSelectedFormat("all");
    setSelectedLevel("all");
    setSelectedPrice("all");
    setSearchQuery("");
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* ── Filtres ── */}
      <Card className="rounded-sm">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Rechercher une formation..."
                className="pl-8 h-9 text-sm rounded-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

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

            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="icon" onClick={clearFilters} title="Réinitialiser les filtres" className="h-9 w-9 rounded-sm">
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Prochaines formations ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold">Prochaines formations</h2>
            {!loading && (
              <span className="text-sm text-muted-foreground">
                {upcoming.length} formation{upcoming.length > 1 ? "s" : ""}
                {activeFiltersCount > 0 ? " filtrée" + (upcoming.length > 1 ? "s" : "") : ""}
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-sm text-sm"
            onClick={() => window.open(CATALOGUE_URL, "_blank")}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Voir toutes les formations
          </Button>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : upcoming.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center space-y-3">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/30" />
              <p className="font-medium">Aucune formation à venir</p>
              <p className="text-sm text-muted-foreground">
                {activeFiltersCount > 0 ? "Essayez de modifier vos filtres." : "Revenez bientôt pour découvrir de nouvelles formations."}
              </p>
              {activeFiltersCount > 0 && (
                <Button variant="outline" size="sm" onClick={clearFilters}>Réinitialiser les filtres</Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((formation) => {
              const format = formatConfig[formation.format];
              const FormatIcon = format.icon;

              return (
                <Card
                  key={formation.id}
                  className="overflow-hidden relative h-52 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group border-0"
                  onClick={() => window.open(toFormationUrl(formation.title), "_blank")}
                >
                  {formation.image ? (
                    <img
                      src={formation.image}
                      alt={formation.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-secondary/70" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

                  {/* Badges haut */}
                  <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-1">
                    <div className="flex flex-col items-start gap-1">
                      {formation.date && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-primary text-white shadow">
                          <Calendar className="w-2.5 h-2.5" />
                          {formatDate(formation.date)} · {formatTime(formation.date)}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30">
                        <FormatIcon className="w-2.5 h-2.5" />
                        {format.label}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {formation.isFree ? (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500 text-white">
                          Gratuit
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30">
                          {(user ? (formation.priceMember || formation.price) : formation.price).toLocaleString()} F
                        </span>
                      )}
                      {formation.hasCertificate && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-500/90 text-white">
                          <Award className="w-2.5 h-2.5" />
                          Certifiant
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contenu bas */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col gap-1.5">
                    <h3 className="font-semibold text-sm text-white leading-snug line-clamp-2">
                      {formation.title}
                    </h3>
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
                        onClick={(e) => { e.stopPropagation(); window.open(toFormationUrl(formation.title), "_blank"); }}
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


      </div>
    </div>
  );
}
