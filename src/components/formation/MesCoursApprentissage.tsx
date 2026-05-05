import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  PlayCircle, BookOpen, Clock, GraduationCap,
  AlertCircle, RefreshCw, Video, MapPin, Calendar,
  CheckCircle2, Hourglass,
} from "lucide-react";
import { mesCoursApi, MonInscription } from "@/lib/api";
import { cn } from "@/lib/utils";

const FORMATION_BASE_URL = "https://devformation.cpupme.ci/formations";

function toSlug(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ── Config ────────────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  pending:   { label: "En attente",  color: "bg-amber-50 text-amber-700 border-amber-200",   icon: Hourglass },
  confirmed: { label: "Confirmé",    color: "bg-blue-50 text-blue-700 border-blue-200",       icon: CheckCircle2 },
  started:   { label: "En cours",    color: "bg-primary/10 text-primary border-primary/20",   icon: PlayCircle },
  completed: { label: "Terminé",     color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
};

const modeConfig: Record<string, { label: string; icon: typeof Video; color: string }> = {
  a_son_rythme: { label: "À son rythme", icon: Video,     color: "text-blue-600" },
  presentiel:   { label: "Présentiel",   icon: MapPin,    color: "text-green-600" },
  webinaire:    { label: "Webinaire",    icon: Calendar,  color: "text-violet-600" },
  live:         { label: "Webinaire",    icon: Calendar,  color: "text-violet-600" },
};

// ── Skeleton ──────────────────────────────────────────────────────────────────

function CoursCardSkeleton() {
  return (
    <Card className="rounded-sm overflow-hidden">
      <Skeleton className="h-28 w-full rounded-none" />
      <CardContent className="p-4 space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-4 w-16 rounded-sm" />
          <Skeleton className="h-4 w-20 rounded-sm" />
        </div>
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-8 w-full rounded-sm" />
      </CardContent>
    </Card>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  onStartLearning?: (formationId: string) => void;
}

// ── Composant ─────────────────────────────────────────────────────────────────

export function MesCoursApprentissage(_props: Props) {
  const [inscriptions, setInscriptions] = useState<MonInscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const fetchMesCours = () => {
    setLoading(true);
    setError(null);
    mesCoursApi.getMesFormations()
      .then(setInscriptions)
      .catch(() => setError("Impossible de charger vos formations."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMesCours(); }, []);

  const filtered = filterStatus === "all"
    ? inscriptions
    : inscriptions.filter((i) => i.status === filterStatus);

  const stats = {
    total: inscriptions.length,
    enCours: inscriptions.filter((i) => i.status === "started").length,
    termines: inscriptions.filter((i) => i.status === "completed").length,
    enAttente: inscriptions.filter((i) => i.status === "pending" || i.status === "confirmed").length,
  };

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "En cours", value: stats.enCours, color: "text-primary" },
          { label: "Terminés", value: stats.termines, color: "text-emerald-600" },
          { label: "En attente", value: stats.enAttente, color: "text-amber-600" },
        ].map((s) => (
          <Card key={s.label} className="rounded-sm">
            <CardContent className="p-3 text-center">
              <p className={cn("text-2xl font-bold", s.color)}>
                {loading ? <Skeleton className="h-8 w-8 mx-auto rounded-sm" /> : s.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtres statut */}
      <div className="flex items-center gap-2 flex-wrap">
        {["all", "pending", "confirmed", "started", "completed"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={cn(
              "text-xs px-3 py-1 rounded-sm border transition-colors",
              filterStatus === s
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:bg-muted"
            )}
          >
            {s === "all" ? "Tous" : (statusConfig[s]?.label ?? s)}
            {s !== "all" && (
              <span className="ml-1.5 opacity-70">
                {inscriptions.filter((i) => i.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Chargement */}
      {loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <CoursCardSkeleton key={i} />)}
        </div>
      )}

      {/* Erreur */}
      {!loading && error && (
        <Card className="rounded-sm">
          <CardContent className="py-14 text-center space-y-3">
            <AlertCircle className="w-10 h-10 mx-auto text-destructive/40" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" className="gap-2 rounded-sm" onClick={fetchMesCours}>
              <RefreshCw className="w-3.5 h-3.5" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Vide */}
      {!loading && !error && filtered.length === 0 && (
        <Card className="rounded-sm">
          <CardContent className="py-16 text-center space-y-3">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/25" />
            <p className="font-medium">
              {filterStatus === "all" ? "Vous n'êtes inscrit à aucune formation" : "Aucune formation dans cette catégorie"}
            </p>
            <p className="text-sm text-muted-foreground">
              Parcourez le catalogue pour vous inscrire
            </p>
          </CardContent>
        </Card>
      )}

      {/* Grille */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const { formation, status, progression, registeredAt } = item;
            const statusCfg = statusConfig[status] ?? statusConfig.pending;
            const StatusIcon = statusCfg.icon;
            const modeCfg = modeConfig[formation.mode] ?? modeConfig.a_son_rythme;
            const ModeIcon = modeCfg.icon;
            const progressValue = progression ?? 0;
            const instructorName = formation.formateur
              ? `${formation.formateur.firstname} ${formation.formateur.lastname}`
              : "Formateur non renseigné";
            const isCompleted = status === "completed";

            return (
              <Card
                key={item.participantId}
                className={cn(
                  "rounded-sm overflow-hidden flex flex-col hover:shadow-md transition-all",
                  isCompleted && "opacity-80"
                )}
              >
                {/* Image */}
                {formation.image ? (
                  <div className="h-28 overflow-hidden flex-shrink-0">
                    <img src={formation.image} alt={formation.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-28 bg-gradient-to-br from-primary/20 to-secondary/15 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-10 h-10 text-primary/25" />
                  </div>
                )}

                <CardContent className="p-4 flex flex-col flex-1 gap-2.5">
                  {/* Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="outline" className={cn("text-[10px] h-4 px-1.5 border rounded-sm gap-1", statusCfg.color)}>
                      <StatusIcon className="w-2.5 h-2.5" />
                      {statusCfg.label}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] h-4 px-1.5 rounded-sm gap-1">
                      <ModeIcon className={cn("w-2.5 h-2.5", modeCfg.color)} />
                      {modeCfg.label}
                    </Badge>
                  </div>

                  {/* Titre */}
                  <h3 className="font-semibold text-sm leading-snug line-clamp-2">
                    {formation.title}
                  </h3>

                  {/* Catégorie */}
                  <p className="text-[11px] text-muted-foreground/70 truncate">{formation.category}</p>

                  {/* Formateur */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 border">
                      {formation.formateur?.photo ? (
                        <img src={formation.formateur.photo} alt={instructorName} className="w-full h-full object-cover" />
                      ) : (
                        <GraduationCap className="w-3 h-3" />
                      )}
                    </div>
                    <span className="truncate">{instructorName}</span>
                    {formation.duration > 0 && (
                      <span className="flex items-center gap-0.5 ml-auto flex-shrink-0">
                        <Clock className="w-3 h-3" />{formation.duration}h
                      </span>
                    )}
                  </div>

                  {/* Progression */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progression</span>
                      <span className="font-medium">{progressValue}%</span>
                    </div>
                    <Progress value={progressValue} className="h-1.5 rounded-sm" />
                  </div>

                  {/* Date inscription */}
                  <p className="text-[11px] text-muted-foreground">
                    Inscrit le {new Date(registeredAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>

                  {/* CTA */}
                  <Button
                    className="w-full rounded-sm gap-2 mt-auto"
                    variant={isCompleted ? "outline" : "default"}
                    size="sm"
                    onClick={() => window.open(`${FORMATION_BASE_URL}/${toSlug(formation.title)}`, "_blank", "noopener,noreferrer")}
                  >
                    <PlayCircle className="w-4 h-4" />
                    {isCompleted ? "Revoir" : status === "started" ? "Continuer" : "Commencer"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
