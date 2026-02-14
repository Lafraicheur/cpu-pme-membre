import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Award, Eye, Download, TrendingUp, Users, Building2, Image, FileText,
  CheckCircle2, Clock, Upload, Plus, Settings, BarChart3, Calendar, DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type SponsorStatus = "pending_payment" | "active" | "delivered" | "closed";

interface SponsorPackage {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  level: "bronze" | "argent" | "or";
  price: number;
  status: SponsorStatus;
  deliverables: { name: string; status: "pending" | "uploaded" | "approved" }[];
  visibility: { impressions: number; clicks: number; leads: number };
}

const mockSponsorships: SponsorPackage[] = [
  {
    id: "sp-001",
    eventId: "evt-001",
    eventTitle: "Forum PME Côte d'Ivoire 2024",
    eventDate: "2024-03-15",
    level: "or",
    price: 5000000,
    status: "active",
    deliverables: [
      { name: "Logo haute résolution", status: "approved" },
      { name: "Bannière web", status: "approved" },
      { name: "Slide de présentation", status: "pending" },
      { name: "Vidéo sponsor (30s)", status: "uploaded" },
    ],
    visibility: { impressions: 45000, clicks: 1234, leads: 89 },
  },
  {
    id: "sp-002",
    eventId: "evt-002",
    eventTitle: "Salon de l'Agro-industrie",
    eventDate: "2024-04-20",
    level: "argent",
    price: 2500000,
    status: "pending_payment",
    deliverables: [],
    visibility: { impressions: 0, clicks: 0, leads: 0 },
  },
];

const levelConfig = {
  bronze: { label: "Bronze", color: "bg-amber-600", price: 1000000 },
  argent: { label: "Argent", color: "bg-gray-400", price: 2500000 },
  or: { label: "Or", color: "bg-yellow-500", price: 5000000 },
};

const statusConfig: Record<SponsorStatus, { label: string; color: string }> = {
  pending_payment: { label: "Paiement en attente", color: "bg-amber-500/10 text-amber-600" },
  active: { label: "Actif", color: "bg-secondary/10 text-secondary" },
  delivered: { label: "Livrables validés", color: "bg-blue-500/10 text-blue-600" },
  closed: { label: "Terminé", color: "bg-muted text-muted-foreground" },
};

const packageFeatures = {
  bronze: [
    "Logo sur supports print",
    "Mention sur le site web",
    "1 post sur les réseaux sociaux",
    "2 badges participants",
  ],
  argent: [
    "Tout Bronze +",
    "Logo sur l'écran principal",
    "Stand 9m² inclus",
    "Intervention 5 min sur scène",
    "Emailing dédié (1x)",
    "4 badges participants",
  ],
  or: [
    "Tout Argent +",
    "Naming partenaire officiel",
    "Stand 20m² premium",
    "Keynote 15 min",
    "Emailing dédié (3x)",
    "Vidéo promotionnelle diffusée",
    "8 badges VIP",
    "Accès données leads premium",
  ],
};

