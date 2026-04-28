import { useRef, useState } from "react";
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

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function ETicket({ reg }: ETicketProps) {
  const ticketRef = useRef<HTMLDivElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const qrData = JSON.stringify({
    registrationId: reg.id,
    eventId: reg.event_id,
    attendee: `${reg.prenom} ${reg.nom}`,
    email: reg.email,
  });

  const ticketNom = reg.details[0]?.ticket_type?.nom ?? "Billet";
  const event = reg.event;

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 10, (pageHeight - imgHeight) / 2, imgWidth, imgHeight);
      pdf.save(`eticket-${reg.id.slice(0, 8)}.pdf`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        ref={ticketRef}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-orange-400 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logoCpu} alt="CPU-PME" className="w-10 h-10 rounded-lg object-contain bg-white p-0.5" />
              <div>
                <p className="font-bold">CPU-PME</p>
                <p className="text-xs opacity-80">E-Ticket Officiel</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-80">Référence</p>
              <p className="font-mono font-bold text-sm">{reg.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Titre événement + type billet */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <h3 className="font-bold text-base text-foreground leading-snug">
              {event?.titre ?? `Événement #${reg.event_id.slice(0, 8)}`}
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-sm shrink-0 bg-primary/10 text-primary border border-primary/20">
              {ticketNom.toUpperCase()}
            </span>
          </div>

          {/* Infos événement */}
          <div className="space-y-2 text-sm mb-5">
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

          {/* Séparateur ticket style */}
          <div className="border-t border-dashed border-border my-5 relative">
            <div className="absolute -left-7 -top-3 w-5 h-5 bg-background rounded-full border border-border" />
            <div className="absolute -right-7 -top-3 w-5 h-5 bg-background rounded-full border border-border" />
          </div>

          {/* Participant */}
          <div className="mb-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Participant</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Nom complet</p>
                <p className="font-semibold">{reg.prenom} {reg.nom}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="break-all">{reg.email}</p>
              </div>
              {reg.entreprise && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Entreprise</p>
                  <p className="text-primary font-medium">{reg.entreprise}</p>
                </div>
              )}
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center gap-2">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-border">
              <QRCodeSVG
                value={qrData}
                size={130}
                level="H"
                bgColor="#ffffff"
                fgColor="#1a1a1a"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Scannez ce QR code à l'entrée de l'événement
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-muted/50 px-5 py-2.5 text-center border-t border-border">
          <p className="text-xs text-muted-foreground">
            CPU-PME Côte d'Ivoire — Billet non remboursable
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={handleDownload}
        disabled={isGenerating}
        className="w-full gap-2"
      >
        {isGenerating ? (
          <><Loader2 className="w-4 h-4 animate-spin" />Génération du PDF...</>
        ) : (
          <><Download className="w-4 h-4" />Télécharger le ticket en PDF</>
        )}
      </Button>
    </div>
  );
}
