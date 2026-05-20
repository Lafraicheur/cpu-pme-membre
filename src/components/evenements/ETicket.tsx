import { useRef, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Calendar, MapPin, Clock, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logoCpu from "@/assets/logo-cpu-pme.png";
import type { EnrichedRegistration } from "./MesInscriptions";

interface ETicketProps {
  reg: EnrichedRegistration;
}

interface IndividualTicket {
  nom?: string;
  code: string;
  index: number;
  total: number;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

function getTicketBadgeStyle(nom: string): React.CSSProperties {
  const lower = nom.toLowerCase();
  if (lower.includes("vip"))
    return { backgroundColor: "#fef3c7", color: "#b45309", border: "1px solid #fbbf24" };
  if (lower.includes("premium"))
    return { backgroundColor: "#f3e8ff", color: "#7c3aed", border: "1px solid #c084fc" };
  if (lower.includes("standard"))
    return { backgroundColor: "#dbeafe", color: "#1d4ed8", border: "1px solid #60a5fa" };
  if (lower.includes("gratuit") || lower.includes("free"))
    return { backgroundColor: "#dcfce7", color: "#15803d", border: "1px solid #4ade80" };
  return { backgroundColor: "#f0fdf4", color: "#166534", border: "1px solid #86efac" };
}

export function ETicket({ reg }: ETicketProps) {
  const ticketRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const event = reg.event;

  const individualTickets = useMemo<IndividualTicket[]>(() => {
    // Codes réels depuis participant_tickets dans les détails
    const codes: IndividualTicket[] = [];
    for (const d of reg.details) {
      if (d.participant_tickets && d.participant_tickets.length > 0) {
        for (const pt of d.participant_tickets) {
          codes.push({
            nom: d.ticket_type?.nom,
            code: pt.code,
            index: pt.numero,
            total: d.participant_tickets.length,
          });
        }
      }
    }
    if (codes.length > 0) {
      const total = codes.length;
      return codes.map((c, i) => ({ ...c, index: i + 1, total }));
    }

    // Fallback : génération depuis les quantités
    const total = reg.details.reduce((s, d) => s + d.quantite, 0);
    const result: IndividualTicket[] = [];
    let counter = 1;
    for (const d of reg.details) {
      for (let i = 0; i < d.quantite; i++) {
        result.push({
          nom: d.ticket_type?.nom,
          code: `${reg.id.slice(0, 8).toUpperCase()}-${counter}`,
          index: counter,
          total,
        });
        counter++;
      }
    }
    return result.length > 0 ? result : [{ code: reg.id.slice(0, 8).toUpperCase(), index: 1, total: 1 }];
  }, [reg]);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      for (let i = 0; i < ticketRefs.current.length; i++) {
        const el = ticketRefs.current[i];
        if (!el) continue;
        const ticket = individualTickets[i];
        const canvas = await html2canvas(el, { scale: 3, useCORS: true, backgroundColor: null });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 10, (pageHeight - imgHeight) / 2, imgWidth, imgHeight);
        pdf.save(`eticket-${ticket.code}.pdf`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {individualTickets.map((ticket, i) => (
        <div
          key={ticket.code}
          ref={(el) => { ticketRefs.current[i] = el; }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-orange-400 p-4 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={logoCpu} alt="CPU-PME" className="w-10 h-10 rounded-lg object-contain bg-white p-0.5" />
                <div>
                  <p className="font-bold">CPU-PME Events</p>
                  <p className="text-xs opacity-80">E-Ticket Officiel</p>
                </div>
              </div>
              <div className="text-right space-y-0.5">
                <p className="text-xs opacity-80">Ticket {ticket.index}/{ticket.total}</p>
                <p className="font-mono font-bold text-sm">{ticket.code}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Titre + badge type */}
            <div className="mb-4">
              {ticket.nom && (
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-sm"
                  style={{ ...getTicketBadgeStyle(ticket.nom), display: "inline-block", marginBottom: "8px" }}
                >
                  {ticket.nom.toUpperCase()}
                </span>
              )}
              <h3 className="font-bold text-base text-foreground leading-snug">
                {event?.titre ?? `Événement #${reg.event_id.slice(0, 8)}`}
              </h3>
            </div>

            {/* Infos événement */}
            <div className="space-y-2 text-sm mb-6">
              {event?.date_debut && (
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <span className="capitalize">{formatDate(event.date_debut)}</span>
                </div>
              )}
              {event?.heure_debut && (
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <span>{event.heure_debut}{event.heure_fin ? ` – ${event.heure_fin}` : ""}</span>
                </div>
              )}
              {event?.lieu && (
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span>{event.lieu}</span>
                </div>
              )}
            </div>

            {/* Séparateur style ticket */}
            <div className="border-t border-dashed border-border my-6 relative">
              <div className="absolute -left-8 -top-3 w-6 h-6 bg-background rounded-full" />
              <div className="absolute -right-8 -top-3 w-6 h-6 bg-background rounded-full" />
            </div>

            {/* Participant */}
            <div className="mb-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Participant</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Nom complet</p>
                  <p className="font-semibold text-foreground">{reg.prenom} {reg.nom}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-foreground break-all">{reg.email}</p>
                </div>
                {reg.telephone && (
                  <div>
                    <p className="text-xs text-muted-foreground">Téléphone</p>
                    <p className="text-foreground">{reg.telephone}</p>
                  </div>
                )}
                {reg.entreprise && (
                  <div>
                    <p className="text-xs text-muted-foreground">Entreprise</p>
                    <p className="text-primary font-medium">{reg.entreprise}</p>
                  </div>
                )}
              </div>
            </div>

            {/* QR Code — contient le code du billet pour le scan */}
            <div className="flex justify-center">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-border">
                <QRCodeSVG
                  value={ticket.code}
                  size={120}
                  level="H"
                  bgColor="#ffffff"
                  fgColor="#1a1a1a"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-muted/50 px-6 py-3 text-center border-t border-border">
            <p className="text-xs text-muted-foreground">
              Scannez ce QR code à l'entrée de l'événement
            </p>
          </div>
        </div>
      ))}

      <Button
        variant="outline"
        onClick={handleDownload}
        disabled={isGenerating}
        className="w-full gap-2"
      >
        {isGenerating ? (
          <><Loader2 className="w-4 h-4 animate-spin" />Génération du PDF...</>
        ) : (
          <><Download className="w-4 h-4" />
            Télécharger {individualTickets.length > 1 ? `les ${individualTickets.length} tickets` : "le ticket"} en PDF
          </>
        )}
      </Button>
    </div>
  );
}
