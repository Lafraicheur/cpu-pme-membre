import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart, 
  Wallet, 
  GraduationCap, 
  FileCheck, 
  Calendar,
  ArrowRight,
  CheckCircle2,
  Lock,
  Unlock,
  TrendingUp,
  Users,
  Globe,
  Award,
  Briefcase,
  Handshake,
  Sparkles,
  Target,
  Clock,
  Star,
  ExternalLink,
  Play
} from "lucide-react";
import { toast } from "sonner";

interface ProjectContext {
  id: string;
  name: string;
  status: string;
  readinessScore: number;
  currentSprint: number;
  totalSprints: number;
}

interface PasserellesHubProps {
  project?: ProjectContext | null;
}

// Configuration des passerelles
const passerelles = [
  {
    id: "marketplace",
    name: "Marketplace",
    description: "Vendre vos produits/services sur la place de marché CPU-PME",
    icon: ShoppingCart,
    color: "bg-green-500",
    requiredGate: 3,
    benefits: [
      "Accès à 10,000+ acheteurs professionnels",
      "Visibilité label Made in CI",
      "Gestion commandes intégrée",
      "Paiements sécurisés"
    ],
    actions: [
      { label: "Créer ma boutique", action: "create_shop", primary: true },
      { label: "Importer produits", action: "import_products", primary: false },
    ],
    stats: { label: "Ventes potentielles", value: "+45%", trend: "up" },
  },
  {
    id: "financement",
    name: "Financement",
    description: "Accéder aux financements adaptés à votre stade de développement",
    icon: Wallet,
    color: "bg-primary",
    requiredGate: 2,
    benefits: [
      "Dossier pré-rempli depuis l'incubateur",
      "Matching automatique avec bailleurs",
      "Accompagnement dossiers",
      "Suivi déblocage fonds"
    ],
    actions: [
      { label: "Créer dossier financement", action: "create_dossier", primary: true },
      { label: "Voir programmes éligibles", action: "view_programs", primary: false },
    ],
    stats: { label: "Montant moyen obtenu", value: "25M FCFA", trend: "neutral" },
  },
  {
    id: "formation",
    name: "Formation",
    description: "Formations ciblées selon les gaps identifiés au diagnostic",
    icon: GraduationCap,
    color: "bg-purple-500",
    requiredGate: 0,
    benefits: [
      "Parcours personnalisés",
      "Certifications reconnues",
      "Mentoring par experts filière",
      "Accès replay illimité"
    ],
    actions: [
      { label: "Voir mes recommandations", action: "view_recommendations", primary: true },
      { label: "Catalogue complet", action: "view_catalog", primary: false },
    ],
    stats: { label: "Compétences à renforcer", value: "4", trend: "neutral" },
  },
  {
    id: "appels-offres",
    name: "Appels d'offres",
    description: "Répondre aux marchés publics et privés avec votre projet incubé",
    icon: FileCheck,
    color: "bg-blue-500",
    requiredGate: 3,
    benefits: [
      "AO matchés à votre profil",
      "Templates de soumission",
      "Alertes personnalisées",
      "Historique & analytics"
    ],
    actions: [
      { label: "AO recommandés", action: "view_matched_ao", primary: true },
      { label: "Préparer mes documents", action: "prepare_docs", primary: false },
    ],
    stats: { label: "AO compatibles", value: "12", trend: "up" },
  },
  {
    id: "evenements",
    name: "Événements & B2B",
    description: "Participer aux Demo Days, foires et sessions de matchmaking",
    icon: Calendar,
    color: "bg-orange-500",
    requiredGate: 4,
    benefits: [
      "Demo Day exclusif incubés",
      "B2B matchmaking prioritaire",
      "Stand exposant offert",
      "Networking VIP"
    ],
    actions: [
      { label: "Prochains événements", action: "view_events", primary: true },
      { label: "Préparer mon pitch", action: "prepare_pitch", primary: false },
    ],
    stats: { label: "Contacts générés", value: "28", trend: "up" },
  },
  {
    id: "export",
    name: "Export & International",
    description: "Préparer votre projet à l'internationalisation",
    icon: Globe,
    color: "bg-cyan-500",
    requiredGate: 5,
    benefits: [
      "Diagnostic export",
      "Mise en conformité normes",
      "Missions commerciales",
      "Partenaires distributeurs"
    ],
    actions: [
      { label: "Évaluer mon potentiel export", action: "export_assessment", primary: true },
      { label: "Normes & certifications", action: "view_certifications", primary: false },
    ],
    stats: { label: "Marchés accessibles", value: "8", trend: "neutral" },
  },
];

