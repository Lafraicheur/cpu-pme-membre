import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { evenementsApi, ticketTypesApi, registrationsApi, type Evenement, type TicketType, type RegistrationVerif } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Calendar, MapPin, Clock, PlusCircle, CalendarX, Banknote, Users, Ticket,
  Search, CheckCircle2, XCircle, AlertCircle, Loader2, ScanLine, ShieldCheck,
  Camera, Keyboard, X,
} from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatPrice(price: number): string {
  return price === 0 ? "Gratuit" : `${price.toLocaleString("fr-FR")} FCFA`;
}

// ─── Ticket price row ────────────────────────────────────────────────────────

function TicketPriceRow({ ticket }: { ticket: TicketType }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="rounded-lg bg-muted/60 px-3 py-2">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-0.5">
          <Banknote className="w-3 h-3" /> Public
        </div>
        <p className="text-sm font-bold text-foreground">{formatPrice(ticket.prix)}</p>
      </div>
      <div className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-2">
        <div className="flex items-center gap-1 text-[10px] text-primary font-medium uppercase tracking-wide mb-0.5">
          <Users className="w-3 h-3" /> Membre
        </div>
        <p className="text-sm font-bold text-primary">{formatPrice(ticket.prix_membre)}</p>
      </div>
    </div>
  );
}

// ─── Mon événement card ──────────────────────────────────────────────────────

