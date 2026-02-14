import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Store,
  Calendar,
  MapPin,
  Users,
  Package,
  QrCode,
  Upload,
  Edit,
  Eye,
  Download,
  Plus,
  Star,
  TrendingUp,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Image,
  Video,
  FileText,
  Trash2,
  Phone,
  Mail,
  Building2,
  Target,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type StandStatus = "pending_payment" | "active" | "closed";
type LeadQuality = "hot" | "warm" | "cold";

interface Stand {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  packageType: "bronze" | "argent" | "or";
  surface: string;
  status: StandStatus;
  price: number;
  badges: number;
  extras: string[];
}

interface Lead {
  id: string;
  visitorName: string;
  visitorCompany: string;
  visitorEmail: string;
  visitorPhone: string;
  sector: string;
  interest: string;
  quality: LeadQuality;
  notes: string;
  scannedAt: string;
  eventId: string;
}

interface StandConfig {
  logo: string;
  banner: string;
  description: string;
  products: { name: string; description: string }[];
  teamMembers: { name: string; role: string }[];
  demoSlots: { time: string; title: string }[];
}

const mockStands: Stand[] = [
  {
    id: "stand-001",
    eventId: "evt-001",
    eventTitle: "Forum PME Côte d'Ivoire 2024",
    eventDate: "2024-03-15",
    eventLocation: "Palais de la Culture, Abidjan",
    packageType: "argent",
    surface: "12m²",
    status: "active",
    price: 500000,
    badges: 4,
    extras: ["Électricité renforcée", "Mobilier premium"],
  },
  {
    id: "stand-002",
    eventId: "evt-002",
    eventTitle: "Salon de l'Agro-industrie",
    eventDate: "2024-04-20",
    eventLocation: "Parc des Expositions",
    packageType: "bronze",
    surface: "9m²",
    status: "pending_payment",
    price: 250000,
    badges: 2,
    extras: [],
  },
];

const mockLeads: Lead[] = [
  {
    id: "lead-001",
    visitorName: "Kouamé Yao",
    visitorCompany: "AgroTech CI",
    visitorEmail: "k.yao@agrotech.ci",
    visitorPhone: "+225 07 08 09 10 11",
    sector: "Agro-industrie",
    interest: "Distribution produits",
    quality: "hot",
    notes: "Très intéressé par notre gamme. RDV à planifier.",
    scannedAt: "2024-03-15T10:30:00",
    eventId: "evt-001",
  },
  {
    id: "lead-002",
    visitorName: "Fatou Diallo",
    visitorCompany: "Import Export SARL",
    visitorEmail: "f.diallo@importexport.ci",
    visitorPhone: "+225 05 06 07 08 09",
    sector: "Commerce",
    interest: "Partenariat import",
    quality: "warm",
    notes: "À recontacter dans 2 semaines",
    scannedAt: "2024-03-15T14:15:00",
    eventId: "evt-001",
  },
  {
    id: "lead-003",
    visitorName: "Jean Koffi",
    visitorCompany: "Startup Tech",
    visitorEmail: "j.koffi@startup.ci",
    visitorPhone: "+225 01 02 03 04 05",
    sector: "Tech",
    interest: "Information générale",
    quality: "cold",
    notes: "",
    scannedAt: "2024-03-15T16:00:00",
    eventId: "evt-001",
  },
];

const packageConfig = {
  bronze: { label: "Bronze", color: "bg-amber-600", price: 250000, surface: "9m²", badges: 2 },
  argent: { label: "Argent", color: "bg-gray-400", price: 500000, surface: "12m²", badges: 4 },
  or: { label: "Or", color: "bg-yellow-500", price: 1000000, surface: "20m²", badges: 6 },
};

const statusConfig: Record<StandStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending_payment: { label: "Paiement en attente", color: "bg-amber-500/10 text-amber-600", icon: Clock },
  active: { label: "Actif", color: "bg-secondary/10 text-secondary", icon: CheckCircle2 },
  closed: { label: "Terminé", color: "bg-muted text-muted-foreground", icon: CheckCircle2 },
};

const qualityConfig: Record<LeadQuality, { label: string; color: string }> = {
  hot: { label: "Chaud", color: "bg-red-500/10 text-red-600" },
  warm: { label: "Tiède", color: "bg-amber-500/10 text-amber-600" },
  cold: { label: "Froid", color: "bg-blue-500/10 text-blue-600" },
};