// Programmes partenaires
const partnerPrograms = [
  {
    id: "tony-elumelu",
    name: "Tony Elumelu Foundation",
    type: "Financement",
    deadline: "15 Mars 2024",
    amount: "5,000 USD",
    status: "open",
    logo: "🏆",
  },
  {
    id: "orange-fab",
    name: "Orange Fab",
    type: "Accélération",
    deadline: "28 Fév 2024",
    amount: "Accompagnement",
    status: "open",
    logo: "🍊",
  },
  {
    id: "bad-boost",
    name: "BAD Boost Africa",
    type: "Financement",
    deadline: "30 Avril 2024",
    amount: "50,000 USD",
    status: "open",
    logo: "🌍",
  },
  {
    id: "firca",
    name: "FIRCA Innovation",
    type: "Subvention",
    deadline: "En continu",
    amount: "Variable",
    status: "permanent",
    logo: "🌱",
  },
];

// Mentors & experts disponibles
const mentors = [
  { name: "Marie Konan", expertise: "Finance & Levée de fonds", available: true, rating: 4.9 },
  { name: "Yao Kouadio", expertise: "Agroalimentaire & Export", available: true, rating: 4.8 },
  { name: "Fatou Diallo", expertise: "Marketing & Commercial", available: false, rating: 4.9 },
  { name: "Jean-Marc Aka", expertise: "Tech & Digital", available: true, rating: 4.7 },
];

