import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Target, FileText, Wallet, ShoppingCart, Lightbulb, BarChart3, 
  Users, Clock, Award, ArrowRight, CheckCircle2, BookOpen, Play,
  TrendingUp, Zap, RefreshCw, GraduationCap, Briefcase
} from "lucide-react";

interface ParcoursProps {
  onViewDetail: (formationId: string) => void;
}

const parcours = [
  {
    id: "ao",
    title: "Accès Marchés (AO)",
    description: "Maîtrisez le processus complet de réponse aux appels d'offres",
    icon: FileText,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-600",
    formations: 5,
    duration: "25h",
    level: "Débutant → Avancé",
    outcomes: ["Préparer un dossier AO complet", "Comprendre les critères d'évaluation", "Obtenir le badge 'Prêt AO'"],
    badge: "Prêt AO",
    enrolled: 234,
    module: "AO"
  },
  {
    id: "marketplace",
    title: "Vente & Marketplace",
    description: "Développez vos ventes en ligne et votre présence digitale",
    icon: ShoppingCart,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-600",
    formations: 4,
    duration: "18h",
    level: "Débutant → Intermédiaire",
    outcomes: ["Créer une fiche produit attractive", "Gérer les commandes", "Obtenir le badge 'Vendeur Prêt'"],
    badge: "Vendeur Prêt",
    enrolled: 456,
    module: "Marketplace"
  },
  {
    id: "finance",
    title: "Financement & Bancabilité",
    description: "Renforcez votre dossier pour accéder aux financements",
    icon: Wallet,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-500/10",
    textColor: "text-green-600",
    formations: 6,
    duration: "30h",
    level: "Intermédiaire",
    outcomes: ["Structurer un business plan", "Comprendre les critères bancaires", "Obtenir le badge 'Bancable'"],
    badge: "Bancable",
    enrolled: 189,
    module: "Financement"
  },
  {
    id: "qualite",
    title: "Production++ (Qualité, Certif, PI)",
    description: "Améliorez vos processus de production et obtenez des certifications",
    icon: Lightbulb,
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-600",
    formations: 8,
    duration: "40h",
    level: "Intermédiaire → Avancé",
    outcomes: ["Mettre en place une démarche qualité", "Préparer une certification ISO", "Badge 'Qualité & Normes'"],
    badge: "Qualité & Normes",
    enrolled: 123,
    module: "Incubateur"
  },
  {
    id: "pilotage",
    title: "Pilotage & Data",
    description: "Pilotez votre entreprise avec des données fiables",
    icon: BarChart3,
    color: "from-cyan-500 to-cyan-600",
    bgColor: "bg-cyan-500/10",
    textColor: "text-cyan-600",
    formations: 5,
    duration: "20h",
    level: "Intermédiaire",
    outcomes: ["Construire un tableau de bord", "Analyser vos KPI", "Prendre des décisions data-driven"],
    badge: "Data Driven",
    enrolled: 98,
    module: "Data Hub"
  },
  {
    id: "leadership",
    title: "Leadership & RH",
    description: "Développez vos compétences managériales et RH",
    icon: Users,
    color: "from-rose-500 to-rose-600",
    bgColor: "bg-rose-500/10",
    textColor: "text-rose-600",
    formations: 6,
    duration: "28h",
    level: "Tous niveaux",
    outcomes: ["Manager une équipe", "Recruter efficacement", "Gérer les conflits"],
    badge: "Leader PME",
    enrolled: 267,
    module: "RH"
  },
  // RAC
  {
    id: "rac",
    title: "RAC — Reconnaissance des Acquis",
    description: "Faites valider vos compétences professionnelles par un jury et obtenez une certification sans reprendre la formation complète",
    icon: GraduationCap,
    color: "from-teal-500 to-teal-600",
    bgColor: "bg-teal-500/10",
    textColor: "text-teal-600",
    formations: 4,
    duration: "4-6h évaluation",
    level: "Intermédiaire → Avancé",
    outcomes: ["Valider vos années d'expérience", "Obtenir un certificat de compétences", "Accéder aux modules avancés"],
    badge: "Acquis Validés",
    enrolled: 123,
    module: "RAC"
  },
  // Alternance
  {
    id: "alternance",
    title: "Formations en Alternance",
    description: "Combinez apprentissage en centre et pratique en entreprise pour une montée en compétences terrain",
    icon: RefreshCw,
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-500/10",
    textColor: "text-indigo-600",
    formations: 3,
    duration: "6-12 mois",
    level: "Débutant → Intermédiaire",
    outcomes: ["Diplôme reconnu", "Expérience professionnelle intégrée", "Insertion emploi directe"],
    badge: "Alternant Certifié",
    enrolled: 43,
    module: "Alternance"
  },
];

export function ParcoursFormations({ onViewDetail }: ParcoursProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-none bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-full bg-primary/20">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Parcours par objectif</h2>
              <p className="text-muted-foreground">Choisissez votre objectif, suivez le parcours, obtenez votre badge</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-secondary" />
              <span>Formations progressives</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-secondary" />
              <span>Badges et certifications</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-secondary" />
              <span>Passerelles vers l'action</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grille des parcours */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parcours.map((p) => {
          const Icon = p.icon;
          return (
            <Card key={p.id} className="overflow-hidden hover:shadow-lg transition-all group cursor-pointer">
              <div className={`h-3 bg-gradient-to-r ${p.color}`} />
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-3 rounded-xl ${p.bgColor}`}>
                    <Icon className={`w-6 h-6 ${p.textColor}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{p.title}</CardTitle>
                    <Badge variant="outline" className="text-xs mt-1">{p.module}</Badge>
                  </div>
                </div>
                <CardDescription>{p.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {p.formations} formations
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {p.duration}
                  </span>
                </div>

                {/* Niveau */}
                <div className="text-sm">
                  <span className="text-muted-foreground">Niveau: </span>
                  <span className="font-medium">{p.level}</span>
                </div>

                {/* Objectifs */}
                <div className="space-y-1">
                  <p className="text-sm font-medium">Ce que vous saurez faire :</p>
                  <ul className="space-y-1">
                    {p.outcomes.slice(0, 2).map((outcome, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <CheckCircle2 className="w-3 h-3 text-secondary mt-1 flex-shrink-0" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Badge */}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium">Badge: {p.badge}</span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {p.enrolled} inscrits
                  </span>
                  <Button size="sm" className="gap-1 group-hover:gap-2 transition-all">
                    <Play className="w-3 h-3" />
                    Démarrer
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* CTA Diagnostic */}
      <Card className="border-primary/30">
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-4">
          <div className="p-4 rounded-full bg-primary/10">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-semibold text-lg">Pas sûr du parcours à choisir ?</h3>
            <p className="text-muted-foreground">Faites le diagnostic compétences pour recevoir des recommandations personnalisées</p>
          </div>
          <Button size="lg" className="gap-2">
            <Target className="w-5 h-5" />
            Lancer le diagnostic
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
