import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar, Video, Clock, ChevronLeft, ChevronRight,
  MapPin, AlertCircle, ExternalLink, BookOpen,
  RefreshCw, GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formationsApi, FormationAPI } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────

type EventType = "webinaire" | "presentiel" | "a_son_rythme";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: EventType;
  category: string;
  expert: string;
  lieu: string | null;
  lien: string | null;
  description: string;
  duration: number;
  price: number;
  isFree: boolean;
  niveau: string | null;
  image: string | null;
}

// ── Config visuelle ───────────────────────────────────────────────────────────

const eventConfig: Record<EventType, {
  label: string;
  color: string;
  bgColor: string;
  dotColor: string;
  icon: typeof Video;
}> = {
  webinaire:    { label: "Webinaire / Live", color: "text-violet-600", bgColor: "bg-violet-50 border-violet-200", dotColor: "bg-violet-500", icon: Video },
  presentiel:   { label: "Présentiel",       color: "text-green-600",  bgColor: "bg-green-50 border-green-200",   dotColor: "bg-green-500",  icon: MapPin },
  a_son_rythme: { label: "À son rythme",     color: "text-blue-600",   bgColor: "bg-blue-50 border-blue-200",     dotColor: "bg-blue-500",   icon: BookOpen },
};

const niveauLabel: Record<string, string> = {
  beginner: "Débutant", intermediate: "Intermédiaire", advanced: "Avancé",
};

const DAYS_FR   = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfMonth(y: number, m: number) {
  const d = new Date(y, m, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

function mapFormationToEvent(f: FormationAPI): CalendarEvent | null {
  if (!f.date) return null;
  const date = new Date(f.date);
  if (isNaN(date.getTime())) return null;
  return {
    id: f.id,
    title: f.title,
    date,
    type: (f.mode === "live" ? "webinaire" : (f.mode as EventType)) ?? "a_son_rythme",
    category: f.category,
    expert: f.formateur ? `${f.formateur.firstname} ${f.formateur.lastname}` : "Formateur inconnu",
    lieu: f.location,
    lien: f.lien,
    description: f.description,
    duration: f.duration,
    price: f.price ? parseFloat(f.price) : 0,
    isFree: !f.isPaid || !f.price || parseFloat(f.price) === 0,
    niveau: f.niveau,
    image: f.image,
  };
}

// ── Skeleton calendrier ───────────────────────────────────────────────────────

function CalendarSkeleton() {
  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-8 rounded-sm" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-8 rounded-sm" />
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-sm" />
          ))}
        </div>
      </div>
      <div className="lg:col-span-2 space-y-3">
        <Skeleton className="h-5 w-40" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-sm" />
        ))}
      </div>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