export function PasserellesHub({ project }: PasserellesHubProps) {
  const [activeTab, setActiveTab] = useState("passerelles");

  const currentGate = project ? project.currentSprint : 0;

  const handleAction = (passerelleId: string, action: string) => {
    toast.success(`Action "${action}" lancée`, {
      description: `Redirection vers ${passerelleId}...`,
    });
  };

  const isUnlocked = (requiredGate: number) => currentGate >= requiredGate;

  return (
    <div className="space-y-6">
      {/* Header avec contexte projet */}
      {project && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{project.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Sprint {project.currentSprint}/{project.totalSprints} • Readiness {project.readinessScore}%
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Gates débloquées</p>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-8 h-2 rounded-full ${
                        i < currentGate ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="passerelles">Passerelles Modules</TabsTrigger>
          <TabsTrigger value="programmes">Programmes Partenaires</TabsTrigger>
          <TabsTrigger value="mentors">Mentors & Experts</TabsTrigger>
          <TabsTrigger value="ressources">Ressources</TabsTrigger>
        </TabsList>

        {/* Passerelles vers modules */}
        <TabsContent value="passerelles" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {passerelles.map((passerelle) => {
              const unlocked = isUnlocked(passerelle.requiredGate);
              const Icon = passerelle.icon;
              
              return (
                <Card 
                  key={passerelle.id} 
                  className={`border-border/50 transition-all ${
                    unlocked ? "hover:shadow-lg hover:border-primary/30" : "opacity-75"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-xl ${passerelle.color}/10`}>
                        <Icon className={`h-6 w-6 ${passerelle.color.replace('bg-', 'text-')}`} />
                      </div>
                      {unlocked ? (
                        <Badge className="bg-success/10 text-success">
                          <Unlock className="h-3 w-3 mr-1" />
                          Disponible
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <Lock className="h-3 w-3 mr-1" />
                          Gate {passerelle.requiredGate}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg mt-3">{passerelle.name}</CardTitle>
                    <CardDescription>{passerelle.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Bénéfices */}
                    <div className="space-y-2">
                      {passerelle.benefits.slice(0, 3).map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm text-muted-foreground">{passerelle.stats.label}</span>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">{passerelle.stats.value}</span>
                        {passerelle.stats.trend === "up" && (
                          <TrendingUp className="h-4 w-4 text-success" />
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {passerelle.actions.map((action) => (
                        <Button
                          key={action.action}
                          variant={action.primary ? "default" : "outline"}
                          size="sm"
                          className="flex-1"
                          disabled={!unlocked}
                          onClick={() => handleAction(passerelle.id, action.action)}
                        >
                          {action.primary && <ArrowRight className="h-4 w-4 mr-1" />}
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Programmes partenaires */}
        <TabsContent value="programmes" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {partnerPrograms.map((program) => (
              <Card key={program.id} className="border-border/50 hover:shadow-md transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{program.logo}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{program.name}</h3>
                        <Badge variant={program.status === "open" ? "default" : "secondary"}>
                          {program.status === "open" ? "Ouvert" : "Permanent"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{program.type}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1 text-sm">
                          <Wallet className="h-4 w-4 text-muted-foreground" />
                          <span>{program.amount}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{program.deadline}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="flex-1">
                      Candidater
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </Button>
                    <Button size="sm" variant="outline">
                      Détails
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-dashed border-2 border-muted-foreground/20">
            <CardContent className="pt-6 text-center">
              <Target className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Matching automatique</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Nous analysons votre profil pour vous recommander les programmes adaptés
              </p>
              <Button variant="outline">
                <Sparkles className="h-4 w-4 mr-2" />
                Lancer le matching
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mentors & experts */}
        <TabsContent value="mentors" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {mentors.map((mentor) => (
              <Card key={mentor.name} className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{mentor.name}</h3>
                        {mentor.available ? (
                          <Badge className="bg-success/10 text-success text-xs">Disponible</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Occupé</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{mentor.expertise}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">{mentor.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="flex-1" disabled={!mentor.available}>
                      <Handshake className="h-4 w-4 mr-1" />
                      Demander un RDV
                    </Button>
                    <Button size="sm" variant="outline">
                      Profil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Sessions collectives</CardTitle>
              <CardDescription>Webinaires et ateliers pour tous les incubés</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { title: "Pitch Deck Masterclass", date: "25 Jan 2024", time: "10h00" },
                  { title: "Financement early-stage", date: "28 Jan 2024", time: "14h00" },
                  { title: "Growth Hacking B2B", date: "01 Fév 2024", time: "10h00" },
                ].map((session, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Play className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{session.title}</p>
                        <p className="text-sm text-muted-foreground">{session.date} à {session.time}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">S'inscrire</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ressources */}
        <TabsContent value="ressources" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { 
                title: "Templates & modèles", 
                description: "Business plan, pitch deck, projections financières...",
                count: 24,
                icon: Briefcase,
              },
              { 
                title: "Guides pratiques", 
                description: "Export, certifications, levée de fonds...",
                count: 18,
                icon: GraduationCap,
              },
              { 
                title: "Études de marché", 
                description: "Analyses filières et benchmarks sectoriels",
                count: 12,
                icon: TrendingUp,
              },
            ].map((resource) => (
              <Card key={resource.title} className="border-border/50 hover:shadow-md transition-all cursor-pointer">
                <CardContent className="pt-6">
                  <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                    <resource.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                  <Badge variant="secondary">{resource.count} ressources</Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Téléchargements recommandés</CardTitle>
              <CardDescription>Basés sur votre diagnostic et votre sprint actuel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Template Business Model Canvas", type: "Excel", size: "245 KB" },
                  { name: "Guide certification Made in CI", type: "PDF", size: "1.2 MB" },
                  { name: "Checklist pré-export", type: "PDF", size: "156 KB" },
                  { name: "Modèle projections financières 5 ans", type: "Excel", size: "890 KB" },
                ].map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <Award className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.type} • {file.size}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      Télécharger
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