export function ExposantModule() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showPackageDialog, setShowPackageDialog] = useState(false);
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [selectedStand, setSelectedStand] = useState<Stand | null>(null);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<"bronze" | "argent" | "or" | "">("");

  const activeStands = mockStands.filter(s => s.status === "active");
  const totalLeads = mockLeads.length;
  const hotLeads = mockLeads.filter(l => l.quality === "hot").length;

  const handleBuyStand = () => {
    if (!selectedEvent || !selectedPackage) {
      toast.error("Veuillez sélectionner un événement et un package");
      return;
    }
    toast.success("Demande de stand envoyée ! Redirection vers le paiement...");
    setShowPackageDialog(false);
  };

  const handleScanLead = () => {
    toast.success("Lead scanné avec succès !");
    setShowScanDialog(false);
  };

  const handleConfigureStand = (stand: Stand) => {
    setSelectedStand(stand);
    setShowConfigDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Store className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockStands.length}</p>
              <p className="text-sm text-muted-foreground">Stands réservés</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-secondary/10">
              <CheckCircle2 className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeStands.length}</p>
              <p className="text-sm text-muted-foreground">Stands actifs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/10">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalLeads}</p>
              <p className="text-sm text-muted-foreground">Leads collectés</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-red-500/10">
              <Target className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{hotLeads}</p>
              <p className="text-sm text-muted-foreground">Leads chauds</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList>
            <TabsTrigger value="overview">Mes stands</TabsTrigger>
            <TabsTrigger value="vitrine">Ma vitrine</TabsTrigger>
            <TabsTrigger value="leads">Leads & scans</TabsTrigger>
            <TabsTrigger value="packages">Acheter un stand</TabsTrigger>
          </TabsList>
        </div>

        {/* Mes Stands */}
        <TabsContent value="overview" className="space-y-4">
          {mockStands.length > 0 ? (
            mockStands.map((stand) => {
              const status = statusConfig[stand.status];
              const StatusIcon = status.icon;
              const pkg = packageConfig[stand.packageType];

              return (
                <Card key={stand.id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={status.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                          <Badge className={cn("text-white", pkg.color)}>
                            Stand {pkg.label}
                          </Badge>
                          <Badge variant="outline">{stand.surface}</Badge>
                        </div>
                        <h3 className="text-lg font-semibold">{stand.eventTitle}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(stand.eventDate).toLocaleDateString("fr-FR")}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {stand.eventLocation.split(",")[0]}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {stand.badges} badges
                          </span>
                        </div>
                        {stand.extras.length > 0 && (
                          <div className="flex gap-2">
                            {stand.extras.map((extra, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {extra}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        {stand.status === "pending_payment" ? (
                          <Button className="gap-2">
                            Payer {stand.price.toLocaleString()} FCFA
                          </Button>
                        ) : (
                          <>
                            <Button variant="outline" className="gap-2" onClick={() => handleConfigureStand(stand)}>
                              <Edit className="w-4 h-4" />
                              Configurer vitrine
                            </Button>
                            <Button variant="outline" className="gap-2" onClick={() => setShowScanDialog(true)}>
                              <QrCode className="w-4 h-4" />
                              Scanner visiteur
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Store className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">Aucun stand réservé</p>
                <Button className="mt-4" onClick={() => setActiveTab("packages")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Réserver un stand
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Ma Vitrine */}
        <TabsContent value="vitrine" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration de ma vitrine</CardTitle>
              <CardDescription>
                Personnalisez votre stand pour attirer les visiteurs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Logo entreprise</Label>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Glisser ou cliquer pour ajouter</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Bannière stand</Label>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                      <Image className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Format recommandé: 1920x600px</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Description du stand</Label>
                    <Textarea placeholder="Présentez votre entreprise et vos solutions..." rows={4} />
                  </div>
                  <div className="space-y-2">
                    <Label>Vidéo de présentation (optionnel)</Label>
                    <Input placeholder="Lien YouTube ou Vimeo" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Produits / Solutions</Label>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter
                  </Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <Input placeholder="Nom du produit" className="mb-2" />
                            <Textarea placeholder="Description courte..." rows={2} />
                          </div>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Équipe sur stand</Label>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter
                  </Button>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[1, 2].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-4 text-center">
                        <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-3">
                          <Users className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <Input placeholder="Nom" className="mb-2 text-center" />
                        <Input placeholder="Fonction" className="text-center text-sm" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline">Aperçu</Button>
                <Button>Enregistrer</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leads */}
        <TabsContent value="leads" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Leads collectés</h2>
              <p className="text-sm text-muted-foreground">
                {mockLeads.length} contacts collectés lors de vos événements
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowScanDialog(true)} className="gap-2">
                <QrCode className="w-4 h-4" />
                Scanner
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Exporter CSV
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Intérêt</TableHead>
                    <TableHead>Qualité</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{lead.visitorName}</p>
                          <p className="text-sm text-muted-foreground">{lead.visitorEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{lead.visitorCompany}</p>
                          <p className="text-sm text-muted-foreground">{lead.sector}</p>
                        </div>
                      </TableCell>
                      <TableCell>{lead.interest}</TableCell>
                      <TableCell>
                        <Badge className={qualityConfig[lead.quality].color}>
                          {qualityConfig[lead.quality].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(lead.scannedAt).toLocaleString("fr-FR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon">
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Mail className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Acheter un stand */}
        <TabsContent value="packages" className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">Packages exposant</h2>
            <p className="text-sm text-muted-foreground">
              Choisissez le package adapté à vos besoins
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {(["bronze", "argent", "or"] as const).map((pkg) => {
              const config = packageConfig[pkg];
              const isPopular = pkg === "argent";

              return (
                <Card 
                  key={pkg} 
                  className={cn(
                    "relative overflow-hidden transition-all hover:shadow-lg",
                    isPopular && "border-primary ring-2 ring-primary/20"
                  )}
                >
                  {isPopular && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg">
                      Populaire
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <div className={cn("w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2", config.color)}>
                      <Store className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle>Stand {config.label}</CardTitle>
                    <CardDescription>{config.surface}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-3xl font-bold text-primary mb-4">
                      {config.price.toLocaleString()} <span className="text-sm font-normal">FCFA</span>
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary" />
                        Surface {config.surface}
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary" />
                        {config.badges} badges exposant
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary" />
                        Vitrine personnalisable
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary" />
                        Scan leads illimité
                      </li>
                      {pkg === "or" && (
                        <>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-secondary" />
                            Emplacement premium
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-secondary" />
                            Logo sur supports
                          </li>
                        </>
                      )}
                    </ul>
                    <Button 
                      className="w-full" 
                      variant={isPopular ? "default" : "outline"}
                      onClick={() => {
                        setSelectedPackage(pkg);
                        setShowPackageDialog(true);
                      }}
                    >
                      Réserver ce stand
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={showPackageDialog} onOpenChange={setShowPackageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Réserver un stand {selectedPackage && packageConfig[selectedPackage]?.label}</DialogTitle>
            <DialogDescription>Sélectionnez l'événement pour votre stand</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Événement *</Label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger><SelectValue placeholder="Choisir un événement" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="evt-001">Forum PME CI 2024 - Mars 2024</SelectItem>
                  <SelectItem value="evt-002">Salon Agro-industrie - Avril 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedPackage && (
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex justify-between mb-2">
                  <span>Stand {packageConfig[selectedPackage].label}</span>
                  <span className="font-bold">{packageConfig[selectedPackage].price.toLocaleString()} FCFA</span>
                </div>
              </div>
            )}
            <Button className="w-full" onClick={handleBuyStand}>Procéder au paiement</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showScanDialog} onOpenChange={setShowScanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scanner un visiteur</DialogTitle>
            <DialogDescription>Scannez le badge du visiteur ou saisissez ses coordonnées</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-8 border-2 border-dashed rounded-lg text-center">
              <QrCode className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Cliquez pour activer la caméra</p>
            </div>
            <Separator />
            <p className="text-center text-sm text-muted-foreground">ou saisie manuelle</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nom</Label><Input placeholder="Nom complet" /></div>
              <div className="space-y-2"><Label>Entreprise</Label><Input placeholder="Société" /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="email@example.com" /></div>
              <div className="space-y-2"><Label>Téléphone</Label><Input placeholder="+225..." /></div>
            </div>
            <div className="space-y-2">
              <Label>Intérêt principal</Label>
              <Select><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Produit/Service</SelectItem>
                  <SelectItem value="partnership">Partenariat</SelectItem>
                  <SelectItem value="info">Information</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Notes</Label><Textarea placeholder="Observations..." rows={2} /></div>
            <Button className="w-full" onClick={handleScanLead}>Enregistrer le lead</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
