import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  Building2,
  Ticket,
  Share2,
  Heart,
  Video,
  Handshake,
  Store,
  Award,
  CheckCircle2,
  Info,
  CreditCard,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface EventDetailProps {
  eventId: string;
  onBack: () => void;
}

const mockEvent = {
  id: "evt-001",
  title: "Forum PME Côte d'Ivoire 2024",
  description: `Le rendez-vous annuel des PME ivoiriennes. Trois jours de networking, conférences et opportunités d'affaires.
  
Rejoignez plus de 500 entrepreneurs, investisseurs et partenaires institutionnels pour :
- Des conférences sur les enjeux actuels des PME
- Des sessions de B2B matchmaking
- Une exposition de 50+ stands
- Des ateliers pratiques`,
  type: "forum",
  date: "2024-03-15",
  endDate: "2024-03-17",
  location: "Palais de la Culture, Abidjan",
  address: "Boulevard de la République, Plateau, Abidjan",
  isOnline: false,
  organizer: "CPU-PME",
  organizerLogo: "",
  sector: "Multi-sectoriel",
  region: "LAGUNES",
  capacity: 500,
  registered: 342,
  hasMatchmaking: true,
  hasExhibitors: true,
  tickets: [
    { id: "std", name: "Standard", price: 25000, description: "Accès aux conférences et networking" },
    { id: "vip", name: "VIP", price: 75000, description: "Accès complet + déjeuners + zone VIP" },
    { id: "workshop", name: "Standard + Ateliers", price: 45000, description: "Standard + accès aux ateliers pratiques" },
  ],
  agenda: [
    { date: "2024-03-15", time: "09:00", title: "Ouverture officielle", speaker: "Ministre PME" },
    { date: "2024-03-15", time: "10:00", title: "Keynote: L'avenir des PME en Afrique", speaker: "Jean Kacou" },
    { date: "2024-03-15", time: "14:00", title: "Panel: Financement innovant", speaker: "Experts bancaires" },
    { date: "2024-03-16", time: "09:00", title: "Atelier: Transformation digitale", speaker: "CPU-PME Digital" },
    { date: "2024-03-16", time: "14:00", title: "B2B Matchmaking Sessions", speaker: "" },
    { date: "2024-03-17", time: "10:00", title: "Remise des prix PME", speaker: "" },
    { date: "2024-03-17", time: "16:00", title: "Clôture", speaker: "" },
  ],
  exhibitors: [
    { name: "SIFCA Group", sector: "Agro-industrie" },
    { name: "Orange CI", sector: "Télécom" },
    { name: "BCEAO", sector: "Finance" },
    { name: "CNPS", sector: "Social" },
  ],
  sponsors: [
    { name: "BOAD", level: "Or" },
    { name: "BAD", level: "Or" },
    { name: "Coris Bank", level: "Argent" },
  ],
};

