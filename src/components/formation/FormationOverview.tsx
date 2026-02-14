import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap,
  BookOpen,
  Users,
  Award,
  Clock,
  TrendingUp,
  ArrowRight,
  Play,
  CheckCircle2,
  Calendar,
  DollarSign,
  Target,
  FileText,
  ShoppingCart,
  Wallet,
  Lightbulb,
  BarChart3,
  Video,
  Sparkles,
  Zap,
  MapPin,
  Flame,
  Trophy,
  Star,
  ChevronRight,
  Timer,
  Brain,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendrierFormations } from "./CalendrierFormations";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface OverviewProps {
  onNavigate: (tab: string) => void;
}

const progressionData = [
  { mois: "Sep", heures: 4, certifs: 0 },
  { mois: "Oct", heures: 8, certifs: 1 },
  { mois: "Nov", heures: 12, certifs: 1 },
  { mois: "Déc", heures: 6, certifs: 0 },
  { mois: "Jan", heures: 15, certifs: 2 },
  { mois: "Fév", heures: 10, certifs: 1 },
];

const repartitionData = [
  { name: "AO & Marchés", value: 35, color: "hsl(210, 100%, 50%)" },
  { name: "Finance", value: 25, color: "hsl(145, 100%, 29%)" },
  { name: "Marketplace", value: 20, color: "hsl(24, 100%, 50%)" },
  { name: "Qualité", value: 12, color: "hsl(280, 60%, 50%)" },
  { name: "Digital", value: 8, color: "hsl(38, 92%, 50%)" },
];

const inProgressCourses = [
  { id: "1", title: "Préparation aux Appels d'Offres", progress: 65, deadline: "2024-03-01", module: "AO", nextLive: "2024-02-20T14:00:00", format: "live", expert: "Dr. Konan Yao", heures: "12h" },
  { id: "2", title: "Comptabilité SYSCOHADA Révisé", progress: 30, deadline: "2024-03-15", module: "Finance", format: "video", expert: "Pr. Koffi Amani", heures: "8h" },
  { id: "3", title: "Vente sur Marketplace", progress: 85, deadline: "2024-02-28", module: "Marketplace", format: "hybrid", expert: "Mme Traoré Awa", heures: "6h" },
];

const recentCertificates = [
  { id: "1", title: "Prêt AO", issuedAt: "2024-01-15", employee: "Jean Kouassi", badge: "ao", score: 92 },
  { id: "2", title: "Vendeur Prêt", issuedAt: "2024-01-20", employee: "Marie Bamba", badge: "marketplace", score: 88 },
  { id: "3", title: "Bancable", issuedAt: "2024-01-10", employee: "Kofi Mensah", badge: "finance", score: 95 },
];

const alerts = [
  { type: "live", message: "Live 'Réussir son AO' dans 2 heures", action: "Rejoindre", priority: "high" as const },
  { type: "expiring", message: "Formation 'Excel Avancé' expire dans 5 jours", action: "Continuer", priority: "medium" as const },
  { type: "quiz", message: "Quiz 'Normes qualité' en attente — Note min: 70%", action: "Passer", priority: "medium" as const },
];

const recommendations = [
  { id: "1", title: "Préparer une soumission gagnante", reason: "Basé sur votre parcours AO", module: "AO", duration: "4h", rating: 4.9 },
  { id: "2", title: "Évaluer votre bancabilité", reason: "Complète votre certificat Finance", module: "Finance", duration: "2h", rating: 4.7 },
  { id: "3", title: "Optimiser sa fiche produit", reason: "Boost Marketplace", module: "Marketplace", duration: "1h30", rating: 4.8 },
];

const passerelles = [
  { id: "ao", title: "Appels d'Offres", description: "Formez-vous puis soumissionnez", action: "Soumissionner", icon: FileText, color: "text-info", bgColor: "bg-info/10" },
  { id: "finance", title: "Financement", description: "Renforcez votre bancabilité", action: "Évaluer", icon: Wallet, color: "text-secondary", bgColor: "bg-secondary/10" },
  { id: "marketplace", title: "Marketplace", description: "Vendez après la formation", action: "Ma boutique", icon: ShoppingCart, color: "text-primary", bgColor: "bg-primary/10" },
  { id: "incubateur", title: "Incubateur", description: "Parcours Production++", action: "Démarrer", icon: Lightbulb, color: "text-warning", bgColor: "bg-warning/10" },
  { id: "datahub", title: "Data Hub", description: "Construire mes KPI", action: "Voir KPI", icon: BarChart3, color: "text-info", bgColor: "bg-info/10" },
  { id: "events", title: "Événements", description: "Webinaires et réseautage", action: "Agenda", icon: Calendar, color: "text-destructive", bgColor: "bg-destructive/10" },
];

