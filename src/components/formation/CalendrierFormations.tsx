import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Video,
  Clock,
  Target,
  FileText,
  ChevronLeft,
  ChevronRight,
  Users,
  MapPin,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

type EventType = "live" | "deadline" | "quiz" | "webinar" | "exam";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  type: EventType;
  module: string;
  expert?: string;
  lieu?: string;
  description?: string;
  urgent?: boolean;
}

const eventTypeConfig: Record<EventType, { label: string; color: string; bgColor: string; icon: typeof Video }> = {
  live: { label: "Session live", color: "text-destructive", bgColor: "bg-destructive/10", icon: Video },
  deadline: { label: "Deadline", color: "text-warning", bgColor: "bg-warning/10", icon: Clock },
  quiz: { label: "Quiz / Examen", color: "text-primary", bgColor: "bg-primary/10", icon: Target },
  webinar: { label: "Webinaire", color: "text-info", bgColor: "bg-info/10", icon: Users },
  exam: { label: "Examen final", color: "text-secondary", bgColor: "bg-secondary/10", icon: FileText },
};

const now = new Date();
const y = now.getFullYear();
const m = now.getMonth();

const mockEvents: CalendarEvent[] = [
  { id: "e1", title: "Live — Réussir son AO", date: new Date(y, m, now.getDate() + 0, 14, 0), time: "14h00", type: "live", module: "AO", expert: "Dr. Konan Yao", lieu: "En ligne (Zoom)", urgent: true },
  { id: "e2", title: "Deadline — Comptabilité SYSCOHADA", date: new Date(y, m, now.getDate() + 3), type: "deadline", module: "Finance", description: "Date limite pour finaliser le module 3" },
  { id: "e3", title: "Quiz — Normes qualité", date: new Date(y, m, now.getDate() + 5, 10, 0), time: "10h00", type: "quiz", module: "Qualité", description: "Note minimum : 70%" },
  { id: "e4", title: "Webinaire — Tendances Marketplace 2024", date: new Date(y, m, now.getDate() + 7, 15, 30), time: "15h30", type: "webinar", module: "Marketplace", expert: "Mme Traoré Awa", lieu: "En ligne" },
  { id: "e5", title: "Live — Négociation bancaire", date: new Date(y, m, now.getDate() + 10, 9, 0), time: "09h00", type: "live", module: "Finance", expert: "Pr. Koffi Amani" },
  { id: "e6", title: "Examen — Certification AO", date: new Date(y, m, now.getDate() + 12, 8, 0), time: "08h00", type: "exam", module: "AO", description: "Examen final pour obtenir le certificat Prêt AO" },
  { id: "e7", title: "Deadline — Vente Marketplace", date: new Date(y, m, now.getDate() + 2), type: "deadline", module: "Marketplace" },
  { id: "e8", title: "Live — Optimisation fiche produit", date: new Date(y, m, now.getDate() + 14, 11, 0), time: "11h00", type: "live", module: "Marketplace", expert: "Mme Traoré Awa" },
  { id: "e9", title: "Quiz — Financement PME", date: new Date(y, m, now.getDate() + 8, 14, 0), time: "14h00", type: "quiz", module: "Finance" },
];

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_FR = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

