import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Users,
  Award,
  TrendingUp,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendrierFormations } from "./CalendrierFormations";
import { formationsApi, mesCoursApi, type FormationAPI, type MonInscription } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface OverviewProps {
  onNavigate: (tab: string) => void;
}

function computeStats(
  created: FormationAPI[],
  enrolled: MonInscription[]
) {
  const now = new Date();

  // ── Stats formateur ────────────────────────────────────────────────────────
  const activeCourses = created.filter((c) => c.isActive).length;

  // Participants uniques sur les formations créées
  const allParticipants = created.flatMap((c) => c.participants ?? []);
  const uniqueLearners = new Set(allParticipants.map((p) => p.user_id)).size;
  const certificatesDelivered = allParticipants.filter((p) => p.certificat_delivre).length;

  const completedParticipants = allParticipants.filter(
    (p) => p.status === "completed" || parseFloat(p.progression ?? "0") >= 100
  ).length;
  const completionRate =
    allParticipants.length > 0
      ? Math.round((completedParticipants / allParticipants.length) * 100)
      : 0;

  // Lives / webinaires à venir parmi les formations créées
  const upcomingLives = created.filter(
    (c) =>
      (c.mode === "live" || c.mode === "webinaire") &&
      c.isActive &&
      c.date &&
      new Date(c.date) > now
  ).length;

  // ── Stats apprenant ────────────────────────────────────────────────────────
  const myEnrolledCount = enrolled.length;
  const myCompletedCount = enrolled.filter(
    (e) => e.status === "completed" || (e.progression != null && (e.progression as unknown as number) >= 100)
  ).length;
  const myCertificates = enrolled.filter((e) => {
    const participant = (e as unknown as { certificat_delivre?: boolean });
    return participant.certificat_delivre === true;
  }).length;
  const myCompletionRate =
    myEnrolledCount > 0 ? Math.round((myCompletedCount / myEnrolledCount) * 100) : 0;

  return {
    // formateur
    activeCourses,
    uniqueLearners,
    certificatesDelivered,
    completionRate,
    upcomingLives,
    // apprenant
    myEnrolledCount,
    myCompletedCount,
    myCertificates,
    myCompletionRate,
    isFormateur: created.length > 0,
  };
}

export function FormationOverview({ onNavigate: _onNavigate }: OverviewProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [created, setCreated] = useState<FormationAPI[]>([]);
  const [enrolled, setEnrolled] = useState<MonInscription[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    Promise.allSettled([
      formationsApi.getByCreator(user.id),
      mesCoursApi.getMesFormations(),
    ]).then(([createdRes, enrolledRes]) => {
      if (createdRes.status === "fulfilled") setCreated(createdRes.value);
      if (enrolledRes.status === "fulfilled") setEnrolled(enrolledRes.value);
    }).finally(() => setLoading(false));
  }, [user?.id]);

  const stats = computeStats(created, enrolled);

  // KPIs : si l'utilisateur a créé des formations → vue formateur
  //        sinon → vue apprenant
  const kpis = stats.isFormateur
    ? [
        {
          value: stats.activeCourses,
          label: "Cours actifs",
          icon: BookOpen,
          color: "text-primary",
          bg: "bg-primary/10",
        },
        {
          value: stats.uniqueLearners,
          label: "Apprenants",
          icon: Users,
          color: "text-secondary",
          bg: "bg-secondary/10",
        },
        {
          value: stats.certificatesDelivered,
          label: "Certificats délivrés",
          icon: Award,
          color: "text-warning",
          bg: "bg-warning/10",
        },
        {
          value: `${stats.completionRate}%`,
          label: "Taux complétion",
          icon: TrendingUp,
          color: "text-info",
          bg: "bg-info/10",
        },
        {
          value: stats.upcomingLives,
          label: "Lives à venir",
          icon: Video,
          color: "text-destructive",
          bg: "bg-destructive/10",
        },
      ]
    : [
        {
          value: stats.myEnrolledCount,
          label: "Mes formations",
          icon: BookOpen,
          color: "text-primary",
          bg: "bg-primary/10",
        },
        {
          value: stats.myCompletedCount,
          label: "Terminées",
          icon: Users,
          color: "text-secondary",
          bg: "bg-secondary/10",
        },
        {
          value: stats.myCertificates,
          label: "Certificats",
          icon: Award,
          color: "text-warning",
          bg: "bg-warning/10",
        },
        {
          value: `${stats.myCompletionRate}%`,
          label: "Taux complétion",
          icon: TrendingUp,
          color: "text-info",
          bg: "bg-info/10",
        },
        {
          value: stats.myEnrolledCount - stats.myCompletedCount,
          label: "En cours",
          icon: Video,
          color: "text-destructive",
          bg: "bg-destructive/10",
        },
      ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {loading
          ? [...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
          : kpis.map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <Card key={idx} className="group transition-all">
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between mb-3">
                      <div className={cn("p-2.5 rounded-xl", kpi.bg)}>
                        <Icon className={cn("w-5 h-5", kpi.color)} />
                      </div>
                      {stats.isFormateur && idx === 0 && created.length > 0 && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          {created.length} total
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

      {/* Calendrier interactif */}
      <CalendrierFormations />
    </div>
  );
}
