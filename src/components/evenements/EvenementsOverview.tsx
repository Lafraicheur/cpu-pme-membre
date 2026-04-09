import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Ticket,
  Users,
  Building2,
  MapPin,
  Clock,
  QrCode,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  Handshake,
  TrendingUp,
  ImageOff,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { evenementsApi, registrationsApi, type Evenement, type Registration } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface OverviewProps {
  onNavigate: (tab: string) => void;
}


const upcomingRDV = [
  {
    id: "rdv-001",
    company: "SIFCA Group",
    contact: "Jean Konan",
    date: "2024-03-15",
    time: "10:00",
    objective: "Partenariat distribution",
    status: "accepted",
  },
  {
    id: "rdv-002",
    company: "Nestlé CI",
    contact: "Marie Bamba",
    date: "2024-03-15",
    time: "14:30",
    objective: "Sourcing local",
    status: "requested",
  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function EventCard({ event }: { event: Evenement }) {
  const couleur = event.type_evenement?.couleur ?? "#6366f1";

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {/* Image ou icône */}
        {event.image_flayer ? (
          <img
            src={event.image_flayer}
            alt={event.titre}
            className="w-12 h-12 rounded-lg object-cover shrink-0"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <ImageOff className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0">
          <p className="font-medium truncate">{event.titre}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-0.5">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(event.date_debut)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {event.lieu.split(",")[0]}
            </span>
          </div>
        </div>
      </div>
      <div className="shrink-0">
        {event.type_evenement && (
          <Badge
            style={{ backgroundColor: couleur + "20", color: couleur, borderColor: couleur + "40" }}
            variant="outline"
            className="text-xs whitespace-nowrap"
          >
            {event.type_evenement.nom}
          </Badge>
        )}
      </div>
    </div>
  );
}

function EventCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border">
      <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

function statusLabel(statut: string) {
  switch (statut) {
    case "payé":
    case "paye":
    case "confirmed": return { label: "Payé", className: "bg-green-500/10 text-green-600" };
    case "en_attente": return { label: "En attente", className: "bg-amber-500/10 text-amber-600" };
    case "annulé":
    case "annule": return { label: "Annulé", className: "bg-destructive/10 text-destructive" };
    default: return { label: statut, className: "bg-muted text-muted-foreground" };
  }
}

export function EvenementsOverview({ onNavigate }: OverviewProps) {
  const { user } = useAuth();

  const { data: recentEvents, isLoading, isError } = useQuery({
    queryKey: ["evenements", "recent-upcoming"],
    queryFn: evenementsApi.getRecentUpcoming,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: registrations,
    isLoading: isLoadingTickets,
    isError: isErrorTickets,
  } = useQuery({
    queryKey: ["registrations", user?.id],
    queryFn: () => registrationsApi.getByUser(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{recentEvents?.length ?? "—"}</p>
              <p className="text-sm text-muted-foreground">Événements récents</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-secondary/10">
              <Ticket className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{isLoadingTickets ? "—" : (registrations?.length ?? 0)}</p>
              <p className="text-sm text-muted-foreground">Billets actifs</p>
            </div>
          </CardContent>
        </Card>
        {/* <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/10">
              <Handshake className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-sm text-muted-foreground">RDV B2B prévus</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-500/10">
              <TrendingUp className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Leads collectés</p>
            </div>
          </CardContent>
        </Card> */}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Événements récents — données réelles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Événements récents</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("decouvrir")}>
              Voir tout <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading && (
              <>
                <EventCardSkeleton />
                <EventCardSkeleton />
                <EventCardSkeleton />
              </>
            )}
            {isError && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground p-4">
                <AlertCircle className="w-4 h-4 text-destructive" />
                Impossible de charger les événements.
              </div>
            )}
            {!isLoading && !isError && recentEvents?.length === 0 && (
              <p className="text-sm text-muted-foreground p-4 text-center">
                Aucun événement récent.
              </p>
            )}
            {recentEvents?.slice(0, 3).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </CardContent>
        </Card>

        {/* Mes billets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">
              Mes billets
              {registrations && registrations.length > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({registrations.length})
                </span>
              )}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("inscriptions")}>
              Voir tout <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingTickets && (
              <>
                <EventCardSkeleton />
                <EventCardSkeleton />
              </>
            )}
            {isErrorTickets && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground p-4">
                <AlertCircle className="w-4 h-4 text-destructive" />
                Impossible de charger les billets.
              </div>
            )}
            {!isLoadingTickets && !isErrorTickets && registrations?.length === 0 && (
              <p className="text-sm text-muted-foreground p-4 text-center">
                Aucune inscription trouvée.
              </p>
            )}
            {registrations?.slice(0, 3).map((reg) => {
              const ticketNom = reg.details[0]?.ticket_type?.nom ?? "Billet";
              const { label, className } = statusLabel(reg.statut_paiement);
              return (
                <div
                  key={reg.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-primary/5 to-secondary/5 gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-3 rounded-lg bg-background border shrink-0">
                      <QrCode className="w-6 h-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {reg.prenom} {reg.nom}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-sm mt-0.5">
                        <Badge variant="outline">{ticketNom}</Badge>
                        <Badge className={className}>{label}</Badge>
                        <span className="text-muted-foreground">
                          {new Date(reg.date_commande).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                      {Number(reg.total_price) > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {Number(reg.total_price).toLocaleString("fr-FR")} FCFA
                        </p>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0">
                    <QrCode className="w-4 h-4 mr-1" />
                    Pass
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* RDV B2B */}
        {/* <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">RDV B2B cette semaine</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("b2b")}>
              Gérer mes RDV <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {upcomingRDV.map((rdv) => (
                <div
                  key={rdv.id}
                  className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-500/10">
                        <Building2 className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium">{rdv.company}</p>
                        <p className="text-sm text-muted-foreground">{rdv.contact}</p>
                      </div>
                    </div>
                    <Badge
                      className={
                        rdv.status === "accepted"
                          ? "bg-secondary/10 text-secondary"
                          : "bg-amber-500/10 text-amber-600"
                      }
                    >
                      {rdv.status === "accepted" ? "Confirmé" : "En attente"}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(rdv.date).toLocaleDateString("fr-FR")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {rdv.time}
                    </span>
                  </div>
                  <p className="mt-2 text-sm">{rdv.objective}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
