import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Calendar,
  MapPin,
  Ticket,
  QrCode,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  CreditCard,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { registrationsApi, evenementsApi, paymentsApi, type Registration, type Evenement, type Payment } from "@/lib/api";
import { ETicket } from "./ETicket";
import { useAuth } from "@/contexts/AuthContext";

// Inscription enrichie avec les données de l'événement
export interface EnrichedRegistration extends Registration {
  event?: Evenement;
}

function mapStatut(statut: string): {
  label: string;
  color: string;
  Icon: typeof Clock;
} {
  switch (statut) {
    case "payé":
    case "paye":
    case "confirmed":
      return { label: "Confirmé", color: "bg-green-500/10 text-green-600", Icon: CheckCircle2 };
    case "en_attente":
      return { label: "En attente de paiement", color: "bg-amber-500/10 text-amber-600", Icon: Clock };
    case "annulé":
    case "annule":
    case "cancelled":
      return { label: "Annulé", color: "bg-destructive/10 text-destructive", Icon: XCircle };
    case "checked_in":
      return { label: "Enregistré", color: "bg-blue-500/10 text-blue-600", Icon: CheckCircle2 };
    case "attended":
      return { label: "Participé", color: "bg-primary/10 text-primary", Icon: CheckCircle2 };
    default:
      return { label: statut, color: "bg-muted text-muted-foreground", Icon: Clock };
  }
}

function RegistrationCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6 space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-5 w-2/3" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-36" />
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}

