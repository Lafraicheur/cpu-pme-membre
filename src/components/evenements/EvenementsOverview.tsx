import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Download,
} from "lucide-react";

interface OverviewProps {
  onNavigate: (tab: string) => void;
}

const upcomingEvents = [
  {
    id: "evt-001",
    title: "Forum PME Côte d'Ivoire 2024",
    date: "2024-03-15",
    location: "Palais de la Culture, Abidjan",
    type: "Forum",
    registered: true,
    ticketStatus: "confirmed",
  },
  {
    id: "evt-002",
    title: "Salon de l'Agro-industrie",
    date: "2024-04-20",
    location: "Parc des Expositions",
    type: "Salon",
    registered: false,
  },
];

const myTickets = [
  {
    id: "TKT-001",
    eventTitle: "Forum PME Côte d'Ivoire 2024",
    ticketType: "VIP",
    date: "2024-03-15",
    status: "confirmed",
    qrCode: "QR123456",
  },
];

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

const alerts = [
  { type: "payment", message: "Paiement en attente - Stand Bronze Salon Agro", action: "Payer maintenant" },
  { type: "rdv", message: "2 demandes de RDV B2B à confirmer", action: "Voir" },
];

export function EvenementsOverview({ onNavigate }: OverviewProps) {
  return (
    <div className="space-y-6">
      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <Card key={index} className="border-primary/30 bg-primary/5">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  <span className="font-medium">{alert.message}</span>
                </div>
                <Button size="sm">{alert.action}</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">Événements à venir</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-secondary/10">
              <Ticket className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">2</p>
              <p className="text-sm text-muted-foreground">Billets actifs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
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
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Événements à venir</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("decouvrir")}>
              Voir tout <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CalendarDays className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(event.date).toLocaleDateString("fr-FR")}
                      <MapPin className="w-3 h-3 ml-2" />
                      {event.location.split(",")[0]}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {event.registered ? (
                    <Badge className="bg-secondary/10 text-secondary">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Inscrit
                    </Badge>
                  ) : (
                    <Button size="sm">S'inscrire</Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* My Tickets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Mes billets</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("billets")}>
              Voir tout <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {myTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-primary/5 to-secondary/5"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-background border">
                    <QrCode className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{ticket.eventTitle}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">{ticket.ticketType}</Badge>
                      <span className="text-muted-foreground">
                        {new Date(ticket.date).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <QrCode className="w-4 h-4 mr-1" />
                  Pass
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* B2B Meetings */}
        <Card className="lg:col-span-2">
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
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => onNavigate("decouvrir")} className="gap-2">
              <Calendar className="w-4 h-4" />
              Découvrir les événements
            </Button>
            <Button onClick={() => onNavigate("b2b")} variant="outline" className="gap-2">
              <Handshake className="w-4 h-4" />
              Demander un RDV B2B
            </Button>
            <Button onClick={() => onNavigate("exposant")} variant="outline" className="gap-2">
              <Building2 className="w-4 h-4" />
              Devenir exposant
            </Button>
            <Button onClick={() => onNavigate("billets")} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Télécharger mes factures
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
