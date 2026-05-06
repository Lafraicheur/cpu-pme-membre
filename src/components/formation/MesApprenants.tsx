import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Users, Search, BookOpen, Award, CheckCircle2, Clock, Filter } from "lucide-react";
import { participantsApi, type FormationParticipant } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

// Un apprenant agrégé (une ligne du tableau)
interface AggregatedLearner {
  userId: string;
  name: string;
  email: string;
  phone: string;
  enrollments: FormationParticipant[];
  completedCount: number;
  certificatesCount: number;
  avgProgression: number;
  lastActivity: string | null;
  hasActive: boolean;
}

function statusBadge(learner: AggregatedLearner) {
  const hasCompleted = learner.completedCount > 0;
  const hasActive = learner.enrollments.some(
    (e) => e.status === "confirmed" || e.status === "started"
  );
  if (hasCompleted) return <Badge className="bg-green-100 text-green-700 border-green-200">Terminé</Badge>;
  if (hasActive)    return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Actif</Badge>;
  return <Badge className="bg-amber-100 text-amber-700 border-amber-200">En attente</Badge>;
}

export function MesApprenants() {
  const { user } = useAuth();
  const [allParticipants, setAllParticipants] = useState<FormationParticipant[]>([]);
  const [loading, setLoading]   = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    participantsApi.getAll()
      .then(setAllParticipants)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  // Filtrer les participations aux formations créées par l'utilisateur courant
  const myParticipants = allParticipants.filter(
    (p) => p.formation?.creator_user_id === user?.id
  );

  // Regrouper par apprenant (user_id)
  const learnerMap = new Map<string, AggregatedLearner>();
  for (const p of myParticipants) {
    const uid = p.user_id;
    if (!uid) continue;
    const details = p.user_details;
    if (!learnerMap.has(uid)) {
      learnerMap.set(uid, {
        userId: uid,
        name:   details?.name  ?? "Inconnu",
        email:  details?.email ?? "",
        phone:  details?.phone ?? "",
        enrollments: [],
        completedCount: 0,
        certificatesCount: 0,
        avgProgression: 0,
        lastActivity: null,
        hasActive: false,
      });
    }
    const learner = learnerMap.get(uid)!;
    learner.enrollments.push(p);
    if (p.status === "completed" || parseFloat(p.progression ?? "0") >= 100) learner.completedCount++;
    if (p.certificat_delivre) learner.certificatesCount++;
    const activity = p.last_accessed_at ?? p.registered_at;
    if (!learner.lastActivity || activity > learner.lastActivity) learner.lastActivity = activity;
    if (p.status === "confirmed" || p.status === "started") learner.hasActive = true;
  }

  // Calculer la progression moyenne
  for (const learner of learnerMap.values()) {
    const total = learner.enrollments.reduce((acc, e) => acc + parseFloat(e.progression ?? "0"), 0);
    learner.avgProgression = learner.enrollments.length > 0 ? total / learner.enrollments.length : 0;
  }

  const learners = Array.from(learnerMap.values());

  // Appliquer recherche + filtre statut
  const filtered = learners.filter((l) => {
    const matchSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;
    if (statusFilter === "all") return true;
    if (statusFilter === "active")  return l.enrollments.some((e) => e.status === "confirmed" || e.status === "started");
    if (statusFilter === "pending") return l.enrollments.every((e) => e.status === "pending");
    if (statusFilter === "completed") return l.completedCount > 0;
    return true;
  });

  const totalEnrollments = learners.reduce((acc, l) => acc + l.enrollments.length, 0);
  const totalCertificates = learners.reduce((acc, l) => acc + l.certificatesCount, 0);
  const activeCount = learners.filter((l) => l.hasActive).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10"><Users className="w-6 h-6 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold">{learners.length}</p>
              <p className="text-sm text-muted-foreground">Apprenants</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/10"><CheckCircle2 className="w-6 h-6 text-blue-500" /></div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-sm text-muted-foreground">Actifs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-500/10"><Award className="w-6 h-6 text-amber-500" /></div>
            <div>
              <p className="text-2xl font-bold">{totalCertificates}</p>
              <p className="text-sm text-muted-foreground">Certificats</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/10"><BookOpen className="w-6 h-6 text-green-500" /></div>
            <div>
              <p className="text-2xl font-bold">{totalEnrollments}</p>
              <p className="text-sm text-muted-foreground">Inscriptions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre de recherche + filtre */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un apprenant..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] gap-2">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="completed">Terminés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">
                {learners.length === 0
                  ? "Aucun apprenant inscrit à vos formations"
                  : "Aucun résultat pour cette recherche"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Apprenant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Formations</TableHead>
                  <TableHead>Progression</TableHead>
                  <TableHead>Certificats</TableHead>
                  <TableHead>Dernière activité</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((learner) => (
                  <TableRow key={learner.userId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{learner.name}</p>
                        <p className="text-xs text-muted-foreground">{learner.email}</p>
                        {learner.phone && (
                          <p className="text-xs text-muted-foreground">{learner.phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{statusBadge(learner)}</TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {learner.completedCount}/{learner.enrollments.length}
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {learner.enrollments.length === 1
                          ? learner.enrollments[0].formation?.title ?? "—"
                          : `${learner.enrollments.length} formations`}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[80px]">
                        <Progress value={learner.avgProgression} className="h-2 w-16" />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {Math.round(learner.avgProgression)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        <Award className="w-3 h-3 mr-1" />
                        {learner.certificatesCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {learner.lastActivity ? (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(learner.lastActivity).toLocaleDateString("fr-FR", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                        </span>
                      ) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
