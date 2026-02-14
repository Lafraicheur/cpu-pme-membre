import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Calendar,
  MapPin,
  Users,
  Clock,
  Tag,
  Building2,
  Ticket,
  ChevronRight,
  Star,
  Globe,
  Video,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  description: string;
  type: "salon" | "forum" | "atelier" | "webinar" | "conference";
  date: string;
  endDate?: string;
  location: string;
  isOnline: boolean;
  organizer: string;
  sector: string;
  region: string;
  price: number;
  currency: string;
  capacity: number;
  registered: number;
  hasMatchmaking: boolean;
  hasExhibitors: boolean;
  image?: string;
  featured: boolean;
  tags: string[];
}

const mockEvents: Event[] = [
  {
    id: "evt-001",
    title: "Forum PME Côte d'Ivoire 2024",
    description: "Le rendez-vous annuel des PME ivoiriennes. Networking, conférences et opportunités d'affaires.",
    type: "forum",
    date: "2024-03-15",
    endDate: "2024-03-17",
    location: "Palais de la Culture, Abidjan",
    isOnline: false,
    organizer: "CPU-PME",
    sector: "Multi-sectoriel",
    region: "LAGUNES",
    price: 25000,
    currency: "FCFA",
    capacity: 500,
    registered: 342,
    hasMatchmaking: true,
    hasExhibitors: true,
    featured: true,
    tags: ["B2B", "Networking", "Financement"],
  },
  {
    id: "evt-002",
    title: "Salon de l'Agro-industrie",
    description: "Exposition des innovations agricoles et opportunités de partenariat dans la filière agro-alimentaire.",
    type: "salon",
    date: "2024-04-20",
    endDate: "2024-04-22",
    location: "Parc des Expositions, Abidjan",
    isOnline: false,
    organizer: "ANADER",
    sector: "Agriculture",
    region: "LAGUNES",
    price: 15000,
    currency: "FCFA",
    capacity: 1000,
    registered: 567,
    hasMatchmaking: true,
    hasExhibitors: true,
    featured: true,
    tags: ["Agriculture", "Agro-industrie", "Export"],
  },
  {
    id: "evt-003",
    title: "Atelier Transformation Numérique PME",
    description: "Formation pratique sur la digitalisation des processus métier et l'adoption des outils numériques.",
    type: "atelier",
    date: "2024-02-28",
    location: "CPU-PME Hub, Plateau",
    isOnline: false,
    organizer: "CPU-PME Digital",
    sector: "Numérique",
    region: "LAGUNES",
    price: 0,
    currency: "FCFA",
    capacity: 50,
    registered: 45,
    hasMatchmaking: false,
    hasExhibitors: false,
    featured: false,
    tags: ["Digital", "Formation", "Gratuit"],
  },
  {
    id: "evt-004",
    title: "Webinar: Accéder aux marchés publics",
    description: "Comprendre les procédures et optimiser vos soumissions aux appels d'offres publics.",
    type: "webinar",
    date: "2024-02-20",
    location: "En ligne",
    isOnline: true,
    organizer: "CPU-PME Academy",
    sector: "Multi-sectoriel",
    region: "National",
    price: 0,
    currency: "FCFA",
    capacity: 200,
    registered: 156,
    hasMatchmaking: false,
    hasExhibitors: false,
    featured: false,
    tags: ["Marchés publics", "Formation", "Gratuit"],
  },
  {
    id: "evt-005",
    title: "Conférence Financement PME",
    description: "Rencontrez les institutions financières et découvrez les nouvelles solutions de financement.",
    type: "conference",
    date: "2024-05-10",
    location: "Hôtel Ivoire, Abidjan",
    isOnline: false,
    organizer: "BCEAO & CPU-PME",
    sector: "Finance",
    region: "LAGUNES",
    price: 50000,
    currency: "FCFA",
    capacity: 300,
    registered: 89,
    hasMatchmaking: true,
    hasExhibitors: false,
    featured: true,
    tags: ["Financement", "Banques", "B2B"],
  },
];