export function CalendrierFormations() {
  const now = new Date();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(now);
  const [filterType, setFilterType] = useState<EventType | "all">("all");

  const fetchEvents = () => {
    setLoading(true);
    setError(null);
    formationsApi.getAll()
      .then((formations) => {
        const mapped = formations
          .map(mapFormationToEvent)
          .filter(Boolean) as CalendarEvent[];
        setEvents(mapped);
      })
      .catch(() => setError("Impossible de charger les formations."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, []);

  const viewYear  = currentMonth.getFullYear();
  const viewMonth = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay    = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => setCurrentMonth(new Date(viewYear, viewMonth - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(viewYear, viewMonth + 1, 1));
  const goToday   = () => {
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(new Date(now));
  };

  // Map events by date key
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((ev) => {
      const key = `${ev.date.getFullYear()}-${ev.date.getMonth()}-${ev.date.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    });
    return map;
  }, [events]);

  const getEventsForDay = (day: number) =>
    eventsByDate[`${viewYear}-${viewMonth}-${day}`] ?? [];

  // Events for selected date (filtered)
  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    const key = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
    const evs = eventsByDate[key] ?? [];
    return filterType === "all" ? evs : evs.filter((e) => e.type === filterType);
  }, [selectedDate, eventsByDate, filterType]);

  // Next 5 upcoming events from today
  const upcomingEvents = useMemo(() => {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return [...events]
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  }, [events]);

  // Stats du mois affiché
  const monthEvents = useMemo(() =>
    events.filter((e) => e.date.getFullYear() === viewYear && e.date.getMonth() === viewMonth),
    [events, viewYear, viewMonth]
  );

  const isToday = (day: number) =>
    viewYear === now.getFullYear() && viewMonth === now.getMonth() && day === now.getDate();

  const isSelected = (day: number) =>
    !!selectedDate &&
    viewYear === selectedDate.getFullYear() &&
    viewMonth === selectedDate.getMonth() &&
    day === selectedDate.getDate();

  // Compter les types de dots pour un jour
  const getDayDots = (day: number) => {
    const evs = getEventsForDay(day);
    const types = new Set(evs.map((e) => e.type));
    return Array.from(types).slice(0, 3);
  };

  return (
    <Card className="rounded-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Calendrier des formations
            </CardTitle>
            <CardDescription>
              {loading ? "Chargement…" : `${events.filter(e => e.date >= new Date()).length} formation${events.filter(e => e.date >= new Date()).length > 1 ? "s" : ""} à venir`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {/* Filtre type */}
            <div className="flex items-center gap-1 flex-wrap">
              {(["all", "webinaire", "presentiel", "a_son_rythme"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-sm border transition-colors",
                    filterType === t
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  {t === "all" ? "Tous" : eventConfig[t].label}
                </button>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-xs rounded-sm" onClick={goToday}>
              Aujourd'hui
            </Button>
          </div>
        </div>

        {/* Stats mois */}
        {!loading && !error && monthEvents.length > 0 && (
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {(["webinaire", "presentiel", "a_son_rythme"] as EventType[]).map((t) => {
              const count = monthEvents.filter((e) => e.type === t).length;
              if (!count) return null;
              const cfg = eventConfig[t];
              return (
                <span key={t} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className={cn("w-2 h-2 rounded-full", cfg.dotColor)} />
                  {count} {cfg.label}
                </span>
              );
            })}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {loading && <CalendarSkeleton />}

        {!loading && error && (
          <div className="text-center py-12 space-y-3">
            <AlertCircle className="w-10 h-10 mx-auto text-destructive/40" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" className="gap-2 rounded-sm" onClick={fetchEvents}>
              <RefreshCw className="w-3.5 h-3.5" />
              Réessayer
            </Button>
          </div>
        )}

        {!loading && !error && (
          <div className="grid lg:grid-cols-5 gap-6">
            {/* ── Grille calendrier ── */}
            <div className="lg:col-span-3">
              {/* Navigation mois */}
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm" onClick={prevMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="text-center">
                  <h3 className="font-semibold text-sm">
                    {MONTHS_FR[viewMonth]} {viewYear}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {monthEvents.length} formation{monthEvents.length > 1 ? "s" : ""}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Jours semaine */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {DAYS_FR.map((d) => (
                  <div key={d} className="text-center text-[11px] font-semibold text-muted-foreground py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Cellules */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`e-${i}`} className="h-12" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dots = getDayDots(day);
                  const count = getEventsForDay(day).length;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(new Date(viewYear, viewMonth, day))}
                      className={cn(
                        "h-12 rounded-sm flex flex-col items-center justify-center gap-0.5 text-sm transition-all relative",
                        "hover:bg-muted/80",
                        isToday(day) && !isSelected(day) && "bg-primary/10 font-bold text-primary ring-1 ring-primary/30",
                        isSelected(day) && "bg-primary text-primary-foreground font-bold shadow-sm",
                        !isToday(day) && !isSelected(day) && "text-foreground"
                      )}
                    >
                      <span className="leading-none">{day}</span>
                      {dots.length > 0 && (
                        <div className="flex gap-0.5">
                          {dots.map((type) => (
                            <span
                              key={type}
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                isSelected(day) ? "bg-primary-foreground/80" : eventConfig[type].dotColor
                              )}
                            />
                          ))}
                        </div>
                      )}
                      {count > 1 && (
                        <span className={cn(
                          "absolute top-1 right-1 text-[9px] font-bold leading-none",
                          isSelected(day) ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Légende */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t flex-wrap">
                {(["webinaire", "presentiel", "a_son_rythme"] as EventType[]).map((t) => (
                  <div key={t} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className={cn("w-2 h-2 rounded-full", eventConfig[t].dotColor)} />
                    {eventConfig[t].label}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Panel détail ── */}
            <div className="lg:col-span-2 min-h-0">
              {selectedDate ? (
                <div className="space-y-4">
                  {/* Titre date */}
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm capitalize">
                      {selectedDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                    </h4>
                    {selectedEvents.length > 0 && (
                      <Badge variant="outline" className="text-xs rounded-sm">
                        {selectedEvents.length} formation{selectedEvents.length > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>

                  {selectedEvents.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Aucune formation ce jour</p>
                      {filterType !== "all" && (
                        <button
                          className="text-xs text-primary mt-1 hover:underline"
                          onClick={() => setFilterType("all")}
                        >
                          Voir tous les types
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                      {selectedEvents.map((event) => {
                        const cfg = eventConfig[event.type] ?? eventConfig.a_son_rythme;
                        const Icon = cfg.icon;
                        const isJoinable = event.type === "webinaire";

                        return (
                          <div
                            key={event.id}
                            className={cn(
                              "rounded-sm border overflow-hidden transition-all hover:shadow-sm",
                            )}
                          >
                            {/* Image mini */}
                            {event.image && (
                              <div className="h-20 overflow-hidden">
                                <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="p-3">
                              {/* Badges */}
                              <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                                <Badge className={cn("text-[10px] h-4 px-1.5 border gap-1 rounded-sm", cfg.bgColor, cfg.color)}>
                                  <Icon className="w-2.5 h-2.5" />
                                  {cfg.label}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] h-4 px-1.5 rounded-sm">
                                  {event.category}
                                </Badge>
                                {event.niveau && (
                                  <Badge variant="outline" className="text-[10px] h-4 px-1.5 rounded-sm">
                                    {niveauLabel[event.niveau] ?? event.niveau}
                                  </Badge>
                                )}
                              </div>

                              {/* Titre */}
                              <p className="font-semibold text-sm line-clamp-2 leading-snug mb-2">
                                {event.title}
                              </p>

                              {/* Meta */}
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3 flex-shrink-0" />
                                  {event.date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                  {event.duration > 0 && ` · ${event.duration}h`}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <GraduationCap className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{event.expert}</span>
                                </div>
                                {event.lieu && (
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <MapPin className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{event.lieu}</span>
                                  </div>
                                )}
                              </div>

                              {/* Prix + bouton */}
                              <div className="flex items-center justify-between mt-2.5 pt-2 border-t">
                                {event.isFree ? (
                                  <span className="text-xs font-semibold text-emerald-600">Gratuit</span>
                                ) : (
                                  <span className="text-xs font-semibold text-primary">
                                    {event.price.toLocaleString()} FCFA
                                  </span>
                                )}
                                {isJoinable && event.lien ? (
                                  <a
                                    href={event.lien}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 h-6 px-2 text-[11px] rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    Rejoindre
                                  </a>
                                ) : (
                                  <Button size="sm" variant="outline" className="h-6 px-2 text-[11px] rounded-sm">
                                    S'inscrire
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Prochains événements */}
                  {upcomingEvents.length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Prochaines formations
                      </p>
                      <div className="space-y-1">
                        {upcomingEvents.map((ev) => {
                          const cfg = eventConfig[ev.type] ?? eventConfig.a_son_rythme;
                          return (
                            <button
                              key={ev.id}
                              className="w-full flex items-center gap-2 p-2 rounded-sm hover:bg-muted/50 transition-colors text-left"
                              onClick={() => {
                                setSelectedDate(new Date(ev.date));
                                setCurrentMonth(new Date(ev.date.getFullYear(), ev.date.getMonth(), 1));
                              }}
                            >
                              <span className={cn("w-2 h-2 rounded-full flex-shrink-0", cfg.dotColor)} />
                              <span className="text-xs flex-1 truncate font-medium">{ev.title}</span>
                              <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                                {ev.date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Sélectionnez une date</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
