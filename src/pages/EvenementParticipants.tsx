import { useState, useMemo, Fragment } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { registrationsApi, evenementsApi, participantTicketsApi } from "@/lib/api";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, Download, Search, Users, CheckCircle2, XCircle, Calendar,
  MapPin, Mail, Phone, Building2, Ticket, ChevronDown, ChevronRight,
} from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function StatutBadge({ statut }: { statut: string }) {
  if (statut === "payé" || statut === "paye" || statut === "success") {
    return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">Payé</Badge>;
  }
  if (statut === "en_attente" || statut === "pending") {
    return <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">En attente</Badge>;
  }
  if (statut === "annulé" || statut === "cancelled") {
    return <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]">Annulé</Badge>;
  }
  return <Badge variant="outline" className="text-[10px]">{statut}</Badge>;
}

export default function EvenementParticipants() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"participants" | "billets">("participants");
  const [search, setSearch] = useState("");
  const [searchBillets, setSearchBillets] = useState("");
  const [pageParticipants, setPageParticipants] = useState(1);
  const [pageBillets, setPageBillets] = useState(1);
  const PAGE_SIZE = 10;
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const { data: event, isLoading: loadingEvent } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => evenementsApi.getById(eventId!),
    enabled: !!eventId,
  });

  const { data: registrations = [], isLoading: loadingRegs } = useQuery({
    queryKey: ["registrations-event", eventId],
    queryFn: () => registrationsApi.getByEvent(eventId!),
    enabled: !!eventId,
  });

  const { data: allTicketsData, isLoading: loadingTickets } = useQuery({
    queryKey: ["all-tickets-event", eventId],
    queryFn: () => participantTicketsApi.getAllByEvent(eventId!),
    enabled: !!eventId,
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return registrations;
    return registrations.filter((r) =>
      `${r.prenom} ${r.nom}`.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      (r.telephone ?? "").includes(q) ||
      (r.entreprise ?? "").toLowerCase().includes(q)
    );
  }, [registrations, search]);

  const totalPagesParticipants = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedParticipants = filtered.slice((pageParticipants - 1) * PAGE_SIZE, pageParticipants * PAGE_SIZE);

  const allTickets = allTicketsData?.tickets ?? [];

  const filteredBillets = useMemo(() => {
    const q = searchBillets.toLowerCase().trim();
    if (!q) return allTickets;
    return allTickets.filter((t) =>
      t.code.toLowerCase().includes(q) ||
      (t.ticket?.nom ?? "").toLowerCase().includes(q) ||
      (t.registration ? `${t.registration.prenom} ${t.registration.nom}`.toLowerCase().includes(q) : false) ||
      (t.registration?.email ?? "").toLowerCase().includes(q)
    );
  }, [allTickets, searchBillets]);

  const totalPagesBillets = Math.max(1, Math.ceil(filteredBillets.length / PAGE_SIZE));
  const paginatedBillets = filteredBillets.slice((pageBillets - 1) * PAGE_SIZE, pageBillets * PAGE_SIZE);

  const totalTickets = useMemo(() =>
    registrations.reduce((s, r) => s + r.details.reduce((ds, d) => ds + d.quantite, 0), 0),
    [registrations]
  );

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    const titre = event?.titre ?? "Événement";
    const dateExport = new Date().toLocaleDateString("fr-FR", {
      day: "numeric", month: "long", year: "numeric",
    });

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`Liste des participants — ${titre}`, 14, 18);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    if (event) {
      doc.text(`Date : ${formatDate(event.date_debut)}  |  Lieu : ${event.lieu ?? "Non précisé"}  |  Exporté le ${dateExport}`, 14, 26);
    }
    doc.text(`Total inscriptions : ${registrations.length}  |  Total billets : ${totalTickets}`, 14, 32);
    doc.setTextColor(0, 0, 0);

    const rows = filtered.map((r, i) => {
      const billets = r.details
        .map((d) => `${d.ticket_type?.nom ?? "?"} x${d.quantite}`)
        .join(", ");
      const statut =
        r.statut_paiement === "payé" || r.statut_paiement === "paye" || r.statut_paiement === "success"
          ? "Payé"
          : r.statut_paiement === "en_attente"
          ? "En attente"
          : r.statut_paiement;

      return [
        String(i + 1),
        `${r.prenom} ${r.nom}`,
        r.email,
        r.telephone ?? "—",
        r.entreprise ?? "—",
        billets,
        statut,
        formatDate(r.date_commande),
        r.est_valable ? "Oui" : "Non",
      ];
    });

    autoTable(doc, {
      startY: 38,
      head: [["N°", "Participant", "Email", "Téléphone", "Entreprise", "Billets", "Paiement", "Date", "Valide"]],
      body: rows,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 36 },
        2: { cellWidth: 50 },
        3: { cellWidth: 24 },
        4: { cellWidth: 30 },
        5: { cellWidth: 44 },
        6: { cellWidth: 22 },
        7: { cellWidth: 24 },
        8: { cellWidth: 14 },
      },
    });

    doc.save(`participants-${titre.replace(/\s+/g, "-").toLowerCase()}.pdf`);
  };

  const exportBilletsPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    const titre = event?.titre ?? "Événement";
    const dateExport = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`Liste des billets — ${titre}`, 14, 18);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    if (event) {
      doc.text(`Date : ${formatDate(event.date_debut)}  |  Lieu : ${event.lieu ?? "Non précisé"}  |  Exporté le ${dateExport}`, 14, 26);
    }
    doc.text(
      `Total billets : ${allTicketsData?.total ?? 0}  |  Valables : ${allTicketsData?.valables ?? 0}  |  Utilisés : ${allTicketsData?.utilises ?? 0}`,
      14, 32
    );
    doc.setTextColor(0, 0, 0);

    const rows = filteredBillets.map((t, i) => {
      const participant = t.registration
        ? `${t.registration.prenom} ${t.registration.nom}`
        : "—";
      const email = t.registration?.email ?? "—";
      const statut = t.used_at ? "Utilisé" : t.est_valable ? "Valable" : "Invalide";
      return [
        String(i + 1),
        t.code,
        t.ticket?.nom ?? "—",
        `N°${t.numero}`,
        statut,
        participant,
        email,
        formatDateTime(t.created_at),
      ];
    });

    autoTable(doc, {
      startY: 38,
      head: [["N°", "Code", "Type de billet", "Numéro", "Statut", "Participant", "Email", "Date création"]],
      body: rows,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 28 },
        2: { cellWidth: 30 },
        3: { cellWidth: 16 },
        4: { cellWidth: 20 },
        5: { cellWidth: 40 },
        6: { cellWidth: 54 },
        7: { cellWidth: 36 },
      },
    });

    doc.save(`billets-${titre.replace(/\s+/g, "-").toLowerCase()}.pdf`);
  };

  const isLoading = loadingEvent || loadingRegs;

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0 mt-0.5" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1 min-w-0">
            {loadingEvent ? (
              <>
                <Skeleton className="h-6 w-64 mb-1" />
                <Skeleton className="h-4 w-40" />
              </>
            ) : (
              <>
                <h1 className="text-lg font-bold text-foreground truncate">{event?.titre}</h1>
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  {event && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(event.date_debut)}
                    </span>
                  )}
                  {event?.lieu && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.lieu}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mb-1">
              <Users className="w-3 h-3" /> Inscriptions
            </p>
            {isLoading ? <Skeleton className="h-6 w-12" /> : (
              <p className="text-2xl font-bold">{registrations.length}</p>
            )}
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mb-1">
              <Ticket className="w-3 h-3" /> Billets totaux
            </p>
            {loadingTickets ? <Skeleton className="h-6 w-12" /> : (
              <p className="text-2xl font-bold">{allTicketsData?.total ?? totalTickets}</p>
            )}
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mb-1">
              <CheckCircle2 className="w-3 h-3" /> Valables
            </p>
            {loadingTickets ? <Skeleton className="h-6 w-12" /> : (
              <p className="text-2xl font-bold">{allTicketsData?.valables ?? 0}</p>
            )}
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mb-1">
              <XCircle className="w-3 h-3" /> Utilisés
            </p>
            {loadingTickets ? <Skeleton className="h-6 w-12" /> : (
              <p className="text-2xl font-bold">{allTicketsData?.utilises ?? 0}</p>
            )}
          </div>
        </div>

        {/* Onglets */}
        <div className="flex gap-1 border-b border-border">
          <button
            onClick={() => setActiveTab("participants")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === "participants"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Participants
            </span>
          </button>
          <button
            onClick={() => setActiveTab("billets")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === "billets"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5" />
              Tous les billets
              {allTicketsData && (
                <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {allTicketsData.total}
                </span>
              )}
            </span>
          </button>
        </div>

        {/* ── Onglet Participants ── */}
        {activeTab === "participants" && (
          <>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, email, téléphone, entreprise…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPageParticipants(1); }}
                  className="pl-8 h-9 text-sm"
                />
              </div>
              <Button
                onClick={exportPDF}
                disabled={isLoading || registrations.length === 0}
                size="sm"
                className="h-9 gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                Exporter PDF
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <Users className="w-10 h-10 mb-3 opacity-30" />
                <p className="font-medium">{search ? "Aucun résultat" : "Aucune inscription pour cet événement"}</p>
                {search && (
                  <button className="text-xs text-primary mt-1 underline" onClick={() => setSearch("")}>
                    Effacer la recherche
                  </button>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="w-8 px-2 py-2.5" />
                        <th className="text-left text-[11px] font-semibold text-muted-foreground px-4 py-2.5 whitespace-nowrap">N°</th>
                        <th className="text-left text-[11px] font-semibold text-muted-foreground px-4 py-2.5 whitespace-nowrap">Participant</th>
                        <th className="text-left text-[11px] font-semibold text-muted-foreground px-4 py-2.5 whitespace-nowrap">Contact</th>
                        <th className="text-left text-[11px] font-semibold text-muted-foreground px-4 py-2.5 whitespace-nowrap">Entreprise</th>
                        <th className="text-left text-[11px] font-semibold text-muted-foreground px-4 py-2.5 whitespace-nowrap">Billets</th>
                        <th className="text-left text-[11px] font-semibold text-muted-foreground px-4 py-2.5 whitespace-nowrap">Paiement</th>
                        <th className="text-left text-[11px] font-semibold text-muted-foreground px-4 py-2.5 whitespace-nowrap">Date</th>
                        <th className="text-left text-[11px] font-semibold text-muted-foreground px-4 py-2.5 whitespace-nowrap">Valide</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedParticipants.map((r, i) => {
                        const rowTickets = r.details.flatMap((d) =>
                          (d.participant_tickets ?? []).map((pt) => ({
                            ...pt,
                            ticketNom: d.ticket_type?.nom ?? "?",
                          }))
                        );
                        const hasTickets = rowTickets.length > 0;
                        const isExpanded = expandedRows.has(r.id);

                        return (
                          <Fragment key={r.id}>
                            <tr
                              className={`border-b border-border transition-colors ${hasTickets ? "cursor-pointer hover:bg-muted/30" : "hover:bg-muted/20"} ${isExpanded ? "bg-muted/20" : ""}`}
                              onClick={() => hasTickets && toggleRow(r.id)}
                            >
                              <td className="w-8 px-2 py-3 text-center">
                                {hasTickets ? (
                                  isExpanded
                                    ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground mx-auto" />
                                    : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground mx-auto" />
                                ) : null}
                              </td>
                              <td className="px-4 py-3 text-xs text-muted-foreground">{i + 1}</td>
                              <td className="px-4 py-3">
                                <p className="font-medium text-xs">{r.prenom} {r.nom}</p>
                              </td>
                              <td className="px-4 py-3">
                                <div className="space-y-0.5">
                                  <p className="text-xs flex items-center gap-1 text-muted-foreground">
                                    <Mail className="w-3 h-3 shrink-0" />
                                    <span className="truncate max-w-[160px]">{r.email}</span>
                                  </p>
                                  {r.telephone && (
                                    <p className="text-xs flex items-center gap-1 text-muted-foreground">
                                      <Phone className="w-3 h-3 shrink-0" />
                                      {r.telephone}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                {r.entreprise ? (
                                  <span className="text-xs flex items-center gap-1 text-muted-foreground">
                                    <Building2 className="w-3 h-3 shrink-0" />
                                    {r.entreprise}
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground/50">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="space-y-0.5">
                                  {r.details.map((d) => (
                                    <div key={d.id} className="flex items-center gap-1">
                                      <Ticket className="w-3 h-3 text-muted-foreground shrink-0" />
                                      <span className="text-xs text-muted-foreground">
                                        {d.ticket_type?.nom ?? "?"}{" "}
                                        <span className="font-medium text-foreground">×{d.quantite}</span>
                                      </span>
                                      {(d.participant_tickets ?? []).length > 0 && (
                                        <span className="text-[10px] text-primary ml-1">
                                          ({(d.participant_tickets ?? []).length} code{(d.participant_tickets ?? []).length > 1 ? "s" : ""})
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <StatutBadge statut={r.statut_paiement} />
                              </td>
                              <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                {formatDate(r.date_commande)}
                              </td>
                              <td className="px-4 py-3">
                                {r.est_valable ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-400" />
                                )}
                              </td>
                            </tr>

                            {isExpanded && (
                              <tr key={`${r.id}-detail`} className="border-b border-border bg-muted/10">
                                <td colSpan={9} className="px-6 pb-4 pt-2">
                                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                    Billets individuels ({rowTickets.length})
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                    {rowTickets
                                      .sort((a, b) => a.numero - b.numero)
                                      .map((pt) => (
                                        <div
                                          key={pt.id}
                                          className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs ${
                                            pt.est_valable
                                              ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
                                              : pt.used_at
                                              ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
                                              : "border-border bg-background"
                                          }`}
                                        >
                                          <div className="space-y-0.5 min-w-0">
                                            <p className="font-mono font-semibold text-foreground truncate">{pt.code}</p>
                                            <p className="text-muted-foreground">{pt.ticketNom} · N°{pt.numero}</p>
                                          </div>
                                          <div className="ml-2 shrink-0">
                                            {pt.used_at ? (
                                              <span className="text-[10px] text-amber-600 font-medium">Utilisé</span>
                                            ) : pt.est_valable ? (
                                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            ) : (
                                              <XCircle className="w-4 h-4 text-muted-foreground/50" />
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-2 bg-muted/30 border-t border-border flex items-center justify-between gap-4 flex-wrap">
                  <p className="text-xs text-muted-foreground">
                    {filtered.length} inscription{filtered.length > 1 ? "s" : ""}
                    {search && ` trouvée${filtered.length > 1 ? "s" : ""} sur ${registrations.length}`}
                    {" · "}Cliquer sur une ligne pour voir les billets individuels
                  </p>
                  {totalPagesParticipants > 1 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled={pageParticipants === 1}
                        onClick={() => setPageParticipants((p) => p - 1)}
                      >
                        ‹ Préc.
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        Page {pageParticipants} / {totalPagesParticipants}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled={pageParticipants === totalPagesParticipants}
                        onClick={() => setPageParticipants((p) => p + 1)}
                      >
                        Suiv. ›
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Onglet Billets ── */}
        {activeTab === "billets" && (
          <>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par code, type, nom ou email…"
                  value={searchBillets}
                  onChange={(e) => { setSearchBillets(e.target.value); setPageBillets(1); }}
                  className="pl-8 h-9 text-sm"
                />
              </div>
              <Button
                onClick={exportBilletsPDF}
                disabled={loadingTickets || allTickets.length === 0}
                size="sm"
                className="h-9 gap-1.5 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Download className="w-3.5 h-3.5" />
                Exporter PDF
              </Button>
            </div>

            {loadingTickets ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            ) : filteredBillets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <Ticket className="w-10 h-10 mb-3 opacity-30" />
                <p className="font-medium">{searchBillets ? "Aucun résultat" : "Aucun billet pour cet événement"}</p>
                {searchBillets && (
                  <button className="text-xs text-primary mt-1 underline" onClick={() => setSearchBillets("")}>
                    Effacer la recherche
                  </button>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="text-left text-[11px] font-semibold text-muted-foreground px-4 py-2.5 whitespace-nowrap">N°</th>
                        <th className="text-left text-[11px] font-semibold text-muted-foreground px-4 py-2.5 whitespace-nowrap">Code</th>
                        <th className="text-left text-[11px] font-semibold text-muted-foreground px-4 py-2.5 whitespace-nowrap">Type</th>
                        <th className="text-left text-[11px] font-semibold text-muted-foreground px-4 py-2.5 whitespace-nowrap">Numéro</th>
                        <th className="text-left text-[11px] font-semibold text-muted-foreground px-4 py-2.5 whitespace-nowrap">Statut</th>
                        <th className="text-left text-[11px] font-semibold text-muted-foreground px-4 py-2.5 whitespace-nowrap">Participant</th>
                        <th className="text-left text-[11px] font-semibold text-muted-foreground px-4 py-2.5 whitespace-nowrap">Date création</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedBillets.map((t, i) => (
                        <tr key={t.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 text-xs text-muted-foreground">{(pageBillets - 1) * PAGE_SIZE + i + 1}</td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs font-semibold">{t.code}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {t.ticket?.nom ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground text-center">
                            N°{t.numero}
                          </td>
                          <td className="px-4 py-3">
                            {t.used_at ? (
                              <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">Utilisé</Badge>
                            ) : t.est_valable ? (
                              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">Valable</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-muted-foreground">Invalide</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {t.registration ? (
                              <div className="space-y-0.5">
                                <p className="text-xs font-medium">{t.registration.prenom} {t.registration.nom}</p>
                                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                  <Mail className="w-3 h-3 shrink-0" />
                                  <span className="truncate max-w-[160px]">{t.registration.email}</span>
                                </p>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground/50">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(t.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-2 bg-muted/30 border-t border-border flex items-center justify-between gap-4 flex-wrap">
                  <p className="text-xs text-muted-foreground">
                    {filteredBillets.length} billet{filteredBillets.length > 1 ? "s" : ""}
                    {searchBillets && ` trouvé${filteredBillets.length > 1 ? "s" : ""} sur ${allTickets.length}`}
                  </p>
                  {totalPagesBillets > 1 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled={pageBillets === 1}
                        onClick={() => setPageBillets((p) => p - 1)}
                      >
                        ‹ Préc.
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        Page {pageBillets} / {totalPagesBillets}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled={pageBillets === totalPagesBillets}
                        onClick={() => setPageBillets((p) => p + 1)}
                      >
                        Suiv. ›
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
