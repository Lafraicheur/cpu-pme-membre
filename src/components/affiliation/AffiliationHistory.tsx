import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building2,
  Calendar,
  FileText,
  Download,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  User,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { affiliationApi, type AffiliationEventType, type AffiliationHistoryEvent } from "@/lib/api";

// Re-export local alias for use in JSX below
type AffiliationEvent = AffiliationHistoryEvent;

interface AffiliationHistoryProps {
  onBack: () => void;
}

const eventConfig: Record<AffiliationEventType, { label: string; color: string; icon: React.ElementType }> = {
  AFF_DECLARED_DRAFT_SAVED: { label: "Brouillon enregistré", color: "bg-secondary text-secondary-foreground", icon: FileText },
  AFF_REQUEST_SENT: { label: "Demande envoyée", color: "bg-blue-500/20 text-blue-700", icon: Clock },
  AFF_REQUEST_CANCELLED_BY_MEMBER: { label: "Demande annulée", color: "bg-muted text-muted-foreground", icon: XCircle },
  AFF_APPROVED_BY_ORG: { label: "Approuvée", color: "bg-emerald-500/20 text-emerald-700", icon: CheckCircle2 },
  AFF_REJECTED_BY_ORG_REASON: { label: "Refusée", color: "bg-destructive/20 text-destructive", icon: XCircle },
  AFF_CHANGE_REQUESTED: { label: "Changement demandé", color: "bg-amber-500/20 text-amber-700", icon: ArrowRight },
  AFF_REVOKED_BY_ORG_REASON: { label: "Révoquée", color: "bg-destructive/20 text-destructive", icon: AlertTriangle },
  AFF_SUSPENDED_BY_CPU_PME_REASON: { label: "Suspendue (CPU-PME)", color: "bg-orange-500/20 text-orange-700", icon: AlertTriangle },
  AFF_OVERRIDE_BY_CPU_PME_REASON: { label: "Modifiée (CPU-PME)", color: "bg-purple-500/20 text-purple-700", icon: AlertTriangle },
};


export function AffiliationHistory({ onBack }: AffiliationHistoryProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["affiliation", "history"],
    queryFn: () => affiliationApi.getHistory({ page: 1, limit: 30 }),
    staleTime: 2 * 60 * 1000,
  });

  const history: AffiliationEvent[] = data?.data ?? [];
  const stats = data?.stats ?? { organizationsCount: 0, approvalsCount: 0, rejectionsCount: 0 };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Historique des affiliations</h2>
            <p className="text-muted-foreground">
              Consultez l'historique complet de vos affiliations
            </p>
          </div>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exporter
        </Button>
      </div>

      {/* Erreur */}
      {isError && (
        <Alert variant="destructive">
          <AlertDescription>
            Impossible de charger l'historique. Veuillez réessayer.
          </AlertDescription>
        </Alert>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Événements</CardTitle>
          <CardDescription>
            Tous les événements liés à vos affiliations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p>Aucun événement d'affiliation pour le moment.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-6">
                {history.map((event) => {
                  const config = eventConfig[event.type];
                  const Icon = config.icon;

                  return (
                    <div key={event.id} className="relative flex gap-4">
                      {/* Icon */}
                      <div className={cn(
                        "relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-background shrink-0",
                        config.color
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge className={cn("text-xs", config.color)}>
                                {config.label}
                              </Badge>
                            </div>
                            <h4 className="font-medium mt-1">{event.organization}</h4>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span>{event.actor}</span>
                              <span>•</span>
                              <span>{event.actorRole}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(event.timestamp)}</span>
                          </div>
                        </div>

                        {/* Reason if exists */}
                        {event.reason && (
                          <div className="mt-3 p-3 rounded-lg bg-muted/50 border">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-sm font-medium">Motif</p>
                                <p className="text-sm text-muted-foreground">{event.reason}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Attachments if exist */}
                        {event.attachments && event.attachments.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {event.attachments.map((file) => (
                              <Button key={file} variant="outline" size="sm" className="gap-2">
                                <FileText className="h-4 w-4" />
                                {file}
                                <Download className="h-3 w-3" />
                              </Button>
                            ))}
                          </div>
                        )}

                        {/* Change details if exist */}
                        {event.previousValue && event.newValue && (
                          <div className="mt-3 flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground line-through">{event.previousValue}</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{event.newValue}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                {isLoading ? <Skeleton className="h-8 w-8 mb-1" /> : <p className="text-2xl font-bold">{stats.organizationsCount}</p>}
                <p className="text-sm text-muted-foreground">Organisations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                {isLoading ? <Skeleton className="h-8 w-8 mb-1" /> : <p className="text-2xl font-bold">{stats.approvalsCount}</p>}
                <p className="text-sm text-muted-foreground">Approbations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                {isLoading ? <Skeleton className="h-8 w-8 mb-1" /> : <p className="text-2xl font-bold">{stats.rejectionsCount}</p>}
                <p className="text-sm text-muted-foreground">Refus</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