function MonEvenementCard({ event, tickets }: { event: Evenement; tickets: TicketType[] }) {
  const couleur = event.type_evenement?.couleur ?? "#6366f1";
  const typeNom = event.type_evenement?.nom ?? "Événement";
  const eventUrl = `https://evenement.cpupme.ci/evenement/${event.id}`;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-all flex flex-col">
      <div className="relative h-40 bg-muted overflow-hidden shrink-0">
        {event.image_flayer ? (
          <img src={event.image_flayer} alt={event.titre} className="w-full h-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="w-10 h-10 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-0.5 rounded-sm text-xs font-medium text-white" style={{ backgroundColor: couleur }}>
            {typeNom}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-0.5 rounded-sm text-xs font-medium ${event.isActive ? "bg-emerald-500 text-white" : "bg-background text-muted-foreground border"}`}>
            {event.isActive ? "Actif" : "Inactif"}
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-4 space-y-3">
        <h3 className="font-semibold text-sm line-clamp-2">{event.titre}</h3>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>{formatDate(event.date_debut)}</span>
            <Clock className="w-3.5 h-3.5 ml-auto shrink-0" />
            <span>{event.heure_debut}</span>
          </div>
          {event.lieu && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{event.lieu}</span>
            </div>
          )}
        </div>
        <div className="space-y-2 flex-1">
          {tickets.length === 0 ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2.5">
              <Ticket className="w-3.5 h-3.5 shrink-0" />
              <span>Aucun billet configuré</span>
            </div>
          ) : tickets.length === 1 ? (
            <div className="space-y-1.5">
              <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                <Ticket className="w-3 h-3" /> {tickets[0].nom}
              </p>
              <TicketPriceRow ticket={tickets[0]} />
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                <Ticket className="w-3 h-3" /> {tickets.length} types de billets
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-0.5">
                {tickets.map((t) => (
                  <div key={t.id} className="space-y-1">
                    <p className="text-[10px] text-muted-foreground pl-0.5">{t.nom}</p>
                    <TicketPriceRow ticket={t} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <a href={eventUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="w-full h-8 text-xs">Voir l'événement</Button>
        </a>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-14 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

// ─── QR Scanner ──────────────────────────────────────────────────────────────

const QR_READER_ID = "qr-reader-verif";

function QrScannerView({ onScan, onClose }: { onScan: (text: string) => void; onClose: () => void }) {
  const scannerRef = useRef<unknown>(null);
  const isRunningRef = useRef(false);
  const [camError, setCamError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const stopScanner = () => {
    if (!isRunningRef.current) return;
    isRunningRef.current = false;
    try {
      const s = scannerRef.current as { stop?: () => Promise<void> } | null;
      s?.stop?.().catch(() => {});
    } catch {
      // already stopped
    }
  };

  useEffect(() => {
    let cancelled = false;

    import("html5-qrcode").then(({ Html5Qrcode }) => {
      if (cancelled) return;
      const scanner = new Html5Qrcode(QR_READER_ID);
      scannerRef.current = scanner;

      scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded: string) => {
          const uuidMatch = decoded.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
          const id = uuidMatch ? uuidMatch[0] : decoded.trim();
          isRunningRef.current = false;
          try { scanner.stop().catch(() => {}); } catch { /* ignore */ }
          onScan(id);
        },
        () => {}
      )
        .then(() => {
          if (!cancelled) {
            isRunningRef.current = true;
            setScanning(true);
          } else {
            // démonté avant que le scanner démarre, on l'arrête proprement
            try { scanner.stop().catch(() => {}); } catch { /* ignore */ }
          }
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err);
          setCamError(msg.includes("ermission") ? "Accès à la caméra refusé." : "Impossible d'ouvrir la caméra.");
        });
    }).catch(() => setCamError("Impossible de charger le scanner."));

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-3">
      <div className="relative rounded-xl overflow-hidden border border-border bg-black">
        {/* Vue caméra injectée par html5-qrcode */}
        <div id={QR_READER_ID} className="w-full" />

        {/* Overlay cadre QR si en cours */}
        {scanning && !camError && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-48 h-48 rounded-xl border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]" />
          </div>
        )}

        {/* Erreur caméra */}
        {camError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 text-white p-6 text-center">
            <Camera className="w-8 h-8 text-white/50" />
            <p className="text-sm">{camError}</p>
          </div>
        )}
      </div>

      <Button variant="outline" onClick={onClose} className="w-full gap-2">
        <X className="w-4 h-4" /> Fermer le scanner
      </Button>
    </div>
  );
}

// ─── Vérification ticket ─────────────────────────────────────────────────────

function VerifTicketTab() {
  const [inputMode, setInputMode] = useState<"manual" | "scan">("manual");
  const [inputId, setInputId] = useState("");
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<RegistrationVerif | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [accessValidated, setAccessValidated] = useState(false);

  const { data: verif, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["verifi-ticket", registrationId],
    queryFn: () => registrationsApi.verifiTicket(registrationId!),
    enabled: !!registrationId,
    retry: false,
    staleTime: 0,
  });

  const result = validationResult ?? verif;

  const triggerSearch = (id: string) => {
    const clean = id.trim();
    if (!clean) return;
    setValidationResult(null);
    setValidationError(null);
    setInputMode("manual");
    if (clean === registrationId) {
      refetch();
    } else {
      setRegistrationId(clean);
    }
  };

  const handleScan = (decoded: string) => {
    setInputId(decoded);
    triggerSearch(decoded);
  };

  const handleValiderAcces = async () => {
    if (!registrationId) return;
    setValidating(true);
    setValidationError(null);
    try {
      const res = await registrationsApi.validerAcces(registrationId);
      setValidationResult(res);
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : "Erreur lors de la validation.");
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-lg font-semibold">Vérifier un ticket</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Scannez le QR code du billet ou saisissez l'ID d'inscription manuellement.
        </p>
      </div>

      {/* Toggle mode */}
      <div className="flex rounded-lg border border-border overflow-hidden w-fit">
        <button
          onClick={() => setInputMode("manual")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${inputMode === "manual" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted text-muted-foreground"}`}
        >
          <Keyboard className="w-4 h-4" /> Saisie manuelle
        </button>
        <button
          onClick={() => setInputMode("scan")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${inputMode === "scan" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted text-muted-foreground"}`}
        >
          <Camera className="w-4 h-4" /> Scanner QR
        </button>
      </div>

      {/* Mode saisie manuelle */}
      {inputMode === "manual" && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9 font-mono text-sm"
              placeholder="ID d'inscription (UUID)…"
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && triggerSearch(inputId)}
            />
          </div>
          <Button onClick={() => triggerSearch(inputId)} disabled={!inputId.trim() || isLoading} className="gap-2 shrink-0">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Vérifier
          </Button>
        </div>
      )}

      {/* Mode scan QR */}
      {inputMode === "scan" && (
        <QrScannerView onScan={handleScan} onClose={() => setInputMode("manual")} />
      )}

      {/* Erreur API (404, etc.) */}
      {isError && (
        <div className="flex items-center gap-2 text-sm text-destructive p-4 border border-destructive/20 rounded-lg bg-destructive/5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {(error as Error)?.message ?? "Inscription introuvable."}
        </div>
      )}

      {/* Résultat */}
      {result && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Bandeau statut */}
          <div className={`px-5 py-4 flex items-center gap-3 ${result.est_valable ? "bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-800" : "bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-800"}`}>
            {result.est_valable
              ? <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              : <XCircle className="w-6 h-6 text-red-500 shrink-0" />}
            <div>
              <p className={`font-semibold text-sm ${result.est_valable ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                {result.est_valable ? "Billet valide" : "Billet non valable"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">{result.id}</p>
            </div>
            <div className="ml-auto">
              <Badge className={result.statut_paiement === "paye" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"}>
                {result.statut_paiement}
              </Badge>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Événement */}
            {result.evenement && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Événement</p>
                <p className="font-semibold text-sm">{result.evenement.titre}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(result.evenement.date_debut)} à {result.evenement.heure_debut}
                  </span>
                  {result.evenement.lieu && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {result.evenement.lieu}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="border-t" />

            {/* Participant */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Participant</p>
              <p className="font-semibold text-sm">{result.prenom} {result.nom}</p>
              <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                <span>{result.email}</span>
                {result.telephone && <span>{result.telephone}</span>}
                {result.entreprise && <span>{result.entreprise}</span>}
              </div>
            </div>

            <div className="border-t" />

            {/* Billets */}
            {(result.details ?? []).length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Billets</p>
                {(result.details ?? []).map((d) => (
                  <div key={d.id} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="font-medium">{d.ticket_type?.nom ?? "Billet"}</span>
                      <span className="text-xs text-muted-foreground">×{d.quantite}</span>
                    </div>
                    <span className="font-semibold text-xs">
                      {d.montantTotal === 0 ? "Gratuit" : `${d.montantTotal.toLocaleString("fr-FR")} FCFA`}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-sm font-semibold pt-1 px-1">
                  <span>Total</span>
                  <span>
                    {Number(result.total_price) === 0
                      ? "Gratuit"
                      : `${Number(result.total_price).toLocaleString("fr-FR")} FCFA`}
                  </span>
                </div>
              </div>
            )}

            {/* Erreur validation */}
            {validationError && (
              <div className="flex items-center gap-2 text-sm text-destructive p-3 border border-destructive/20 rounded-lg bg-destructive/5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {validationError}
              </div>
            )}

            {/* Bouton valider accès */}
            {result.est_valable && (
              <Button onClick={handleValiderAcces} disabled={validating} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700">
                {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Valider l'accès (marquer comme utilisé)
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

interface MesEvenementsProps {
  onCreateEvent: () => void;
}

export function MesEvenements({ onCreateEvent }: MesEvenementsProps) {
  const { user } = useAuth();

  const { data: evenements = [], isLoading: loadingEvents } = useQuery({
    queryKey: ["evenements", "by-creator", user?.id],
    queryFn: () => evenementsApi.getByCreator(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: allTickets = [], isLoading: loadingTickets } = useQuery({
    queryKey: ["ticket-types", "by-creator", user?.id],
    queryFn: () => ticketTypesApi.getAll({ creatorUserId: user!.id }),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = loadingEvents || loadingTickets;

  const ticketsByEvent = allTickets.reduce<Record<string, TicketType[]>>((acc, t) => {
    if (!acc[t.event_id]) acc[t.event_id] = [];
    acc[t.event_id].push(t);
    return acc;
  }, {});

  return (
    <Tabs defaultValue="mes-evenements" className="space-y-6">
      <TabsList>
        <TabsTrigger value="mes-evenements" className="gap-2">
          <Calendar className="w-4 h-4" /> Mes événements
        </TabsTrigger>
        <TabsTrigger value="verif-ticket" className="gap-2">
          <ScanLine className="w-4 h-4" /> Vérif. ticket
        </TabsTrigger>
      </TabsList>

      {/* ── Onglet : Mes événements ── */}
      <TabsContent value="mes-evenements">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Mes événements
                {!isLoading && evenements.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">({evenements.length})</span>
                )}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">Les événements que vous avez créés</p>
            </div>
            <Button onClick={onCreateEvent} className="gap-2">
              <PlusCircle className="w-4 h-4" /> Créer un événement
            </Button>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <CardSkeleton /><CardSkeleton /><CardSkeleton />
            </div>
          )}

          {!isLoading && evenements.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
              <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
                <CalendarX className="w-10 h-10 text-muted-foreground/40" />
              </div>
              <div className="space-y-1.5 max-w-xs">
                <h3 className="font-semibold text-lg">Aucun événement créé</h3>
                <p className="text-sm text-muted-foreground">Vous n'avez pas encore créé d'événement. Commencez maintenant !</p>
              </div>
              <Button onClick={onCreateEvent} size="lg" className="gap-2 px-8 rounded-xl">
                <PlusCircle className="w-5 h-5" /> Créer mon premier événement
              </Button>
            </div>
          )}

          {!isLoading && evenements.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
              {evenements.map((e) => (
                <MonEvenementCard key={e.id} event={e} tickets={ticketsByEvent[e.id] ?? []} />
              ))}
            </div>
          )}
        </div>
      </TabsContent>

      {/* ── Onglet : Vérif. ticket ── */}
      <TabsContent value="verif-ticket">
        <VerifTicketTab />
      </TabsContent>
    </Tabs>
  );
}