const eventTypeConfig = {
  salon: { label: "Salon", color: "bg-blue-500/10 text-blue-600" },
  forum: { label: "Forum", color: "bg-primary/10 text-primary" },
  atelier: { label: "Atelier", color: "bg-secondary/10 text-secondary" },
  webinar: { label: "Webinar", color: "bg-purple-500/10 text-purple-600" },
  conference: { label: "Conférence", color: "bg-amber-500/10 text-amber-600" },
};

interface DecouvrirProps {
  onViewDetail: (eventId: string) => void;
}

export function DecouvrirEvenements({ onViewDetail }: DecouvrirProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredEvents = mockEvents.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || event.type === selectedType;
    const matchesRegion = selectedRegion === "all" || event.region === selectedRegion;
    const matchesPrice =
      selectedPrice === "all" ||
      (selectedPrice === "free" && event.price === 0) ||
      (selectedPrice === "paid" && event.price > 0);
    return matchesSearch && matchesType && matchesRegion && matchesPrice;
  });

  const featuredEvents = filteredEvents.filter((e) => e.featured);
  const regularEvents = filteredEvents.filter((e) => !e.featured);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un événement..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full lg:w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="salon">Salon</SelectItem>
                <SelectItem value="forum">Forum</SelectItem>
                <SelectItem value="atelier">Atelier</SelectItem>
                <SelectItem value="webinar">Webinar</SelectItem>
                <SelectItem value="conference">Conférence</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-full lg:w-[150px]">
                <SelectValue placeholder="Région" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes régions</SelectItem>
                <SelectItem value="LAGUNES">LAGUNES</SelectItem>
                <SelectItem value="National">National</SelectItem>
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

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Événements à la une
          </h2>
          <div className="grid lg:grid-cols-2 gap-4">
            {featuredEvents.map((event) => (
              <Card
                key={event.id}
                className="overflow-hidden hover:shadow-lg transition-all cursor-pointer border-primary/20"
                onClick={() => onViewDetail(event.id)}
              >
                <div className="h-32 bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-primary/50" />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={eventTypeConfig[event.type].color}>
                      {eventTypeConfig[event.type].label}
                    </Badge>
                    {event.isOnline && (
                      <Badge variant="outline" className="gap-1">
                        <Video className="w-3 h-3" />
                        En ligne
                      </Badge>
                    )}
                    {event.hasMatchmaking && (
                      <Badge variant="outline" className="gap-1">
                        B2B
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                  <p className="text-muted-foreground line-clamp-2 mb-4">{event.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.date).toLocaleDateString("fr-FR")}
                      {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString("fr-FR")}`}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {event.location.split(",")[0]}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {event.organizer}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      {event.price > 0 ? (
                        <p className="text-lg font-bold text-primary">
                          {event.price.toLocaleString()} {event.currency}
                        </p>
                      ) : (
                        <Badge className="bg-secondary/10 text-secondary">Gratuit</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        <Users className="w-4 h-4 inline mr-1" />
                        {event.registered}/{event.capacity}
                      </span>
                      <Button>S'inscrire</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Regular Events */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Tous les événements</h2>
        <div className="space-y-4">
          {regularEvents.map((event) => (
            <Card
              key={event.id}
              className="hover:shadow-lg transition-all cursor-pointer"
              onClick={() => onViewDetail(event.id)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={eventTypeConfig[event.type].color}>
                        {eventTypeConfig[event.type].label}
                      </Badge>
                      {event.isOnline && (
                        <Badge variant="outline" className="gap-1">
                          <Video className="w-3 h-3" />
                          En ligne
                        </Badge>
                      )}
                      {event.price === 0 && (
                        <Badge className="bg-secondary/10 text-secondary">Gratuit</Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                    <p className="text-muted-foreground line-clamp-1">{event.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(event.date).toLocaleDateString("fr-FR")}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.location.split(",")[0]}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {event.organizer}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      {event.price > 0 ? (
                        <p className="font-bold text-primary">
                          {event.price.toLocaleString()} FCFA
                        </p>
                      ) : (
                        <p className="font-medium text-secondary">Gratuit</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {event.capacity - event.registered} places
                      </p>
                    </div>
                    <Button>S'inscrire</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {filteredEvents.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">Aucun événement trouvé</p>
            <p className="text-sm text-muted-foreground">Modifiez vos filtres pour voir plus de résultats</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
