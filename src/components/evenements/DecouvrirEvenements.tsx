import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Calendar,
  MapPin,
  Clock,
  Video,
  ExternalLink,
  AlertCircle,
  ArrowRight,
  LayoutGrid,
  List,
  Globe,
  Presentation,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { evenementsApi, type Evenement } from "@/lib/api";

const SITE_EVENEMENTS = "https://evenement.cpupme.ci/agenda";
const PAGE_SIZE = 6;

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(event: Evenement) {
  if (event.gratuit_pour_tous || event.prix === "0.00" || !event.prix) return "Gratuit";
  return `${Number(event.prix).toLocaleString("fr-FR")} FCFA`;
}

function getAccessBadge(event: Evenement): { label: string; className: string } {
  if (event.gratuit_pour_tous)
    return { label: "Gratuit", className: "bg-emerald-500 text-white" };
  if (event.gratuit_membre_uniquement)
    return { label: "Membres", className: "bg-violet-500 text-white" };
  if (event.prix && event.prix !== "0.00")
    return {
      label: `${Number(event.prix).toLocaleString("fr-FR")} FCFA`,
      className: "bg-primary text-primary-foreground",
    };
  return { label: "Voir prix", className: "bg-muted text-muted-foreground" };
}

function getTypeIcon(format: string) {
  switch (format) {
    case "en_ligne":
    case "webinaire":
      return <Video className="w-3 h-3" />;
    case "presentiel":
      return <Presentation className="w-3 h-3" />;
    default:
      return <Globe className="w-3 h-3" />;
  }
}

function getFormatBadgeClass(format: string) {
  switch (format) {
    case "webinaire": return "bg-blue-500";
    case "presentiel": return "bg-emerald-500";
    case "en_ligne": return "bg-blue-500";
    default: return "bg-muted-foreground";
  }
}

function resolveImage(event: Evenement) {
  if (!event.image_flayer) return null;
  return event.image_flayer;
}

// ─── Event Card Grid ────────────────────────────────────────────────────────