export function MesInscriptions() {
  const { user } = useAuth();
  const [selectedReg, setSelectedReg] = useState<EnrichedRegistration | null>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);

  // 1. Récupérer les inscriptions de l'utilisateur
  const {
    data: registrations,
    isLoading: isLoadingReg,
    isError: isErrorReg,
  } = useQuery({
    queryKey: ["registrations", user?.id],
    queryFn: () => registrationsApi.getByUser(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // 2. Récupérer tous les événements publics pour enrichir les inscriptions
  const { data: allEvents, isLoading: isLoadingEvents } = useQuery({
    queryKey: ["evenements", "all"],
    queryFn: evenementsApi.getAll,
    staleTime: 5 * 60 * 1000,
  });

  // 3. Récupérer les paiements de l'utilisateur pour les liens de checkout
  const { data: payments } = useQuery({
    queryKey: ["payments", user?.id],
    queryFn: () => paymentsApi.getByUser(user!.id),
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
  });

  // Map registrationId → paiement pending avec checkoutUrl
  const pendingPaymentMap = new Map<string, Payment>();
  (payments ?? []).forEach((p) => {
    if (p.status !== "pending" || !p.checkoutUrl) return;
    const regId = p.registrationId ?? (p.payableType === "registration" ? p.payableId : null);
    if (regId) pendingPaymentMap.set(regId, p);
  });

  const isLoading = isLoadingReg || isLoadingEvents;

  // Map eventId → Evenement
  const eventMap = new Map<string, Evenement>();
  (allEvents ?? []).forEach((ev) => eventMap.set(ev.id, ev));

  // 3. Enrichir les inscriptions
  const enriched: EnrichedRegistration[] = (registrations ?? []).map((reg) => ({
    ...reg,
    event: eventMap.get(reg.event_id),
  }));

  const now = new Date();

  // 4. Séparer à venir / passés selon date_debut de l'événement
  const upcoming = enriched.filter((r) => {
    if (r.statut_paiement === "annulé" || r.statut_paiement === "annule") return false;
    const dateDebut = r.event?.date_debut;
    if (!dateDebut) return true; // si event pas encore chargé, on garde dans "à venir" par défaut
    return new Date(dateDebut) >= now;
  });

  const past = enriched.filter((r) => {
    if (r.statut_paiement === "annulé" || r.statut_paiement === "annule") return true;
    const dateDebut = r.event?.date_debut;
    if (!dateDebut) return false;
    return new Date(dateDebut) < now;
  });

  const pendingCount = enriched.filter((r) => r.statut_paiement === "en_attente").length;

  const handleShowQR = (reg: EnrichedRegistration) => {
    setSelectedReg(reg);
    setShowQRDialog(true);
  };

  function RegistrationCard({
    reg,
    isPast,
  }: {
    reg: EnrichedRegistration;
    isPast?: boolean;
  }) {
    const { label, color, Icon } = mapStatut(reg.statut_paiement);
    const ticketNom = reg.details[0]?.ticket_type?.nom ?? "Billet";
    const pendingPayment = pendingPaymentMap.get(reg.id);

    return (
      <Card className={`flex flex-col h-full ${isPast ? "opacity-75" : "hover:shadow-lg transition-all"}`}>
        <CardContent className="p-5 flex flex-col flex-1 gap-3">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={color}>
              <Icon className="w-3 h-3 mr-1" />
              {label}
            </Badge>
            <Badge variant="outline">{ticketNom}</Badge>
          </div>

          {/* Titre */}
          <h3 className="font-semibold leading-snug line-clamp-2">
            {reg.event?.titre ?? `Événement #${reg.event_id.slice(0, 8)}`}
          </h3>

          {/* Infos */}
          <div className="flex flex-col gap-1.5 text-sm text-muted-foreground flex-1">
            {reg.event?.date_debut && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                {new Date(reg.event.date_debut).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
            {reg.event?.lieu && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{reg.event.lieu.split(",")[0]}</span>
              </span>
            )}
            {/* {totalQty > 0 && (
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 shrink-0" />
                {totalQty} participant{totalQty > 1 ? "s" : ""}
              </span>
            )} */}
            {Number(reg.total_price) > 0 && (
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <CreditCard className="w-3.5 h-3.5 shrink-0" />
                {Number(reg.total_price).toLocaleString("fr-FR")} FCFA
              </span>
            )}
          </div>

          {/* Action */}
          <div className="pt-1">
            {isPast ? (
              <Button variant="outline" size="sm" className="w-full">
                Laisser un avis
              </Button>
            ) : reg.statut_paiement === "en_attente" ? (
              <Button
                className="w-full gap-2"
                size="sm"
                onClick={() => pendingPayment?.checkoutUrl && window.open(pendingPayment.checkoutUrl, "_blank")}
                disabled={!pendingPayment?.checkoutUrl}
              >
                <CreditCard className="w-4 h-4" />
                {pendingPayment?.checkoutUrl ? "Finaliser le paiement" : "Payer"}
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => handleShowQR(reg)}>
                <QrCode className="w-4 h-4" />
                Voir mon pass
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Ticket className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{isLoading ? "—" : enriched.length}</p>
              <p className="text-sm text-muted-foreground">Total inscriptions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-secondary/10">
              <Calendar className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{isLoading ? "—" : upcoming.length}</p>
              <p className="text-sm text-muted-foreground">À venir</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-500/10">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{isLoading ? "—" : pendingCount}</p>
              <p className="text-sm text-muted-foreground">Paiement en attente</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/10">
              <CheckCircle2 className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{isLoading ? "—" : past.length}</p>
              <p className="text-sm text-muted-foreground">Passés</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {isErrorReg && (
        <div className="flex items-center gap-2 text-sm text-destructive p-4 border border-destructive/20 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          Impossible de charger vos inscriptions.
        </div>
      )}

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming">
            À venir {!isLoading && `(${upcoming.length})`}
          </TabsTrigger>
          <TabsTrigger value="past">
            Passés {!isLoading && `(${past.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <RegistrationCardSkeleton />
              <RegistrationCardSkeleton />
              <RegistrationCardSkeleton />
            </div>
          )}
          {!isLoading && upcoming.length === 0 && (
            <EmptyState message="Aucune inscription à venir" />
          )}
          {!isLoading && upcoming.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {upcoming.map((reg) => <RegistrationCard key={reg.id} reg={reg} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <RegistrationCardSkeleton />
              <RegistrationCardSkeleton />
              <RegistrationCardSkeleton />
            </div>
          )}
          {!isLoading && past.length === 0 && (
            <EmptyState message="Aucun événement passé" />
          )}
          {!isLoading && past.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {past.map((reg) => <RegistrationCard key={reg.id} reg={reg} isPast />)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* E-Ticket Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mon E-Ticket</DialogTitle>
            <DialogDescription>
              {selectedReg?.event?.titre ?? `Événement #${selectedReg?.event_id.slice(0, 8)}`}
            </DialogDescription>
          </DialogHeader>
          {selectedReg && <ETicket reg={selectedReg} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