export function EventDetail({ eventId, onBack }: EventDetailProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState("");
  const [quantity, setQuantity] = useState("1");

  const event = mockEvent;

  const handleRegister = () => {
    if (!selectedTicket) {
      toast.error("Veuillez sélectionner un type de billet");
      return;
    }
    toast.success("Inscription enregistrée ! Redirection vers le paiement...");
    setShowRegistration(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge className="bg-primary/10 text-primary">Forum</Badge>
            {event.hasMatchmaking && <Badge variant="outline">B2B Matchmaking</Badge>}
            {event.hasExhibitors && <Badge variant="outline">Exposition</Badge>}
          </div>
          <h1 className="text-2xl font-bold text-foreground">{event.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setIsFavorite(!isFavorite)}>
            <Heart className={cn("w-5 h-5", isFavorite && "fill-red-500 text-red-500")} />
          </Button>
          <Button variant="outline" size="icon">
            <Share2 className="w-5 h-5" />
          </Button>
          <Button onClick={() => setShowRegistration(true)} size="lg" className="gap-2">
            <Ticket className="w-5 h-5" />
            S'inscrire
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Image Placeholder */}
          <div className="h-64 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
            <Calendar className="w-20 h-20 text-primary/40" />
          </div>

          <Tabs defaultValue="description" className="space-y-4">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="agenda">Programme</TabsTrigger>
              <TabsTrigger value="exhibitors">Exposants</TabsTrigger>
              <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
            </TabsList>

            <TabsContent value="description">
              <Card>
                <CardContent className="p-6">
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground whitespace-pre-line">{event.description}</p>
                  </div>
                  <Separator className="my-6" />
                  <h3 className="font-semibold mb-4">Informations pratiques</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Dates</p>
                        <p className="font-medium">
                          {new Date(event.date).toLocaleDateString("fr-FR")} - {new Date(event.endDate!).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <MapPin className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Lieu</p>
                        <p className="font-medium">{event.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Building2 className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Organisateur</p>
                        <p className="font-medium">{event.organizer}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Users className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Capacité</p>
                        <p className="font-medium">{event.capacity} participants</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="agenda">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {["2024-03-15", "2024-03-16", "2024-03-17"].map((date) => {
                      const dayEvents = event.agenda.filter((a) => a.date === date);
                      return (
                        <div key={date}>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            {new Date(date).toLocaleDateString("fr-FR", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                            })}
                          </h4>
                          <div className="space-y-2 ml-6 border-l-2 border-primary/20 pl-4">
                            {dayEvents.map((item, index) => (
                              <div key={index} className="flex items-start gap-4 py-2">
                                <span className="text-sm font-medium text-primary min-w-[50px]">
                                  {item.time}
                                </span>
                                <div>
                                  <p className="font-medium">{item.title}</p>
                                  {item.speaker && (
                                    <p className="text-sm text-muted-foreground">{item.speaker}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="exhibitors">
              <Card>
                <CardContent className="p-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {event.exhibitors.map((exhibitor, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                      >
                        <div className="p-3 rounded-full bg-muted">
                          <Store className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{exhibitor.name}</p>
                          <p className="text-sm text-muted-foreground">{exhibitor.sector}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sponsors">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {["Or", "Argent"].map((level) => {
                      const levelSponsors = event.sponsors.filter((s) => s.level === level);
                      if (levelSponsors.length === 0) return null;
                      return (
                        <div key={level}>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Award className={cn(
                              "w-4 h-4",
                              level === "Or" ? "text-amber-500" : "text-gray-400"
                            )} />
                            Sponsors {level}
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            {levelSponsors.map((sponsor, index) => (
                              <Badge key={index} variant="outline" className="px-4 py-2">
                                {sponsor.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tickets */}
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary" />
                Billets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {event.tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedTicket(ticket.id);
                    setShowRegistration(true);
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium">{ticket.name}</p>
                    <p className="font-bold text-primary">
                      {ticket.price.toLocaleString()} FCFA
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{ticket.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Inscrits
                </span>
                <span className="font-semibold">{event.registered}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Places restantes</span>
                <span className="font-semibold text-primary">
                  {event.capacity - event.registered}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* B2B Matchmaking CTA */}
          {event.hasMatchmaking && (
            <Card className="bg-gradient-to-r from-blue-500/10 to-primary/10 border-blue-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Handshake className="w-6 h-6 text-blue-500" />
                  <h3 className="font-semibold">B2B Matchmaking</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Planifiez des rendez-vous d'affaires avec les autres participants
                </p>
                <Button className="w-full" variant="outline">
                  Configurer mon profil B2B
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Become Exhibitor */}
          {event.hasExhibitors && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Store className="w-6 h-6 text-secondary" />
                  <h3 className="font-semibold">Devenir exposant</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Exposez vos produits et services
                </p>
                <Button className="w-full" variant="secondary">
                  Voir les stands
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Registration Dialog */}
      <Dialog open={showRegistration} onOpenChange={setShowRegistration}>
        <DialogContent className="max-w-[95vw] sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Inscription à l'événement</DialogTitle>
            <DialogDescription>{event.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Type de billet *</Label>
              <Select value={selectedTicket} onValueChange={setSelectedTicket}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un billet" />
                </SelectTrigger>
                <SelectContent>
                  {event.tickets.map((ticket) => (
                    <SelectItem key={ticket.id} value={ticket.id}>
                      {ticket.name} - {ticket.price.toLocaleString()} FCFA
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nombre de participants</Label>
              <Select value={quantity} onValueChange={setQuantity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={n.toString()}>
                      {n} participant{n > 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTicket && (
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="font-medium">
                    {(
                      event.tickets.find((t) => t.id === selectedTicket)!.price *
                      parseInt(quantity)
                    ).toLocaleString()}{" "}
                    FCFA
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    {(
                      event.tickets.find((t) => t.id === selectedTicket)!.price *
                      parseInt(quantity)
                    ).toLocaleString()}{" "}
                    FCFA
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowRegistration(false)}>
                Annuler
              </Button>
              <Button className="flex-1 gap-2" onClick={handleRegister}>
                <CreditCard className="w-4 h-4" />
                Payer et s'inscrire
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