function EventCardGrid({ event }: { event: Evenement }) {
  const { label, className: badgeClass } = getAccessBadge(event);
  const couleur = event.type_evenement?.couleur ?? "#6366f1";
  const typeNom = event.type_evenement?.nom ?? "Événement";
  const image = resolveImage(event);
  const eventUrl = `https://evenement.cpupme.ci/evenement/${event.id}`;

  return (
    <a
      href={eventUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col h-full rounded-sm border border-border bg-card overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-300"
    >
      {/* Image — hauteur fixe */}
      <div className="relative h-44 shrink-0 overflow-hidden bg-muted">
        {image ? (
          <img
            src={image}
            alt={event.titre}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="w-10 h-10 text-muted-foreground/30" />
          </div>
        )}

        {/* Badge accès — top left */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-0.5 rounded-sm text-xs font-medium ${badgeClass}`}>
            {label}
          </span>
        </div>

        {/* Badge type — top right */}
        <div className="absolute top-3 right-3 max-w-[45%]">
          <div
            className="flex items-center gap-1 text-white px-2 py-1 rounded-sm text-xs font-medium truncate"
            style={{ backgroundColor: couleur }}
          >
            {getTypeIcon(event.format)}
            <span className="truncate">{typeNom}</span>
          </div>
        </div>

        {/* Badges format + région — bottom left */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 flex-wrap max-w-[90%]">
          {event.lieu && (
            <Badge className="bg-amber-500 text-white text-xs">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="truncate max-w-[100px]">{event.lieu.split(",")[0]}</span>
            </Badge>
          )}
          {event.format && (
            <Badge className={`text-white text-xs capitalize ${getFormatBadgeClass(event.format)}`}>
              {event.format.replace("_", " ")}
            </Badge>
          )}
        </div>
      </div>

      {/* Content — flex-1 pour remplir l'espace restant */}
      <div className="flex flex-col flex-1 p-4">
        {/* Titre — hauteur fixe 2 lignes */}
        <h3 className="font-semibold text-base text-foreground mb-3 line-clamp-2 min-h-[3rem] group-hover:text-primary transition-colors">
          {event.titre}
        </h3>

        {/* Infos — flex-1 pour pousser le bouton vers le bas */}
        <div className="flex-1 space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{formatDate(event.date_debut)}</span>
            <Clock className="w-3.5 h-3.5 text-primary ml-auto shrink-0" />
            <span>{event.heure_debut}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">{event.lieu ?? "En ligne"}</span>
          </div>
        </div>

        {/* Bouton — toujours en bas */}
        <div className="flex items-center justify-end mt-4">
          <Button variant="default" size="sm" className="group/btn h-8 px-3 text-xs gap-1">
            Voir détails
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </div>
      </div>
    </a>
  );
}

// ─── Event Card List ────────────────────────────────────────────────────────

function EventCardList({ event }: { event: Evenement }) {
  const image = resolveImage(event);
  const eventUrl = `https://evenement.cpupme.ci/evenement/${event.id}`;
  const prix = formatPrice(event);

  return (
    <a
      href={eventUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex bg-card border border-border rounded-sm overflow-hidden hover:border-primary/50 transition-all group"
    >
      <div className="w-48 h-36 flex-shrink-0 relative overflow-hidden bg-muted">
        {image ? (
          <img
            src={image}
            alt={event.titre}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="w-8 h-8 text-muted-foreground/30" />
          </div>
        )}
      </div>
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            {event.lieu && (
              <Badge className="bg-amber-500 text-white text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                {event.lieu.split(",")[0]}
              </Badge>
            )}
            {event.format && (
              <Badge className={`text-white text-xs capitalize ${getFormatBadgeClass(event.format)}`}>
                {event.format.replace("_", " ")}
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {event.titre}
          </h3>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(event.date_debut)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {event.heure_debut}
            </span>
          </div>
          <span className={`font-bold text-sm ${prix === "Gratuit" ? "text-emerald-600" : "text-primary"}`}>
            {prix}
          </span>
        </div>
      </div>
    </a>
  );
}

// ─── Skeletons ───────────────────────────────────────────────────────────────

function GridSkeleton() {
  return (
    <div className="rounded-sm border border-border overflow-hidden">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex justify-end"><Skeleton className="h-8 w-24" /></div>
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex border border-border rounded-sm overflow-hidden">
      <Skeleton className="w-48 h-36 rounded-none shrink-0" />
      <div className="flex-1 p-4 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface DecouvrirProps {
  onViewDetail?: (eventId: string) => void;
}

export function DecouvrirEvenements({ onViewDetail }: DecouvrirProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedFormat, setSelectedFormat] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Tous les événements
  const { data: allEvents, isLoading: isLoadingAll, isError } = useQuery({
    queryKey: ["evenements", "all"],
    queryFn: evenementsApi.getAll,
    staleTime: 5 * 60 * 1000,
  });

  // Types uniques pour le filtre
  const typeOptions = useMemo(() => {
    if (!allEvents) return [];
    const map = new Map<string, string>();
    allEvents.forEach((e) => {
      if (e.type_evenement) map.set(e.type_evenement.nom, e.type_evenement.nom);
    });
    return [...map.keys()];
  }, [allEvents]);

  // Événements filtrés (exclu les à la une)
  const filtered = useMemo(() => {
    if (!allEvents) return [];
    return allEvents.filter((e) => {
      const matchSearch =
        !searchQuery ||
        e.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.lieu ?? "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = selectedType === "all" || e.type_evenement?.nom === selectedType;
      const matchFormat = selectedFormat === "all" || e.format === selectedFormat;
      const matchPrice =
        selectedPrice === "all" ||
        (selectedPrice === "free" && (e.gratuit_pour_tous || e.prix === "0.00")) ||
        (selectedPrice === "paid" && !e.gratuit_pour_tous && e.prix !== "0.00");
      return matchSearch && matchType && matchFormat && matchPrice;
    });
  }, [allEvents, searchQuery, selectedType, selectedFormat, selectedPrice]);

  const visible = filtered.slice(0, PAGE_SIZE);
  const hasMore = filtered.length > PAGE_SIZE;

  return (
    <div className="space-y-8">
      {/* ── Filtres ── */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un événement, lieu..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {typeOptions.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger className="w-full lg:w-[150px]">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous formats</SelectItem>
                <SelectItem value="presentiel">Présentiel</SelectItem>
                <SelectItem value="en_ligne">En ligne</SelectItem>
                <SelectItem value="webinaire">Webinaire</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPrice} onValueChange={setSelectedPrice}>
              <SelectTrigger className="w-full lg:w-[140px]">
                <SelectValue placeholder="Prix" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous prix</SelectItem>
                <SelectItem value="free">Gratuit</SelectItem>
                <SelectItem value="paid">Payant</SelectItem>
              </SelectContent>
            </Select>
            {/* Toggle vue */}
            <div className="flex border border-border rounded-lg overflow-hidden shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isError && (
        <div className="flex items-center gap-2 text-sm text-destructive p-4 border border-destructive/20 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          Impossible de charger les événements.
        </div>
      )}
      {/* ── Tous les événements ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Tous les événements
            {!isLoadingAll && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({filtered.length})
              </span>
            )}
          </h2>
          {!isLoadingAll && hasMore && (
            <Button size="sm" className="gap-2 font-semibold" asChild>
              <a href={SITE_EVENEMENTS} target="_blank" rel="noopener noreferrer">
                Voir tous les événements
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>
          )}
        </div>

        {/* Grid */}
        {!isLoadingAll && !isError && viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {visible.map((e) => <EventCardGrid key={e.id} event={e} />)}
          </div>
        )}

        {/* List */}
        {!isLoadingAll && !isError && viewMode === "list" && (
          <div className="space-y-4">
            {visible.map((e) => <EventCardList key={e.id} event={e} />)}
          </div>
        )}

        {/* Skeletons chargement */}
        {isLoadingAll && viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            <GridSkeleton /><GridSkeleton /><GridSkeleton />
          </div>
        )}
        {isLoadingAll && viewMode === "list" && (
          <div className="space-y-4">
            <ListSkeleton /><ListSkeleton /><ListSkeleton />
          </div>
        )}

        {/* État vide */}
        {!isLoadingAll && !isError && visible.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">Aucun événement trouvé</p>
              <p className="text-sm text-muted-foreground mt-1">Modifiez vos filtres</p>
            </CardContent>
          </Card>
        )}


        {!isLoadingAll && filtered.length > 0 && (
          <p className="text-center text-xs text-muted-foreground">
            Retrouvez tous les événements sur{" "}
            <a
              href={SITE_EVENEMENTS}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline underline-offset-2"
            >
              evenement.cpupme.ci
            </a>
          </p>
        )}
      </section>
    </div>
  );
}