const weekDays = ["L", "M", "M", "J", "V", "S", "D"];
const streakData = [true, true, true, false, true, true, false, true, true, true, true, false, true, true];

const badgeColors: Record<string, string> = {
  ao: "bg-info/10 text-info",
  finance: "bg-secondary/10 text-secondary",
  marketplace: "bg-primary/10 text-primary",
};

const moduleColors: Record<string, string> = {
  AO: "border-info/50 bg-info/5",
  Finance: "border-secondary/50 bg-secondary/5",
  Marketplace: "border-primary/50 bg-primary/5",
};

export function FormationOverview({ onNavigate }: OverviewProps) {
  return (
    <div className="space-y-6">
      {/* Alertes prioritaires */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center justify-between p-4 rounded-sm transition-all",
                alert.priority === "high"
                  ? "border-l-destructive bg-destructive/5"
                  : "border-l-primary bg-primary/5"
              )}
            >
              <div className="flex items-center gap-3">
                {alert.type === "live" && <Video className="w-5 h-5 text-destructive animate-pulse" />}
                {alert.type === "expiring" && <Clock className="w-5 h-5 text-warning" />}
                {alert.type === "quiz" && <Target className="w-5 h-5 text-primary" />}
                <span className="font-medium text-sm">{alert.message}</span>
              </div>
              <Button size="sm" variant={alert.priority === "high" ? "default" : "outline"}>
                {alert.action}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* KPIs principaux - design amélioré */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { value: "8", label: "Cours actifs", icon: BookOpen, color: "text-primary", bg: "bg-primary/10", trend: "+2" },
          { value: "12", label: "Apprenants", icon: Users, color: "text-secondary", bg: "bg-secondary/10", trend: "+3" },
          { value: "5", label: "Certificats", icon: Award, color: "text-warning", bg: "bg-warning/10", trend: "+1" },
          { value: "78%", label: "Taux complétion", icon: TrendingUp, color: "text-info", bg: "bg-info/10", trend: "+5%" },
          { value: "2", label: "Lives à venir", icon: Video, color: "text-destructive", bg: "bg-destructive/10", trend: "" },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="group transition-all">
              <CardContent className="p-2">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("p-2.5 rounded-xl", kpi.bg)}>
                    <Icon className={cn("w-5 h-5", kpi.color)} />
                  </div>
                  {kpi.trend && (
                    <Badge variant="outline" className="text-xs text-secondary border-secondary/30 bg-secondary/5">
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                      {kpi.trend}
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Streak + Recommandations IA */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Streak d'apprentissage */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Flame className="w-5 h-5 text-primary" />
              Série d'apprentissage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
                <Flame className="w-6 h-6 text-primary" />
                <span className="text-3xl font-extrabold text-primary">7</span>
                <span className="text-sm font-medium text-primary">jours</span>
              </div>
            </div>
            <div className="flex justify-center gap-1.5 mb-4">
              {streakData.map((active, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {weekDays[i % 7]}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 rounded-lg bg-muted/50">
                <p className="text-lg font-bold">55h</p>
                <p className="text-xs text-muted-foreground">Total heures</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/50">
                <p className="text-lg font-bold">14</p>
                <p className="text-xs text-muted-foreground">Modules finis</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/50">
                <p className="text-lg font-bold">89%</p>
                <p className="text-xs text-muted-foreground">Moy. quiz</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommandations IA */}
        <Card className="lg:col-span-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Recommandations personnalisées
            </CardTitle>
            <CardDescription>Sélectionnées par l'IA selon votre profil et vos objectifs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-3">
              {recommendations.map((reco) => (
                <div
                  key={reco.id}
                  className="group p-4 rounded-xl bg-card border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">{reco.module}</Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="w-3 h-3 fill-warning text-warning" />
                      {reco.rating}
                    </div>
                  </div>
                  <h4 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">{reco.title}</h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                    <Zap className="w-3 h-3 text-primary" />
                    {reco.reason}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Timer className="w-3 h-3" />
                      {reco.duration}
                    </span>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-primary">
                      Commencer <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formations en cours + Graphique progression */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Formations en cours */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Mes formations en cours</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("inscriptions")}>
              Voir tout <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {inProgressCourses.map((course) => (
              <div
                key={course.id}
                className={cn(
                  "p-4 rounded-xl border-l-4 bg-card hover:shadow-sm transition-all",
                  moduleColors[course.module] || "border-muted"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-semibold text-sm">{course.title}</h4>
                      {course.nextLive && (
                        <Badge className="bg-destructive/10 text-destructive text-xs gap-1 animate-pulse">
                          <Video className="w-3 h-3" />
                          Live
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {course.expert} • {course.heures}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-primary">{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2 mb-2" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Limite: {new Date(course.deadline).toLocaleDateString("fr-FR")}
                    </span>
                    <Badge variant="outline" className="text-xs">{course.module}</Badge>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1 h-7 text-xs">
                    <Play className="w-3 h-3" />
                    Continuer
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Graphique progression */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Ma progression
            </CardTitle>
            <CardDescription>Heures de formation par mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="mois" className="text-xs" tick={{ fontSize: 11 }} />
                  <YAxis className="text-xs" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.75rem",
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="heures"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary) / 0.15)"
                    strokeWidth={2}
                    name="Heures"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Répartition par domaine */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs font-semibold text-muted-foreground mb-3">RÉPARTITION PAR DOMAINE</p>
              <div className="space-y-2">
                {repartitionData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-xs flex-1">{item.name}</span>
                    <span className="text-xs font-semibold">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificats + Budget */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Certificats récents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="w-5 h-5 text-warning" />
              Certificats & Badges
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("certifications")}>
              Voir tout <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentCertificates.map((cert) => (
              <div key={cert.id} className="flex items-center gap-4 p-3 rounded-xl border bg-card hover:shadow-sm transition-all">
                <div className="p-2.5 rounded-xl bg-warning/10">
                  <Award className="w-6 h-6 text-warning" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{cert.title}</p>
                    <Badge className={cn(badgeColors[cert.badge] || "bg-muted", "text-xs")}>
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Validé
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{cert.employee}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{cert.score}%</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(cert.issuedAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Budget formation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-secondary" />
              Budget formation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 mb-6">
              <div className="w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { value: 42.5, fill: "hsl(var(--primary))" },
                        { value: 57.5, fill: "hsl(var(--muted))" },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      <Cell fill="hsl(var(--primary))" />
                      <Cell fill="hsl(var(--muted))" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Budget annuel</p>
                  <p className="text-xl font-bold">2 000 000 FCFA</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Consommé</p>
                  <p className="text-lg font-semibold text-primary">850 000 FCFA</p>
                </div>
              </div>
            </div>
            <Progress value={42.5} className="h-2.5 mb-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>42.5% utilisé</span>
              <span className="font-medium text-secondary">1 150 000 FCFA restant</span>
            </div>

            <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-3">
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <p className="text-sm font-bold">3</p>
                <p className="text-xs text-muted-foreground">Formations achetées</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <p className="text-sm font-bold">12</p>
                <p className="text-xs text-muted-foreground">Places utilisées</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <p className="text-sm font-bold">2</p>
                <p className="text-xs text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendrier interactif */}
      <CalendrierFormations />

      {/* Passerelles modules */}
      {/* <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            Aller à l'action — Passerelles modules
          </CardTitle>
          <CardDescription>De la formation à l'application concrète dans vos opérations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {passerelles.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.id}
                  className={cn(
                    "p-4 rounded-xl border hover:shadow-md transition-all cursor-pointer group",
                    p.bgColor
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-card shadow-sm">
                      <Icon className={cn("w-5 h-5", p.color)} />
                    </div>
                    <h4 className="font-semibold text-sm">{p.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{p.description}</p>
                  <Button size="sm" variant="outline" className="w-full gap-1 h-8 text-xs group-hover:bg-card">
                    {p.action}
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card> */}

      {/* Actions rapides */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Button onClick={() => onNavigate("catalogue")} className="gap-2 h-12">
              <BookOpen className="w-4 h-4" />
              Catalogue
            </Button>
            <Button onClick={() => onNavigate("parcours")} variant="outline" className="gap-2 h-12">
              <Target className="w-4 h-4" />
              Parcours
            </Button>
            <Button onClick={() => onNavigate("apprenants")} variant="outline" className="gap-2 h-12">
              <Users className="w-4 h-4" />
              Mes apprenants
            </Button>
            <Button onClick={() => onNavigate("certifications")} variant="outline" className="gap-2 h-12">
              <Award className="w-4 h-4" />
              Certificats
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