export function CalendrierFormations() {
  const [currentMonth, setCurrentMonth] = useState(new Date(y, m, 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(y, m, now.getDate()));
  const [filter, setFilter] = useState<EventType | "all">("all");

  const viewYear = currentMonth.getFullYear();
  const viewMonth = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => setCurrentMonth(new Date(viewYear, viewMonth - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(viewYear, viewMonth + 1, 1));
  const goToday = () => {
    setCurrentMonth(new Date(y, m, 1));
    setSelectedDate(new Date(y, m, now.getDate()));
  };

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    mockEvents.forEach((ev) => {
      const key = `${ev.date.getFullYear()}-${ev.date.getMonth()}-${ev.date.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    });
    return map;
  }, []);

  const getEventsForDay = (day: number) => {
    const key = `${viewYear}-${viewMonth}-${day}`;
    return eventsByDate[key] || [];
  };

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    const key = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
    const events = eventsByDate[key] || [];
    if (filter === "all") return events;
    return events.filter((e) => e.type === filter);
  }, [selectedDate, eventsByDate, filter]);

  const upcomingEvents = useMemo(() => {
    const today = new Date(y, m, now.getDate());
    return mockEvents
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  }, []);

  const isToday = (day: number) =>
    viewYear === y && viewMonth === m && day === now.getDate();

  const isSelected = (day: number) =>
    selectedDate &&
    viewYear === selectedDate.getFullYear() &&
    viewMonth === selectedDate.getMonth() &&
    day === selectedDate.getDate();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Calendrier des formations
            </CardTitle>
            <CardDescription>Sessions live, deadlines et examens à venir</CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={goToday}>
              Aujourd'hui
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Calendrier grille */}
          <div className="lg:col-span-3">
            {/* Navigation mois */}
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h3 className="font-semibold text-sm">
                {MONTHS_FR[viewMonth]} {viewYear}
              </h3>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Jours de la semaine */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAYS_FR.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Grille jours */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-12" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                const hasLive = dayEvents.some((e) => e.type === "live" || e.type === "webinar");
                const hasDeadline = dayEvents.some((e) => e.type === "deadline");
                const hasQuiz = dayEvents.some((e) => e.type === "quiz" || e.type === "exam");

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(new Date(viewYear, viewMonth, day))}
                    className={cn(
                      "h-12 rounded-lg flex flex-col items-center justify-center gap-0.5 text-sm transition-all relative",
                      "hover:bg-muted/80",
                      isToday(day) && !isSelected(day) && "bg-primary/10 font-bold text-primary",
                      isSelected(day) && "bg-primary text-primary-foreground font-bold shadow-md",
                      !isToday(day) && !isSelected(day) && "text-foreground"
                    )}
                  >
                    {day}
                    {dayEvents.length > 0 && (
                      <div className="flex gap-0.5">
                        {hasLive && (
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            isSelected(day) ? "bg-primary-foreground" : "bg-destructive"
                          )} />
                        )}
                        {hasDeadline && (
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            isSelected(day) ? "bg-primary-foreground" : "bg-warning"
                          )} />
                        )}
                        {hasQuiz && (
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            isSelected(day) ? "bg-primary-foreground" : "bg-secondary"
                          )} />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Légende */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-destructive" /> Live / Webinaire
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-warning" /> Deadline
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-secondary" /> Quiz / Examen
              </div>
            </div>
          </div>

          {/* Panel événements */}
          <div className="lg:col-span-2">
            {selectedDate ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm">
                    {selectedDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                  </h4>
                  {selectedEvents.length > 0 && (
                    <Badge variant="outline" className="text-xs">{selectedEvents.length} événement(s)</Badge>
                  )}
                </div>

                {selectedEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Aucun événement ce jour</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedEvents.map((event) => {
                      const config = eventTypeConfig[event.type];
                      const Icon = config.icon;
                      return (
                        <div
                          key={event.id}
                          className={cn(
                            "p-3 rounded-xl border transition-all hover:shadow-sm",
                            event.urgent && "ring-1 ring-destructive/50"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn("p-2 rounded-lg mt-0.5", config.bgColor)}>
                              <Icon className={cn("w-4 h-4", config.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <Badge className={cn(config.bgColor, config.color, "border-0 text-xs")}>
                                  {config.label}
                                </Badge>
                                <Badge variant="outline" className="text-xs">{event.module}</Badge>
                                {event.urgent && (
                                  <Badge className="bg-destructive/10 text-destructive text-xs border-0 animate-pulse">
                                    <AlertCircle className="w-3 h-3 mr-0.5" />
                                    Urgent
                                  </Badge>
                                )}
                              </div>
                              <p className="font-semibold text-sm truncate">{event.title}</p>
                              {event.time && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <Clock className="w-3 h-3" />
                                  {event.time}
                                </p>
                              )}
                              {event.expert && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {event.expert}
                                </p>
                              )}
                              {event.lieu && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {event.lieu}
                                </p>
                              )}
                              {event.description && (
                                <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                              )}
                              {(event.type === "live" || event.type === "webinar") && (
                                <Button size="sm" className="mt-2 h-7 text-xs gap-1">
                                  <ExternalLink className="w-3 h-3" />
                                  Rejoindre
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
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">PROCHAINS ÉVÉNEMENTS</p>
                  <div className="space-y-1.5">
                    {upcomingEvents.map((event) => {
                      const config = eventTypeConfig[event.type];
                      return (
                        <div
                          key={event.id}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedDate(event.date);
                            setCurrentMonth(new Date(event.date.getFullYear(), event.date.getMonth(), 1));
                          }}
                        >
                          <span className={cn("w-2 h-2 rounded-full", config.bgColor.replace("/10", ""))} style={{
                            backgroundColor: event.type === "live" ? "hsl(var(--destructive))" :
                              event.type === "deadline" ? "hsl(var(--warning))" :
                              event.type === "webinar" ? "hsl(var(--info))" :
                              "hsl(var(--secondary))"
                          }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{event.title}</p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {event.date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Sélectionnez une date</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
