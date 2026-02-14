import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  AlertCircle,
  ArrowRight,
  Play,
  CheckCircle2,
  Calendar,
  DollarSign,
} from "lucide-react";

interface OverviewProps {
  onNavigate: (tab: string) => void;
}

const inProgressCourses = [
  { id: "1", title: "Transformation Digitale PME", progress: 65, deadline: "2024-03-01" },
  { id: "2", title: "Comptabilité SYSCOHADA", progress: 30, deadline: "2024-03-15" },
];

const recentCertificates = [
  { id: "1", title: "Gestion financière PME", issuedAt: "2024-01-15", employee: "Jean Kouassi" },
  { id: "2", title: "Marketing Digital", issuedAt: "2024-01-20", employee: "Marie Bamba" },
];

const alerts = [
  { type: "expiring", message: "Accès formation 'Excel Avancé' expire dans 5 jours", action: "Renouveler" },
  { type: "payment", message: "Facture formation en attente - 150 000 FCFA", action: "Payer" },
];

export function FormationOverview({ onNavigate }: OverviewProps) {
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
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">8</p>
              <p className="text-sm text-muted-foreground">Formations actives</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-secondary/10">
              <Users className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Apprenants</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-500/10">
              <Award className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-sm text-muted-foreground">Certificats</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/10">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">78%</p>
              <p className="text-sm text-muted-foreground">Taux complétion</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* In Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Formations en cours</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("inscriptions")}>
              Voir tout <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {inProgressCourses.map((course) => (
              <div key={course.id} className="p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{course.title}</h4>
                  <Badge variant="outline">{course.progress}%</Badge>
                </div>
                <Progress value={course.progress} className="h-2 mb-2" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Limite: {new Date(course.deadline).toLocaleDateString("fr-FR")}
                  </span>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Play className="w-3 h-3" />
                    Continuer
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Certificates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Certificats récents</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("certifications")}>
              Voir tout <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentCertificates.map((cert) => (
              <div key={cert.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-amber-500/10">
                    <Award className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium">{cert.title}</p>
                    <p className="text-sm text-muted-foreground">{cert.employee}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-secondary/10 text-secondary">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Validé
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(cert.issuedAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Budget */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Budget formation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Budget annuel</span>
                <span className="font-bold">2 000 000 FCFA</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Consommé</span>
                <span className="font-medium text-primary">850 000 FCFA</span>
              </div>
              <Progress value={42.5} className="h-2" />
              <p className="text-sm text-muted-foreground">42.5% du budget utilisé</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => onNavigate("catalogue")} className="gap-2">
                <BookOpen className="w-4 h-4" />
                Catalogue
              </Button>
              <Button onClick={() => onNavigate("apprenants")} variant="outline" className="gap-2">
                <Users className="w-4 h-4" />
                Mes apprenants
              </Button>
              <Button onClick={() => onNavigate("certifications")} variant="outline" className="gap-2">
                <Award className="w-4 h-4" />
                Certificats
              </Button>
              <Button onClick={() => onNavigate("inscriptions")} variant="outline" className="gap-2">
                <Clock className="w-4 h-4" />
                Inscriptions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