export function SponsorModule() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showPackageDialog, setShowPackageDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<"bronze" | "argent" | "or" | "">("");
  const [selectedEvent, setSelectedEvent] = useState("");

  const activeSponsors = mockSponsorships.filter(s => s.status === "active" || s.status === "delivered");
  const totalImpressions = mockSponsorships.reduce((acc, s) => acc + s.visibility.impressions, 0);
  const totalLeads = mockSponsorships.reduce((acc, s) => acc + s.visibility.leads, 0);

  const handleBuyPackage = () => {
    if (!selectedEvent || !selectedPackage) {
      toast.error("Veuillez sélectionner un événement et un package");
      return;
    }
    toast.success("Package sponsor réservé ! Redirection vers le paiement...");
    setShowPackageDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10"><Award className="w-6 h-6 text-primary" /></div>
            <div><p className="text-2xl font-bold">{mockSponsorships.length}</p><p className="text-sm text-muted-foreground">Sponsorings</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-secondary/10"><CheckCircle2 className="w-6 h-6 text-secondary" /></div>
            <div><p className="text-2xl font-bold">{activeSponsors.length}</p><p className="text-sm text-muted-foreground">Actifs</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/10"><Eye className="w-6 h-6 text-blue-500" /></div>
            <div><p className="text-2xl font-bold">{(totalImpressions / 1000).toFixed(0)}k</p><p className="text-sm text-muted-foreground">Impressions</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-500/10"><Users className="w-6 h-6 text-amber-500" /></div>
            <div><p className="text-2xl font-bold">{totalLeads}</p><p className="text-sm text-muted-foreground">Leads générés</p></div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList>
            <TabsTrigger value="overview">Mes sponsorings</TabsTrigger>
            <TabsTrigger value="livrables">Livrables</TabsTrigger>
            <TabsTrigger value="visibility">Rapport visibilité</TabsTrigger>
            <TabsTrigger value="packages">Devenir sponsor</TabsTrigger>
          </TabsList>
        </div>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          {mockSponsorships.length > 0 ? (
            mockSponsorships.map((sponsor) => {
              const level = levelConfig[sponsor.level];
              const status = statusConfig[sponsor.status];

              return (
                <Card key={sponsor.id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={status.color}>{status.label}</Badge>
                          <Badge className={cn("text-white", level.color)}>Sponsor {level.label}</Badge>
                        </div>
                        <h3 className="text-lg font-semibold">{sponsor.eventTitle}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(sponsor.eventDate).toLocaleDateString("fr-FR")}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {sponsor.price.toLocaleString()} FCFA
                          </span>
                        </div>
                        {sponsor.status === "active" && (
                          <div className="flex gap-6 mt-2">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-primary">{(sponsor.visibility.impressions / 1000).toFixed(0)}k</p>
                              <p className="text-xs text-muted-foreground">Impressions</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-secondary">{sponsor.visibility.clicks}</p>
                              <p className="text-xs text-muted-foreground">Clics</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-amber-500">{sponsor.visibility.leads}</p>
                              <p className="text-xs text-muted-foreground">Leads</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        {sponsor.status === "pending_payment" ? (
                          <Button>Payer {sponsor.price.toLocaleString()} FCFA</Button>
                        ) : (
                          <>
                            <Button variant="outline" onClick={() => setActiveTab("livrables")}>Gérer livrables</Button>
                            <Button variant="outline" onClick={() => setActiveTab("visibility")}>Voir rapport</Button>
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
                <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">Aucun sponsoring actif</p>
                <Button className="mt-4" onClick={() => setActiveTab("packages")}>
                  <Plus className="w-4 h-4 mr-2" />Devenir sponsor
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Livrables */}
        <TabsContent value="livrables" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Livrables sponsor</CardTitle>
              <CardDescription>Téléversez vos contenus pour validation</CardDescription>
            </CardHeader>
            <CardContent>
              {mockSponsorships.filter(s => s.status === "active").map(sponsor => (
                <div key={sponsor.id} className="space-y-4">
                  <h4 className="font-medium">{sponsor.eventTitle}</h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {sponsor.deliverables.map((del, i) => (
                      <Card key={i}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{del.name}</p>
                              <Badge className={
                                del.status === "approved" ? "bg-secondary/10 text-secondary" :
                                del.status === "uploaded" ? "bg-blue-500/10 text-blue-600" :
                                "bg-muted text-muted-foreground"
                              }>
                                {del.status === "approved" ? "Validé" : del.status === "uploaded" ? "En revue" : "À fournir"}
                              </Badge>
                            </div>
                          </div>
                          {del.status === "pending" ? (
                            <Button size="sm" variant="outline"><Upload className="w-4 h-4 mr-1" />Upload</Button>
                          ) : del.status === "approved" ? (
                            <CheckCircle2 className="w-5 h-5 text-secondary" />
                          ) : (
                            <Clock className="w-5 h-5 text-amber-500" />
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visibility Report */}
        <TabsContent value="visibility" className="space-y-6">
          {mockSponsorships.filter(s => s.status === "active").map(sponsor => (
            <Card key={sponsor.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Rapport de visibilité - {sponsor.eventTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <Eye className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-3xl font-bold">{sponsor.visibility.impressions.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Impressions logo</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-secondary" />
                    <p className="text-3xl font-bold">{sponsor.visibility.clicks}</p>
                    <p className="text-sm text-muted-foreground">Clics vers site</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <Users className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                    <p className="text-3xl font-bold">{sponsor.visibility.leads}</p>
                    <p className="text-sm text-muted-foreground">Leads qualifiés</p>
                  </div>
                </div>
                <Button variant="outline" className="gap-2"><Download className="w-4 h-4" />Télécharger rapport PDF</Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Buy Package */}
        <TabsContent value="packages" className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">Packages sponsoring</h2>
            <p className="text-sm text-muted-foreground">Maximisez votre visibilité lors des événements CPU-PME</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {(["bronze", "argent", "or"] as const).map((pkg) => {
              const config = levelConfig[pkg];
              const isPopular = pkg === "argent";

              return (
                <Card key={pkg} className={cn("relative overflow-hidden transition-all hover:shadow-lg", isPopular && "border-primary ring-2 ring-primary/20")}>
                  {isPopular && <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg">Populaire</div>}
                  <CardHeader className="text-center pb-2">
                    <div className={cn("w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2", config.color)}>
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle>Sponsor {config.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-3xl font-bold text-primary mb-4">
                      {config.price.toLocaleString()} <span className="text-sm font-normal">FCFA</span>
                    </p>
                    <ul className="space-y-2 text-sm text-left mb-6">
                      {packageFeatures[pkg].map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full" 
                      variant={isPopular ? "default" : "outline"}
                      onClick={() => { setSelectedPackage(pkg); setShowPackageDialog(true); }}
                    >
                      Choisir ce package
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Purchase Dialog */}
      <Dialog open={showPackageDialog} onOpenChange={setShowPackageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Devenir Sponsor {selectedPackage && levelConfig[selectedPackage]?.label}</DialogTitle>
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
                  <span>Package {levelConfig[selectedPackage].label}</span>
                  <span className="font-bold">{levelConfig[selectedPackage].price.toLocaleString()} FCFA</span>
                </div>
              </div>
            )}
            <Button className="w-full" onClick={handleBuyPackage}>Procéder au paiement</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
